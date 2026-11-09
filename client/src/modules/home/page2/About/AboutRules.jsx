const rules = [
  { num: "01", text: "Valid ID proof is mandatory at the time of admission" },
  { num: "02", text: "Maintain silence after 10:00 PM" },
  { num: "03", text: "Visitors allowed only with prior permission" },
  { num: "04", text: "Cleanliness must be maintained at all times" },
  { num: "05", text: "Advance payment required to confirm booking" },
];

const AboutRules = () => {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          House{" "}
          <span className="text-primary">Rules</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Maintaining peace, respect, and discipline for everyone.
        </p>
      </div>

      {/* Horizontal scrollable rule cards */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent -mx-4 px-4">
        {rules.map(({ num, text }) => (
          <div
            key={num}
            className="snap-start shrink-0 w-[260px] sm:w-[280px] relative p-6 rounded-2xl
              bg-card border border-border
              hover:border-primary/40 hover:shadow-[0_8px_24px_oklch(62%_0.18_155/0.08)]
              transition-all duration-300 group"
          >
            {/* Large number watermark */}
            <span className="absolute top-3 right-4 text-5xl font-black text-primary/8
              group-hover:text-primary/15 transition-colors select-none">
              {num}
            </span>

            <div className="relative">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full
                bg-primary/15 text-primary text-[12px] font-extrabold mb-4
                group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {num}
              </span>
              <p className="text-foreground text-[14px] leading-relaxed font-medium">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AboutRules;
