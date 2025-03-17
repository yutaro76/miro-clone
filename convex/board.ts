import { mutation } from "./_generated/server";
import { v } from "convex/values";

const images = [
  "/placeholders/1.svg",
  "/placeholders/2.svg",
  "/placeholders/3.svg",
  "/placeholders/4.svg",
  "/placeholders/5.svg",
  "/placeholders/6.svg",
  "/placeholders/7.svg",
  "/placeholders/8.svg",
  "/placeholders/9.svg",
  "/placeholders/10.svg",
];

export const create = mutation({
  args: {
    orgId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }
    // 0から1の間で小数を生成（0.2..., 0.6...）
    // 10のimagesがあるので10倍する
    // Math.floorで小数点以下を削除
    // 2や6が残り、画像が一つ選択される
    const randomImage = images[Math.floor(Math.random() * images.length)];

    // boardsはschemaの名前
    // ここでconvexのデータベースに値を入れる。
    const board = await ctx.db.insert("boards", {
      title: args.title,
      orgId: args.orgId,
      authorId: identity.subject,
      // nameは絶対あるので、必ずという意味で!をつける
      authorName: identity.name! || identity.email!,
      imageUrl: randomImage,
    });

    return board;
  },
});
