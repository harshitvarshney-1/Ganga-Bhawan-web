import React, { useState } from "react";
import Logo from "./Logo";
import HyperLinks from "./HyperLinks";
import Buttons from "./Buttons";
import { ThemeToggle } from "../../atoms/ThemeToggle/ThemeToggle";

const NavBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/70">
        <nav className="h-16 px-4 sm:px-8 md:px-12 flex items-center justify-between text-foreground">

          {/* Logo */}
          <Logo />

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <HyperLinks />
            <ThemeToggle />
            <Buttons />
          </div>

          {/* Hamburger (Mobile) */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="flex flex-col gap-[5px]"
              onClick={() => setOpen(true)}
            >
              <span className="w-5 h-[2px] bg-foreground block"></span>
              <span className="w-5 h-[2px] bg-foreground block"></span>
              <span className="w-5 h-[2px] bg-foreground block"></span>
            </button>
          </div>

        </nav>
      </header>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-background/50 z-40"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-[260px]
        bg-popover border-l border-border z-50 transform
        ${open ? "translate-x-0" : "translate-x-full"}
        transition-transform duration-300`}
      >

        {/* Drawer Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-border">
          <span className="text-[13px] font-semibold text-primary">Menu</span>
          <button
            className="text-muted-foreground hover:text-primary transition text-lg font-medium"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Drawer Content */}
        <div className="px-5 py-6 space-y-6" onClick={() => setOpen(false)}>
          <HyperLinks />
          <div className="pt-4 border-t border-border">
            <Buttons />
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
