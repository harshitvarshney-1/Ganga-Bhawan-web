import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, LogIn, LogOut, AlertTriangle, IndianRupee,
  User as UserIcon, RefreshCw, ChevronLeft, ChevronRight,
  Filter, TrendingUp, Clock, Activity, Search, X
} from 'lucide-react';
import { API_URL } from '../../infra/config';

const ACTION_META = {
  login_success:      { label: 'Login',            icon: LogIn,         color: 'text-emerald-500',  bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20' },
  login_failed:       { label: 'Login Failed',     icon: AlertTriangle, color: 'text-rose-500',     bg: 'bg-rose-500/10',     border: 'border-rose-500/20' },
  logout:             { label: 'Logout',            icon: LogOut,        color: 'text-amber-500',    bg: 'bg-amber-500/10',    border: 'border-amber-500/20' },
  payment_submitted:  { label: 'Payment',          icon: IndianRupee,   color: 'text-blue-500',     bg: 'bg-blue-500/10',     border: 'border-blue-500/20' },
  payment_approved:   { label: 'Pmt Approved',     icon: ShieldCheck,   color: 'text-emerald-500',  bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20' },
  payment_rejected:   { label: 'Pmt Rejected',     icon: AlertTriangle, color: 'text-rose-500',     bg: 'bg-rose-500/10',     border: 'border-rose-500/20' },
  profile_updated:    { label: 'Profile Updated',  icon: UserIcon,      color: 'text-primary',      bg: 'bg-primary/10',      border: 'border-primary/20' },
  password_reset:     { label: 'Password Reset',   icon: ShieldCheck,   color: 'text-amber-500',    bg: 'bg-amber-500/10',    border: 'border-amber-500/20' },
};

const LIMIT = 15;

const AuditLogs = ({ token }) => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: LIMIT, page });
      if (filterAction) params.set('action', filterAction);
      const res = await fetch(`${API_URL}/admin/audit-logs?${params}`, { headers });
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, filterAction, token]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/audit-logs/stats`, { headers });
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const totalPages = Math.ceil(total / LIMIT);

  // Filter logs by search input (client-side for name/email)
  const displayed = searchInput.trim()
    ? logs.filter(l =>
        l.userId?.fullName?.toLowerCase().includes(searchInput.toLowerCase()) ||
        l.userId?.email?.toLowerCase().includes(searchInput.toLowerCase())
      )
    : logs;

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const min  = Math.floor(diff / 60000);
    const hr   = Math.floor(min / 60);
    const day  = Math.floor(hr / 24);
    if (day > 0)  return `${day}d ago`;
    if (hr > 0)   return `${hr}h ago`;
    if (min > 0)  return `${min}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">Security</p>
          <h2 className="text-lg font-bold text-foreground">Audit Logs</h2>
        </div>
        <button
          onClick={() => { fetchLogs(); fetchStats(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors border border-border"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Logins',    value: stats?.totalLogins ?? '–',   icon: LogIn,     color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Today',           value: stats?.todayLogins ?? '–',   icon: Activity,  color: 'text-primary',     bg: 'bg-primary/10' },
          { label: 'Active (7d)',     value: stats?.topUsers?.length ?? '–', icon: UserIcon, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Total Events',    value: total,                        icon: Clock,     color: 'text-muted-foreground', bg: 'bg-muted/50' },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background border border-border rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className={`text-xl font-bold ${s.color}`}>
                {statsLoading ? <span className="animate-pulse">…</span> : s.value}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Login Users (7d) */}
      {stats?.topUsers?.length > 0 && (
        <div className="bg-background border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-[12px] font-semibold text-foreground uppercase tracking-wide">Most Active Tenants (Last 7 Days)</h3>
          </div>
          <div className="space-y-2">
            {stats.topUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[11px] shrink-0">
                  {u.user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{u.user?.fullName || 'Unknown'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{u.user?.email || ''}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-bold text-emerald-500">{u.count}×</p>
                  <p className="text-[10px] text-muted-foreground">{timeAgo(u.lastLogin)}</p>
                </div>
                {/* Bar */}
                <div className="hidden sm:block w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, (u.count / (stats.topUsers[0]?.count || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-background border border-border rounded-md text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-ring"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action filter */}
        <div className="relative shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={filterAction}
            onChange={e => { setFilterAction(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 bg-background border border-border rounded-md text-[13px] text-foreground outline-none focus:border-ring appearance-none cursor-pointer"
          >
            <option value="">All Actions</option>
            {Object.entries(ACTION_META).map(([key, m]) => (
              <option key={key} value={key}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-2.5 border-b border-border bg-muted/30">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Tenant</p>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Action</p>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">IP Address</p>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest text-right">Time</p>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[13px] text-muted-foreground">Loading logs...</p>
              </div>
            ) : displayed.length === 0 ? (
              <div className="py-16 text-center">
                <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-[13px] text-muted-foreground">No logs found</p>
              </div>
            ) : (
              displayed.map((log, i) => {
                const meta = ACTION_META[log.action] || ACTION_META.login_success;
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 sm:gap-4 px-5 py-3 hover:bg-accent/40 transition-colors"
                  >
                    {/* Tenant */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-[11px] shrink-0">
                        {log.userId?.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{log.userId?.fullName || 'Deleted User'}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{log.userId?.email || ''}</p>
                      </div>
                    </div>

                    {/* Action Badge */}
                    <div className="flex items-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${meta.bg} ${meta.border} ${meta.color}`}>
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </span>
                    </div>

                    {/* IP */}
                    <div className="flex items-center">
                      <code className="text-[11px] text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded">
                        {log.ipAddress || '—'}
                      </code>
                    </div>

                    {/* Time */}
                    <div className="text-right">
                      <p className="text-[12px] font-medium text-foreground">{timeAgo(log.createdAt)}</p>
                      <p className="text-[10px] text-muted-foreground">{formatTime(log.createdAt)}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
            <p className="text-[11px] text-muted-foreground">
              Page {page} of {totalPages} &nbsp;·&nbsp; {total} total events
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-accent text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-accent text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
