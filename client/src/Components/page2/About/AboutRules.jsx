const rules = [
  "Valid ID proof is mandatory at the time of admission",
  "Maintain silence after 10:00 PM",
  "Visitors allowed only with prior permission",
  "Cleanliness must be maintained",
  "Advance payment required to confirm booking",
];

const AboutRules = () => {
  return (
    <div className="bg-card border border-border shadow-sm rounded-2xl p-12">

      <h2 className="text-3xl font-bold mb-6">
        House <span className="text-cyan-400">Rules & Discipline</span>
      </h2>

      <p className="text-muted-foreground mb-8 max-w-2xl">
        To maintain a peaceful and respectful environment, all residents
        are requested to follow the rules mentioned below.
      </p>

      <ol className="grid md:grid-cols-2 gap-4 text-muted-foreground list-decimal list-inside">
        {rules.map((rule) => (
          <li
            key={rule}
            className="hover:text-cyan-400 transition"
          >
            {rule}
          </li>
        ))}
      </ol>

    </div>
  );
};

export default AboutRules;
