import React, { useState } from "react";
import Logo from "./Logo";
import HyperLinks from "./HyperLinks";
import Buttons from "./Buttons";

const NavBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full z-50 bg-slate-900 border-b border-slate-800">
        <nav className="h-20 px-4 sm:px-8 md:px-12 flex items-center justify-between text-white">

          {/* Logo */}
          <Logo />

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            <HyperLinks />
            <Buttons />
          </div>

          {/* Hamburger (Mobile) */}
          <button
            className="md:hidden flex flex-col gap-[5px]"
            onClick={() => setOpen(true)}
          >
            <span className="w-6 h-[2px] bg-white"></span>
            <span className="w-6 h-[2px] bg-white"></span>
            <span className="w-6 h-[2px] bg-white"></span>
          </button>

        </nav>
      </header>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px]
        bg-slate-950 z-50 transform
        ${open ? "translate-x-0" : "translate-x-full"}
        transition-transform duration-300`}
      >

        {/* Drawer Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800">
          <span className="text-lg font-semibold text-cyan-400">
            Menu
          </span>

          <button
            className="text-2xl text-white hover:text-cyan-400 transition"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Drawer Content */}
        <div className="px-6 py-8 space-y-8" onClick={() => setOpen(false)}>
          <HyperLinks />

          <div className="pt-6 border-t border-slate-800">
            <Buttons />
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;