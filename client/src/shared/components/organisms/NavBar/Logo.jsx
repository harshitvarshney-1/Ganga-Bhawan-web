import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Logo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <Link
      to="/"
      onClick={handleLogoClick}
      className="flex items-center gap-2.5 text-[14px] font-semibold text-foreground hover:text-primary transition cursor-pointer"
    >
      <span className="text-lg">🏠</span>
      <span>
        Ganga Bhawan
        <span className="font-normal text-muted-foreground"> (Hariom)</span>
      </span>
    </Link>
  );
};

export default Logo;
