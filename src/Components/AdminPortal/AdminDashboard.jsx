import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../services/api';
import Loader from '../Loader/Loader';


const StatCard = ({ title, value, icon, gradient }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${gradient}`}>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-white/90 uppercase tracking-wider">{title}</p>
        <div className="text-3xl">{icon}</div>
      </div>
      <h3 className="text-4xl font-bold text-white mb-2">{value}</h3>
    </div>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
  </div>
);

const TenantCard = ({ tenant, isPending, setSelectedTenant, setShowModal, setSelectedAadhaar, handleApprove, handleReject }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
            {tenant.profilePicture ? (
              <img 
                src={tenant.profilePicture.startsWith('data:') || tenant.profilePicture.startsWith('http') 
                  ? tenant.profilePicture 
                  : `${BASE_URL}/${tenant.profilePicture}`} 
                alt={tenant.fullName} 
                className="w-full h-full object-cover"
              />
            ) : (
              tenant.fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{tenant.fullName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(tenant.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 ${
            isPending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {isPending ? '⏰' : '✅'} {isPending ? 'Pending' : 'Approved'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-cyan-600 text-xl">📧</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Email</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{tenant.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-cyan-600 text-xl">📱</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Mobile</p>
              <p className="text-sm font-semibold text-gray-900">{tenant.mobileNumber}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-cyan-600 text-xl">🆔</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Aadhaar</p>
              <p className="text-sm font-semibold text-gray-900">{tenant.aadhaarNumber}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-cyan-600 text-xl">👤</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Gender</p>
              <p className="text-sm font-semibold text-gray-900">{tenant.gender}</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg mb-6">
          <div className="flex items-start gap-2">
            <span className="text-cyan-600 text-xl">📍</span>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase mb-1">Address</p>
              <p className="text-sm text-gray-900 font-medium">{tenant.permanentAddress}</p>
            </div>
          </div>
        </div>

        {tenant.aadhaarFile && (
          <div className="mb-6">
            <button
              onClick={() => setSelectedAadhaar(tenant)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
            >
              📄 View Aadhaar Card (Image/PDF)
            </button>
          </div>
        )}


        <div className="flex gap-3 pt-6 border-t border-gray-100">
          <button
            onClick={() => { setSelectedTenant(tenant); setShowModal(true); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
          >
            👁️ View
          </button>
          {isPending && (
            <>
              <button
                onClick={() => handleApprove(tenant._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all font-semibold shadow-lg"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => handleReject(tenant._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-semibold shadow-lg"
              >
                ✕ Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const PaymentStatusTab = ({ approvedTenants, openHistoryModal }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Status (Monthly History)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {approvedTenants.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-lg">No approved tenants to track payments</p>
            </div>
          ) : (
            approvedTenants.map(tenant => (
              <div 
                key={tenant._id}
                onClick={() => openHistoryModal(tenant)}
                className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-cyan-500 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                    {tenant.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">{tenant.fullName}</h3>
                    <p className="text-sm text-gray-500">{tenant.mobileNumber}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-xs font-semibold text-gray-400 uppercase">View History</span>
                  <span className="text-xl">➡️</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const PaymentHistoryModal = ({ 
  isHistoryModalOpen, 
  setIsHistoryModalOpen, 
  selectedHistoryTenant, 
  loadingHistory, 
  tenantPayments, 
  setFullScreenImage,
  handleDeletePayment // Added prop
}) => {
  if (!isHistoryModalOpen || !selectedHistoryTenant) return null;

  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4"
      onClick={() => setIsHistoryModalOpen(false)}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {selectedHistoryTenant.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedHistoryTenant.fullName}</h2>
              <p className="text-sm text-gray-500">Payment History for {currentYear}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsHistoryModalOpen(false)}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-8">
          {loadingHistory ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-semibold">Loading payment records...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {monthNamesShort.map((month, idx) => {
                  const payment = tenantPayments.find(p => !p.isAdvanced && p.monthIndex === idx && new Date(p.paymentDate).getFullYear() === currentYear);
                  const isPaid = payment?.status === 'success';
                  const isPending = payment?.status === 'pending';
                  const isRejected = payment?.status === 'rejected';
                  const isOverdue = !isPaid && !isPending && idx <= currentMonth;

                  let statusClass = "bg-gray-50 border-gray-200 text-gray-400";
                  let statusIcon = "📅";
                  let statusLabel = "Upcoming";

                  if (isPaid) {
                    statusClass = "bg-emerald-50 border-emerald-500 text-emerald-700";
                    statusIcon = "✅";
                    statusLabel = "Paid";
                  } else if (isPending) {
                    statusClass = "bg-amber-50 border-amber-500 text-amber-700";
                    statusIcon = "⏳";
                    statusLabel = "Pending";
                  } else if (isRejected) {
                    statusClass = "bg-red-50 border-red-500 text-red-700";
                    statusIcon = "❌";
                    statusLabel = "Rejected";
                  } else if (isOverdue) {
                    statusClass = "bg-rose-50 border-rose-500 text-rose-700";
                    statusIcon = "❗";
                    statusLabel = "Overdue";
                  }

                  return (
                    <div 
                      key={month}
                      className={`relative p-4 rounded-2xl border-2 transition-all ${statusClass}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-lg">{month}</span>
                        <span className="text-xl">{statusIcon}</span>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-3">{statusLabel}</p>
                      
                      {(isPaid || isPending || isRejected) && payment.barcodeImage && (
                        <div className="flex gap-1 mt-2">
                          <button 
                            onClick={() => setFullScreenImage(payment.barcodeImage)}
                            className="flex-1 py-1.5 bg-white/60 hover:bg-white text-[10px] font-bold rounded-lg transition-colors border border-current"
                            title="View Receipt"
                          >
                            👁️ View
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePayment(payment._id, selectedHistoryTenant._id);
                            }}
                            className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition-colors border border-red-200 hover:border-red-500"
                            title="Delete Payment Record"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Advanced Booking Box - Distinct Look */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-6 relative overflow-hidden group hover:border-indigo-400 transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg">
                        🚀
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">Advanced Booking</h4>
                        <p className="text-sm text-indigo-600 font-medium">Pre-pay for upcoming months</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {tenantPayments.filter(p => p.isAdvanced).map((payment, idx) => (
                        <div key={idx} className="bg-white px-4 py-2 rounded-lg border border-indigo-100 shadow-sm flex items-center gap-3">
                          <span className="font-bold text-indigo-700">{payment.month || 'Future Payment'}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 
                            payment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {payment.status === 'success' ? 'Paid' : payment.status === 'pending' ? 'Pending' : 'Rejected'}
                          </span>
                          {payment.barcodeImage && (
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => setFullScreenImage(payment.barcodeImage)}
                                className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50"
                                title="View Receipt"
                              >
                                👁️
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePayment(payment._id, selectedHistoryTenant._id);
                                }}
                                className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                                title="Delete Record"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {tenantPayments.filter(p => p.isAdvanced).length === 0 && (
                        <span className="text-gray-400 text-sm italic py-2">No advanced payments yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Legend</h3>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> <span className="text-sm">Paid</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> <span className="text-sm">Pending Approval</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span> <span className="text-sm">Overdue / Unpaid</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-300"></span> <span className="text-sm">Upcoming</span></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingTenants, setPendingTenants] = useState([]);
  const [approvedTenants, setApprovedTenants] = useState([]);
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

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
      const token = localStorage.getItem('token');
      const pendingRes = await fetch(`${BASE_URL}/api/admin/pending-tenants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const pendingData = await pendingRes.json();
      setPendingTenants(pendingData);

      const approvedRes = await fetch(`${BASE_URL}/api/admin/approved-tenants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const approvedData = await approvedRes.json();
      setApprovedTenants(approvedData);

      const total = pendingData.length + approvedData.length;
      const thisMonth = [...pendingData, ...approvedData].filter(t =>
        new Date(t.createdAt).getMonth() === new Date().getMonth()
      ).length;
      const today = [...pendingData, ...approvedData].filter(t =>
        new Date(t.createdAt).toDateString() === new Date().toDateString()
      ).length;

      setStats({
        total,
        pending: pendingData.length,
        approved: approvedData.length,
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/admin/pending-payments`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/admin/approve-payment/${paymentId}`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/admin/reject-payment/${paymentId}`, {
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/admin/tenant-payments/${tenantId}`, {
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
      const { resetPassword: apiResetPassword } = await import('../../services/api');
      const data = await apiResetPassword(tenantId, resetPasswordInput);
      
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/admin/approve-tenant/${tenantId}`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/admin/reject-tenant/${tenantId}`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/admin/delete-tenant/${tenantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('✅ Tenant deleted successfully!');
        setShowModal(false);
        fetchTenants();
      } else {
        alert('❌ Error deleting tenant');
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      alert('❌ Error deleting tenant');
    }
  };

  // Delete Payment Record
  const handleDeletePayment = async (paymentId, tenantId) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this payment record?\n\nThis will remove the payment proof and reset the status to 'Unpaid' for the tenant. They will need to upload the receipt again.")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/admin/delete-payment/${paymentId}`, {
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
        [...pendingTenants, ...approvedTenants];

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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white fixed lg:sticky lg:top-0 h-full lg:h-screen shadow-2xl z-50 flex flex-col flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-2 rounded-xl text-2xl">
                🏠
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Ganga Bhawan
              </h2>
            </div>
          </div>
          
          <nav className="p-4 space-y-2">
            <button 
              onClick={() => {
                setActiveTab('overview');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'overview' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">📊</span>
              Overview
            </button>
            
            <button 
              onClick={() => {
                setActiveTab('pending');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all relative ${
                activeTab === 'pending' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">⏰</span>
              Pending
              {stats.pending > 0 && (
                <span className="absolute right-4 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => {
                setActiveTab('approved');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'approved' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">✅</span>
              Approved
            </button>
            
            <button 
              onClick={() => {
                setActiveTab('all');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'all' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">👥</span>
              All Tenants
            </button>
            
            <button 
              onClick={() => {
                setActiveTab('payments');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all relative ${
                activeTab === 'payments' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">💳</span>
              Pending Payments
              {pendingPayments.length > 0 && (
                <span className="absolute right-4 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingPayments.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => {
                setActiveTab('payment-status');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all relative ${
                activeTab === 'payment-status' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">📊</span>
              Payment Status
            </button>
          </nav>

        </div>

        {/* Logout Button - Fixed at bottom */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex-shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-all shadow-lg"
          >
            <span className="text-xl">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 mb-6 lg:mb-8 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-1">
                  Admin Portal
                </h1>
                <p className="text-sm lg:text-base text-gray-500 font-medium">Manage your tenant applications</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 lg:px-4 py-2 lg:py-3 w-full lg:w-80">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400 text-sm lg:text-base"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <StatCard 
                title="Total Tenants"
                value={stats.total}
                icon="👥"
                gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
              />
              <StatCard 
                title="Pending"
                value={stats.pending}
                icon="⏰"
                gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              />
              <StatCard 
                title="Approved"
                value={stats.approved}
                icon="✅"
                gradient="bg-gradient-to-br from-emerald-500 to-green-600"
              />
              <StatCard 
                title="This Month"
                value={stats.thisMonth}
                icon="📅"
                gradient="bg-gradient-to-br from-purple-500 to-pink-600"
              />
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Status Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">Pending</span>
                      <span className="font-bold text-amber-600">{stats.pending}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${stats.total ? (stats.pending / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">Approved</span>
                      <span className="font-bold text-emerald-600">{stats.approved}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${stats.total ? (stats.approved / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {[...pendingTenants, ...approvedTenants].slice(0, 5).map(tenant => (
                    <div key={tenant._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {tenant.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{tenant.fullName}</p>
                        <span className="text-xs text-gray-500">{new Date(tenant.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                  {[...pendingTenants, ...approvedTenants].length === 0 && (
                    <p className="text-center text-gray-500 py-4">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Payment Approvals</h2>
              
              {pendingPayments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-gray-500 text-lg">No pending payments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPayments.map((payment) => (
                    <div key={payment._id} className="border-2 border-amber-200 rounded-xl p-6 bg-amber-50 hover:bg-amber-100 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                              {payment.userId?.fullName?.charAt(0)?.toUpperCase() || 'T'}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{payment.userId?.fullName || 'Unknown'}</h3>
                              <p className="text-sm text-gray-500">{payment.userId?.email || ''}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Month</p>
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-bold text-gray-900">{payment.month}</p>
                                {payment.isAdvanced && (
                                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
                                    🚀 Advanced
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Submitted</p>
                              <p className="text-sm text-gray-700">
                                {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Status</p>
                              <span className="inline-block px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                                PENDING
                              </span>
                            </div>
                          </div>

                          {payment.barcodeImage && (
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Barcode Screenshot (Approval ke liye)</p>
                              <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <img
                                  src={payment.barcodeImage}
                                  alt="Payment proof"
                                  onClick={() => setFullScreenImage(payment.barcodeImage)}
                                  className="max-w-full sm:max-w-xs max-h-48 object-contain rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:opacity-95 hover:shadow-lg transition-all"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-amber-200">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowPaymentModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold text-sm sm:text-base"
                        >
                          👁️ View Details
                        </button>
                        <button
                          onClick={() => handleApprovePayment(payment._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all font-semibold shadow-lg text-sm sm:text-base"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleRejectPayment(payment._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-semibold shadow-lg text-sm sm:text-base"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tenant Lists */}
        {(activeTab === 'pending' || activeTab === 'approved' || activeTab === 'all') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
              
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredTenants.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No tenants found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search term</p>
                </div>
              ) : (
                filteredTenants.map(tenant => (
                  <TenantCard 
                    key={tenant._id} 
                    tenant={tenant} 
                    isPending={pendingTenants.includes(tenant)} 
                    setSelectedTenant={setSelectedTenant}
                    setShowModal={setShowModal}
                    setSelectedAadhaar={setSelectedAadhaar}
                    handleApprove={handleApprove}
                    handleReject={handleReject}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Payment Status Tab */}
        {activeTab === 'payment-status' && (
          <PaymentStatusTab 
            approvedTenants={approvedTenants} 
            openHistoryModal={openHistoryModal} 
          />
        )}
      </main>

      {/* Modal */}
      {showModal && selectedTenant && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">Tenant Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-gray-600 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Full Name</label>
                  <p className="text-lg font-bold text-gray-900 break-words">{selectedTenant.fullName}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Email</label>
                  <p className="text-lg font-bold text-gray-900 break-all">{selectedTenant.email}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Mobile Number</label>
                  <p className="text-lg font-bold text-gray-900">{selectedTenant.mobileNumber}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Aadhaar Number</label>
                  <p className="text-lg font-bold text-gray-900 break-all">{selectedTenant.aadhaarNumber}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Date of Birth</label>
                  <p className="text-lg font-bold text-gray-900">{new Date(selectedTenant.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Father's Name</label>
                  <p className="text-lg font-bold text-gray-900">{selectedTenant.fatherName}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Gender</label>
                  <p className="text-lg font-bold text-gray-900">{selectedTenant.gender}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Registration Date</label>
                  <p className="text-lg font-bold text-gray-900">{new Date(selectedTenant.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-red-500 font-semibold uppercase tracking-wider">Password (Hashed)</label>
                  <p className="text-sm font-mono text-gray-900 break-all bg-red-50 p-2 rounded">{selectedTenant.password || 'N/A'}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Father's Phone</label>
                  <p className="text-lg font-bold text-gray-900">{selectedTenant.fatherPhone || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Mother's Name</label>
                  <p className="text-lg font-bold text-gray-900">{selectedTenant.motherName || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Mother's Phone</label>
                  <p className="text-lg font-bold text-gray-900">{selectedTenant.motherPhone || 'N/A'}</p>
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Permanent Address</label>
                  <p className="text-lg font-bold text-gray-900 break-words">{selectedTenant.permanentAddress}</p>
                </div>

              </div>

              {/* Enhanced Manual Password Reset Section */}
              <div className="bg-red-50/50 p-6 rounded-2xl border-2 border-dashed border-red-200 mb-6">
                <h3 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span>🔒</span> Manual Password Override
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={resetPasswordInput}
                    onChange={(e) => setResetPasswordInput(e.target.value)}
                    placeholder="Type new plain password here..."
                    className="flex-1 px-4 py-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
                  />
                  <button
                    onClick={() => handleResetPassword(selectedTenant._id)}
                    disabled={resetting}
                    className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-red-200"
                  >
                    {resetting ? 'Overriding...' : 'Set New Password'}
                  </button>
                </div>
                <div className="mt-3 flex items-start gap-2">
                  <span className="text-red-400 text-xs">⚠️</span>
                  <p className="text-[11px] text-red-500 leading-tight">
                    This will change the login password immediately. The tenant will <strong>not</strong> be notified automatically. You must inform them of their new password.
                  </p>
                </div>
              </div>

               {selectedTenant.aadhaarFile && (
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Documents</h3>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSelectedAadhaar(selectedTenant)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
                    >
                      📄 View Aadhaar Card
                    </button>
                  </div>
                </div>
              )}


              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                {pendingTenants.some(t => t._id === selectedTenant._id) && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedTenant._id);
                        setShowModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all font-semibold shadow-lg"
                    >
                      ✓ Approve Tenant
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedTenant._id);
                        setShowModal(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all font-semibold shadow-lg"
                    >
                      ✕ Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(selectedTenant._id, selectedTenant.fullName)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-semibold shadow-lg"
                >
                  🗑️ Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {showPaymentModal && selectedPayment && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-gray-600 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Tenant Name</label>
                  <p className="text-lg font-bold text-gray-900">{selectedPayment.userId?.fullName || 'Unknown'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Email</label>
                  <p className="text-lg font-bold text-gray-900">{selectedPayment.userId?.email || ''}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Month</label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-900">{selectedPayment.month}</p>
                    {selectedPayment.isAdvanced && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
                        🚀 Advanced Booking
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Submitted Date</label>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(selectedPayment.paymentDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Status</label>
                  <span className="inline-block px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-full">
                    PENDING
                  </span>
                </div>
              </div>

              {selectedPayment.barcodeImage && (
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Barcode Screenshot</h3>
                  <div className="flex justify-center">
                    <img 
                      src={selectedPayment.barcodeImage}
                      alt="Barcode payment screenshot"
                      onClick={() => setFullScreenImage(selectedPayment.barcodeImage)}
                      className="max-w-full max-h-96 rounded-xl border-2 border-gray-200 shadow-lg cursor-pointer hover:opacity-95 hover:shadow-xl transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleApprovePayment(selectedPayment._id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all font-semibold shadow-lg"
                >
                  ✓ Approve Payment
                </button>
                <button
                  onClick={() => {
                    handleRejectPayment(selectedPayment._id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-semibold shadow-lg"
                >
                  ✕ Reject Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Viewer */}
      {fullScreenImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={fullScreenImage}
              alt="Full size payment screenshot"
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{ maxWidth: '90vw', maxHeight: '90vh' }}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                Click outside or press ESC to close
              </p>
            </div>
          </div>
          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={() => setFullScreenImage(null)}
          />
        </div>
      )}

      {/* Aadhaar File Viewer Modal - FULL IMAGE FIT IN VIEW */}
{selectedAadhaar && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    onClick={() => setSelectedAadhaar(null)}
  >
    <div 
      className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col"
      style={{ height: '90vh' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Aadhaar Card: {selectedAadhaar.fullName}
          </h3>
          <p className="text-sm text-gray-500">ID: {selectedAadhaar.aadhaarNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`${BASE_URL}/api/admin/tenant-aadhaar/${selectedAadhaar._id}?token=${localStorage.getItem('token')}`}
            download
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 text-sm"
          >
            Download ⬇️
          </a>
          <button
            onClick={() => setSelectedAadhaar(null)}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content Area - Full image fit without scroll */}
      <div 
        className="flex-1 bg-gray-900 flex items-center justify-center p-4 overflow-hidden"
      >
        {/* Check if PDF or Image */}
        {selectedAadhaar.aadhaarFileData?.contentType === 'application/pdf' || 
         selectedAadhaar.aadhaarFile?.includes('pdf') || 
         selectedAadhaar.aadhaarFileData?.filename?.toLowerCase().endsWith('.pdf') ? (
          <iframe
            src={`${BASE_URL}/api/admin/tenant-aadhaar/${selectedAadhaar._id}?token=${localStorage.getItem('token')}`}
            className="w-full h-full rounded-lg"
            title="Aadhaar PDF"
          />
        ) : (
          <img
            src={`${BASE_URL}/api/admin/tenant-aadhaar/${selectedAadhaar._id}?token=${localStorage.getItem('token')}`}
            alt="Aadhaar Card"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/800x600?text=Error+Loading+Image";
            }}
          />
        )}
      </div>

      {/* Footer - Fixed */}
      <div className="p-3 bg-white border-t border-gray-100 text-center flex-shrink-0">
        <p className="text-xs text-gray-500">
          Large images might take a moment to load. Press ESC or click ✕ to close.
        </p>
      </div>
    </div>
  </div>
)}
      {/* Payment History Modal */}
      <PaymentHistoryModal 
        isHistoryModalOpen={isHistoryModalOpen}
        setIsHistoryModalOpen={setIsHistoryModalOpen}
        selectedHistoryTenant={selectedHistoryTenant}
        loadingHistory={loadingHistory}
        tenantPayments={tenantPayments}
        setFullScreenImage={setFullScreenImage}
        handleDeletePayment={handleDeletePayment}
      />
    </div>
  );
};

export default AdminDashboard;