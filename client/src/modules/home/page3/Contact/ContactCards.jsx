const contactData = [
  {
    title: "Call Us",
    value: ["+91 84102 25050", "+91 74538 57474"],
    icon: "📞",
  },
  {
    title: "WhatsApp",
    value: ["Chat with us anytime"],
    action: "https://wa.me/917453857474",
    actionLabel: "Open WhatsApp →",
    icon: "💬",
  },
  {
    title: "Email",
    value: ["harshitvarshney822@gmail.com"],
    action: "mailto:harshitvarshney822@gmail.com",
    actionLabel: "Send Email →",
    icon: "📧",
  },
  {
    title: "Visit Us",
    value: [
      "Ganga Bhawan (Hariom)",
      "Badhauta Road, Chaumuhan",
      "Mathura, UP – 281406",
    ],
    icon: "📍",
  },
];

const ContactCards = () => {
  return (
    <div className="flex flex-col gap-3">
      {contactData.map((item) => (
        <div
          key={item.title}
          className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border
            hover:border-primary/40 hover:shadow-[0_4px_20px_oklch(62%_0.18_155/0.08)]
            transition-all duration-300 group"
        >
          {/* Icon */}
          <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 border border-primary/20
            flex items-center justify-center text-xl
            group-hover:bg-primary/20 transition-colors">
            {item.icon}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-bold text-foreground mb-1">{item.title}</h3>
            <div className="space-y-0.5 text-muted-foreground text-[13px]">
              {item.value.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            {item.action && (
              <a
                href={item.action}
                target={item.title === "Email" ? "_self" : "_blank"}
                rel="noreferrer"
                className="inline-block mt-2 text-primary text-[12px] font-semibold
                  hover:underline underline-offset-2 transition"
              >
                {item.actionLabel}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactCards;
