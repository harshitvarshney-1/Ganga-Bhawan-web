const points = [
  { icon: "📍", text: "Prime location near market & transport" },
  { icon: "💰", text: "Affordable and flexible stay options" },
  { icon: "👨‍👩‍👧", text: "Family-managed & disciplined environment" },
  { icon: "⭐", text: "Trusted by students & professionals" },
];

const AboutWhyUs = () => {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 sm:p-12 md:p-16">

      {/* Corner glow */}
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative space-y-10 text-center">

        <div>
          <span className="inline-flex items-center gap-2 text-primary text-[11px] font-bold tracking-[0.18em] uppercase mb-4">
            <span className="w-5 h-[1.5px] bg-primary" />
            Why Choose Us
            <span className="w-5 h-[1.5px] bg-primary" />
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            More than just a{" "}
            <span className="text-primary">place to stay</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto leading-relaxed">
            We provide a community, a safe space, and a second home — built
            on trust, care, and years of experience.
          </p>
        </div>

        {/* Inline pill cards */}
        <div className="flex flex-wrap justify-center gap-3">
          {points.map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2.5 px-5 py-3 rounded-full
                bg-card/80 backdrop-blur-sm border border-border
                hover:border-primary/50 hover:shadow-[0_4px_16px_oklch(62%_0.18_155/0.1)]
                transition-all duration-200 text-[13px] font-medium text-foreground"
            >
              <span className="text-lg">{icon}</span>
              {text}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AboutWhyUs;
