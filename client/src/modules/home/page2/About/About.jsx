import AboutIntro from "./AboutIntro";
import AboutFacilities from "./AboutFacilities";
import AboutRules from "./AboutRules";
import AboutWhyUs from "./AboutWhyUs";

const About = () => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 md:px-12">
      <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">
        <AboutIntro />
        <AboutFacilities />
        <AboutRules />
        <AboutWhyUs />
      </div>
    </section>
  );
};

export default About;
