"use client";

import { useCallback, useState } from "react";

import {
  useHistory,
  useCanRedo,
  useCanUndo,
  useMutation,
} from "@/liveblocks.config";
import { Camera, CanvasMode, CanvasState } from "@/types/canvas";
import { pointerEventToCanvasPoint } from "@/lib/utils";

import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import { CursorsPresence } from "./cursors-presence";

interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  // liveblocks-auth/route.tsで設定したエンドポイントはuseSelfを使って使用できる
  // const info = useSelf((me) => me.info);

  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });

  const history = useHistory();
  const canRedo = useCanRedo();
  const canUndo = useCanUndo();

  // useCallbackは繰り返し利用されるときに使う
  // 縦横際限なく動けるようにする
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      // e.deltaX: 横に動いた距離
      x: camera.x - e.deltaX,
      // e.deltaY: 縦に動いた距離
      y: camera.x - e.deltaY,
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
      >
        <g>
          {/* 動きに関することをこのコンポーネントで管理する */}
          <CursorsPresence />
        </g>
      </svg>
    </main>
  );
};
