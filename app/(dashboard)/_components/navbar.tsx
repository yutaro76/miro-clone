"use client";

import { UserButton } from "@clerk/nextjs";

export const Navbar = () => {
  return (
    <div className="flex items-center gap-x-4 p-5 bg-green-500">
      {/* flex-1がsearchにあり横に自由に動くので、ボタンは右に追いやられる */}
      <div className="hidden lg:flex flex-1 bg-yellow-500">search</div>
      <UserButton />
    </div>
  );
};
