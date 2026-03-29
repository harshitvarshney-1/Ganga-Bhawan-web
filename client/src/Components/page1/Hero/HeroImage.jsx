import React from "react";

const HeroImage = () => {
  return (
    <div className="flex justify-center animate-slideUp">
      <div className="relative">

        {/* glow effect */}
        <div className="absolute -inset-4 rounded-2xl
          bg-cyan-500/20 blur-2xl"></div>

        <img
          src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
          alt="Hostel Room"
          className="relative w-[420px] rounded-2xl shadow-2xl
          hover:scale-105 transition duration-300"
        />

      </div>
    </div>
  );
};

export default HeroImage;
