"use client";

import { Plus } from "lucide-react";
import { CreateOrganization } from "@clerk/nextjs";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Hint } from "@/components/hint";

export const NewButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* 縦横の比率が正方形のようにする */}
        <div className="aspect-square">
          <Hint
            label="Create Organization"
            side="right"
            align="start"
            sideOffset={18}
          >
            {/* items-center: 横軸に沿って真ん中に justify-center: 縦軸に沿って真ん中に */}
            <button className="bg-white/25 h-full w-full rounded-md flex items-center justify-center opacity-60 hover:opacity-100 transition">
              <Plus className="text-white " />
            </button>
          </Hint>
        </div>
      </DialogTrigger>
      {/* <DialogContent className="p-0 bg-transparent border-none max-w-[480px]"> */}
      <DialogContent className="place-content-center w-[420px] h-[480px] p-0  border-none max-w-[480px]">
        <CreateOrganization />
      </DialogContent>
    </Dialog>
  );
};
