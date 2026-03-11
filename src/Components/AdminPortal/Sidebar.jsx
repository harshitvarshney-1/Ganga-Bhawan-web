import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, UserPlus, Users, IndianRupee, History, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pending', label: 'Pending Apps', icon: UserPlus },
    { id: 'approved', label: 'Current Tenants', icon: Users },
    { id: 'pendingPayments', label: 'Payment Approvals', icon: IndianRupee },
    { id: 'paymentStatus', label: 'Payment History', icon: History },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-2xl">🏠</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight font-outfit">Ganga Bhawan</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${
                activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'
              }`} />
              <span className="font-semibold text-sm">{item.label}</span>
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-slate-800/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all font-semibold text-sm border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-5 h-5" />
          Logout Securely
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar: always visible ── */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-slate-300 fixed top-0 left-0 bottom-0 z-50">
        <SidebarContent />
      </aside>

      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile sidebar: slides in/out ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 bottom-0 w-72 bg-slate-900 text-slate-300 z-50 flex flex-col lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
