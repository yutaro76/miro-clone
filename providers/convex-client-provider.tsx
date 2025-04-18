"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Authenticated, AuthLoading, ConvexReactClient } from "convex/react";
import { Loading } from "@/components/auth/loading";

interface ConvexClientProviderProps {
  children: React.ReactNode;
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

const convex = new ConvexReactClient(convexUrl);

// ログイン機能を全体で使うために、大元のlayout.tsxを包む形で使われる。
export const ConvexClientProvider = ({
  children,
}: ConvexClientProviderProps) => {
  return (
    <ClerkProvider>
      {
        // eslint-disable-next-line
        <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
          {/* ログインできた状態でのみページが表示される */}
          <Authenticated>{children}</Authenticated>
          {/* ローディング中はローディングを表示させる */}
          <AuthLoading>
            <Loading />
          </AuthLoading>
        </ConvexProviderWithClerk>
      }
    </ClerkProvider>
  );
};
