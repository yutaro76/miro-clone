"use client";

import {
  OrganizationSwitcher,
  UserButton,
  useOrganization,
} from "@clerk/nextjs";
import { SearchInput } from "./search-input";
import { InviteButton } from "./invite-button";

export const Navbar = () => {
  // 現在画面に表示されているorganizationを取得する
  const { organization } = useOrganization();

  return (
    <div className="flex items-center gap-x-4 p-5 ">
      {/* flex-1がsearchにあり横に自由に動くので、ボタンは右に追いやられる */}
      <div className="hidden lg:flex flex-1">
        <SearchInput />
      </div>
      {/* flex-1で他の要素を押しのけて広がる */}
      <div className="block lg:hidden flex-1">
        <OrganizationSwitcher
          hidePersonal
          appearance={{
            elements: {
              rootBox: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                maxWidth: "376px",
              },
              organizationSwitcherTrigger: {
                padding: "6px",
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                justifyContent: "space-between",
                backgroundColor: "white",
                height: "44px",
              },
            },
          }}
        />
      </div>
      {organization && <InviteButton />}
      <UserButton />
    </div>
  );
};
