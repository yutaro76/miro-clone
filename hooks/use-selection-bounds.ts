import { shallow } from "@liveblocks/react";
import { Layer, XYWH } from "@/types/canvas";
import { useStorage, useSelf } from "@/liveblocks.config";

const boundingBox = (layers: Layer[]): XYWH | null => {
  const first = layers[0];

  if (!first) {
    return null;
  }

  // 図形の初期値
  let left = first.x;
  let right = first.x + first.width;
  let top = first.y;
  let bottom = first.y + first.height;

  for (let i = 1; i < layers.length; i++) {
    // 各レイヤーから情報を出力
    const { x, y, width, height } = layers[i];

    // x軸の左端はレイヤーを踏まえた小さい数字に合わせる
    if (left > x) {
      left = x;
    }

    // x軸の右側は大きい数字に合わせる
    if (right < x + width) {
      right = x + width;
    }

    // y軸の下端は小さい数字に合わせる
    if (top > y) {
      top = y;
    }

    // y軸の上一番大きい数字に合わせる
    if (bottom < y + height) {
      bottom = y + height;
    }
  }
  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

export const useSelectionBounds = () => {
  // 自分のlayerを取得
  const selection = useSelf((me) => me.presence.selection);

  return useStorage((root) => {
    const selectedLayers = selection
      // !は必ず含むようにするという意味
      .map((layerId) => root.layers.get(layerId)!)
      // trueのものだけselectedLayersに入るようにする
      .filter(Boolean);

    return boundingBox(selectedLayers);
    // shallowは深くまで各layerをチェックせず、素早く表層だけチェックする
  }, shallow);
};
