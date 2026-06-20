import { Link } from "react-router-dom";

const LoginForm = () => {
  return (
    <form className="space-y-5">

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-3 rounded-lg
            bg-slate-800 border border-slate-700
            text-foreground placeholder-gray-500
            focus:outline-none focus:border-cyan-500
            focus:ring-2 focus:ring-cyan-500/20 transition"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full px-4 py-3 rounded-lg
            bg-slate-800 border border-slate-700
            text-foreground placeholder-gray-500
            focus:outline-none focus:border-cyan-500
            focus:ring-2 focus:ring-cyan-500/20 transition"
        />
      </div>

      {/* Button */}
      <button
        type="submit"
        className="w-full py-3 rounded-lg font-semibold text-foreground
          bg-gradient-to-r from-cyan-500 to-teal-500
          hover:opacity-90 hover:-translate-y-[1px]
          transition shadow-lg shadow-cyan-500/30"
      >
        Login
      </button>

      {/* Register link */}
      <p className="text-sm text-center text-gray-400 pt-3">
        Don't have an account?{" "}
        <Link to="/register" className="text-cyan-400 hover:underline cursor-pointer">
          Register
        </Link>
      </p>

    </form>
  );
};

export default LoginForm;