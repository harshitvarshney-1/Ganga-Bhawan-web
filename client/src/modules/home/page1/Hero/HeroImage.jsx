import React from "react";

const features = [
  { icon: "🛏️", label: "Furnished Rooms" },
  { icon: "📶", label: "High Speed Wi-Fi" },
  { icon: "💧", label: "RO Water" },
  { icon: "🔒", label: "CCTV Security" },
  { icon: "⚡", label: "Power Backup" },
  { icon: "🌿", label: "Peaceful Area" },
];

// Rendered twice so the marquee loops seamlessly (track slides by -50%).
const marqueeItems = [...features, ...features];

const HeroImage = () => {
  return (
    <div className="relative w-full max-w-3xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>

      {/* Breathing glow behind the card */}
      <div className="hero-glow absolute inset-0 -m-8 rounded-[2rem] bg-primary/20 blur-3xl pointer-events-none" />

      {/* Floating card with rotating gradient border */}
      <div className="hero-float relative">
        <div className="hero-frame shadow-2xl shadow-primary/20">
          <div className="relative rounded-[1.35rem] overflow-hidden bg-card">
            {/* Full image — native 4:3 ratio, nothing cropped */}
            <img
              src="https://res.cloudinary.com/dti0b5pna/image/upload/v1788930033/Home_chiz7c.png"
              alt="Ganga Bhawan building front view"
              loading="lazy"
              width={1448}
              height={1086}
              className="block w-full h-auto aspect-[4/3] object-contain"
            />

            {/* Light sweep */}
            <div className="hero-shine" />

            {/* Status badge */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 px-3 py-1.5 rounded-full
              bg-background/75 backdrop-blur-md border border-border/60 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-[11px] sm:text-[12px] font-semibold text-foreground">Now Accepting Tenants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Continuous feature strip */}
      <div className="hero-marquee relative mt-6 overflow-hidden">
        <div className="hero-marquee-track">
          {marqueeItems.map(({ icon, label }, i) => (
            <span
              key={`${label}-${i}`}
              aria-hidden={i >= features.length}
              className="mr-3 flex shrink-0 items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold
                bg-card/70 backdrop-blur-md border border-border/60 text-foreground shadow-sm"
            >
              <span>{icon}</span>
              {label}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HeroImage;
