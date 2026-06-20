import { useNavigate, useLocation } from "react-router-dom";

const HyperLinks = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById(id);
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <ul className="flex flex-col md:flex-row gap-5 md:gap-8 text-[13px] font-medium text-muted-foreground">
      {[
        { name: "Home", id: "home" },
        { name: "About", id: "about" },
        { name: "Contact", id: "contact" },
      ].map((item) => (
        <li key={item.name}>
          <button
            onClick={() => handleScroll(item.id)}
            className="hover:text-primary transition w-full text-left block"
          >
            {item.name}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default HyperLinks;
