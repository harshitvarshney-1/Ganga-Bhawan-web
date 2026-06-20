import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, CreditCard, LogOut, Camera, CheckCircle2, Clock } from 'lucide-react';
import LogoIcon from '../../shared/components/atoms/Logo/LogoIcon';

const menuItems = [
  { id: 'profile', label: 'My Profile',       icon: User },
  { id: 'details', label: 'Personal Details', icon: FileText },
  { id: 'payment', label: 'Payments & Dues',  icon: CreditCard },
];

const Sidebar = ({
  activeSection,
  setActiveSection,
  userData,
  profilePicturePreview,
  handleProfilePictureChange,
  handleSavePhoto,
  saving,
  profilePicture,
  handleLogout,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shadow-lg shrink-0 text-primary">
            <LogoIcon size={24} />
          </div>
          <div>
            <h1 className="text-[13px] font-semibold text-foreground leading-none">Ganga Bhawan</h1>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.06em] mt-0.5">Tenant Portal</p>
          </div>
        </div>

        {/* Profile section */}
        <div className="flex flex-col items-center mb-6 py-4 px-2 rounded-lg bg-accent/30">
          <div className="relative mb-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 rounded-xl overflow-hidden bg-primary/20 flex items-center justify-center text-xl font-bold text-primary shadow-md"
            >
              {profilePicturePreview ? (
                <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userData?.fullName?.charAt(0).toUpperCase()
              )}
            </motion.div>
            <label className="absolute -bottom-1.5 -right-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-1.5 cursor-pointer shadow-md transition-all">
              <Camera className="w-3 h-3" />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-[13px] font-semibold text-foreground text-center truncate w-full px-1 leading-none">{userData?.fullName}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate w-full text-center px-1">{userData?.email}</p>

          <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-background border border-border">
            {userData?.isApproved ? (
              <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> <span className="text-emerald-500">Approved</span></>
            ) : (
              <><Clock className="w-3 h-3 text-amber-500" /> <span className="text-amber-500">Pending</span></>
            )}
          </div>

          {profilePicture && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 w-full">
              <button
                onClick={handleSavePhoto}
                disabled={saving}
                className="w-full px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-[12px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground" />Saving...</>
                ) : 'Save Photo'}
              </button>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setIsMobileOpen?.(false); }}
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
                    layoutId="tenantActiveIndicator"
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
          onClick={handleLogout}
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
      {/* Desktop Sidebar */}
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen?.(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
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
