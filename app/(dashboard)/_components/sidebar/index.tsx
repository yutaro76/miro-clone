export const Sidebar = () => {
  return (
    // z-[num]は重なりの順番を示すために使われる
    // left-0は左側の0の位置からスタート
    <aside className="fixed z-[1] left-0 bg-blue-950 h-full w-[60px] flex p-3 flex-col gap-y-4 text-white">
      Side
    </aside>
  );
};
