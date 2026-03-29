import React from "react";
import { useNavigate } from "react-router-dom";

const HeroContent = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fadeIn">

      <span className="inline-block px-4 py-1 text-sm rounded-full
        bg-cyan-500/10 text-cyan-400 tracking-wide">
        Trusted Hostel & PG
      </span>

      <h1 className="text-4xl md:text-5xl font-bold leading-tight">
        Comfortable & Secure Stay at <br />
        <span className="text-cyan-400">
          Ganga Bhawan (Hariom)
        </span>
      </h1>

      <p className="text-gray-400 text-lg max-w-xl">
        Affordable accommodation for students and working professionals
        with all essential facilities.
      </p>

      {/* FEATURES */}
      <ul className="grid grid-cols-2 gap-3 text-sm text-gray-300">
        <li>✔ Furnished Rooms</li>
        <li>✔ High Speed Wi-Fi</li>
        <li>✔ RO Drinking Water</li>
        <li>✔ 24×7 CCTV Security</li>
        <li>✔ Power Backup</li>
        <li>✔ Peaceful Area</li>
      </ul>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={() => navigate('/register')}
          className="px-6 py-3 rounded-md font-medium
          bg-cyan-500 hover:bg-cyan-600 transition"
        >
          Register Now
        </button>
      </div>

    </div>
  );
};

export default HeroContent;