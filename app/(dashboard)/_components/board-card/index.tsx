"use client";

import Image from "next/image";
import Link from "next/link";
import { Overlay } from "./overlay";
import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { Footer } from "./footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Actions } from "@/components/actions";
import { MoreHorizontal } from "lucide-react";
import { useApiMutation } from "../../../../hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface BoardCardProps {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  createdAt: number;
  imageUrl: string;
  orgId: string;
  isFavorite: boolean;
}

export const BoardCard = ({
  id,
  title,
  authorName,
  authorId,
  createdAt,
  imageUrl,
  orgId,
  isFavorite,
}: BoardCardProps) => {
  const { userId } = useAuth();
  const authorLabel = userId === authorId ? "You" : authorName;

  // addSuffixをtrueにすれば、agoやinのように過去か未来かがわかる
  const createdAtLabel = formatDistanceToNow(createdAt, { addSuffix: true });

  const { mutate: onFavorite, pending: pendingFavorite } = useApiMutation(
    api.board.favorite
  );
  const { mutate: onUnfavorite, pending: pendingUnFavorite } = useApiMutation(
    api.board.unfavorite
  );

  const toggleFavorite = () => {
    if (isFavorite) {
      onUnfavorite({ id, orgId }).catch(() =>
        toast.error("Failed to Remove from Favorite")
      );
    } else {
      onFavorite({ id, orgId }).catch(() =>
        toast.error("Failed to Add Favorite")
      );
    }
  };

  return (
    <Link href={`/board/${id}`}>
      {/* group: 親要素に操作があれば、子要素に影響するようにする */}
      {/* <Overlay />の中にgroup-hoverが含まれ、それに連動する */}
      {/* aspect-[100/127]: 縦横の比率を100:127に維持 */}
      {/* border: borderを追加 */}
      <div className="group aspect-[100/127] border rounded-lg flex flex-col justify-between overflow-hidden">
        <div className="relative flex-1 bg-amber-50">
          {/* fill: 要素を満たすように表示 */}
          {/* object-fit: 要素からはみ出ないようにする */}
          <Image src={imageUrl} alt={title} fill className="object-fit p-4" />
          <Overlay />
          <Actions id={id} title={title} side="right">
            <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 outline-none">
              <MoreHorizontal className="text-white opacity-75 hover:opacity-100 transition-opacity" />
            </button>
          </Actions>
        </div>
        <Footer
          isFavorite={isFavorite}
          title={title}
          authorLabel={authorLabel}
          createdAtLabel={createdAtLabel}
          onClick={toggleFavorite}
          disabled={pendingFavorite || pendingUnFavorite}
        />
      </div>
    </Link>
  );
};

BoardCard.Skeleton = function BoardCardSkeleton() {
  return (
    <div className="aspect-[100/127] rounded-lg overflow-hidden">
      <Skeleton className="h-full w-full" />
    </div>
  );
};
