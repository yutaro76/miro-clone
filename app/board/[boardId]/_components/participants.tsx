"use client";

import { useOthers, useSelf } from "@/liveblocks.config";
import { UserAvatar } from "./user-avatar";
import { connectionIdToColor } from "@/lib/utils";

// 右上の部分に表示する自分以外の名前の最大値
// 自分を入れると+1になる
const MAX_SHOWN_USERS = 2;

export const Participants = () => {
  // room内にいる自分以外のuserの情報
  const users = useOthers();
  // 自分自身の情報
  const currentUser = useSelf();
  const hasMoreUsers = users.length > MAX_SHOWN_USERS;

  return (
    // 一番多い表示で、MAX_SHOWN_USERS + 自分 + その他アバター
    <div className="absolute h-12 top-2 right-2 bg-white rounded-md p-3 flex items-center shadow-md">
      <div className="flex gap-x-2">
        {/* 自分以外 */}
        {/* 最大でMAX_SHOWN_USERSの人数分表示される */}
        {users.slice(0, MAX_SHOWN_USERS).map(({ connectionId, info }) => {
          return (
            <UserAvatar
              borderColor={connectionIdToColor(connectionId)}
              key={connectionId}
              src={info?.picture}
              name={info?.name}
              fallback={info?.name?.[0] || "T"}
            />
          );
        })}

        {/* 自分 */}
        {/* 自分は必ずいるはずなので表示される */}
        {currentUser && (
          <UserAvatar
            borderColor={connectionIdToColor(currentUser.connectionId)}
            src={currentUser.info?.picture}
            name={`${currentUser.info?.name} (You)`}
            fallback={currentUser.info?.name?.[0]}
          />
        )}

        {/* 自分以外のuserがMAX_SHOWN_USERSより多い */}
        {/* 多くなければ表示されない */}
        {hasMoreUsers && (
          <UserAvatar
            name={`${users.length - MAX_SHOWN_USERS} more`}
            fallback={`+${users.length - MAX_SHOWN_USERS}`}
          />
        )}
      </div>
    </div>
  );
};

export const ParticipantsSkeleton = () => {
  return (
    <div className="absolute top-2 right-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md w-[100px]" />
  );
};
