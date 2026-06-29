import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, UserPlus, Users, IndianRupee, History, LogOut, ShieldCheck, Home } from 'lucide-react';
import LogoIcon from "@/shared/components/atoms/Logo/LogoIcon";

const menuItems = [
  { id: 'overview',        label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'rooms',           label: 'Rooms',            icon: Home },
  { id: 'pending',         label: 'Pending Apps',     icon: UserPlus },
  { id: 'approved',        label: 'Current Tenants',  icon: Users },
  { id: 'pendingPayments', label: 'Payment Approvals', icon: IndianRupee },
  { id: 'disabled',        label: 'Disabled Acc',     icon: Users },
  { id: 'paymentStatus',   label: 'Payment History',  icon: History },
  { id: 'auditLogs',       label: 'Audit Logs',       icon: ShieldCheck },
];


const Sidebar = ({ activeTab, setActiveTab, onLogout, isMobileOpen, setIsMobileOpen }) => {
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shadow-lg shrink-0 text-primary">
            <LogoIcon size={24} />
          </div>
          <div>
            <h1 className="text-[13px] font-semibold text-foreground leading-none">Ganga Bhawan</h1>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.06em] mt-0.5">Admin Portal</p>
          </div>
        </div>

        <nav className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors group ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="adminActiveIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="mt-auto px-6 pb-6 pt-4 border-t border-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout Securely
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-background border-r border-border fixed top-0 left-0 bottom-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 bottom-0 w-56 bg-background border-r border-border z-50 flex flex-col lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
