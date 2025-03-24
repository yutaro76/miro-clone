"use client";

import { nanoid } from "nanoid";
import { useCallback, useState } from "react";

import {
  useHistory,
  useCanRedo,
  useCanUndo,
  useMutation,
  useStorage,
} from "@/liveblocks.config";
import {
  Camera,
  CanvasMode,
  CanvasState,
  Color,
  EllipseLayer,
  LayerType,
  NoteLayer,
  Point,
  RectangleLayer,
  TextLayer,
} from "@/types/canvas";
import { pointerEventToCanvasPoint } from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";

import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import { CursorsPresence } from "./cursors-presence";
import { LayerPreview } from "./layer-preview";

const MAX_LAYERS = 100;

interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  // liveblocks-auth/route.tsで設定したエンドポイントはuseSelfを使って使用できる
  // const info = useSelf((me) => me.info);

  // layerIdsはそれぞれのlayerの情報が入ったもの
  // liveblocksのstorageは複数のユーザーの永続化されたデータの編集を可能にする
  const layerIds = useStorage((root) => root.layerIds);

  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  // defaultは黒
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });

  const history = useHistory();
  const canRedo = useCanRedo();
  const canUndo = useCanUndo();

  // 楕円や四角などの描画をする新しいレイヤーを追加する
  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note,
      position: Point
    ) => {
      // 全てのlayerを取得
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) {
        return;
      }
      // 全てのlayerの情報を取得
      const liveLayerIds = storage.get("layerIds");
      // IDを生成
      const layerId = nanoid();
      // layerを作成
      const layer = new LiveObject({
        // layerTypeはこのconstの上部のlayerTypeを指す
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
      } as RectangleLayer | EllipseLayer | TextLayer | NoteLayer);

      // 新しいlayerのIDを一覧に追加
      liveLayerIds.push(layerId);
      // 追加したlayerのIDに情報を載せる
      liveLayers.set(layerId, layer);

      // 新しいlayerを見た目でわかるようにする
      // Redo, Undoができるようにhistoryに追加する
      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setCanvasState({ mode: CanvasMode.None });
    },
    [lastUsedColor]
  );

  // useCallbackは繰り返し利用されるときに使う
  // 縦横際限なく動けるようにする
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      // e.deltaX: 横に動いた距離
      x: camera.x - e.deltaX,
      // e.deltaY: 縦に動いた距離
      y: camera.y - e.deltaY,
    }));
  }, []);

  // マウスのカーソルに合わせて位置を更新する
  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();
      const current = pointerEventToCanvasPoint(e, camera);
      setMyPresence({ cursor: current });
    },
    []
  );

  // カーソルが画面外に出た時に、キャンバス内のポインタが消えるようにする
  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  const onPointerUp = useMutation(
    ({}, e) => {
      // どこに描画するかを決める
      const point = pointerEventToCanvasPoint(e, camera);

      // insertモードであればlayerを追加
      if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
      // 追加中には一時的にhistoryへの追加が止まっていたものを、historyへの追加を再開する
      history.resume();
    },
    [camera, canvasState, history, insertLayer]
  );

  return (
    // bg-neutral-100は少し背景を濃くする
    // touch-noneは画面を動かしたりズームしたりできなくする
    <main className="h-full w-full relative bg-neutral-100 touch-none">
      <Info boardId={boardId} />
      <Participants />
      <Toolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        undo={history.undo}
        redo={history.redo}
        canRedo={canRedo}
        canUndo={canUndo}
      />
      {/* 100vhと100vhで縦横いっぱい */}
      <svg
        className="h-[100vh] w-[100vw]"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerUp={onPointerUp}
      >
        {/* transformは移動や変形を管理し、今回はtranslateと共に移動の装飾をする */}
        <g style={{ transform: `translate(${camera.x}px, ${camera.y}px)` }}>
          {layerIds.map((layerId) => (
            // 他のuserが何か操作をしているのをわかるようにする
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={() => {}}
              selectionColor="#000"
            />
          ))}
          {/* 動きに関することをこのコンポーネントで管理する */}
          <CursorsPresence />
        </g>
      </svg>
    </main>
  );
};
