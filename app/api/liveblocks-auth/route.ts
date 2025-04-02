import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  const authorization = await auth(); // eslint-disable-line
  const user = await currentUser();

  if (!authorization || !user) {
    return new Response("Unauthorized", { status: 403 });
  }

  // boardから入ろうとしているroomの情報
  const { room } = await request.json(); // eslint-disable-line
  // roomを含むboardの情報
  const board = await convex.query(api.board.get, { id: room }); // eslint-disable-line

  // boardの大元のorganizationのidと、ログインしているorganizationのidが一致するか
  if (board?.orgId !== authorization.orgId) {
    return new Response("Unauthorized", { status: 403 });
  }

  const userEmailInfo = user.emailAddresses;
  const userEmail = userEmailInfo[0]?.emailAddress;

  const userInfo = {
    name: user.firstName || userEmail,
    picture: user.imageUrl,
  };

  const session = liveblocks.prepareSession(user.id, { userInfo });

  if (room) {
    session.allow(room, session.FULL_ACCESS); // eslint-disable-line
  }

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
