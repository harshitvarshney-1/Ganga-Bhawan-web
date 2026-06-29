import { Link } from "react-router-dom";

const Buttons = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4">

      {/* Login */}
      <Link to="/login">
        <button
          className="w-full px-5 py-2 rounded-md border border-border
          text-muted-foreground hover:bg-muted transition"
        >
          Login
        </button>
      </Link>

      {/* Register */}
      <Link to="/register">
        <button
          className="w-full px-5 py-2 rounded-md font-medium text-foreground
          bg-gradient-to-r from-cyan-500 to-teal-500
          hover:opacity-90 transition"
        >
          Register
        </button>
      </Link>

    </div>
  );
};

export default Buttons;