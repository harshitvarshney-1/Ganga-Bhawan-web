import { useState } from "react";

const LoginTabs = () => {
  const [active, setActive] = useState("tenant");

  return (
    <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
      {["tenant", "admin"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition
            ${
              active === tab
                ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-foreground"
                : "text-gray-400 hover:text-foreground"
            }`}
        >
          {tab === "tenant" ? "Tenant Login" : "Admin Login"}
        </button>
      ))}
    </div>
  );
};

export default LoginTabs;
