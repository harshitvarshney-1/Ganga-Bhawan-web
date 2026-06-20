import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Bell, Menu, UserCircle, X, UserPlus, CreditCard, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../../shared/components/atoms/ThemeToggle/ThemeToggle';

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setHasNewNotif(notifications.length > 0);
  }, [notifications]);

  const handleNotifClick = (notif) => {
    if (notif.type === 'tenant') setActiveTab('pending');
    else if (notif.type === 'payment') setActiveTab('pendingPayments');
    setIsNotifOpen(false);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim().length > 0 && setActiveTab) setActiveTab('all');
  };

  return (
    <header className="h-[44px] bg-card border-b border-border sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-1.5 hover:bg-accent rounded-md transition-colors shrink-0"
        >
          <Menu className="w-4 h-4 text-foreground" />
        </button>

        {/* Search */}
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-9 pr-8 py-1.5 bg-background border border-border focus:bg-card focus:border-ring focus:ring-2 focus:ring-ring/20 rounded-md transition-all outline-none text-[13px] text-foreground placeholder:text-muted-foreground"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2 rounded-md transition-colors ${isNotifOpen ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}
          >
            <Bell className="w-4 h-4" />
            {hasNewNotif && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-1.5 w-80 bg-popover rounded-lg border border-border shadow-lg overflow-hidden z-50"
              >
                <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-foreground">Notifications</h3>
                  <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {notifications.length} Pending
                  </span>
                </div>

                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <Clock className="w-8 h-8 text-muted mx-auto mb-2" />
                      <p className="text-muted-foreground text-[13px]">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className="px-3 py-2.5 hover:bg-accent cursor-pointer transition-colors border-b border-border last:border-0 flex gap-2.5"
                      >
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${notif.type === 'tenant' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {notif.type === 'tenant' ? <UserPlus className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-foreground truncate">{notif.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {notif.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-5 bg-border mx-1 hidden lg:block" />

        <div className="flex items-center gap-2">
          <div className="text-right hidden xl:block">
            <p className="text-[12px] font-medium text-foreground leading-none">Admin Panel</p>
            <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">System Active</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shadow-sm shrink-0">
            <UserCircle className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
