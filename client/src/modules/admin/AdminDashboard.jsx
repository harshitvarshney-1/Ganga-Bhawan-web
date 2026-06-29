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
  resetPasswordAPI,
  updateTenantAPI
} from '../../infra/admin/admin.api';
import Loader from '../../shared/components/atoms/Loader/Loader';

// Modular Components
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import StatCard from './StatCard';
import TenantCard from './TenantCard';
import PaymentStatusTab from './PaymentStatusTab';
import PaymentHistoryModal from './PaymentHistoryModal';
import AuditLogs from './AuditLogs';
import RoomsTab from './RoomsTab';


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

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

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

      const occupiedRooms = new Set(approvedData.map(t => Number(t.roomNumber)).filter(n => n > 0));
      
      setStats({
        total,
        pending: pendingData.length,
        approved: approvedData.length,
        disabled: disabledData.length,
        occupiedRooms: occupiedRooms.size,
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
        if (res.status === 401) {
          // Clear token to stop spamming
          setAuth({ token: null, isAuthenticated: false });
          localStorage.removeItem('auth');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
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

  const handleUpdateTenant = async () => {
    setIsUpdating(true);
    try {
      const data = await updateTenantAPI(selectedTenant._id, editData, auth.token);
      alert('✅ Tenant details updated successfully!');
      setSelectedTenant(data.tenant); 
      setIsEditing(false);
      fetchTenants();
    } catch (error) {
      console.error('Update error:', error);
      alert(`❌ Error: ${error.message || 'Failed to update tenant'}`);
    } finally {
      setIsUpdating(false);
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
    <div className="flex h-screen overflow-hidden bg-background">
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

      {/* Main Content — floating card */}
      <div className="flex-1 min-w-0 lg:ml-56 flex flex-col lg:p-2 h-full">
        <div className="flex-1 flex flex-col lg:rounded-xl lg:border lg:border-border bg-card overflow-hidden">
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
                <div className="space-y-5">

                  {/* Hero strip */}
                  <div className="relative overflow-hidden rounded-xl bg-background border border-border">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-primary/5 rounded-full -mb-16 blur-3xl pointer-events-none" />

                    <div className="relative z-10 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.15em] mb-1">Ganga Bhawan</p>
                        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Admin Dashboard</h1>
                        <p className="text-muted-foreground text-[12px] mt-0.5">
                          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('pending')}
                        className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium text-[13px] transition-colors shrink-0"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        View Applications
                      </button>
                    </div>

                    {/* 4 metric tiles */}
                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 border-t border-border">
                      {[
                        { label: 'Total Tenants',  value: stats.total,    color: 'text-foreground',        sub: 'All time',      accent: 'border-primary' },
                        { label: 'Pending Review', value: stats.pending,  color: 'text-amber-500',         sub: 'Action needed', accent: 'border-amber-500' },
                        { label: 'Approved',       value: stats.approved, color: 'text-emerald-500',       sub: 'Checked in',    accent: 'border-emerald-500' },
                        { label: 'This Month',     value: stats.thisMonth, color: 'text-primary',          sub: 'New signups',   accent: 'border-primary' },
                      ].map((m, i) => (
                        <motion.div
                          key={m.label}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07, duration: 0.3 }}
                          className={`px-5 py-4 border-border border-t-2 odd:border-r even:border-r-0 md:border-r md:last:border-r-0 ${m.accent}`}
                        >
                          <p className={`text-3xl font-bold ${m.color}`}>{m.value}</p>
                          <p className="text-foreground text-[13px] font-medium mt-0.5">{m.label}</p>
                          <p className="text-muted-foreground text-[11px] mt-0.5">{m.sub}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* 3-col grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Quick Actions */}
                    <div className="bg-background rounded-xl p-5 border border-border">
                      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-3">Quick Actions</h3>
                      <div className="space-y-2">
                        {[
                          { label: 'Review Pending',    count: stats.pending,           tab: 'pending',         color: 'hover:bg-amber-500/10 text-amber-500',   dot: 'bg-amber-500' },
                          { label: 'All Tenants',       count: stats.total,             tab: 'all',             color: 'hover:bg-primary/10 text-primary',        dot: 'bg-primary' },
                          { label: 'Payment Approvals', count: pendingPayments.length,  tab: 'pendingPayments', color: 'hover:bg-destructive/10 text-destructive', dot: 'bg-destructive' },
                          { label: 'Payment History',   count: stats.approved,          tab: 'paymentStatus',   color: 'hover:bg-emerald-500/10 text-emerald-500', dot: 'bg-emerald-500' },
                        ].map(item => (
                          <button
                            key={item.tab}
                            onClick={() => setActiveTab(item.tab)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md border border-border text-[13px] font-medium transition-colors ${item.color}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                              {item.label}
                            </div>
                            <span className="font-semibold">{item.count}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Occupancy Ring */}
                    <div className="bg-background rounded-xl p-5 border border-border flex flex-col items-center justify-center">
                      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-5 self-start">Room Occupancy</h3>

                      <div className="relative w-32 h-32 mb-5">
                        <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.9" fill="none"
                            stroke="url(#emeraldGrad)" strokeWidth="3"
                            strokeDasharray={`${(stats.occupiedRooms / 12) * 100} 100`}
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
                          <span className="text-3xl font-bold text-foreground">
                            {stats.occupiedRooms}/12
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Rooms Full</span>
                        </div>
                      </div>

                      <div className="w-full grid grid-cols-2 gap-2.5">
                        <div className="p-3 bg-emerald-500/10 rounded-lg text-center border border-emerald-500/20">
                          <p className="text-xl font-bold text-emerald-500">{stats.occupiedRooms}</p>
                          <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Occupied</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center border border-border">
                          <p className="text-xl font-bold text-foreground">{12 - stats.occupiedRooms}</p>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Vacant</p>
                        </div>
                      </div>
                    </div>


                    {/* Recent Registrations */}
                    <div className="bg-background rounded-xl p-5 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">Recent</h3>
                        <button onClick={() => setActiveTab('all')} className="text-[12px] font-medium text-primary hover:text-primary/80">View all →</button>
                      </div>

                      {[...pendingTenants, ...approvedTenants].slice(0, 5).length === 0 ? (
                        <div className="py-8 text-center">
                          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-muted-foreground text-[13px]">No tenants yet</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          {[...pendingTenants, ...approvedTenants].slice(0, 5).map((tenant, i) => {
                            const isPending = pendingTenants.some(t => t._id === tenant._id);
                            return (
                              <motion.div
                                key={tenant._id}
                                initial={{ opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06, duration: 0.3 }}
                                onClick={() => { setSelectedTenant(tenant); setShowModal(true); }}
                                className="flex items-center gap-2.5 p-2.5 rounded-md hover:bg-accent cursor-pointer transition-colors"
                              >
                                <div className={`w-8 h-8 rounded-md flex items-center justify-center text-foreground font-semibold text-[12px] shrink-0 ${isPending ? 'bg-amber-500' : 'bg-primary'}`}>
                                  {tenant.fullName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-medium text-foreground truncate">{tenant.fullName}</p>
                                  <p className="text-[11px] text-muted-foreground">{new Date(tenant.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                </div>
                                <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500' : 'bg-emerald-500'}`} />
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
                <div className="space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-xl font-semibold text-foreground capitalize">
                        {activeTab === 'pending' ? 'Pending Applications' :
                         activeTab === 'approved' ? 'Current Tenants' :
                         activeTab === 'disabled' ? 'Disabled Accounts' : 'All Tenants'}
                      </h1>
                      <p className="text-muted-foreground text-[13px] mt-0.5">{filteredTenants.length} record{filteredTenants.length !== 1 ? 's' : ''} found</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-3 py-1.5 bg-background border border-border rounded-md text-foreground text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1.5 bg-background border border-border rounded-md text-foreground text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
                      >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                      </select>
                      <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-md font-medium text-[13px] hover:bg-primary/90 transition-colors"
                      >
                        <IndianRupee className="w-3.5 h-3.5" />
                        Export CSV
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredTenants.length === 0 ? (
                      <div className="col-span-full py-20 text-center bg-background rounded-xl border-2 border-dashed border-border">
                        <div className="text-5xl mb-3">🔍</div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">No Tenants Found</h3>
                        <p className="text-muted-foreground text-[13px]">Try adjusting your search or filter options.</p>
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
                <div className="space-y-5">
                  <div>
                    <h1 className="text-xl font-semibold text-foreground">Payment Approvals</h1>
                    <p className="text-muted-foreground text-[13px] mt-0.5">Review and approve submitted payment proofs.</p>
                  </div>

                  {pendingPayments.length === 0 ? (
                    <div className="py-20 text-center bg-background rounded-xl border-2 border-dashed border-border">
                      <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-500">
                        <IndianRupee className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">All Clear!</h3>
                      <p className="text-muted-foreground text-[13px]">No pending payment approvals at this time.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingPayments.map((payment, i) => (
                        <motion.div
                          key={payment._id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-background rounded-xl p-6 border border-border"
                        >

                          <div className="flex items-start gap-4 mb-5">
                            <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold text-base shrink-0">
                              {payment.userId?.fullName?.charAt(0)?.toUpperCase() || 'T'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                                <h3 className="text-[15px] font-semibold text-foreground">{payment.userId?.fullName || 'Unknown'}</h3>
                                {payment.isAdvanced && (
                                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-semibold rounded-full">🚀 Advanced</span>
                                )}
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[11px] font-semibold rounded-full">Pending Review</span>
                              </div>
                              <p className="text-muted-foreground text-[12px]">{payment.userId?.email}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5 p-4 bg-muted/30 rounded-lg">
                            <div>
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-0.5">Month</p>
                              <p className="text-[13px] font-semibold text-foreground">{payment.month}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-0.5">Submitted</p>
                              <p className="text-[13px] font-semibold text-foreground">{new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>

                          {payment.barcodeImage && (
                            <div className="mb-5">
                              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2">Payment Proof</p>
                              <img
                                src={payment.barcodeImage}
                                alt="Payment proof"
                                onClick={() => setFullScreenImage(payment.barcodeImage)}
                                className="max-w-xs max-h-40 object-contain rounded-lg border border-border cursor-pointer hover:border-primary/40 transition-all hover:scale-105"
                              />
                            </div>
                          )}

                          <div className="flex gap-2.5 pt-4 border-t border-border flex-wrap">
                            <button
                              onClick={() => setFullScreenImage(payment.barcodeImage)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-foreground rounded-md hover:bg-accent/80 text-[13px] font-medium"
                            >
                              View Image
                            </button>
                            <button
                              onClick={() => handleApprovePayment(payment._id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-foreground rounded-md hover:bg-emerald-700 text-[13px] font-medium"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleRejectPayment(payment._id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 text-[13px] font-medium"
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

              {/* ── Audit Logs ── */}
              {activeTab === 'auditLogs' && (
                <AuditLogs token={auth.token} />
              )}

              {/* ── Rooms Management ── */}
              {activeTab === 'rooms' && (
                <RoomsTab 
                  tenants={[...pendingTenants, ...approvedTenants, ...disabledTenants]} 
                  onTenantClick={(tenant) => {
                    setSelectedTenant(tenant);
                    setShowModal(true);
                  }}
                />
              )}


            </motion.div>
          </AnimatePresence>
        </main>
        </div>
      </div>

      {/* ── Tenant Detail Modal ── */}
      {showModal && selectedTenant && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card/90 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold text-base overflow-hidden">
                  {selectedTenant.profilePicture ? (
                    <img src={selectedTenant.profilePicture} alt={selectedTenant.fullName} className="w-full h-full object-cover" />
                  ) : (
                    selectedTenant.fullName.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground">{selectedTenant.fullName}</h2>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${pendingTenants.some(t => t._id === selectedTenant._id) ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {pendingTenants.some(t => t._id === selectedTenant._id) ? 'Pending' : 'Approved'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={() => { setEditData(selectedTenant); setIsEditing(true); }}
                    className="px-3 py-1.5 text-[13px] font-medium bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                )}
                <button
                  onClick={() => { setShowModal(false); setIsEditing(false); }}
                  className="w-8 h-8 flex items-center justify-center bg-accent hover:bg-accent/80 rounded-md transition-colors text-muted-foreground"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {[
                  ['fullName', 'Full Name', editData.fullName || selectedTenant.fullName],
                  ['email', 'Email', editData.email || selectedTenant.email],
                  ['mobileNumber', 'Mobile', editData.mobileNumber || selectedTenant.mobileNumber],
                  ['roomNumber', 'Room Number', editData.roomNumber || selectedTenant.roomNumber],
                  ['aadhaarNumber', 'Aadhaar', editData.aadhaarNumber || selectedTenant.aadhaarNumber],
                  ['dateOfBirth', 'Date of Birth', (editData.dateOfBirth || selectedTenant.dateOfBirth) ? new Date(editData.dateOfBirth || selectedTenant.dateOfBirth).toISOString().split('T')[0] : ''],
                  ['fatherName', "Father's Name", editData.fatherName || selectedTenant.fatherName],
                  ['gender', 'Gender', editData.gender || selectedTenant.gender],
                  ['createdAt', 'Registered', new Date(selectedTenant.createdAt).toLocaleString(), true],
                  ['fatherPhone', "Father's Phone", editData.fatherPhone !== undefined ? editData.fatherPhone : (selectedTenant.fatherPhone || '')],
                  ['motherName', "Mother's Name", editData.motherName !== undefined ? editData.motherName : (selectedTenant.motherName || '')],
                  ['motherPhone', "Mother's Phone", editData.motherPhone !== undefined ? editData.motherPhone : (selectedTenant.motherPhone || '')],
                ].map(([key, label, value, readOnly]) => (
                  <div key={label} className="p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1">{label}</p>
                    {isEditing && !readOnly ? (
                      key === 'gender' ? (
                        <select value={value} onChange={(e) => setEditData({...editData, [key]: e.target.value})} className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-[13px] text-foreground outline-none focus:border-ring">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : key === 'roomNumber' ? (
                        <select value={value} onChange={(e) => setEditData({...editData, [key]: Number(e.target.value)})} className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-[13px] text-foreground outline-none focus:border-ring">
                          <option value="">No Room Assigned</option>
                          {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>Room {i + 1}</option>
                          ))}
                        </select>
                      ) : key === 'dateOfBirth' ? (
                        <input type="date" value={value} onChange={(e) => setEditData({...editData, [key]: e.target.value})} className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-[13px] text-foreground outline-none focus:border-ring" />
                      ) : (
                        <input type="text" value={value} onChange={(e) => setEditData({...editData, [key]: e.target.value})} className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-[13px] text-foreground outline-none focus:border-ring" />
                      )
                    ) : (
                      <p className="text-[13px] font-medium text-foreground break-all">
                        {key === 'dateOfBirth' && !isEditing ? new Date(value).toLocaleDateString() : 
                         (key === 'roomNumber' && value) ? `Room ${value}` : 
                         value || 'N/A'}
                      </p>
                    )}
                  </div>
                ))}

                <div className="md:col-span-2 p-3 bg-muted/30 rounded-lg border border-border">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-1">Address</p>
                  {isEditing ? (
                    <textarea value={editData.permanentAddress !== undefined ? editData.permanentAddress : selectedTenant.permanentAddress} onChange={(e) => setEditData({...editData, permanentAddress: e.target.value})} className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-[13px] text-foreground outline-none focus:border-ring resize-none h-16" />
                  ) : (
                    <p className="text-[13px] font-medium text-foreground">{selectedTenant.permanentAddress}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2.5 mb-6">
                  <button onClick={handleUpdateTenant} disabled={isUpdating} className="flex-1 bg-primary text-primary-foreground font-medium py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 text-[13px]">
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => { setIsEditing(false); setEditData(selectedTenant); }} className="flex-1 bg-accent text-foreground font-medium py-2 rounded-md hover:bg-accent/80 transition-colors text-[13px]">
                    Cancel
                  </button>
                </div>
              )}

              {/* Password Reset */}
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 mb-5">
                <h3 className="text-[12px] font-semibold text-destructive uppercase tracking-[0.08em] mb-3">🔒 Manual Password Override</h3>
                <div className="flex gap-2.5 flex-col sm:flex-row">
                  <input
                    type="text"
                    value={resetPasswordInput}
                    onChange={(e) => setResetPasswordInput(e.target.value)}
                    placeholder="Enter new password..."
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-destructive/20 focus:border-destructive outline-none text-[13px] text-foreground"
                  />
                  <button
                    onClick={() => handleResetPassword(selectedTenant._id)}
                    disabled={resetting}
                    className="px-6 py-2 bg-destructive text-destructive-foreground font-medium rounded-md hover:bg-destructive/90 disabled:opacity-50 transition-colors text-[13px]"
                  >
                    {resetting ? 'Saving...' : 'Set Password'}
                  </button>
                </div>
                <p className="text-[11px] text-destructive/70 mt-2">⚠️ The tenant will NOT be notified. Inform them manually.</p>
              </div>

              {(selectedTenant.aadhaarFront || selectedTenant.aadhaarBack) && (
                <div className="mb-5">
                  <button
                    onClick={() => setSelectedAadhaar(selectedTenant)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium text-[13px] transition-colors"
                  >
                    📄 View Aadhaar Photos
                  </button>
                </div>
              )}

              <div className="flex gap-2.5 pt-5 border-t border-border flex-wrap">
                {pendingTenants.some(t => t._id === selectedTenant._id) && (
                  <>
                    <button onClick={() => { handleApprove(selectedTenant._id); setShowModal(false); }} className="flex-1 px-5 py-2.5 bg-emerald-600 text-foreground rounded-md hover:bg-emerald-700 font-medium text-[13px] transition-colors">
                      ✓ Approve Tenant
                    </button>
                    <button onClick={() => { handleReject(selectedTenant._id); setShowModal(false); }} className="flex-1 px-5 py-2.5 bg-amber-500 text-foreground rounded-md hover:bg-amber-600 font-medium text-[13px] transition-colors">
                      ✕ Reject
                    </button>
                  </>
                )}
                {selectedTenant.isDisabled ? (
                  <button onClick={() => handleEnable(selectedTenant._id)} className="flex-1 px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium text-[13px] transition-colors">
                    🔓 Enable Account
                  </button>
                ) : (
                  !pendingTenants.some(t => t._id === selectedTenant._id) && (
                    <button onClick={() => handleDisable(selectedTenant._id)} className="flex-1 px-5 py-2.5 bg-amber-500/20 border border-amber-500 text-amber-600 dark:text-amber-400 rounded-md hover:bg-amber-500/30 font-medium text-[13px] transition-colors">
                      🚫 Disable Account
                    </button>
                  )
                )}
                <button onClick={() => handleDelete(selectedTenant._id, selectedTenant.fullName)} className="flex-1 px-5 py-2.5 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 font-medium text-[13px] transition-colors">
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
        <div className="fixed inset-0 z-[100] bg-background/90 flex items-center justify-center p-4" onClick={() => setFullScreenImage(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setFullScreenImage(null)} className="absolute -top-12 right-0 w-9 h-9 flex items-center justify-center bg-card/10 hover:bg-card/20 rounded-lg text-foreground transition-colors">
              ✕
            </button>
            <img src={fullScreenImage} alt="Full size" className="max-w-full max-h-full object-contain rounded-lg" style={{ maxWidth: '90vw', maxHeight: '85vh' }} />
            <p className="text-center text-foreground/50 text-[12px] mt-3">Click outside or press ESC to close</p>
          </motion.div>
        </div>
      )}

      {/* ── Aadhaar Viewer ── */}
      {selectedAadhaar && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedAadhaar(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl w-full max-w-4xl flex flex-col overflow-hidden border border-border shadow-2xl"
            style={{ height: '88vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
              <div>
                <h3 className="text-[14px] font-semibold text-foreground">Aadhaar Card – {selectedAadhaar.fullName}</h3>
                <p className="text-[12px] text-muted-foreground">ID: {selectedAadhaar.aadhaarNumber}</p>
              </div>
              <button onClick={() => setSelectedAadhaar(null)} className="w-8 h-8 flex items-center justify-center bg-accent hover:bg-accent/80 rounded-md text-muted-foreground transition-colors">✕</button>
            </div>
            <div className="flex-1 bg-background flex flex-col md:flex-row items-center justify-center p-5 gap-5 overflow-y-auto">
              <div className="flex-1 flex flex-col items-center gap-2.5 h-full min-h-[280px]">
                <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.08em]">Front Side</p>
                {selectedAadhaar.aadhaarFront ? (
                  <img src={selectedAadhaar.aadhaarFront} alt="Aadhaar Front" className="max-w-full max-h-[55vh] object-contain rounded-lg border border-border" />
                ) : (
                  <div className="flex-1 w-full bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground border border-dashed border-border">No Front Photo</div>
                )}
              </div>
              <div className="hidden md:block w-px h-28 bg-border" />
              <div className="flex-1 flex flex-col items-center gap-2.5 h-full min-h-[280px]">
                <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.08em]">Back Side</p>
                {selectedAadhaar.aadhaarBack ? (
                  <img src={selectedAadhaar.aadhaarBack} alt="Aadhaar Back" className="max-w-full max-h-[55vh] object-contain rounded-lg border border-border" />
                ) : (
                  <div className="flex-1 w-full bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground border border-dashed border-border">No Back Photo</div>
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
