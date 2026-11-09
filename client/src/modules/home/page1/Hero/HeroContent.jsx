import React from "react";
import { useNavigate } from "react-router-dom";

const HeroContent = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fadeInUp max-w-3xl">

      {/* Animated badge */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full
          border border-primary/30 bg-primary/5 backdrop-blur-sm
          text-primary text-[11px] font-bold tracking-[0.2em] uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          Trusted Hostel &amp; PG in Chaumuhan
        </span>
      </div>

      {/* Headline — cinematic, oversized */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.08] tracking-tight text-foreground">
        Your New Home{" "}
        <br className="hidden sm:block" />
        at{" "}
        <span className="relative inline-block text-primary">
          Ganga Bhawan
          <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 10" fill="none" aria-hidden="true">
            <path d="M4 8 Q100 0 196 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary/40"/>
          </svg>
        </span>
      </h1>

      {/* Subheading */}
      <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
        Affordable, safe &amp; modern accommodation for students and
        working professionals — managed with personal care.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button
          onClick={() => navigate('/register')}
          className="group relative px-8 py-3 rounded-xl font-semibold text-[14px] text-primary-foreground
            bg-gradient-to-r from-primary to-emerald-400
            shadow-[0_6px_24px_oklch(62%_0.18_155/0.35)]
            hover:shadow-[0_8px_36px_oklch(62%_0.18_155/0.5)]
            hover:brightness-110 active:scale-[0.97]
            transition-all duration-200 whitespace-nowrap"
        >
          Get Started →
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 rounded-xl font-semibold text-[14px]
            border border-border bg-card/50 backdrop-blur-sm
            text-foreground hover:border-primary/50 hover:bg-primary/5
            active:scale-[0.97]
            transition-all duration-200 whitespace-nowrap"
        >
          Sign In
        </button>
      </div>

      {/* Trust indicators — floating stat row */}
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        {[
          { val: "100+", label: "Happy Tenants" },
          { val: "2+", label: "Years Running" },
          { val: "24×7", label: "CCTV Security" },
        ].map(({ val, label }) => (
          <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full
            bg-card/60 backdrop-blur-sm border border-border/60 text-[12px]">
            <span className="font-extrabold text-primary">{val}</span>
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default HeroContent;
