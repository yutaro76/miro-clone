"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { EmptyBoards } from "./empty-boards";
import { EmptyFavorites } from "./empty-favorites";
import { EmptySearch } from "./empty-search";
import { BoardCard } from "./board-card";
import { NewBoardButton } from "./new-board-button";

interface BoardListProps {
  orgId: string;
  query: {
    search?: string;
    favorites?: string;
  };
}

export const BoardList = ({ orgId, query }: BoardListProps) => {
  const data = useQuery(api.boards.get, { orgId }); // eslint-disable-line

  // データを読み込んでいるときにスケルトンが出るようにする
  // <BoardCard.Skeleton />の数だけ出るが、ここでは一つにしている
  if (data === undefined) {
    return (
      <div>
        <h2 className="text-3xl">
          {query.favorites ? "Favorite Boards" : "Team Boards"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
          <NewBoardButton orgId={orgId} disabled />
          <BoardCard.Skeleton />
        </div>
      </div>
    );
  }

  // 検索をしたが、データがない場合
  // eslint-disable-next-line
  if (!data?.length && query.search) {
    return <EmptySearch />;
  }

  // お気に入りを開いたが、データがない場合
  // eslint-disable-next-line
  if (!data?.length && query.favorites) {
    // eslint-disable-line
    return <EmptyFavorites />;
  }

  // dashboardに表示するデータがない場合
  // eslint-disable-next-line
  if (!data?.length) {
    // eslint-disable-line
    return <EmptyBoards />;
  }

  return (
    <div>
      <h2 className="text-3xl">
        {query.favorites ? "Favorite Boards" : "Team Boards"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
        <NewBoardButton orgId={orgId} />
        {/* eslint-disable-next-line */}
        {data?.map((board) => (
          <BoardCard
            key={board._id} // eslint-disable-line
            id={board._id} // eslint-disable-line
            title={board.title} // eslint-disable-line
            imageUrl={board.imageUrl} // eslint-disable-line
            authorId={board.authorId} // eslint-disable-line
            authorName={board.authorName} // eslint-disable-line
            createdAt={board._creationTime} // eslint-disable-line
            orgId={board.orgId} // eslint-disable-line
            isFavorite={board.isFavorite}
          />
        ))}
      </div>
    </div>
  );
};
