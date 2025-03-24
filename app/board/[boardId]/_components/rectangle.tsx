import { colorToCss } from "@/lib/utils";
import { RectangleLayer } from "@/types/canvas";

interface RectangleProps {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Rectangle = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: RectangleProps) => {
  const { x, y, width, height, fill } = layer;

  return (
    <rect
      className="drop-shadow-md"
      // 新しく図形が作成されるわけではない
      // 既存の図形にはすでにidが振られている
      // eがあるため、クリックされるたびにonPointerDownはtriggerされる
      // すでにidは図形に入っている（親からpropsとして渡されている）ので、そのidを元にonPointerDownをtriggerする
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{ transform: `translate(${x}px, ${y}px)` }}
      x={0}
      y={0}
      width={width}
      height={height}
      // 枠線の太さ
      strokeWidth={1}
      // 中の塗りつぶしの色
      fill={fill ? colorToCss(fill) : "#000"}
      // 枠線の色
      stroke={selectionColor || "transparent"}
    />
  );
};
