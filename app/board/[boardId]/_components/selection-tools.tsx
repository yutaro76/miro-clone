"use client";

import { memo } from "react";
import { Trash2 } from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { Camera, Color } from "@/types/canvas";
import { useMutation, useSelf } from "@/liveblocks.config";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { useDeleteLayers } from "@/hooks/use-delete-layers";

import { ColorPicker } from "./color-picker";

interface SelectionToolsProps {
  camera: Camera;
  setLastUsedColor: (color: Color) => void;
}

export const SelectionTools = memo(
  ({ camera, setLastUsedColor }: SelectionToolsProps) => {
    const selection = useSelf((me) => me.presence.selection);

    const setFill = useMutation(
      ({ storage }, fill: Color) => {
        // layerの一覧
        const liveLayers = storage.get("layers");
        setLastUsedColor(fill);

        // 選択しているlayerのidと全てのlayerのidを比較して同じものの色を変える
        selection.forEach((id) => {
          liveLayers.get(id)?.set("fill", fill);
        });
      },
      [selection, setLastUsedColor]
    );

    const deleteLayers = useDeleteLayers();

    // useSelectionBoundsはlayerの大きさの調整に関わるhook
    const selectionBounds = useSelectionBounds();

    if (!selectionBounds) {
      return null;
    }

    // selectionBounds.width: 図形の横幅
    // selectionBounds.x: 図形の左端
    // cameraは画面を動かしたときに追従するために使われる
    // 画面自体を動かさない場合はcamera.x = 0
    const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
    console.log(selectionBounds.width, selectionBounds.x, camera.x);
    const y = selectionBounds.y + camera.y;

    return (
      <div
        className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
        style={{
          // 50%はこのdiv要素自身の横幅の半分左にずらす
          // y - 16 は縦方向に16px引き上げる
          transform: `translate(
            calc(${x}px - 50%),
            calc(${y - 16}px - 100%)
          )`,
        }}
      >
        <ColorPicker onChange={setFill} />
        <div className="flex items-center pl-2 ml-2 border-l border-neutral-200">
          <Hint label="Delete">
            <Button variant="board" size="icon" onClick={deleteLayers}>
              <Trash2 />
            </Button>
          </Hint>
        </div>
      </div>
    );
  }
);

SelectionTools.displayName = "SelectionTools";
