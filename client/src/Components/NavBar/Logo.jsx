import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Logo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      // If already on home, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to home
      navigate("/", { replace: true });
    }
  };

  return (
    <Link
      to="/"
      onClick={handleLogoClick}
      className="flex items-center gap-2
        text-lg font-semibold tracking-wide
        hover:text-cyan-400 transition cursor-pointer"
    >
      <i className="fa-solid fa-house text-cyan-400 text-xl"></i>
      <span>
        Ganga Bhawan
        <span className="font-normal text-gray-400"> (Hariom)</span>
      </span>
    </Link>
  );
};

export default Logo;