const stats = [
  { value: "2+", label: "Years Experience", icon: "🏛️" },
  { value: "100+", label: "Happy Tenants", icon: "😊" },
  { value: "24×7", label: "Security", icon: "🛡️" },
  { value: "100%", label: "Peaceful Area", icon: "🌿" },
];

const AboutIntro = () => {
  return (
    <div className="space-y-12">

      {/* Section header — centered */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-2 text-primary text-[11px] font-bold tracking-[0.18em] uppercase">
          <span className="w-6 h-[1.5px] bg-primary" />
          About Us
          <span className="w-6 h-[1.5px] bg-primary" />
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          A Safe &amp; Trusted Home{" "}
          <span className="text-primary">for Everyone</span>
        </h2>
      </div>

      {/* Bento grid: big intro card + stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-5">

        {/* Large intro text card — spans 3 columns */}
        <div className="md:col-span-3 relative p-8 md:p-10 rounded-2xl bg-card border border-border overflow-hidden group">
          {/* corner orb */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/8 blur-2xl pointer-events-none group-hover:bg-primary/14 transition-colors duration-500" />
          <div className="relative space-y-4">
            <p className="text-muted-foreground leading-relaxed text-[15px]">
              <span className="text-foreground font-semibold">Ganga Bhawan (Hariom)</span> is a
              reliable accommodation space in Chaumuhan, built to provide more than
              just rooms. We focus on comfort, safety, discipline, and a peaceful
              living environment so that residents can fully concentrate on their goals.
            </p>
            <p className="text-muted-foreground leading-relaxed text-[15px]">
              The property is personally managed by{" "}
              <span className="text-primary font-semibold">Shri Hariom Varshney</span>{" "}
              and his family, ensuring every tenant receives respectful and
              prompt support.
            </p>
          </div>
        </div>

        {/* Stats — 2x2 grid spanning 2 columns */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4 md:gap-5">
          {stats.map(({ value, label, icon }) => (
            <div
              key={label}
              className="relative p-5 rounded-2xl bg-card border border-border
                hover:border-primary/50 hover:shadow-[0_0_24px_oklch(62%_0.18_155/0.1)]
                transition-all duration-300 group overflow-hidden flex flex-col items-center justify-center text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-2xl mb-2">{icon}</span>
              <p className="relative text-xl sm:text-2xl font-extrabold text-primary">{value}</p>
              <p className="relative text-muted-foreground text-[11px] font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AboutIntro;
