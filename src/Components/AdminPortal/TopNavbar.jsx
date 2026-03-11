import React from 'react';
import { Search, Bell, Menu, UserCircle, X } from 'lucide-react';

const TopNavbar = ({ searchTerm, setSearchTerm, setIsMobileOpen, setActiveTab }) => {
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    // Auto-switch to 'all' tab so the search results are visible
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
        <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-all group">
          <Bell className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-[1.5px] border-white" />
        </button>

        <div className="h-8 w-px bg-slate-200 hidden md:block" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 font-outfit leading-none">Admin Panel</p>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5">System Active</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-200">
            <UserCircle className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
