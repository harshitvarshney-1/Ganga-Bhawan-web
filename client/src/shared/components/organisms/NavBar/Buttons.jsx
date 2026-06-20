import { Link } from "react-router-dom";

const Buttons = () => {
  return (
    <div className="flex flex-col md:flex-row gap-2.5">
      <Link to="/login">
        <button className="w-full px-4 py-1.5 rounded-md border border-border text-[13px] text-foreground hover:bg-accent transition">
          Login
        </button>
      </Link>
      <Link to="/register">
        <button className="w-full px-4 py-1.5 rounded-md text-[13px] font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition">
          Register
        </button>
      </Link>
    </div>
  );
};

export default Buttons;
