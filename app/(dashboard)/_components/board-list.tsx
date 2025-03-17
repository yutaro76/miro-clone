"use client";

import { EmptyBoards } from "./empty-boards";
import { EmptyFavorites } from "./empty-favorites";
import { EmptySearch } from "./empty-search";

interface BoardListProps {
  orgId: string;
  query: {
    search?: string;
    favorites?: string;
  };
}

export const BoardList = ({ query }: BoardListProps) => {
  const data = [];

  // 検索をしたが、データがない場合
  if (!data?.length && query.search) {
    return <EmptySearch />;
  }

  // お気に入りを開いたが、データがない場合
  if (!data?.length && query.favorites) {
    return <EmptyFavorites />;
  }

  // dashboardに表示するデータがない場合
  if (!data?.length) {
    return <EmptyBoards />;
  }

  return <div>{JSON.stringify(query)}</div>;
};
