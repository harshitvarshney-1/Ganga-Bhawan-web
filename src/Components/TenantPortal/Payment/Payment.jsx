import React, { useState, useEffect } from "react";
import { BASE_URL } from '../../../services/api';
import barcodeImg from '../../../assets/barcode.png';

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function Legend({ color, text }) {
  return (
    <span className="flex items-center gap-2 text-sm font-semibold">
      <span className={`w-4 h-4 rounded-full ${color} border-2 border-white shadow-md`}></span>
      {text}
    </span>
  );
}

// Simple alert dialog for feedback
function CustomAlert({ open, message, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 rounded-2xl shadow-xl px-8 py-8 min-w-[320px] max-w-full text-white relative">
        <div className="text-lg font-bold mb-2">Payment Portal</div>
        <div className="mb-4 text-sm">{message}</div>
        <button
          onClick={onClose}
          className="bg-cyan-400 text-gray-900 px-6 py-2 rounded-xl font-semibold shadow-lg border-2 border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:bg-cyan-300 transition"
          autoFocus
        >
          OK
        </button>
      </div>
    </div>
  );
}

const Payment = () => {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, month: null, amount: 0, monthIndex: null });
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
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        setAlert({
          open: true,
          message: 'Session expired. Please login again.'
        });
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);

      // Fetch payment history from backend
      const response = await fetch(`${BASE_URL}/api/payments/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          setPayments([]);
          setLoading(false);
          setAlert({
            open: true,
            message: 'Session expired. Please login again.'
          });
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
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
      p.monthIndex === monthIndex &&
      new Date(p.paymentDate).getFullYear() === currentYear &&
      p.status === 'success'
    );
  };

  const openPaymentModal = (monthIndex) => {
    setModal({
      open: true,
      month: monthNames[monthIndex],
      monthIndex: monthIndex,
      amount: 5000 // Default amount
    });
    setBarcodeImage(null);
    setBarcodePreview(null);
  };

  const closeModal = () => {
    setProcessing(false);
    setModal({ open: false, month: null, amount: 0, monthIndex: null });
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
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAlert({
          open: true,
          message: 'Session expired. Please login again.'
        });
        setProcessing(false);
        return;
      }

      const formData = new FormData();
      formData.append('barcodeImage', barcodeImage);
      formData.append('month', modal.month);
      formData.append('monthIndex', modal.monthIndex);
      formData.append('amount', modal.amount);

      const response = await fetch(`${BASE_URL}/api/payments/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      }).catch(fetchError => {
        // Handle network errors gracefully
        throw new Error('NETWORK_ERROR');
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `Server error: ${response.status}` 
        }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json().catch(() => {
        // If JSON parsing fails, assume success if status was ok
        return { success: true };
      });
      
      if (data.success) {
        setAlert({
          open: true,
          message: `✅ Payment submitted successfully for ${modal.month}! Admin will verify and approve it soon.`
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
          ? '❌ Network error – payment submit nahi hua. Internet / backend check karo, phir dubara try karo.'
          : (error.message || 'Error submitting payment. Please try again.')
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAlertClose = () => setAlert({ open: false, message: "" });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <CustomAlert open={alert.open} message={alert.message} onClose={handleAlertClose} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Payment Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Manage your monthly PG rent payments</p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.fullName || 'Tenant'}</h2>
              <p className="text-gray-500">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Legend color="bg-emerald-500" text="Paid" />
            <Legend color="bg-amber-500" text="Pending Approval" />
            <Legend color="bg-red-500" text="Current Due" />
            <Legend color="bg-gray-300" text="Upcoming" />
          </div>
        </div>

        {/* Payment Calendar */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Year {currentYear}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {monthNames.map((month, index) => {
              const isPaid = isMonthPaid(index);
              const isCurrent = index === currentMonth;
              const isPast = index < currentMonth;
              const canPay = !isPaid && (isCurrent || isPast);
              
              // Check if payment is pending (use monthIndex = month payment is FOR, not submit date)
              const pendingPayment = payments.find(p =>
                p.monthIndex === index &&
                new Date(p.paymentDate).getFullYear() === currentYear &&
                p.status === 'pending'
              );

              return (
                <div
                  key={month}
                  className={`
                    relative rounded-2xl p-6 border-2 transition-all duration-300
                    ${isPaid
                    ? 'border-emerald-500 bg-emerald-50'
                    : pendingPayment
                      ? 'border-amber-500 bg-amber-50'
                      : isCurrent
                        ? 'border-red-500 bg-red-50 shadow-lg shadow-red-100'
                        : isPast
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 bg-gray-50'
                  }
                    ${canPay ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : ''}
                  `}
                  onClick={() => canPay && openPaymentModal(index)}
                >
                  {/* Month Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      ${isPaid
                        ? 'bg-emerald-500'
                        : pendingPayment
                          ? 'bg-amber-500'
                          : isCurrent
                            ? 'bg-red-500'
                            : isPast
                              ? 'bg-amber-500'
                              : 'bg-gray-300'
                      }
                    `}>
                      {isPaid ? (
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                    </div>

                    {isCurrent && !isPaid && !pendingPayment && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                        DUE
                      </span>
                    )}
                    {pendingPayment && (
                      <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                        PENDING
                      </span>
                    )}
                  </div>

                  {/* Month Name */}
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{month}</h4>

                  {/* Status Badge */}
                  <div className={`
                    inline-block px-3 py-1 rounded-full text-xs font-bold
                    ${isPaid
                    ? 'bg-emerald-500 text-white'
                    : pendingPayment
                      ? 'bg-amber-500 text-white'
                      : isCurrent
                        ? 'bg-red-500 text-white'
                        : isPast
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                  }
                  `}>
                    {isPaid ? '✓ PAID' : pendingPayment ? '⏳ PENDING' : isCurrent ? 'PAY NOW' : isPast ? 'OVERDUE' : 'UPCOMING'}
                  </div>

                  {/* Pay Button for Current/Overdue */}
                  {canPay && (
                    <button className={`
                      w-full mt-4 py-2 rounded-xl font-semibold text-white transition-all
                      ${isCurrent
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                      }
                    `}>
                      Pay
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment History</h3>

          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-xl hover:bg-gray-100 transition-colors ${
                  payment.status === 'success' ? 'bg-emerald-50' : 
                  payment.status === 'pending' ? 'bg-amber-50' : 
                  'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      payment.status === 'success' ? 'bg-emerald-500' : 
                      payment.status === 'pending' ? 'bg-amber-500' : 
                      'bg-red-500'
                    }`}>
                      {payment.status === 'success' ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : payment.status === 'pending' ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{payment.month}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Status: {payment.status === 'success' ? '✅ Approved' : payment.status === 'pending' ? '⏳ Pending Approval' : '❌ Rejected'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">₹{payment.amount}</p>
                    {payment.barcodeImage && (
                      <button 
                        onClick={() => setFullScreenImage(payment.barcodeImage)}
                        className="text-xs text-cyan-600 hover:underline mt-1 block cursor-pointer bg-transparent border-none p-0"
                      >
                        View Barcode
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 text-lg">No payment history yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {modal.open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Submit Payment</h3>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-xl transition-all text-gray-600 text-2xl"
                  disabled={processing}
                >
                  ✕
                </button>
              </div>

              <div className="bg-white rounded-2xl p-4 mb-6 border-2 border-cyan-200">
                <div className="text-center">
                  <div className="mb-0">
                    <img 
                      src={barcodeImg} 
                      alt="Payment Barcode" 
                      className="w-full max-w-[240px] mx-auto rounded-lg shadow-md border-2 border-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Barcode Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Barcode Payment Screenshot *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-cyan-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBarcodeChange}
                    className="hidden"
                    id="barcode-upload"
                    disabled={processing}
                  />
                  <label
                    htmlFor="barcode-upload"
                    className="cursor-pointer"
                  >
                    {barcodePreview ? (
                      <div className="space-y-3">
                        <img
                          src={barcodePreview}
                          alt="Barcode preview"
                          className="w-full max-h-64 object-contain rounded-lg mx-auto border-2 border-gray-200"
                        />
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-4xl">📷</div>
                        <p className="text-gray-600 font-semibold">Click to upload barcode screenshot</p>
                        <p className="text-xs text-gray-400">JPG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-3 mb-6 text-sm text-gray-600 bg-blue-50 p-4 rounded-xl">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>After payment, upload the barcode screenshot. Admin will verify and approve it.</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Payment status will be updated automatically once approved by admin.</span>
                </div>
              </div>

              <button
                onClick={handleSubmitPayment}
                disabled={processing || !barcodeImage}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg transition-all
                  ${processing || !barcodeImage
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  } text-white
                `}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Payment for Approval'
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                By submitting, you confirm that you have made the payment via barcode
              </p>
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
    </div>
  );
};

export default Payment;
