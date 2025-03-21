"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Hint } from "@/components/hint";
import { useRenameModal } from "@/store/use-rename-modal";
import { Actions } from "@/components/actions";

interface InfoProps {
  boardId: string;
}

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

const TabSeparator = () => {
  return <div className="text-neutral-300 px-1.5">|</div>;
};

export const Info = ({ boardId }: InfoProps) => {
  const { onOpen } = useRenameModal();
  // board.tsのgetメソッド
  const data = useQuery(api.board.get, { id: boardId as Id<"boards"> });

  if (!data) return <InfoSkeleton />;

  return (
    // 親要素のcanvas.tsxでrelativeを設定しているため、ここでabsoluteを使えるo
    <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
      {/* sideOffsetで下側に少しずらす */}
      <Hint label="Go Back to Boards" side="bottom" sideOffset={10}>
        <Button asChild variant="board" className="px-2">
          <Link href="/">
            <Image src="/logo.svg" alt="logo" height={40} width={40} />
            {/* font.classNameは上記で定義したfontを指す */}
            <span
              className={cn(
                "font-semibold text-xl ml-2 text-black",
                font.className
              )}
            >
              Miro
            </span>
          </Link>
        </Button>
      </Hint>
      <TabSeparator />
      {/* text-baseはデフォルトのフォントサイズを差し、大きさとしては1rem(root em(element)) */}
      <Hint label="Edit Title" side="bottom" sideOffset={10}>
        <Button
          variant="board"
          className="text-base font-normal px-2"
          // user-rename-modal.tsに値が渡る
          // isOpen=trueにより、rename-modal.tsxが開く
          // 編集した文字列がonSubmit->mutateの順番でapiまで処理が続く
          onClick={() => onOpen(data._id, data.title)}
        >
          {data.title}
        </Button>
      </Hint>
      <TabSeparator />
      <Actions id={data._id} title={data.title} side="bottom" sideOffset={10}>
        <div>
          <Hint label="Main Menu" side="bottom" sideOffset={10}>
            {/* size='icon'はbutton.tsxに定義されている */}
            <Button size="icon" variant="board">
              <Menu />
            </Button>
          </Hint>
        </div>
      </Actions>
    </div>
  );
};

export const InfoSkeleton = () => {
  return (
    <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md w-[300px]" />
  );
};
