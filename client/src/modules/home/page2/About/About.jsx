import AboutIntro from "./AboutIntro";
import AboutFacilities from "./AboutFacilities";
import AboutRules from "./AboutRules";
import AboutWhyUs from "./AboutWhyUs";

const About = () => {
  return (
    <section className="pt-20 pb-24 px-12 bg-background text-foreground">
      <div className="max-w-7xl mx-auto space-y-28">
        <AboutIntro />
        <AboutFacilities />
        <AboutRules />
        <AboutWhyUs />
      </div>
    </section>
  );
};

export default About;
