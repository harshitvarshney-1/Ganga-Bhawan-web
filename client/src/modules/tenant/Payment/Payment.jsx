import React, { useState, useEffect } from 'react';
import { authAtom, userAtom } from '../../../shared/hooks/store/auth.atom';
import { useAtomValue } from 'jotai';
import { API_URL } from '../../../infra/config';
import barcodeImg from '../../../assets/barcode.jpeg';
import Loader from '../../../shared/components/atoms/Loader/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle2, Clock, Calendar, Rocket, Image as ImageIcon, UploadCloud, X, AlertCircle } from 'lucide-react';
import { uploadToCloudinaryDirect } from '../../../infra/cloudinary';

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function Legend({ color, text, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 backdrop-blur-sm rounded-full border border-border/50 shadow-sm">
      <div className={`p-1 rounded-full ${color.bg}`}>
        <Icon className={`w-3.5 h-3.5 ${color.text}`} />
      </div>
      <span className="text-[13px] font-bold text-foreground">{text}</span>
    </div>
  );
}

// Simple alert dialog for feedback
function CustomAlert({ open, message, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/40 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-card rounded-3xl shadow-2xl p-6 md:p-8 min-w-[320px] max-w-sm text-center relative max-h-[90vh] overflow-hidden"
          >
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Notice</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{message}</p>
            <button
              onClick={onClose}
              className="w-full bg-primary text-primary-foreground px-6 py-3.5 rounded-2xl font-bold shadow-lg hover:bg-primary/90 transition-all active:scale-95"
            >
              Acknowledge
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const Payment = () => {
  const auth = useAtomValue(authAtom);
  const authUser = useAtomValue(userAtom);
  const [user, setUser] = useState(authUser);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, month: null, amount: 0, monthIndex: null });
  const [advancedModal, setAdvancedModal] = useState({ open: false, month: "", monthIndex: null });
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "" });
  const [barcodeImage, setBarcodeImage] = useState(null);
  const [barcodePreview, setBarcodePreview] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchUserAndPayments();
    
    // Auto-refresh payments every 10 seconds to check for admin approval updates
    // Silent refresh - don't show errors
    const interval = setInterval(() => {
      fetchUserAndPayments().catch(err => {
        // Silently handle errors during auto-refresh
        console.log('Auto-refresh payment error (silent):', err);
      });
    }, 10000); // Check every 10 seconds for faster updates
    
    return () => clearInterval(interval);
  }, []);

  // Keyboard event listener for ESC key to close full screen image
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && fullScreenImage) {
        setFullScreenImage(null);
      }
    };

    if (fullScreenImage) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullScreenImage]);

  const fetchUserAndPayments = async () => {
    try {
      const token = auth.token;
      
      if (!token) {
        setLoading(false);
        setAlert({
          open: true,
          message: 'Session expired. Please login again.'
        });
        return;
      }

      setUser(authUser);

      // Fetch payment history from backend
      const response = await fetch(`${API_URL}/payments/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          // Clear token to stop further requests
          localStorage.removeItem('auth'); 
          localStorage.removeItem('user');
          
          setPayments([]);
          setLoading(false);
          setAlert({
            open: true,
            message: 'Session expired. Please login again.'
          });

          // Redirect to login
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        
        // For other errors, try to get error message
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || `Failed to fetch payments: ${response.status}`);
      }

      const data = await response.json();
      setPayments(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      
      // Don't clear payments on error - keep previous state so pending still shows
      // Don't show error alerts for fetch errors - just log them
      console.warn('Payment fetch error (silent):', error.message);
    }
  };

  const isMonthPaid = (monthIndex) => {
    return payments.some(p =>
      (p.monthIndex === monthIndex || (p.monthIndices && p.monthIndices.includes(monthIndex))) &&
      p.status === 'success'
    );
  };

  const isMonthPending = (monthIndex) => {
    return payments.some(p =>
      (p.monthIndex === monthIndex || (p.monthIndices && p.monthIndices.includes(monthIndex))) &&
      p.status === 'pending'
    );
  };

  const openPaymentModal = (monthIndex) => {
    setModal({
      open: true,
      month: monthNames[monthIndex],
      monthIndex: monthIndex
    });
    setBarcodeImage(null);
    setBarcodePreview(null);
  };

  const openAdvancedModal = (monthIndex) => {
    setAdvancedModal({
      open: true,
      month: monthNames[monthIndex] || "",
      monthIndex: monthIndex
    });
    setBarcodeImage(null);
    setBarcodePreview(null);
  };

  const [multiModal, setMultiModal] = useState({ open: false, selectedMonths: [] });
  const openMultiModal = () => {
    setMultiModal({ open: true, selectedMonths: [] });
    setBarcodeImage(null);
    setBarcodePreview(null);
  };

  const closeModal = () => {
    setProcessing(false);
    setModal({ open: false, month: null, amount: 0, monthIndex: null });
    setAdvancedModal({ open: false, month: "", monthIndex: null });
    setMultiModal({ open: false, selectedMonths: [] });
    setBarcodeImage(null);
    setBarcodePreview(null);
    setAlert({ open: false, message: "" });
  };

  const handleBarcodeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setAlert({
          open: true,
          message: 'Please upload an image file (JPG, PNG, etc.)'
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAlert({
          open: true,
          message: 'Image size should be less than 5MB'
        });
        return;
      }

      setBarcodeImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setBarcodePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!barcodeImage) {
      setAlert({
        open: true,
        message: 'Please upload barcode payment screenshot'
      });
      return;
    }

    setProcessing(true);
    try {
      const token = auth.token;
      
      if (!token) {
        setAlert({
          open: true,
          message: 'Session expired. Please login again.'
        });
        setProcessing(false);
        return;
      }

      // Step 1: Upload to Cloudinary (Direct from Client)
      console.log('[Payment] Uploading receipt to Cloudinary...');
      const barcodeImageUrl = await uploadToCloudinaryDirect(barcodeImage, 'payments');

      // Step 2: Submit to Backend
      const response = await fetch(`${API_URL}/payments/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          barcodeImageUrl, // Send the Cloudinary URL
          month: modal.month,
          monthIndex: modal.monthIndex,
          amount: "0"
        })
      }).catch(() => {
        throw new Error('NETWORK_ERROR');
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `Server error: ${response.status}` 
        }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json().catch(() => {
        return { success: true };
      });
      
      if (data.success) {
        setAlert({
          open: true,
          message: `Payment submitted successfully for ${modal.month}! Admin will verify and approve it soon.`
        });
        
        // Refresh payments so pending status shows immediately
        try {
          await fetchUserAndPayments();
        } catch (err) {
          console.warn('Payment refresh after submit:', err);
        }
        
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      
      const isNetworkError = error.message === 'NETWORK_ERROR' ||
        (error.message && (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('Network request failed')
        ));

      setAlert({
        open: true,
        message: isNetworkError
          ? 'Network error – payment submit nahi hua. Internet / backend check karo, phir dubara try karo.'
          : (error.message || 'Error submitting payment. Please try again.')
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitAdvancedPayment = async () => {
    // Check if it's Multi-month or Single Advanced
    const isMultiMode = multiModal.open;
    const selectedMonths = isMultiMode ? multiModal.selectedMonths : [advancedModal.month];

    if (!barcodeImage || (isMultiMode && selectedMonths.length === 0) || (!isMultiMode && !advancedModal.month)) {
      setAlert({
        open: true,
        message: 'Please select month(s) and upload payment screenshot'
      });
      return;
    }

    setProcessing(true);
    try {
      const token = auth.token;
      
      // Step 1: Upload to Cloudinary (Direct from Client)
      console.log(`[Payment] Uploading ${isMultiMode ? 'multi' : 'single'} receipt to Cloudinary...`);
      const barcodeImageUrl = await uploadToCloudinaryDirect(barcodeImage, 'payments');

      // Prepare payload
      const selectedData = selectedMonths.map(m => ({
        month: m,
        monthIndex: monthNames.indexOf(m)
      }));

      // Step 2: Submit to Backend
      // NOTE: For bulk rent, we set isAdvanced: false so it updates the main calendar
      const response = await fetch(`${API_URL}/payments/submit`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          barcodeImageUrl,
          selectedMonths: selectedData,
          amount: "0",
          isAdvanced: !isMultiMode // Only single 'Pay in Advance' counts as Advanced (Security)
        })
      });

      if (response.ok) {
        setAlert({
          open: true,
          message: `Booking submitted for ${selectedMonths.join(', ')}! Admin will verify soon.`
        });
        fetchUserAndPayments();
        setTimeout(closeModal, 2000);
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Failed to submit advanced payment');
      }
    } catch (error) {
      console.error('Advanced payment error:', error);
      setAlert({
        open: true,
        message: error.message || 'Error submitting advanced payment. Please try again.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAlertClose = () => setAlert({ open: false, message: "" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return <Loader text="Syncing Financials..." />;
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto pb-12 space-y-6"
    >
      <CustomAlert open={alert.open} message={alert.message} onClose={handleAlertClose} />
      
      {/* Hero Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-background">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
        <div className="relative z-10 px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-primary text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5">Ganga Bhawan</p>
            <h1 className="text-2xl lg:text-3xl font-black text-foreground font-outfit">Payments &amp; Dues</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Manage your rent, clear dues, and view payment history</p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto flex-wrap">
            <Legend color={{bg: 'bg-emerald-900/50', text: 'text-emerald-400'}} icon={CheckCircle2} text="Paid" />
            <Legend color={{bg: 'bg-amber-900/50', text: 'text-amber-400'}} icon={Clock} text="Pending" />
            <Legend color={{bg: 'bg-rose-900/50', text: 'text-rose-400'}} icon={CreditCard} text="Due" />
          </div>
        </div>
      </motion.div>

      {/* Advanced Booking & User Info Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Card */}
        <div className="lg:col-span-1 bg-card rounded-3xl p-6 border border-border shadow-sm flex items-center gap-5">
          <div className="w-16 h-16 rounded-[1.2rem] bg-primary/10 flex items-center justify-center text-primary text-2xl font-black shadow-inner">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'T'}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">{user?.fullName || 'Tenant'}</h2>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        {/* Advanced Booking Box */}
        <div className="lg:col-span-2 bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 relative overflow-hidden text-foreground shadow-xl shadow-primary/20 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-2xl group-hover:bg-primary/20 transition-all duration-700 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 h-full">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase mb-3 text-primary-foreground border border-primary/20">
                <Rocket className="w-3.5 h-3.5" /> Fast Track
              </div>
              <h3 className="text-2xl font-bold mb-1">Advanced Booking</h3>
              <p className="text-primary-foreground text-sm font-medium">Pre-pay for coming months to avoid late fees</p>
            </div>
            
            {payments.filter(p => p.isAdvanced && p.status !== 'rejected').length === 0 ? (
              <div className="flex gap-3 self-start sm:self-center flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openAdvancedModal()}
                  className="whitespace-nowrap px-6 py-3.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2"
                >
                  Pay in Advance
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openMultiModal}
                  className="whitespace-nowrap px-6 py-3.5 bg-indigo-400 text-foreground hover:bg-indigo-300 font-bold rounded-2xl shadow-lg transition-all border border-primary/30 flex items-center gap-2"
                >
                  Bulk Payment (Multi-Month)
                </motion.button>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap self-start sm:self-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openMultiModal}
                  className="whitespace-nowrap px-4 py-2 bg-primary/20 backdrop-blur-md text-primary font-bold rounded-xl border border-primary/20 transition-all text-xs"
                >
                  + Add Bulk
                </motion.button>
                {payments.filter(p => p.isAdvanced && p.status !== 'rejected').map((payment, idx) => (
                  <div key={idx} className="bg-primary/20 backdrop-blur-md px-4 py-2 rounded-xl border border-primary/20 flex items-center gap-3">
                    <span className="font-bold text-sm">{payment.month}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      payment.status === 'success' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 
                      payment.status === 'pending' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'bg-rose-400'
                    }`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Payment Calendar */}
      <motion.div variants={itemVariants} className="bg-card rounded-3xl p-8 border border-border shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
            <Calendar className="w-6 h-6 text-indigo-500" /> Payment Schedule
          </h3>
          <div className="px-4 py-1.5 bg-muted text-muted-foreground font-bold rounded-full text-sm">
            Year {currentYear}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
          {monthNames.map((month, index) => {
            // Find if there is a matching payment record in the DB!
            const paymentRecord = payments.find(p => 
              (p.monthIndex === index || (p.monthIndices && p.monthIndices.includes(index))) && !p.isAdvanced
            );

            // If there's no record at all, the admin hasn't generated this month. DO NOT SHOW.
            if (!paymentRecord) return null;

            const isPaid = paymentRecord.status === 'success';
            const pendingPayment = paymentRecord.status === 'pending';
            const isDue = paymentRecord.status === 'due';
            const isRejected = paymentRecord.status === 'rejected';

            // Tenant can pay if it's 'due' or 'rejected'.
            const canPay = isDue || isRejected;
            
            let baseStyle, iconStyle, tagStyle, tagText;
            
            if (isPaid) {
              baseStyle = "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
              iconStyle = "bg-emerald-500 text-white shadow-emerald-500/30 shadow-lg";
              tagStyle = "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400";
              tagText = "Paid";
            } else if (pendingPayment) {
              baseStyle = "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
              iconStyle = "bg-amber-500 text-white shadow-amber-500/30 shadow-lg";
              tagStyle = "bg-amber-500/20 text-amber-700 dark:text-amber-400";
              tagText = "Processing";
            } else if (isDue || isRejected) {
              baseStyle = "border-primary/30 bg-card text-foreground shadow-xl shadow-primary/20 ring-1 ring-primary/10";
              iconStyle = "bg-primary text-primary-foreground shadow-primary/30 shadow-lg";
              tagStyle = "bg-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse";
              tagText = isRejected ? "Rejected/Due" : "Due Now";
            } else {
              tagStyle = "bg-muted text-muted-foreground";
              tagText = "Upcoming";
              baseStyle = "border-border bg-card text-muted-foreground opacity-60";
              iconStyle = "bg-muted text-muted-foreground";
            }

            return (
              <motion.div
                key={month}
                whileHover={canPay ? { y: -4, scale: 1.02 } : { scale: 1 }}
                className={`
                  relative rounded-2xl p-5 border transition-all duration-300
                  ${baseStyle} ${canPay ? 'cursor-pointer hover:shadow-lg' : ''}
                `}
                onClick={() => canPay && openPaymentModal(index)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconStyle}`}>
                    {isPaid ? <CheckCircle2 className="w-5 h-5" /> : pendingPayment ? <Clock className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${tagStyle}`}>
                    {tagText}
                  </span>
                </div>

                <h4 className={`text-lg font-extrabold ${!canPay && !isPaid && !pendingPayment ? 'text-muted-foreground' : ''}`}>
                  {month}
                  {paymentRecord.amount > 0 && (
                    <span className="block text-sm font-bold text-muted-foreground mt-1">₹ {paymentRecord.amount}</span>
                  )}
                </h4>

                {canPay && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <motion.button 
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all 
                        shadow-lg relative overflow-hidden group/btn
                        ${canPay 
                          ? 'bg-primary text-foreground shadow-primary/10' 
                          : 'bg-rose-600 text-foreground shadow-rose-200'}
                      `}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                      Pay Now <CreditCard className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Payment History List */}
      <motion.div variants={itemVariants} className="bg-card rounded-3xl p-8 border border-border shadow-sm">
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
          <Clock className="w-6 h-6 text-muted-foreground" /> Recent Transactions
        </h3>

        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((payment, index) => {
              const isSuccess = payment.status === 'success';
              const isPending = payment.status === 'pending';
              
              return (
                <div key={index} className="group flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 p-4 rounded-2xl border border-border hover:border-border hover:bg-background transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isSuccess ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 
                      isPending ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}>
                      {isSuccess ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : isPending ? <Clock className="w-5 h-5 sm:w-6 sm:h-6" /> : <X className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-foreground text-sm sm:text-base truncate">
                        {payment.month} <span className="text-muted-foreground font-normal text-xs sm:text-sm ml-1 hidden sm:inline">Rent</span>
                      </h5>
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5 truncate">
                        {new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {isSuccess ? 'Verified' : isPending ? 'Processing' : 'Declined'}
                      </p>
                    </div>
                  </div>
                  
                  {payment.barcodeImage && (
                    <button 
                      onClick={() => setFullScreenImage(payment.barcodeImage)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/10 transition-all shadow-sm shrink-0 ml-auto sm:ml-0"
                      title="View Receipt"
                    >
                      <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center bg-background rounded-2xl border-2 border-dashed border-border">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No transactions found</p>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {modal.open && (
          <PaymentModal 
            title={`Pay Rent for ${modal.month}`}
            closeModal={closeModal}
            barcodeImg={barcodeImg}
            handleBarcodeChange={handleBarcodeChange}
            barcodePreview={barcodePreview}
            handleSubmit={handleSubmitPayment}
            processing={processing}
            barcodeImage={barcodeImage}
          />
        )}
        
        {advancedModal.open && (
           <PaymentModal 
             title="Advanced Booking"
             closeModal={closeModal}
             barcodeImg={barcodeImg}
             handleBarcodeChange={handleBarcodeChange}
             barcodePreview={barcodePreview}
             handleSubmit={handleSubmitAdvancedPayment}
             processing={processing}
             barcodeImage={barcodeImage}
             isAdvanced={true}
             advancedModal={advancedModal}
             setAdvancedModal={setAdvancedModal}
             monthNames={monthNames}
             currentMonth={currentMonth}
           />
        )}

        {multiModal.open && (
           <PaymentModal 
             title="Bulk Payment (Multi-Month)"
             closeModal={closeModal}
             barcodeImg={barcodeImg}
             handleBarcodeChange={handleBarcodeChange}
             barcodePreview={barcodePreview}
             handleSubmit={handleSubmitAdvancedPayment} // Reusing the batch handler
             processing={processing}
             barcodeImage={barcodeImage}
             isMulti={true}
             multiModal={multiModal}
             setMultiModal={setMultiModal}
             monthNames={monthNames}
             isMonthPaid={isMonthPaid}
           />
        )}
        
        {fullScreenImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative max-w-full max-h-full">
              <button onClick={() => setFullScreenImage(null)} className="absolute -top-16 right-0 text-foreground/50 hover:text-foreground transition-colors bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm">
                <X className="w-6 h-6" />
              </button>
              <motion.img 
                initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                src={fullScreenImage} alt="Receipt" className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl" 
              />
            </div>
            <div className="absolute inset-0 -z-10" onClick={() => setFullScreenImage(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Reusable Modal Component for Payment & Advanced
const PaymentModal = ({ 
  title, closeModal, barcodeImg, handleBarcodeChange, barcodePreview, 
  handleSubmit, processing, barcodeImage, isAdvanced, advancedModal, setAdvancedModal, 
  monthNames, isMulti, multiModal, setMultiModal, isMonthPaid
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/40 backdrop-blur-sm flex items-center justify-center z-[80] p-4"
      onClick={closeModal}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-card rounded-xl w-full max-w-sm sm:max-w-md mx-2 sm:mx-0 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <button onClick={closeModal} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto hidden-scrollbar flex-1">
          
          {isAdvanced && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-foreground mb-2">Select Target Month</label>
              <div className="relative">
                <select
                  className="w-full appearance-none p-4 bg-background border border-border rounded-xl font-medium text-foreground focus:ring-2 focus:ring-primary/100 focus:border-primary outline-none transition-all cursor-pointer"
                  value={advancedModal.month}
                  onChange={(e) => setAdvancedModal({...advancedModal, month: e.target.value})}
                >
                  <option value="">Choose a month...</option>
                  {monthNames.map((m) => (
                     <option key={m} value={m}>{m} {new Date().getFullYear() + (monthNames.indexOf(m) < new Date().getMonth() ? 1 : 0)}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          )}

          {isMulti && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-foreground mb-3">Select Months</label>
              <div className="grid grid-cols-2 gap-2">
                {monthNames.map((m) => {
                  const mIdx = monthNames.indexOf(m);
                  const isAlreadyPaid = isMonthPaid(mIdx);
                  const isSelected = multiModal.selectedMonths.includes(m);
                  return (
                    <button
                      key={m}
                      disabled={isAlreadyPaid}
                      onClick={() => {
                        const current = multiModal.selectedMonths;
                        if (current.includes(m)) {
                          setMultiModal({...multiModal, selectedMonths: current.filter(x => x !== m)});
                        } else {
                          setMultiModal({...multiModal, selectedMonths: [...current, m]});
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${isAlreadyPaid ? 'bg-background opacity-50' : isSelected ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}
                    >
                      <span className="text-xs font-bold block">{m}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date().getFullYear() + (mIdx < new Date().getMonth() ? 1 : 0)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-primary/10/50 rounded-2xl p-5 mb-6 border border-indigo-100 text-center">
            <div className="inline-block p-2 bg-card rounded-xl shadow-sm mb-3">
              <img src={barcodeImg} alt="QR Code" className="w-64 h-64 object-contain" />
            </div>
            <p className="text-sm font-bold text-foreground">Scan to Pay securely</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-foreground mb-2">Upload Receipt</label>
            <div className="relative group">
              <input type="file" accept="image/*" onChange={handleBarcodeChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={processing} />
              <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${barcodePreview ? 'border-primary/30 bg-primary/10/30' : 'border-border bg-background group-hover:bg-muted group-hover:border-slate-300'}`}>
                {barcodePreview ? (
                  <div className="space-y-3">
                    <img src={barcodePreview} alt="Preview" className="max-h-32 object-contain rounded-lg mx-auto shadow-sm" />
                    <p className="text-xs font-bold text-primary">Tap to replace image</p>
                  </div>
                ) : (
                  <div className="space-y-2 pointer-events-none">
                    <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-sm mx-auto text-muted-foreground group-hover:text-indigo-500 group-hover:scale-110 transition-all">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-foreground">Click or drag receipt here</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG (Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-card shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={processing || !barcodeImage || (isAdvanced && !advancedModal.month) || (isMulti && multiModal.selectedMonths.length === 0)}
            className="w-full py-4 bg-primary text-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <><div className="w-5 h-5 border-2 border-primary/30 border-t-white rounded-full animate-spin" /> Verifying...</>
            ) : (
              <><CheckCircle2 className="w-5 h-5" /> Submit for Approval</>
            )}
          </button>
        </div>
        
        {/* Scrollbar styles inside modal to avoid global pollution if not available */}
        <style dangerouslySetInnerHTML={{__html: `
          .hidden-scrollbar::-webkit-scrollbar { display: none; }
          .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
      </motion.div>
    </motion.div>
  );
};

export default Payment;
