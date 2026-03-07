import React from "react";
import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

const Hero = () => {
  return (
    <section className="pt-28 pb-20 px-12
      bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      
      <div className="max-w-7xl mx-auto
        grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        <HeroContent />
        <HeroImage />

      </div>
    </section>
  );
};

export default Hero;
