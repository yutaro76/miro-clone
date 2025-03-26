import { useMutation, useSelf } from "@/liveblocks.config";

export const useDeleteLayers = () => {
  const selection = useSelf((me) => me.presence.selection);

  return useMutation(
    ({ storage, setMyPresence }) => {
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");

      // 一つのlayerの情報がstorageの中の二箇所の部分layersとlayerIdsにあるので、2回deleteが必要
      for (const id of selection) {
        liveLayers.delete(id);

        const index = liveLayerIds.indexOf(id);

        // indexが存在する場合
        if (index !== -1) {
          liveLayerIds.delete(index);
        }

        setMyPresence({ selection: [] }, { addToHistory: true });
      }
    },
    [selection]
  );
};
