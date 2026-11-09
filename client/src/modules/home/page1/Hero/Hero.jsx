import React from "react";
import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

const Hero = () => {
  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-start px-4 sm:px-8 pt-24 md:pt-28 pb-16 overflow-hidden">

      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Large radial glow center */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-primary/8 blur-[100px]" />
        {/* Top-right orb */}
        <div className="absolute -top-20 right-0 w-64 h-64 rounded-full bg-primary/6 blur-3xl animate-float" />
        {/* Bottom-left orb */}
        <div className="absolute bottom-10 -left-20 w-48 h-48 rounded-full bg-primary/5 blur-2xl" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Main content — stacked, centered */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center gap-10 md:gap-14">
        <HeroContent />
        <HeroImage />
      </div>

    </section>
  );
};

export default Hero;
