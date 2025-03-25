import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { Camera, Color, Point, Side, XYWH } from "@/types/canvas";

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function connectionIdToColor(connectionId: number): string {
  return COLORS[connectionId % COLORS.length];
}

export function pointerEventToCanvasPoint(
  e: React.PointerEvent,
  camera: Camera
) {
  return {
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y,
  };
}

export function colorToCss(color: Color) {
  // color.rは0から255までの数字で渡され、それをtoString(16)で16進数（ff, a, 0）に変換する
  // padStart(2, '0'): 二桁までの変換で、必要であれば先頭に0をつける
  // 最終的に、rgbの数字から、#RRGGBBのようなcssで使われる形に変換される
  return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}

export function resizeBounds(bounds: XYWH, corner: Side, point: Point): XYWH {
  // returnするための初期値
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };

  // 左
  if ((corner && Side.Left) === Side.Left) {
    // point.x: カーソルが指すx軸
    // bounds.x + bounds.width:元の図形の「右」辺
    // 小さい方（より左側にある方）が新しいxとなる
    result.x = Math.min(point.x, bounds.x + bounds.width);
    // 横幅は元の幅からxの部分までの絶対値
    result.width = Math.abs(bounds.x + bounds.width - point.x);
  }

  // 右
  if ((corner && Side.Right) === Side.Right) {
    result.x = Math.min(point.x, bounds.x);
    result.width = Math.abs(point.x - bounds.x);
  }

  // 上
  if ((corner && Side.Top) === Side.Top) {
    result.y = Math.min(point.y, bounds.y + bounds.height);
    result.height = Math.abs(bounds.y + bounds.height - point.y);
  }

  // 下
  if ((corner && Side.Bottom) === Side.Bottom) {
    result.y = Math.min(point.y, bounds.y);
    result.height = Math.abs(point.y - bounds.y);
  }

  return result;
}
