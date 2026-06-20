const ContactHeader = () => {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-4">
      <span className="text-primary text-sm tracking-widest uppercase">
        Contact Us
      </span>

      <h1 className="text-4xl md:text-5xl font-bold">
        Let’s <span className="text-primary">Connect</span>
      </h1>

      <p className="text-gray-400 text-lg">
        Have questions about rooms, facilities, or availability?
        Reach out to us anytime — we’re happy to help.
      </p>
    </div>
  );
};

export default ContactHeader;
