import ContactHeader from "./ContactHeader";
import ContactCards from "./ContactCards";
import ContactMap from "./ContactMap";

const Contact = () => {
  return (
    <section className="pt-10 sm:pt-14 pb-16 sm:pb-20 px-4 sm:px-8 md:px-12 bg-background text-foreground">
      <div className="max-w-7xl mx-auto space-y-16">
        <ContactHeader />
        <ContactCards />
        <ContactMap />
      </div>
    </section>
  );
};

export default Contact;
