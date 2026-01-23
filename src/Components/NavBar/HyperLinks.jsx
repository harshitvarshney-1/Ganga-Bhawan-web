import { useNavigate, useLocation } from "react-router-dom";

const HyperLinks = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleScroll = (id) => {
    // If we're not on the home page, navigate to home first
    if (location.pathname !== "/") {
      navigate("/");
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const section = document.getElementById(id);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // If we're already on home page, just scroll
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <ul className="flex flex-col md:flex-row gap-6 md:gap-10
      text-[16px] font-medium text-gray-300">
      {[
        { name: "Home", id: "home" },
        { name: "About", id: "about" },
        { name: "Contact", id: "contact" },
      ].map((item) => (
        <li key={item.name}>
          <button
            onClick={() => handleScroll(item.id)}
            className="hover:text-cyan-400 transition"
          >
            {item.name}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default HyperLinks;