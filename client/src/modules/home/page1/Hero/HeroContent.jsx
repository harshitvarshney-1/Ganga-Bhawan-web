import React from "react";
import { useNavigate } from "react-router-dom";

const HeroContent = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fadeIn">

      <span className="inline-block px-3 py-1 text-[12px] rounded-full bg-primary/10 text-primary font-medium tracking-wide">
        Trusted Hostel & PG
      </span>

      <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
        Comfortable & Secure Stay at <br />
        <span className="text-primary">Ganga Bhawan (Hariom)</span>
      </h1>

      <p className="text-muted-foreground text-lg max-w-xl">
        Affordable accommodation for students and working professionals
        with all essential facilities.
      </p>

      {/* Features */}
      <ul className="grid grid-cols-2 gap-3 text-[13px] text-muted-foreground">
        <li className="flex items-center gap-2"><span className="text-primary">✔</span> Furnished Rooms</li>
        <li className="flex items-center gap-2"><span className="text-primary">✔</span> High Speed Wi-Fi</li>
        <li className="flex items-center gap-2"><span className="text-primary">✔</span> RO Drinking Water</li>
        <li className="flex items-center gap-2"><span className="text-primary">✔</span> 24×7 CCTV Security</li>
        <li className="flex items-center gap-2"><span className="text-primary">✔</span> Power Backup</li>
        <li className="flex items-center gap-2"><span className="text-primary">✔</span> Peaceful Area</li>
      </ul>

      {/* CTA */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => navigate('/register')}
          className="px-6 py-2.5 rounded-md font-medium text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
        >
          Register Now
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-md font-medium text-[13px] border border-border text-foreground hover:bg-accent transition"
        >
          Sign In
        </button>
      </div>

    </div>
  );
};

export default HeroContent;
