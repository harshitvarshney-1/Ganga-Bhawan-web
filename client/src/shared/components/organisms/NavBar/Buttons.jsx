import { Link } from "react-router-dom";

const Buttons = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4">

      {/* Login */}
      <Link to="/login">
        <button
          className="w-full px-5 py-2 rounded-md border border-gray-600
          text-gray-300 hover:bg-slate-800 transition"
        >
          Login
        </button>
      </Link>

      {/* Register */}
      <Link to="/register">
        <button
          className="w-full px-5 py-2 rounded-md font-medium text-white
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