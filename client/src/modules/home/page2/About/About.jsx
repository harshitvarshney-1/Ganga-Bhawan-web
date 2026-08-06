import AboutIntro from "./AboutIntro";
import AboutFacilities from "./AboutFacilities";
import AboutRules from "./AboutRules";
import AboutWhyUs from "./AboutWhyUs";

const About = () => {
  return (
    <section className="pt-10 sm:pt-14 pb-16 sm:pb-20 px-4 sm:px-8 md:px-12 bg-background text-foreground">
      <div className="max-w-7xl mx-auto space-y-20">
        <AboutIntro />
        <AboutFacilities />
        <AboutRules />
        <AboutWhyUs />
      </div>
    </section>
  );
};

export default About;
