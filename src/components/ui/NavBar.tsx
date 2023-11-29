import { UserButton } from "@clerk/nextjs";
import { Navbar, NavbarContent, divider } from "@nextui-org/react";
import React from "react";

const NavBar = () => {
  return (
    <nav className="w-full bg-gradient-to-tr from-red-500 to-pink-500 ">
      <div className="mx-2 my-2 flex justify-end">
        <UserButton afterSignOutUrl="/"></UserButton>
      </div>
    </nav>
  );
};

export default NavBar;
