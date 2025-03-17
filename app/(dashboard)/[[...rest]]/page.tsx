"use client";

import React from "react";
import { EmptyOrg } from "../_components/empty-org";
import { useOrganization } from "@clerk/nextjs";
import { BoardList } from "../_components/board-list";

interface DashboardPageProps {
  searchParams: {
    search?: string;
    favorites?: string;
  };
}

const DashboardPage = ({ searchParams }: DashboardPageProps) => {
  const { organization } = useOrganization();
  return (
    // navbarの分だけ、dashboard部分の高さを低くした
    // 上部の80pxとp-6の部分を除いて占有するため、真ん中に要素が寄る
    <div className="flex-1 h-[calc(100%-80px)] p-6">
      {!organization ? (
        <EmptyOrg />
      ) : (
        // page.tsxは大元のファイルにあたるため、子ファイルによるURLの変化を取得できる
        <BoardList orgId={organization.id} query={searchParams} />
      )}
    </div>
  );
};

export default DashboardPage;
