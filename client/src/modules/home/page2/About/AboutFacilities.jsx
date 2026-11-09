const facilities = [
  { icon: "🛏️", title: "Spacious Rooms", desc: "Clean, furnished, and well-ventilated rooms for maximum comfort." },
  { icon: "📶", title: "High-Speed WiFi", desc: "Seamless connectivity for work, study, and entertainment." },
  { icon: "💧", title: "RO Drinking Water", desc: "Pure, filtered water available round the clock." },
  { icon: "⚡", title: "Power Backup", desc: "Uninterrupted electricity with 24×7 backup." },
  { icon: "📷", title: "CCTV Surveillance", desc: "Complete security monitoring of all common areas." },
  { icon: "🧹", title: "Regular Cleaning", desc: "Maintained hygiene with routine cleaning schedules." },
];

const AboutFacilities = () => {
  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          Everything You{" "}
          <span className="text-primary">Need</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Thoughtfully designed facilities for a convenient, comfortable daily life.
        </p>
      </div>

      {/* 3-column facility cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {facilities.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="relative p-6 rounded-2xl bg-card border border-border
              hover:border-primary/40 hover:-translate-y-1
              hover:shadow-[0_12px_40px_oklch(62%_0.18_155/0.08)]
              transition-all duration-300 group overflow-hidden"
          >
            {/* Glass overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <span className="relative text-3xl block mb-4">{icon}</span>
            <h3 className="relative font-bold text-foreground text-[15px] mb-1.5">{title}</h3>
            <p className="relative text-muted-foreground text-[13px] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AboutFacilities;
