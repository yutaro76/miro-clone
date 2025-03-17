import { useState } from "react";
import { useMutation } from "convex/react";

// mutationFunction自体が操作を行うエンドポイント
// eslint-disable-next-line
export const useApiMutation = (mutationFunction: any) => {
  const [pending, setPending] = useState(false);
  // useMutationはconvexから提供されるフック
  const apiMutation = useMutation(mutationFunction);

  // payloadにはapiに渡されるパラメーターが入る
  // eslint-disable-next-line
  const mutate = (payload: any) => {
    setPending(true);
    return apiMutation(payload) // eslint-disable-line
      .finally(() => setPending(false))
      .then((result) => {
        return result; // eslint-disable-line
      })
      .catch((error) => {
        throw error;
      });
  };

  return {
    mutate,
    pending,
  };
};
