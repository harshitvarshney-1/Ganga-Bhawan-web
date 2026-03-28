import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, FileText, CreditCard, LogOut, Camera, CheckCircle2, Clock } from 'lucide-react';

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
  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'details', label: 'Personal Details', icon: FileText },
    { id: 'payment', label: 'Payments & Dues', icon: CreditCard },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Branding */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-2xl">🏠</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight font-outfit">Ganga Bhawan</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tenant Portal</p>
          </div>
        </div>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center text-2xl font-black text-white shadow-xl"
            >
              {profilePicturePreview ? (
                <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userData?.fullName?.charAt(0).toUpperCase()
              )}
            </motion.div>
            <label className="absolute -bottom-2 -right-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl p-2 cursor-pointer shadow-lg transition-all hover:scale-110 active:scale-95">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </label>
          </div>

          <h2 className="text-base font-bold text-white text-center truncate w-full px-2">{userData?.fullName}</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5 truncate w-full text-center px-2">{userData?.email}</p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-800 border border-slate-700">
            {userData?.isApproved ? (
              <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-emerald-400">Approved</span></>
            ) : (
              <><Clock className="w-3.5 h-3.5 text-amber-500" /> <span className="text-amber-400">Pending</span></>
            )}
          </div>

          {profilePicture && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 w-full">
              <button
                onClick={handleSavePhoto}
                disabled={saving}
                className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Saving...</>
                ) : (
                  'Save Photo'
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setIsMobileOpen?.(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                activeSection === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${
                activeSection === item.id ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'
              }`} />
              <span className="font-semibold text-sm">{item.label}</span>
              {activeSection === item.id && (
                <motion.div
                  layoutId="tenantActiveIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div className="mt-auto p-8 border-t border-slate-800/50">
        <button
          onClick={handleLogout}
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
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-slate-300 fixed top-0 left-0 bottom-0 z-50">
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
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
