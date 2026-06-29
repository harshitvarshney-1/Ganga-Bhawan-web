const facilities = [
  "Spacious & Clean Rooms",
  "High-Speed WiFi",
  "RO Drinking Water",
  "24×7 Power Backup",
  "CCTV Surveillance",
  "Regular Cleaning",
];

const AboutFacilities = () => {
  return (
    <div className="grid md:grid-cols-2 gap-16 items-center">

      <div>
        <h2 className="text-3xl font-bold mb-6">
          Facilities That <span className="text-primary">Make Life Easy</span>
        </h2>

        <p className="text-muted-foreground mb-8 max-w-xl">
          Our facilities are designed keeping student and professional
          lifestyles in mind, ensuring convenience and comfort.
        </p>

        <ul className="grid grid-cols-2 gap-4 text-muted-foreground">
          {facilities.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2
              hover:text-primary transition"
            >
              ✔ {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl p-10 bg-gradient-to-br
        from-card to-secondary border border-border shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-primary">
          Our Commitment
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          We continuously upgrade our services and infrastructure to
          maintain a disciplined, hygienic, and secure environment for
          all residents.
        </p>
      </div>

    </div>
  );
};

export default AboutFacilities;
