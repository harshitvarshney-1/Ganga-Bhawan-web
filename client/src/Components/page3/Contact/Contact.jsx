import ContactHeader from "./ContactHeader";
import ContactCards from "./ContactCards";
import ContactMap from "./ContactMap";

const Contact = () => {
  return (
    <section className="pt-28 pb-24 px-12 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto space-y-24">
        <ContactHeader />
        <ContactCards />
        <ContactMap />
      </div>
    </section>
  );
};

export default Contact;
