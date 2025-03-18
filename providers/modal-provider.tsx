"use client";

import { useEffect, useState } from "react";

import { RenameModal } from "@/components/modal/rename-modal";

// クライアントサイドでのみ動くようuseEffectを使う
export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <RenameModal />
    </>
  );
};
