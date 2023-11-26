import { UserButton } from "@clerk/nextjs";
import { divider } from "@nextui-org/react";
import React from "react";

const NavBar = () => {
  return (
    <div className="ml-2 mt-2">
      <UserButton afterSignOutUrl="/"></UserButton>
    </div>
  );
};

export default NavBar;
