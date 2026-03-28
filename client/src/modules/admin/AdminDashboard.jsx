import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, IndianRupee, UserPlus } from 'lucide-react';
import { authAtom, userAtom } from '../../shared/hooks/store/auth.atom';
import { useAtom, useSetAtom } from 'jotai';
import { API_URL } from '../../infra/config';
import { 
  getPendingTenantsAPI, 
  getApprovedTenantsAPI, 
  getDisabledTenantsAPI,
  approveTenantAPI, 
  rejectTenantAPI, 
  deleteTenantAPI,
  disableTenantAPI,
  enableTenantAPI,
  resetPasswordAPI 
} from '../../infra/admin/admin.api';
import Loader from '../../shared/components/atoms/Loader/Loader';

// Modular Components
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import StatCard from './StatCard';
import TenantCard from './TenantCard';
import PaymentStatusTab from './PaymentStatusTab';
import PaymentHistoryModal from './PaymentHistoryModal';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingTenants, setPendingTenants] = useState([]);
  const [approvedTenants, setApprovedTenants] = useState([]);
  const [disabledTenants, setDisabledTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    disabled: 0,
    thisMonth: 0,
    todayRegistrations: 0
  });
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [selectedHistoryTenant, setSelectedHistoryTenant] = useState(null);
  const [tenantPayments, setTenantPayments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [resetting, setResetting] = useState(false);
  const [selectedAadhaar, setSelectedAadhaar] = useState(null);

  const [auth, setAuth] = useAtom(authAtom);
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth({ token: null, isAuthenticated: false });
    sessionStorage.setItem('hasShownSplash', 'true');
    navigate('/login');
  };

  useEffect(() => {
    fetchTenants();
    fetchPendingPayments();
    
    // Refresh payments every 10 seconds to get latest payment updates
    const paymentInterval = setInterval(() => {
      fetchPendingPayments();
    }, 10000); // Check every 10 seconds for faster updates
    
    // Offline detection and auto-logout after 2-3 minutes
    let offlineTimer = null;
    const OFFLINE_LOGOUT_TIME = 150000; // 2.5 minutes (150 seconds)
    
    const handleOnline = () => {
      // Clear timer if user comes back online
      if (offlineTimer) {
        clearTimeout(offlineTimer);
        offlineTimer = null;
      }
    };
    
    const handleOffline = () => {
      // Start timer when user goes offline
      offlineTimer = setTimeout(() => {
        // Check if still offline after timeout
        if (!navigator.onLine) {
          alert('⚠️ You have been offline for more than 2 minutes. Logging out for security...');
          handleLogout();
        }
      }, OFFLINE_LOGOUT_TIME);
    };
    
    // Check initial online status
    if (!navigator.onLine) {
      handleOffline();
    }
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(paymentInterval);
      if (offlineTimer) {
        clearTimeout(offlineTimer);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line
  }, []);

  // Keyboard event listener for ESC key to close full screen image
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && fullScreenImage) {
        setFullScreenImage(null);
      }
      if (event.key === 'Escape' && selectedAadhaar) {
        setSelectedAadhaar(null);
      }
    };

    if (fullScreenImage || selectedAadhaar) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullScreenImage, selectedAadhaar]);

  // Fetch tenants as before
  const fetchTenants = async () => {
    try {
      const token = auth.token;
      
      // Fetch all three types in parallel for efficiency
      const [pendingDataRaw, approvedDataRaw, disabledDataRaw] = await Promise.all([
        getPendingTenantsAPI(token).catch(() => []),
        getApprovedTenantsAPI(token).catch(() => []),
        getDisabledTenantsAPI(token).catch(() => [])
      ]);

      const pendingData = Array.isArray(pendingDataRaw) ? pendingDataRaw : [];
      const approvedData = Array.isArray(approvedDataRaw) ? approvedDataRaw : [];
      const disabledData = Array.isArray(disabledDataRaw) ? disabledDataRaw : [];

      setPendingTenants(pendingData);
      setApprovedTenants(approvedData);
      setDisabledTenants(disabledData);

      const allUsers = [...pendingData, ...approvedData, ...disabledData];
      const total = allUsers.length;
      
      const thisMonth = allUsers.filter(t =>
        t.createdAt && new Date(t.createdAt).getMonth() === new Date().getMonth()
      ).length;
      
      const today = allUsers.filter(t =>
        t.createdAt && new Date(t.createdAt).toDateString() === new Date().toDateString()
      ).length;

      setStats({
        total,
        pending: pendingData.length,
        approved: approvedData.length,
        disabled: disabledData.length,
        thisMonth,
        todayRegistrations: today
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setLoading(false);
    }
  };


  // Fetch pending payments for approval
  const fetchPendingPayments = async () => {
    try {
      const token = auth.token;
      const res = await fetch(`${API_URL}/admin/pending-payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingPayments(Array.isArray(data) ? data : []);
      } else {
        console.warn('Pending payments fetch failed:', res.status, res.statusText);
        setPendingPayments([]);
      }
    } catch (err) {
      console.error('Error fetching pending payments:', err);
      setPendingPayments([]);
    }
  };

  // Approve payment
  const handleApprovePayment = async (paymentId) => {
    try {
      const token = auth.token;
      const response = await fetch(`${API_URL}/admin/approve-payment/${paymentId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Payment approved successfully for ${data.payment?.month || 'the month'}! Status updated in both admin and tenant portals.`);
        
        // Refresh all payment data
        await Promise.all([
          fetchPendingPayments(),
          fetchTenants() // Refresh tenants to update payment status in cards
        ]);
        
        setShowPaymentModal(false);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`❌ Error approving payment: ${errorData.error || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('❌ Error approving payment. Please check your connection and try again.');
    }
  };

  // Reject payment
  const handleRejectPayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to reject this payment?')) return;

    try {
      const token = auth.token;
      const response = await fetch(`${API_URL}/admin/reject-payment/${paymentId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('✅ Payment rejected');
        fetchPendingPayments();
        setShowPaymentModal(false);
      } else {
        alert('❌ Error rejecting payment');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('❌ Error rejecting payment');
    }
  };

  const fetchTenantPayments = async (tenantId) => {
    setLoadingHistory(true);
    try {
      const token = auth.token;
      const res = await fetch(`${API_URL}/admin/tenant-payments/${tenantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTenantPayments(data);
      } else {
        setTenantPayments([]);
      }
    } catch (err) {
      console.error('Error fetching tenant payments:', err);
      setTenantPayments([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const openHistoryModal = (tenant) => {
    setSelectedHistoryTenant(tenant);
    fetchTenantPayments(tenant._id);
    setIsHistoryModalOpen(true);
  };

  const handleResetPassword = async (tenantId) => {
    if (!resetPasswordInput || resetPasswordInput.length < 6) {
      alert('⚠️ Password must be at least 6 characters long');
      return;
    }

    if (!window.confirm(`Are you sure you want to change the password for ${selectedTenant.fullName}?`)) {
      return;
    }

    setResetting(true);
    try {
      const { resetPasswordAPI } = await import('../../infra/admin/admin.api');
      const data = await resetPasswordAPI(tenantId, resetPasswordInput, auth.token);
      
      alert(`✅ ${data.message || 'Password updated successfully'}`);
      setResetPasswordInput(''); 
      fetchTenants();
    } catch (error) {
      console.error('Password reset error:', error);
      alert(`❌ Error: ${error.message || 'Server connection failed'}`);
    } finally {
      setResetting(false);
    }
  };

  const handleApprove = async (tenantId) => {
    try {
      const token = auth.token;
      const response = await fetch(`${API_URL}/admin/approve-tenant/${tenantId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('✅ Tenant approved successfully!');
        fetchTenants();
      }
    } catch (error) {
      alert('❌ Error approving tenant');
    }
  };

  const handleReject = async (tenantId) => {
    if (!window.confirm('Are you sure you want to reject this tenant?')) return;

    try {
      const token = auth.token;
      const response = await fetch(`${API_URL}/admin/reject-tenant/${tenantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('✅ Tenant rejected successfully!');
        fetchTenants();
      }
    } catch (error) {
      alert('❌ Error rejecting tenant');
    }
  };

  const handleDelete = async (tenantId, tenantName) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${tenantName}? This action cannot be undone.`)) return;

    try {
      const token = auth.token;
      await deleteTenantAPI(tenantId, token);
      alert('✅ Tenant deleted successfully!');
      setShowModal(false);
      fetchTenants();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleDisable = async (tenantId) => {
    if (!window.confirm('Are you sure you want to disable this account? The user will not be able to login, but their data will be preserved.')) return;

    try {
      const token = auth.token;
      await disableTenantAPI(tenantId, token);
      alert('🚫 Account disabled successfully!');
      setShowModal(false);
      fetchTenants();
    } catch (error) {
      console.error('Error disabling account:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleEnable = async (tenantId) => {
    try {
      const token = auth.token;
      await enableTenantAPI(tenantId, token);
      alert('✅ Account enabled successfully!');
      setShowModal(false);
      fetchTenants();
    } catch (error) {
      console.error('Error enabling account:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

  // Delete Payment Record
  const handleDeletePayment = async (paymentId, tenantId) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this payment record?\n\nThis will remove the payment proof and reset the status to 'Unpaid' for the tenant. They will need to upload the receipt again.")) {
      return;
    }

    try {
      const token = auth.token;
      const response = await fetch(`${API_URL}/admin/delete-payment/${paymentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert("✅ Payment record deleted. Tenant status reset.");
        // Refresh payments in modal
        if (tenantId) fetchTenantPayments(tenantId);
        // Refresh dashboard stats
        fetchTenants();
      } else {
        alert("❌ Failed to delete payment.");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("❌ Error deleting payment.");
    }
  };

  const exportToCSV = () => {
    const allTenants = [...pendingTenants, ...approvedTenants];
    const csvContent = [
      ['Name', 'Email', 'Mobile', 'Aadhaar', 'Status', 'Registration Date'].join(','),
      ...allTenants.map(t => [
        t.fullName,
        t.email,
        t.mobileNumber,
        t.aadhaarNumber,
        pendingTenants.includes(t) ? 'Pending' : 'Approved',
        new Date(t.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenants-${new Date().toISOString()}.csv`;
    a.click();
  };

  const filteredTenants = useMemo(() => {
    let tenants = activeTab === 'pending' ? pendingTenants :
      activeTab === 'approved' ? approvedTenants :
        activeTab === 'disabled' ? disabledTenants :
          [...pendingTenants, ...approvedTenants, ...disabledTenants];

    if (searchTerm) {
      tenants = tenants.filter(t =>
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.mobileNumber.includes(searchTerm) ||
        t.aadhaarNumber.includes(searchTerm)
      );
    }

    if (dateRange !== 'all') {
      const now = new Date();
      tenants = tenants.filter(t => {
        const date = new Date(t.createdAt);
        if (dateRange === 'today') return date.toDateString() === now.toDateString();
        if (dateRange === 'week') return (now - date) / (1000 * 60 * 60 * 24) <= 7;
        if (dateRange === 'month') return date.getMonth() === now.getMonth();
        return true;
      });
    }

    if (sortBy === 'name') {
      tenants.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortBy === 'date') {
      tenants.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return tenants;
  }, [activeTab, pendingTenants, approvedTenants, searchTerm, dateRange, sortBy]);



  if (loading) {
    return <Loader text="LOADING ADMIN PORTAL" />;
  }






  return (
    <div className="flex min-h-screen bg-slate-50 font-inter">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        stats={stats}
        pendingPaymentsCount={pendingPayments.length}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
        <TopNavbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setIsMobileOpen={setIsMobileMenuOpen}
          setActiveTab={setActiveTab}
          pendingTenants={pendingTenants}
          pendingPayments={pendingPayments}
        />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >

              {/* ── Overview ── */}
              {activeTab === 'overview' && (
                <div className="space-y-6">

                  {/* ═══ TOP HERO — full-width dark strip ═══ */}
                  <div className="relative overflow-hidden rounded-3xl bg-slate-900">
                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-600/15 rounded-full -mb-24 blur-3xl pointer-events-none" />

                    <div className="relative z-10 px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-indigo-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5">Ganga Bhawan</p>
                        <h1 className="text-2xl lg:text-3xl font-black text-white font-outfit">Dashboard</h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('pending')}
                        className="self-start sm:self-auto flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/50 shrink-0"
                      >
                        <UserPlus className="w-4 h-4" />
                        View Applications
                      </button>
                    </div>

                    {/* ── 4 metric tiles inline ── */}
                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 border-t border-white/5">
                      {[
                        { label: 'Total Tenants', value: stats.total, color: 'text-white', sub: 'All time', accent: 'border-indigo-500' },
                        { label: 'Pending Review', value: stats.pending, color: 'text-amber-400', sub: 'Action needed', accent: 'border-amber-500' },
                        { label: 'Approved', value: stats.approved, color: 'text-emerald-400', sub: 'Checked in', accent: 'border-emerald-500' },
                        { label: 'This Month', value: stats.thisMonth, color: 'text-violet-400', sub: 'New signups', accent: 'border-violet-500' },
                      ].map((m, i) => (
                        <motion.div
                          key={m.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08, duration: 0.4 }}
                          className={`px-6 py-5 border-white/5 border-t-2 odd:border-r even:border-r-0 md:border-r md:last:border-r-0 ${m.accent}`}
                        >
                          <p className={`text-4xl font-black font-outfit ${m.color}`}>{m.value}</p>
                          <p className="text-slate-300 text-sm font-semibold mt-0.5">{m.label}</p>
                          <p className="text-slate-500 text-[11px] font-medium mt-0.5">{m.sub}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* ═══ BOTTOM: 3-col grid ═══ */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* ── Quick Actions ── */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                      <div className="space-y-2.5">
                        {[
                          { label: 'Review Pending',  count: stats.pending,  tab: 'pending',         color: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-100',  dot: 'bg-amber-500' },
                          { label: 'All Tenants',     count: stats.total,    tab: 'all',             color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-100', dot: 'bg-indigo-500' },
                          { label: 'Payment Approvals', count: pendingPayments.length, tab: 'pendingPayments', color: 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-100', dot: 'bg-rose-500' },
                          { label: 'Payment History', count: stats.approved, tab: 'paymentStatus',   color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-100', dot: 'bg-emerald-500' },
                        ].map(item => (
                          <button
                            key={item.tab}
                            onClick={() => setActiveTab(item.tab)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border font-semibold text-sm transition-all ${item.color}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                              {item.label}
                            </div>
                            <span className="font-black text-base">{item.count}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Occupancy with SVG Ring ── */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col items-center justify-center">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 self-start">Occupancy Rate</h3>

                      <div className="relative w-40 h-40 mb-6">
                        <svg viewBox="0 0 36 36" className="w-40 h-40 -rotate-90 drop-shadow-xl">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.2" />
                          <circle cx="18" cy="18" r="15.9" fill="none"
                            stroke="url(#emeraldGrad)" strokeWidth="3.2"
                            strokeDasharray={`${stats.total ? (stats.approved / stats.total) * 100 : 0} 100`}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#34d399" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black text-slate-900 font-outfit">
                            {stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%
                          </span>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Filled</span>
                        </div>
                      </div>

                      <div className="w-full grid grid-cols-2 gap-3">
                        <div className="p-3.5 bg-emerald-50 rounded-2xl text-center border border-emerald-100">
                          <p className="text-2xl font-black text-emerald-700 font-outfit">{stats.approved}</p>
                          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Approved</p>
                        </div>
                        <div className="p-3.5 bg-amber-50 rounded-2xl text-center border border-amber-100">
                          <p className="text-2xl font-black text-amber-700 font-outfit">{stats.pending}</p>
                          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Pending</p>
                        </div>
                      </div>
                    </div>

                    {/* ── Recent Registrations ── */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent</h3>
                        <button onClick={() => setActiveTab('all')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">View all →</button>
                      </div>

                      {[...pendingTenants, ...approvedTenants].slice(0, 5).length === 0 ? (
                        <div className="py-10 text-center">
                          <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                          <p className="text-slate-400 font-semibold text-sm">No tenants yet</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {[...pendingTenants, ...approvedTenants].slice(0, 5).map((tenant, i) => {
                            const isPending = pendingTenants.some(t => t._id === tenant._id);
                            return (
                              <motion.div
                                key={tenant._id}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.07, duration: 0.35 }}
                                onClick={() => { setSelectedTenant(tenant); setShowModal(true); }}
                                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
                              >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 ${isPending ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                                  {tenant.fullName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900 truncate">{tenant.fullName}</p>
                                  <p className="text-[11px] text-slate-400">{new Date(tenant.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                </div>
                                <span className={`shrink-0 w-2 h-2 rounded-full ${isPending ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* ── Tenant Lists (pending / approved / disabled / all) ── */}
              {(activeTab === 'pending' || activeTab === 'approved' || activeTab === 'disabled' || activeTab === 'all') && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 font-outfit capitalize">
                        {activeTab === 'pending' ? 'Pending Applications' : 
                         activeTab === 'approved' ? 'Current Tenants' : 
                         activeTab === 'disabled' ? 'Disabled Accounts' : 'All Tenants'}
                      </h1>
                      <p className="text-slate-500 font-medium mt-1">{filteredTenants.length} record{filteredTenants.length !== 1 ? 's' : ''} found</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                      >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                      </select>
                      <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                      >
                        <IndianRupee className="w-4 h-4" />
                        Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredTenants.length === 0 ? (
                      <div className="col-span-full py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 font-outfit">No Tenants Found</h3>
                        <p className="text-slate-500 font-medium">Try adjusting your search or filter options.</p>
                      </div>
                    ) : (
                      filteredTenants.map((tenant, i) => (
                        <TenantCard
                          key={tenant._id}
                          tenant={tenant}
                          isPending={pendingTenants.some(t => t._id === tenant._id)}
                          setSelectedTenant={setSelectedTenant}
                          setShowModal={setShowModal}
                          setSelectedAadhaar={setSelectedAadhaar}
                          handleApprove={handleApprove}
                          handleReject={handleReject}
                          handleDisable={handleDisable}
                          handleEnable={handleEnable}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ── Pending Payments ── */}
              {activeTab === 'pendingPayments' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-outfit">Payment Approvals</h1>
                    <p className="text-slate-500 font-medium mt-1">Review and approve submitted payment proofs.</p>
                  </div>

                  {pendingPayments.length === 0 ? (
                    <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                      <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-500">
                        <IndianRupee className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 font-outfit mb-2">All Clear!</h3>
                      <p className="text-slate-500 font-medium">No pending payment approvals at this time.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {pendingPayments.map((payment, i) => (
                        <motion.div
                          key={payment._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-100/50"
                        >
                          <div className="flex items-start gap-5 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                              {payment.userId?.fullName?.charAt(0)?.toUpperCase() || 'T'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <h3 className="text-xl font-bold text-slate-900 font-outfit">{payment.userId?.fullName || 'Unknown'}</h3>
                                {payment.isAdvanced && (
                                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">🚀 Advanced</span>
                                )}
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">Pending Review</span>
                              </div>
                              <p className="text-slate-400 text-sm font-medium">{payment.userId?.email}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-5 bg-slate-50 rounded-2xl">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Month</p>
                              <p className="text-base font-bold text-slate-900">{payment.month}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Submitted</p>
                              <p className="text-base font-bold text-slate-900">{new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>

                          {payment.barcodeImage && (
                            <div className="mb-6">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Payment Proof</p>
                              <img
                                src={payment.barcodeImage}
                                alt="Payment proof"
                                onClick={() => setFullScreenImage(payment.barcodeImage)}
                                className="max-w-xs max-h-48 object-contain rounded-2xl border border-slate-100 shadow-md cursor-pointer hover:shadow-xl transition-all hover:scale-105"
                              />
                            </div>
                          )}

                          <div className="flex gap-3 pt-6 border-t border-slate-50 flex-wrap">
                            <button
                              onClick={() => setFullScreenImage(payment.barcodeImage)}
                              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 font-bold text-sm"
                            >
                              View Full Image
                            </button>
                            <button
                              onClick={() => handleApprovePayment(payment._id)}
                              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 font-bold text-sm shadow-lg shadow-emerald-200"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleRejectPayment(payment._id)}
                              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 font-bold text-sm shadow-lg shadow-rose-200"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Payment Status/History ── */}
              {activeTab === 'paymentStatus' && (
                <PaymentStatusTab approvedTenants={approvedTenants} openHistoryModal={openHistoryModal} />
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Tenant Detail Modal ── */}
      {showModal && selectedTenant && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-7 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden shadow-lg shadow-indigo-200">
                  {selectedTenant.profilePicture ? (
                    <img 
                      src={selectedTenant.profilePicture} 
                      alt={selectedTenant.fullName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedTenant.fullName.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 font-outfit">{selectedTenant.fullName}</h2>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${pendingTenants.some(t => t._id === selectedTenant._id) ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {pendingTenants.some(t => t._id === selectedTenant._id) ? 'Pending' : 'Approved'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-11 h-11 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  ['Full Name', selectedTenant.fullName],
                  ['Email', selectedTenant.email],
                  ['Mobile', selectedTenant.mobileNumber],
                  ['Aadhaar', selectedTenant.aadhaarNumber],
                  ['Date of Birth', new Date(selectedTenant.dateOfBirth).toLocaleDateString()],
                  ["Father's Name", selectedTenant.fatherName],
                  ['Gender', selectedTenant.gender],
                  ['Registered', new Date(selectedTenant.createdAt).toLocaleString()],
                  ["Father's Phone", selectedTenant.fatherPhone || 'N/A'],
                  ["Mother's Name", selectedTenant.motherName || 'N/A'],
                  ["Mother's Phone", selectedTenant.motherPhone || 'N/A'],
                ].map(([label, value]) => (
                  <div key={label} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-base font-bold text-slate-900 break-all">{value}</p>
                  </div>
                ))}
                <div className="md:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Address</p>
                  <p className="text-base font-bold text-slate-900">{selectedTenant.permanentAddress}</p>
                </div>
              </div>

              {/* Password Reset */}
              <div className="p-6 rounded-2xl bg-rose-50 border-2 border-dashed border-rose-200 mb-6">
                <h3 className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-4">🔒 Manual Password Override</h3>
                <div className="flex gap-3 flex-col sm:flex-row">
                  <input
                    type="text"
                    value={resetPasswordInput}
                    onChange={(e) => setResetPasswordInput(e.target.value)}
                    placeholder="Enter new password..."
                    className="flex-1 px-4 py-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-400 outline-none text-sm font-semibold"
                  />
                  <button
                    onClick={() => handleResetPassword(selectedTenant._id)}
                    disabled={resetting}
                    className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-200 transition-all text-sm"
                  >
                    {resetting ? 'Saving...' : 'Set Password'}
                  </button>
                </div>
                <p className="text-[11px] text-rose-400 mt-3">⚠️ The tenant will NOT be notified. Inform them manually.</p>
              </div>

              {(selectedTenant.aadhaarFront || selectedTenant.aadhaarBack) && (
                <div className="mb-6">
                  <button
                    onClick={() => setSelectedAadhaar(selectedTenant)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-200"
                  >
                    📄 View Aadhaar Photos
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-slate-100 flex-wrap">
                {pendingTenants.some(t => t._id === selectedTenant._id) && (
                  <>
                    <button
                      onClick={() => { handleApprove(selectedTenant._id); setShowModal(false); }}
                      className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-200 transition-all"
                    >
                      ✓ Approve Tenant
                    </button>
                    <button
                      onClick={() => { handleReject(selectedTenant._id); setShowModal(false); }}
                      className="flex-1 px-6 py-4 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 font-bold shadow-lg shadow-amber-200 transition-all"
                    >
                      ✕ Reject
                    </button>
                  </>
                )}
                
                {selectedTenant.isDisabled ? (
                  <button
                    onClick={() => handleEnable(selectedTenant._id)}
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition-all"
                  >
                    🔓 Enable Account
                  </button>
                ) : (
                  !pendingTenants.some(t => t._id === selectedTenant._id) && (
                    <button
                      onClick={() => handleDisable(selectedTenant._id)}
                      className="flex-1 px-6 py-4 bg-amber-600 text-white rounded-2xl hover:bg-amber-700 font-bold shadow-lg shadow-amber-200 transition-all"
                    >
                      🚫 Disable Account
                    </button>
                  )
                )}

                <button
                  onClick={() => handleDelete(selectedTenant._id, selectedTenant.fullName)}
                  className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 font-bold shadow-lg shadow-rose-200 transition-all"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Payment History Modal ── */}
      <PaymentHistoryModal
        isHistoryModalOpen={isHistoryModalOpen}
        setIsHistoryModalOpen={setIsHistoryModalOpen}
        selectedHistoryTenant={selectedHistoryTenant}
        loadingHistory={loadingHistory}
        tenantPayments={tenantPayments}
        setFullScreenImage={setFullScreenImage}
        handleDeletePayment={handleDeletePayment}
      />

      {/* ── Full Screen Image ── */}
      {fullScreenImage && (
        <div className="fixed inset-0 z-[100] bg-black/92 flex items-center justify-center p-4" onClick={() => setFullScreenImage(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute -top-14 right-0 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
            >
              ✕
            </button>
            <img
              src={fullScreenImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-2xl"
              style={{ maxWidth: '90vw', maxHeight: '85vh' }}
            />
            <p className="text-center text-white/60 text-sm mt-4 font-medium">Click outside or press ESC to close</p>
          </motion.div>
          <div className="absolute inset-0 -z-10" onClick={() => setFullScreenImage(null)} />
        </div>
      )}

      {/* ── Aadhaar Viewer ── */}
      {selectedAadhaar && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAadhaar(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] w-full max-w-5xl flex flex-col overflow-hidden shadow-2xl"
            style={{ height: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-outfit">Aadhaar Card – {selectedAadhaar.fullName}</h3>
                <p className="text-sm text-slate-400 font-medium">ID: {selectedAadhaar.aadhaarNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedAadhaar(null)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-all font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-900 border-t border-slate-800 flex flex-col md:flex-row items-center justify-center p-6 gap-6 overflow-y-auto">
              {/* Aadhaar Front */}
              <div className="flex-1 flex flex-col items-center gap-3 h-full min-h-[300px]">
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Front Side</p>
                {selectedAadhaar.aadhaarFront ? (
                  <img
                    src={selectedAadhaar.aadhaarFront}
                    alt="Aadhaar Front"
                    className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl border border-white/5"
                  />
                ) : (
                  <div className="flex-1 w-full bg-slate-800/50 rounded-xl flex items-center justify-center text-slate-500 border border-white/5 border-dashed">
                    No Front Photo
                  </div>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="hidden md:block w-px h-32 bg-white/10" />

              {/* Aadhaar Back */}
              <div className="flex-1 flex flex-col items-center gap-3 h-full min-h-[300px]">
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Back Side</p>
                {selectedAadhaar.aadhaarBack ? (
                  <img
                    src={selectedAadhaar.aadhaarBack}
                    alt="Aadhaar Back"
                    className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl border border-white/5"
                  />
                ) : (
                  <div className="flex-1 w-full bg-slate-800/50 rounded-xl flex items-center justify-center text-slate-500 border border-white/5 border-dashed">
                    No Back Photo
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
