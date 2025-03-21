"use client";

import { useSelf } from "@/liveblocks.config";
import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";

interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  // liveblocks-auth/route.tsで設定したエンドポイントはuseSelfを使って使用できる
  const info = useSelf((me) => me.info);

  return (
    // bg-neutral-100は少し背景を濃くする
    // touch-noneは画面を動かしたりズームしたりできなくする
    <main className="h-full w-full relative bg-neutral-100 touch-none">
      <Info />
      <Participants />
      <Toolbar />
    </main>
  );
};
