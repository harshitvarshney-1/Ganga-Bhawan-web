const ContactHeader = () => {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-4">
      <span className="inline-flex items-center gap-2 text-primary text-[11px] font-bold tracking-[0.18em] uppercase">
        <span className="w-5 h-[1.5px] bg-primary" />
        Contact Us
        <span className="w-5 h-[1.5px] bg-primary" />
      </span>

      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
        Let's{" "}
        <span className="relative inline-block">
          <span className="text-primary">Connect</span>
          <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 120 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M2 6 Q60 1 118 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary/50"/>
          </svg>
        </span>
      </h1>

      <p className="text-muted-foreground text-[15px] leading-relaxed">
        Have questions about rooms, facilities, or availability?
        Reach out to us anytime — we're happy to help.
      </p>
    </div>
  );
};

export default ContactHeader;
