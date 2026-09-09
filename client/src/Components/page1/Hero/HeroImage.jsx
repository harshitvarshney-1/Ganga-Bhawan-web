import React from "react";

const HeroImage = () => {
  return (
    <div className="flex justify-center animate-slideUp">
      <div className="relative">

        {/* glow effect */}
        <div className="absolute -inset-4 rounded-2xl
          bg-cyan-500/20 blur-2xl"></div>

        <img
          src="https://res.cloudinary.com/dti0b5pna/image/upload/v1788930033/Home_chiz7c.png"
          alt="Hostel Room"
          className="relative w-[420px] rounded-2xl shadow-2xl
          hover:scale-105 transition duration-300"
        />

      </div>
    </div>
  );
};

export default HeroImage;
