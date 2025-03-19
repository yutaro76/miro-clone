export const Info = () => {
  return (
    // 親要素のcanvas.tsxでrelativeを設定しているため、ここでabsoluteを使える
    <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
      Board Info
    </div>
  );
};

Info.Skeleton = function InfoSkeleton() {
  return (
    <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md w-[300px]" />
  );
};
