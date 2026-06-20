import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LogoIcon from "../../atoms/Logo";

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
      <div className="text-primary hover:scale-110 transition-transform">
        <LogoIcon size={32} />
      </div>
      <div>
        <span className="block font-bold">Ganga Bhawan</span>
        <span className="text-[11px] text-muted-foreground font-normal">Hariom</span>
      </div>
    </Link>
  );
};

export default Logo;
