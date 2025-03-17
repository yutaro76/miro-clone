export const Overlay = () => {
  return (
    // opacityは数字が大きい方が濃くなり、数字が小さい方が薄くなる
    <div className="opacity-0 group-hover:opacity-50 transition-opacity h-full w-full bg-black" />
  );
};
