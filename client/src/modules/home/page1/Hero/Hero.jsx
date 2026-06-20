import React from "react";
import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

const Hero = () => {
  return (
    <section className="pt-16 sm:pt-20 md:pt-24 pb-16 sm:pb-20 px-4 sm:px-8 md:px-12 bg-background text-foreground">

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start md:items-center">
        
        <HeroContent />
        <HeroImage />

      </div>
    </section>
  );
};

export default Hero;
