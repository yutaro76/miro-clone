import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAllOrThrow } from "convex-helpers/server/relationships";

export const get = query({
  args: {
    orgId: v.string(),
    // 検索窓で検索するときに使う
    search: v.optional(v.string()),
    favorites: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    // organization内にfavoriteがついているboardがある場合
    if (args.favorites) {
      const favoritedBoards = await ctx.db
        .query("userFavorites")
        .withIndex("by_user_org", (q) =>
          q.eq("userId", identity.subject).eq("orgId", args.orgId)
        )
        .order("desc")
        .collect();

      // organization内のfavoriteがついたboardのidを取得
      const ids = favoritedBoards.map((b) => b.boardId);

      const boards = await getAllOrThrow(ctx.db, ids);

      return boards.map((board) => ({
        ...board,
        isFavorite: true,
      }));
    }

    const title = args.search as string;
    let boards = [];

    if (title) {
      // 検索窓用
      boards = await ctx.db
        .query("boards")
        .withSearchIndex("search_title", (q) =>
          // タイトルが一致するそのorganization内のboardを取得
          q.search("title", title).eq("orgId", args.orgId)
        )
        .collect();
    } else {
      // ここでboardの情報を取得する
      boards = await ctx.db
        .query("boards")
        // schema.tsで'by_org'で区別すると規定
        // by_orgはorgのidが使われるため、実質、そのorg内のboardsを全て取得する
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .order("desc")
        // 全ての情報を取得
        .collect();
    }

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
