"use client";

import { nanoid } from "nanoid";
import { useCallback, useMemo, useState, useEffect } from "react";

import {
  useHistory,
  useCanRedo,
  useCanUndo,
  useMutation,
  useStorage,
  useOthersMapped,
  useSelf,
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
  Side,
  TextLayer,
  XYWH,
} from "@/types/canvas";
import {
  colorToCss,
  connectionIdToColor,
  findIntersectingLayersWithRectangle,
  penPointsToPathLayer,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bonce";
import { useDeleteLayers } from "@/hooks/use-delete-layers";

import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import { CursorsPresence } from "./cursors-presence";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Path } from "./path";

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

  const pencilDraft = useSelf((me) => me.presence.pencilDraft);

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

  useDisableScrollBounce();
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

  // 選択した図形のリサイズ部分を選択した際に使われる関数
  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history]
  );
  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }

      // 差を埋める距離
      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      // layerを取得
      const liveLayers = storage.get("layers");

      for (const id of self.presence.selection) {
        // layer一覧の中から現在選択しているlayerを選ぶ
        const layer = liveLayers.get(id);

        // layerの位置をupdate
        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState]
  );

  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    // 選択しているlayerがあるとき
    if (self.presence.selection.length > 0) {
      // 選択をなくして、進む戻るで追えるようにする
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      const layers = storage.get("layers").toImmutable();
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });

      const ids = findIntersectingLayersWithRectangle(
        layerIds,
        layers,
        origin,
        current
      );

      setMyPresence({ selection: ids });
    },
    [layerIds]
  );

  // ドラッグして、複数のlayerを選択するときに使う
  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    // クリックして、クリックしたまま少し動かすとifがtrueになる
    // クリックだけだとtrueにはならない
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });
    }
  }, []);

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence;

      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft == null
      ) {
        return;
      }

      setMyPresence({
        cursor: point,
        pencilDraft:
          pencilDraft.length === 1 &&
          pencilDraft[0][0] === point.x &&
          pencilDraft[0][1] === point.y
            ? pencilDraft
            : [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    },
    [canvasState.mode]
  );

  const insertPath = useMutation(
    ({ storage, self, setMyPresence }) => {
      const liveLayers = storage.get("layers");
      const { pencilDraft } = self.presence;

      if (
        pencilDraft == null ||
        pencilDraft.length < 2 ||
        liveLayers.size >= MAX_LAYERS
      ) {
        setMyPresence({ pencilDraft: null });
        return;
      }

      const id = nanoid();
      liveLayers.set(
        id,
        new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor))
      );

      const liveLayerIds = storage.get("layerIds");
      liveLayerIds.push(id);

      setMyPresence({ pencilDraft: null });
      setCanvasState({ mode: CanvasMode.Pencil });
    },
    [lastUsedColor]
  );

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUsedColor,
      });
    },
    [lastUsedColor]
  );

  // useCallbackは繰り返し利用されるときに使う
  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      );

      // layerの一覧を取得
      const liveLayers = storage.get("layers");
      // 選んでいるlayerを取得
      const layer = liveLayers.get(self.presence.selection[0]);

      if (layer) {
        // 選んだlayerをresizeBoundsでリサイズしたlayerにupdate
        layer.update(bounds);
      }
    },
    [canvasState]
  );

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
      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(current, e);
      }
      setMyPresence({ cursor: current });
    },
    [
      continueDrawing,
      camera,
      canvasState,
      startMultiSelection,
      updateSelectionNet,
      translateSelectedLayers,
      resizeSelectedLayer,
    ]
  );

  // カーソルが画面外に出た時に、キャンバス内のポインタが消えるようにする
  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  // クリックして押下している状態の挙動
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting) {
        return;
      }

      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }

      setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, setCanvasState, startDrawing]
  );

  const onPointerUp = useMutation(
    // eslint-disable-next-line
    ({}, e) => {
      // どこに描画するかを決める
      // eslint-disable-next-line
      const point = pointerEventToCanvasPoint(e, camera);

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayers();
        setCanvasState({ mode: CanvasMode.None });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      } else if (canvasState.mode === CanvasMode.Inserting) {
        // insertモードであればlayerを追加
        insertLayer(canvasState.layerType, point);
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
      // 追加中には一時的にhistoryへの追加が止まっていたものを、historyへの追加を再開する
      history.resume();
    },
    [
      setCanvasState,
      camera,
      canvasState,
      history,
      insertLayer,
      unselectLayers,
      insertPath,
    ]
  );

  // 他の人がクリックしているものを取得する
  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      // 何かを入力しているときはこのメソッドは発火させない
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }
      // 既存のものを取得するので、履歴を更新する必要はない
      history.pause();
      e.stopPropagation();

      // pointerの位置からcanvasの位置を作成する
      const point = pointerEventToCanvasPoint(e, camera);

      // 自分のlayerに選択されたものがなければ、そのlayerを自分のarrayに追加する
      if (!self.presence.selection.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }

      // 選択したら動かすことになるので、Translatingに設定する
      // currentはcanvas.tsに定義されている
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    []
  );

  // 他の人が選んでいるものを複数のものを含めて取得する
  const selections = useOthersMapped((other) => other.presence.selection);

  const layerIdsToColorSelection = useMemo(() => {
    // Recordはreactで使われる型で、Record<Keys, Type>で使われる
    // {}は空の初期値
    const layerIdsToColorSelection: Record<string, string> = {};
    // selectionsからuserの情報を取り出す
    for (const user of selections) {
      // userからconnectionIdとselectionを取り出す
      const [connectionId, selection] = user;
      // selectionからlayerIdを取り出す
      for (const layerId of selection) {
        // layerIdごとに色をつけて格納する
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
      }
    }

    return layerIdsToColorSelection;
  }, [selections]);

  const deleteLayers = useDeleteLayers();

  // command + z : undo
  // command + z + shift : redo
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "z": {
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              history.redo();
            } else {
              history.undo();
            }
            break;
          }
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [deleteLayers, history]);

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
      <SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />
      {/* 100vhと100vhで縦横いっぱい */}
      <svg
        className="h-[100vh] w-[100vw]"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* transformは移動や変形を管理し、今回はtranslateと共に移動の装飾をする */}
        <g style={{ transform: `translate(${camera.x}px, ${camera.y}px)` }}>
          {layerIds.map((layerId) => (
            // 他のuserが何か操作をしているのをわかるようにする
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              selectionColor={layerIdsToColorSelection[layerId]}
            />
          ))}
          <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
          {/* ドラッグしている部分がわかるようにする */}
          {canvasState.mode === CanvasMode.SelectionNet &&
            canvasState.current != null && (
              <rect
                // /5は透明度を5%に設定
                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                x={Math.min(canvasState.origin.x, canvasState.current.x)}
                y={Math.min(canvasState.origin.y, canvasState.current.y)}
                width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                height={Math.abs(canvasState.origin.y - canvasState.current.y)}
              />
            )}
          {/* 動きに関することをこのコンポーネントで管理する */}
          <CursorsPresence />
          {pencilDraft != null && pencilDraft.length > 0 && (
            <Path
              points={pencilDraft}
              fill={colorToCss(lastUsedColor)}
              x={0}
              y={0}
            />
          )}
        </g>
      </svg>
    </main>
  );
};
