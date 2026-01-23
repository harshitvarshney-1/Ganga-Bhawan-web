const AboutIntro = () => {
  return (
    <div className="grid md:grid-cols-2 gap-16 items-center">

      {/* TEXT */}
      <div className="space-y-6">
        <span className="text-cyan-400 text-sm tracking-widest uppercase">
          About Ganga Bhawan
        </span>

        <h2 className="text-3xl md:text-4xl font-bold leading-tight">
          A Safe & Trusted Hostel / PG <br />
          <span className="text-cyan-400">for Students & Professionals</span>
        </h2>

        <p className="text-gray-400 leading-relaxed">
          Ganga Bhawan (Hariom) is a reliable accommodation space in
          Chaumuhan, built to provide more than just rooms. We focus on
          comfort, safety, discipline, and a peaceful living environment
          so that residents can fully concentrate on their goals.
        </p>

        <p className="text-gray-400 leading-relaxed">
          The property is personally managed by
          <span className="text-cyan-400 font-medium">
            {" "}Shri Hariom Varshney{" "}
          </span>
          and his family, ensuring every tenant receives respectful and
          prompt support.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-6">
        {[
          ["10+ Years", "Experience"],
          ["100+", "Happy Tenants"],
          ["24×7", "Security"],
          ["100%", "Peaceful Area"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="p-6 rounded-xl bg-slate-900 border border-slate-800
            hover:border-cyan-500/40 transition"
          >
            <h3 className="text-2xl font-bold text-cyan-400">{value}</h3>
            <p className="text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AboutIntro;
