import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Bell, Menu, UserCircle, X, UserPlus, CreditCard, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TopNavbar = ({ 
  searchTerm, 
  setSearchTerm, 
  setIsMobileOpen, 
  setActiveTab,
  pendingTenants = [],
  pendingPayments = []
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasNewNotif, setHasNewNotif] = useState(false);
  const dropdownRef = useRef(null);

  // Combine and sort notifications
  const notifications = useMemo(() => {
    const list = [
      ...pendingTenants.map(t => ({
        id: t._id,
        type: 'tenant',
        title: 'New Tenant Request',
        message: `${t.fullName} has applied for residency.`,
        date: new Date(t.createdAt),
        data: t
      })),
      ...pendingPayments.map(p => ({
        id: p._id,
        type: 'payment',
        title: 'Payment Approval',
        message: `${p.userId?.fullName || 'A tenant'} submitted proof for ${p.month}.`,
        date: new Date(p.paymentDate || p.createdAt),
        data: p
      }))
    ];

    return list.sort((a, b) => b.date - a.date);
  }, [pendingTenants, pendingPayments]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show notification badge if there are any pending items
  useEffect(() => {
    setHasNewNotif(notifications.length > 0);
  }, [notifications]);

  const toggleNotif = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  const handleNotifClick = (notif) => {
    if (notif.type === 'tenant') {
      setActiveTab('pending');
    } else if (notif.type === 'payment') {
      setActiveTab('pendingPayments');
    }
    setIsNotifOpen(false);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim().length > 0 && setActiveTab) {
      setActiveTab('all');
    }
  };

  return (
    <header className="h-18 bg-white border-b border-slate-100 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>

        {/* Search */}
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search tenants, emails, phone..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all outline-none text-sm font-medium text-slate-800 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={toggleNotif}
            className={`relative p-2 rounded-xl transition-all group ${isNotifOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <Bell className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${isNotifOpen ? 'text-indigo-600' : 'group-hover:text-indigo-600'} transition-colors`} />
            {hasNewNotif && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-[1.5px] border-white animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-72 sm:w-96 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden z-50 py-2"
              >
                <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                  <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {notifications.length} Pending
                  </span>
                </div>

                <div className="max-h-[350px] overflow-y-auto hidden-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-slate-400 font-semibold text-sm">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 flex gap-3"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${notif.type === 'tenant' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {notif.type === 'tenant' ? <UserPlus className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 mb-0.5 truncate">{notif.title}</p>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-1 truncate">{notif.message}</p>
                          <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {notif.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-50 mt-1">
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">End of Notifications</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-slate-200 hidden lg:block" />

        <div className="flex items-center gap-3 ml-1 sm:ml-0">
          <div className="text-right hidden xl:block">
            <p className="text-sm font-bold text-slate-900 font-outfit leading-none">Admin Panel</p>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5">System Active</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
            <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </div>
      </div>
    </header>
  );
};

export default TopNavbar;
