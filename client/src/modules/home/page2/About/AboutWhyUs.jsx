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
        Why <span className="text-primary">Choose Ganga Bhawan?</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {points.map((point) => (
          <div
            key={point}
            className="p-6 rounded-xl bg-card
            border border-border shadow-sm
            hover:border-primary/40 hover:-translate-y-1
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
