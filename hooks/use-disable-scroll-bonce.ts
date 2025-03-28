import { useEffect } from "react";

// ユーザー同士の画面位置が異なって画面の挙動が不安定になるのを防ぐ
export const useDisableScrollBounce = () => {
  useEffect(() => {
    document.body.classList.add("overflow-hidden", "overscroll-none");
    return () => {
      document.body.classList.remove("overflow-hidden", "overscroll-none");
    };
  });
};
