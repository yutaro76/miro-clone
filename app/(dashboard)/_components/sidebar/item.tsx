"use client";

import Image from "next/image";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Hint } from "@/components/hint";

interface ItemProps {
  id: string;
  name: string;
  imageUrl: string;
}

export const Item = ({ id, name, imageUrl }: ItemProps) => {
  const { organization } = useOrganization();
  const { setActive } = useOrganizationList();

  // 現在開いているorganizationと選択されているorganizationが同じであればture
  const isActive = organization?.id === id;

  // クリックされたときに現在のorganizationが変わると同時に、itemも選択される
  const onClick = () => {
    if (!setActive) return;
    // eslint-disable-next-line
    setActive({ organization: id });
  };

  return (
    <div>
      <Hint label={name} side="right" align="start" sideOffset={18}>
        <Image
          alt={name}
          src={imageUrl}
          onClick={onClick}
          // cnは第一引数がスタイルのデフォルトで別の引数を加えれば動的にスタイルを変更できる
          className={cn(
            // cursor-pointerとtransitionでマウスホバーでチカチカさせる
            "rounded-md cursor-pointer opacity-75 hover:opacity-100 transition",
            // organizationが選択されたら、明るい色になる
            isActive && "opacity-100"
          )}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
        />
      </Hint>
    </div>
  );
};
