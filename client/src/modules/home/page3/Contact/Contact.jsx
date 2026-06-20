import ContactHeader from "./ContactHeader";
import ContactCards from "./ContactCards";
import ContactMap from "./ContactMap";

const Contact = () => {
  return (
    <section className="pt-20 sm:pt-28 pb-20 sm:pb-24 px-4 sm:px-8 md:px-12 bg-background text-foreground">
      <div className="max-w-7xl mx-auto space-y-24">
        <ContactHeader />
        <ContactCards />
        <ContactMap />
      </div>
    </section>
  );
};

export default Contact;
