import ContactHeader from "./ContactHeader";
import ContactCards from "./ContactCards";
import ContactMap from "./ContactMap";

const Contact = () => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 md:px-12">
      <div className="max-w-7xl mx-auto space-y-12">

        <ContactHeader />

        {/* Split panel: contact info left + map right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContactCards />
          <ContactMap />
        </div>

      </div>
    </section>
  );
};

export default Contact;
