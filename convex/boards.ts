import { v } from "convex/values";
import { query } from "./_generated/server";

export const get = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    // ここでboardの情報を取得する
    const boards = await ctx.db
      .query("boards")
      // schema.tsで'by_org'で区別すると規定
      // by_orgはorgのidが使われるため、実質、そのorg内のboardsを全て取得する
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      // 全ての情報を取得
      .collect();

    const boardsWithFavoriteRelations = boards.map((board) => {
      return ctx.db
        .query("userFavorites")
        .withIndex("by_user_board", (q) =>
          q.eq("userId", identity.subject).eq("boardId", board._id)
        )
        .unique()
        .then((favorite) => {
          return {
            ...board,
            // DBのお気に入りに入っているかどうかの状態を逆にする
            isFavorite: !!favorite,
          };
        });
    });

    const boardsWithFavoriteBoolean = Promise.all(boardsWithFavoriteRelations);

    return boardsWithFavoriteBoolean;
  },
});
