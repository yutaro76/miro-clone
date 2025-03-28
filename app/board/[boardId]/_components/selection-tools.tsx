"use client";

import { memo } from "react";
import { BringToFront, SendToBack, Trash2 } from "lucide-react";

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
    // selection: 例 "UAqHOOHcvL3IzuP1fHrKO"
    const selection = useSelf((me) => me.presence.selection);

    const moveToFront = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];
        // arrにlayerのid一覧が入る
        const arr = liveLayerIds.toImmutable();

        for (let i = 0; i < arr.length; i++) {
          // 現状のarrの中で、selectionが何番目かをindicesに入れる
          if (selection.includes(arr[i])) {
            indices.push(i);
          }
        }

        // indicesに入ったidのlayerを、liveLaterIdsの中で場所を動かす
        // 配列の最後に来たものが、最前面に表示される
        // liveLayerIds 変更前（"UAqHOOHcvL3IzuP1fHrKO"が移動する）
        // [ "UAqHOOHcvL3IzuP1fHrKO", "kibYRg968uq4F_kMn9EtN", "cfqRcqy_9dXpXe9Xg2y92", "rTIX63DuddzXBJDiSQwaq", "gsAflYLaMNCTMCWzU9Vvv"]
        // liveLayerIds 変更後
        // [ "kibYRg968uq4F_kMn9EtN", "cfqRcqy_9dXpXe9Xg2y92", "rTIX63DuddzXBJDiSQwaq", "gsAflYLaMNCTMCWzU9Vvv", "UAqHOOHcvL3IzuP1fHrKO" ]
        for (let i = indices.length - 1; i >= 0; i--) {
          liveLayerIds.move(
            indices[i],
            arr.length - 1 - (indices.length - 1 - i)
          );
        }
      },
      [selection]
    );

    const moveToBack = useMutation(
      ({ storage }) => {
        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];

        const arr = liveLayerIds.toImmutable();

        for (let i = 0; i < arr.length; i++) {
          // 選択しているlayerがlayerの一覧にあれば、indicesにarrの要素番号を追加
          if (selection.includes(arr[i])) {
            indices.push(i);
          }
        }

        for (let i = 0; i < indices.length; i++) {
          // 最背面に持ってくるときは、配列の先頭（左側）に移動させる
          liveLayerIds.move(indices[i], i);
        }
      },
      [selection]
    );

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
        <div className="flex flex-col gap-y-0.5">
          <Hint label="Bring to Front">
            <Button onClick={moveToFront} variant="board" size="icon">
              <BringToFront />
            </Button>
          </Hint>
          <Hint label="Send to Back" side="bottom">
            <Button onClick={moveToBack} variant="board" size="icon">
              <SendToBack />
            </Button>
          </Hint>
        </div>
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
