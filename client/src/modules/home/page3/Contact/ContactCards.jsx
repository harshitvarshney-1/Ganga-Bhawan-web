const contactData = [
  {
    title: "Call Us",
    value: ["+91 84102 25050", "+91 74538 57474"],
    accent: "cyan",
    icon: "📞",
  },
  {
    title: "WhatsApp",
    value: ["Chat with us on WhatsApp"],
    action: "https://wa.me/917453857474",
    accent: "green",
    icon: "💬",
  },
  {
    title: "Email",
    value: ["harshitvarshney822@gmail.com"],
    action: "mailto:harshitvarshney822@gmail.com",
    accent: "blue",
    icon: "📧",
  },
  {
    title: "Visit Us",
    value: [
      "Ganga Bhawan (Hariom)",
      "Badhauta Road, Chaumuhan",
      "Mathura, UP – 281406",
    ],
    accent: "orange",
    icon: "📍",
  },
];

const ContactCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {contactData.map((item) => (
        <div
          key={item.title}
          className="p-8 rounded-2xl bg-card
          border border-border shadow-sm
          hover:border-primary/40
          hover:-translate-y-1 transition"
        >
          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/20 flex items-center justify-center mb-4 text-3xl">
            {item.icon}
          </div>

          <h3 className="text-xl font-semibold mb-4 text-foreground">
            {item.title}
          </h3>

          <div className="space-y-2 text-muted-foreground text-sm">
            {item.value.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {item.action && (
            <a
              href={item.action}
              target={item.title === "Email" ? "_self" : "_blank"}
              rel="noreferrer"
              className={`inline-block mt-4 px-4 py-2 rounded-md
              ${item.title === "WhatsApp" 
                ? "bg-green-500/10 text-green-400 hover:bg-green-500" 
                : "bg-primary/100/10 text-blue-400 hover:bg-primary/100"
              }
              hover:text-foreground transition text-sm font-medium`}
            >
              {item.title === "WhatsApp" ? "Open WhatsApp" : "Send Email"}
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContactCards;
