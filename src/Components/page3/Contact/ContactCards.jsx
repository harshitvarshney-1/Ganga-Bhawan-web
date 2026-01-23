const contactData = [
  {
    title: "Call Us",
    value: ["+91 84102 25050", "+91 74538 57474"],
    accent: "cyan",
  },
  {
    title: "WhatsApp",
    value: ["Chat with us on WhatsApp"],
    action: "https://wa.me/917453857474",
    accent: "green",
  },
  {
    title: "Email",
    value: ["harshitvarshney822@gmail.com"],
    accent: "blue",
  },
  {
    title: "Visit Us",
    value: [
      "Ganga Bhawan (Hariom)",
      "Badhauta Road, Chaumuhan",
      "Mathura, UP – 281406",
    ],
    accent: "orange",
  },
];

const ContactCards = () => {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {contactData.map((item) => (
        <div
          key={item.title}
          className="p-8 rounded-2xl bg-slate-900
          border border-slate-800
          hover:border-cyan-500/40
          hover:-translate-y-1 transition"
        >
          <h3 className="text-xl font-semibold mb-4 text-white">
            {item.title}
          </h3>

          <div className="space-y-2 text-gray-400 text-sm">
            {item.value.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {item.action && (
            <a
              href={item.action}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-4 px-4 py-2 rounded-md
              bg-green-500/10 text-green-400
              hover:bg-green-500 hover:text-white
              transition text-sm font-medium"
            >
              Open WhatsApp
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContactCards;
