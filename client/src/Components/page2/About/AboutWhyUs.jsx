const points = [
  "Prime location near market & transport",
  "Affordable and flexible stay options",
  "Family-managed & disciplined environment",
  "Trusted by students & professionals",
];

const AboutWhyUs = () => {
  return (
    <div className="text-center space-y-10">

      <h2 className="text-3xl md:text-4xl font-bold">
        Why <span className="text-cyan-400">Choose Ganga Bhawan?</span>
      </h2>

      <div className="grid md:grid-cols-4 gap-6">
        {points.map((point) => (
          <div
            key={point}
            className="p-6 rounded-xl bg-slate-900
            border border-slate-800
            hover:border-cyan-500/40 hover:-translate-y-1
            transition"
          >
            <p className="text-muted-foreground">{point}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AboutWhyUs;
