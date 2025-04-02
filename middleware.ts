import { authMiddleware } from "@clerk/nextjs/server";

// eslint-disable-next-line
export default authMiddleware();

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
