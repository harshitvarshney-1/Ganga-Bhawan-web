import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckCircle2, Clock, AlertTriangle, Image as ImageIcon, Trash2, Rocket, Info, IndianRupee } from 'lucide-react';
import { useAtomValue } from 'jotai';
import { authAtom } from '../../shared/hooks/store/auth.atom';
import { API_URL } from '../../infra/config';

const PaymentHistoryModal = ({
  isHistoryModalOpen,
  setIsHistoryModalOpen,
  selectedHistoryTenant,
  loadingHistory,
  tenantPayments,
  setFullScreenImage,
  handleDeletePayment
}) => {
  const auth = useAtomValue(authAtom);
  const [assignDate, setAssignDate] = React.useState('');
  const [assignAmount, setAssignAmount] = React.useState('');
  const [assigning, setAssigning] = React.useState(false);

  // Manual payment expanded state
  const [paymentType, setPaymentType] = React.useState('monthly'); // 'monthly' | 'advanced' | 'due'
  const [selectedMonthIndex, setSelectedMonthIndex] = React.useState(new Date().getMonth());
  const [customMonthLabel, setCustomMonthLabel] = React.useState('');
  const [paymentMode, setPaymentMode] = React.useState('Cash');
  const [notes, setNotes] = React.useState('');

  if (!isHistoryModalOpen || !selectedHistoryTenant) return null;

  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthNamesFull = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleManualSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!assignAmount || parseFloat(assignAmount) <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const token = auth?.token || (typeof auth === 'string' ? auth : null) || localStorage.getItem('token');
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    // Robustly get tenant ID, whether it's _id or id
    const tenantId = selectedHistoryTenant?._id || selectedHistoryTenant?.id;
    if (!tenantId) {
      alert("Cannot determine tenant ID. Please close and reopen the payment record.");
      return;
    }

    setAssigning(true);
    try {
      const pDate = assignDate ? new Date(assignDate) : new Date();
      const isAdvanced = paymentType === 'advanced';

      let finalMonth = '';
      let mIndex = selectedMonthIndex;

      if (paymentType === 'due') {
        const monthStr = `${pDate.getDate()} ${monthNamesShort[pDate.getMonth()]} ${pDate.getFullYear()}`;
        const response = await fetch(`${API_URL}/admin/assign-due-payment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: tenantId,
            month: monthStr,
            monthIndex: pDate.getMonth(),
            amount: assignAmount,
            isAdvanced: false,
            paymentDate: pDate.toISOString()
          })
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
          alert("✅ Rent assigned (DUE) successfully!");
          setAssignAmount('');
          fetchPaymentsHistory();
        } else {
          alert(`❌ Error (${response.status}): ${data.error || data.message || 'Failed to assign rent'}`);
        }
        return;
      }

      if (isAdvanced) {
        finalMonth = customMonthLabel.trim() || `Advanced - ${monthNamesFull[selectedMonthIndex]} ${pDate.getFullYear()}`;
        mIndex = 99;
      } else {
        finalMonth = `${monthNamesFull[selectedMonthIndex]} ${currentYear}`;
      }

      const response = await fetch(`${API_URL}/admin/record-manual-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: tenantId,
          month: finalMonth,
          monthIndex: mIndex,
          amount: parseFloat(assignAmount),
          isAdvanced,
          paymentDate: pDate.toISOString(),
          paymentMode,
          notes: notes || `Manually recorded by Admin (${paymentMode})`
        })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok && (data.success || response.status === 200)) {
        alert(`✅ ${data.message || 'Payment recorded successfully & confirmation mail sent!'}`);
        setAssignAmount('');
        setCustomMonthLabel('');
        setNotes('');
        fetchPaymentsHistory();
      } else {
        alert(`❌ Error (${response.status}): ${data.error || data.message || 'Failed to submit payment'}`);
      }
    } catch (err) {
      console.error('Error submitting payment:', err);
      alert(`❌ Request failed: ${err.message || 'Server error'}`);
    } finally {
      setAssigning(false);
    }
  };

  const fetchPaymentsHistory = async () => {
    try {
      const token = auth?.token || (typeof auth === 'string' ? auth : null) || localStorage.getItem('token');
      const tenantId = selectedHistoryTenant?._id || selectedHistoryTenant?.id;
      const res = await fetch(`${API_URL}/admin/tenant-payments/${tenantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined' && window.refreshTenantPayments) {
          window.refreshTenantPayments(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={() => setIsHistoryModalOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-card rounded-xl w-full max-w-5xl border border-border max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-foreground font-bold text-2xl shadow-lg shadow-primary/20">
              {selectedHistoryTenant.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{selectedHistoryTenant.fullName}</h2>
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Payment Records for {currentYear}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsHistoryModalOpen(false)}
            className="w-12 h-12 flex items-center justify-center bg-muted/30 hover:bg-card rounded-2xl transition-all text-muted-foreground hover:text-foreground border border-border"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loadingHistory ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-muted-foreground font-bold font-outfit">Retrieving Financial Records...</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Full Manual Payment Control Panel */}
              <div className="bg-card rounded-2xl p-6 border-2 border-primary/20 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💵</span>
                    <h3 className="font-bold text-foreground text-base">Record Payment / Assign Rent</h3>
                  </div>
                  <div className="flex bg-muted p-1 rounded-xl gap-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPaymentType('monthly')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${paymentType === 'monthly' ? 'bg-emerald-500 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Monthly Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentType('advanced')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${paymentType === 'advanced' ? 'bg-indigo-600 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      🚀 Advanced
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentType('due')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${paymentType === 'due' ? 'bg-amber-500 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Assign Due
                    </button>
                  </div>
                </div>

                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Month / Label Selection */}
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                        {paymentType === 'advanced' ? 'Custom Target Label' : 'Select Month'}
                      </label>
                      {paymentType === 'advanced' ? (
                        <input
                          type="text"
                          value={customMonthLabel}
                          onChange={e => setCustomMonthLabel(e.target.value)}
                          placeholder="e.g. August 2026 / Advance"
                          className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <select
                          value={selectedMonthIndex}
                          onChange={e => setSelectedMonthIndex(Number(e.target.value))}
                          className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
                        >
                          {monthNamesFull.map((m, idx) => (
                            <option key={m} value={idx}>{m} {currentYear}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Amount (₹)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground text-sm font-bold">₹</span>
                        <input
                          type="number"
                          value={assignAmount}
                          onChange={e => setAssignAmount(e.target.value)}
                          placeholder="5000"
                          className="w-full bg-card border border-border rounded-xl pl-8 pr-3 py-2 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>

                    {/* Payment Mode */}
                    {paymentType !== 'due' && (
                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Payment Mode</label>
                        <select
                          value={paymentMode}
                          onChange={e => setPaymentMode(e.target.value)}
                          className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="Cash">💵 Cash</option>
                          <option value="Direct UPI">📱 Direct UPI</option>
                          <option value="Bank Transfer">🏦 Bank Transfer</option>
                          <option value="Other">Offline / Other</option>
                        </select>
                      </div>
                    )}

                    {/* Payment Date */}
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Date</label>
                      <input
                        type="date"
                        value={assignDate}
                        onChange={e => setAssignDate(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      {paymentType === 'due'
                        ? '📌 Sets payment status to DUE for tenant to upload receipt.'
                        : '✅ Marks payment as PAID (Success) and sends confirmation email to tenant instantly.'}
                    </p>

                    <button
                      type="submit"
                      disabled={assigning}
                      className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all text-sm flex items-center justify-center gap-2 ${paymentType === 'due'
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : paymentType === 'advanced'
                            ? 'bg-indigo-600 hover:bg-indigo-700'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                    >
                      {assigning ? (
                        'Saving...'
                      ) : paymentType === 'due' ? (
                        '📌 Assign Rent (Due)'
                      ) : (
                        '💵 Record Paid & Email Tenant'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Main Months Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {monthNamesShort.map((month, idx) => {
                  const payment = tenantPayments.find(p =>
                    !p.isAdvanced &&
                    (p.monthIndex === idx || (p.monthIndices && p.monthIndices.includes(idx))) &&
                    new Date(p.paymentDate).getFullYear() === currentYear
                  );

                  // Do not show unassigned months at all
                  if (!payment) return null;

                  const isPaid = payment?.status === 'success';
                  const isPending = payment?.status === 'pending';
                  const isRejected = payment?.status === 'rejected';
                  const isDue = payment?.status === 'due';
                  const isOverdue = !isPaid && !isPending && !isDue && idx <= currentMonth;

                  let style = "bg-muted/30 border-border text-muted-foreground";
                  let icon = <Clock className="w-5 h-5" />;
                  let label = "Upcoming";

                  if (isPaid) {
                    style = "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-sm";
                    icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
                    label = "Paid";
                  } else if (isPending) {
                    style = "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400";
                    icon = <Clock className="w-5 h-5 text-amber-500 animate-pulse" />;
                    label = "Verification";
                  } else if (isRejected) {
                    style = "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400";
                    icon = <AlertTriangle className="w-5 h-5 text-rose-500" />;
                    label = "Issue Found";
                  } else if (isDue) {
                    style = "bg-primary/10 border-primary/30 text-foreground shadow-sm";
                    icon = <Calendar className="w-5 h-5 text-primary" />;
                    label = "ASSIGNED (DUE)";
                  } else if (isOverdue) {
                    style = "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-400 shadow-sm border-2 animate-pulse";
                    icon = <AlertTriangle className="w-5 h-5 text-rose-600" />;
                    label = "UNASSIGNED";
                  }

                  return (
                    <div
                      key={month}
                      className={`relative p-5 rounded-3xl border transition-all duration-300 ${style} group/card`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-xl font-outfit">
                          {month}
                          {payment?.amount > 0 && <span className="block text-xs text-muted-foreground mt-1 font-inter">₹ {payment.amount}</span>}
                        </span>
                        {icon}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-70">{label}</p>

                      {(isPaid && payment?.approvedBy && (!payment?.barcodeImage || (payment?.paymentMode && payment.paymentMode !== 'Online'))) ? (
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                            💵 Cash Payment
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePayment(payment._id, selectedHistoryTenant?._id || selectedHistoryTenant?.id);
                            }}
                            className="p-1.5 bg-card rounded-lg shadow-sm text-rose-500 hover:bg-rose-600 hover:text-foreground transition-all border border-border"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (isPaid || isPending || isRejected) && payment?.barcodeImage ? (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => setFullScreenImage(payment.barcodeImage)}
                            className="flex-1 py-2 bg-card rounded-xl shadow-sm text-[10px] font-bold text-foreground flex items-center justify-center gap-1.5 hover:bg-primary hover:text-foreground transition-all border border-border"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            RECEIPT
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePayment(payment._id, selectedHistoryTenant?._id || selectedHistoryTenant?.id);
                            }}
                            className="p-2 bg-card rounded-xl shadow-sm text-rose-500 hover:bg-rose-600 hover:text-foreground transition-all border border-border"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Advanced Booking Section */}
              <div className="relative p-8 rounded-xl bg-primary/10/50 border border-indigo-100 overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/100/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-foreground shadow-lg shadow-primary/20">
                      <Rocket className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-foreground">Advanced Payments</h4>
                      <p className="text-sm font-medium text-primary/80">Future month settlements received</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {tenantPayments.filter(p => p.isAdvanced).map((payment, idx) => (
                      <div key={idx} className="bg-card px-5 py-4 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-5 group/adv">
                        <div>
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Target Month</p>
                          <span className="font-bold text-foreground">{payment.month || 'Future'}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${payment.status === 'success' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                            payment.status === 'pending' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-rose-500/20 text-rose-700 dark:text-rose-400'
                          }`}>
                          {payment.status}
                        </div>
                        <div className="flex items-center gap-2">
                          {payment.barcodeImage && (
                            <button
                              onClick={() => setFullScreenImage(payment.barcodeImage)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/30 text-indigo-500 hover:bg-primary hover:text-foreground transition-all"
                            >
                              <ImageIcon className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePayment(payment._id, selectedHistoryTenant._id);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/30 text-rose-500 hover:bg-rose-600 hover:text-foreground transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {tenantPayments.filter(p => p.isAdvanced).length === 0 && (
                      <div className="flex items-center gap-3 text-muted-foreground py-4 italic font-medium">
                        <Info className="w-5 h-5" />
                        <span>No advanced payments recorded for this tenant yet.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transaction History List */}
              <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-muted-foreground" /> Recent Transactions
                </h3>

                {tenantPayments.length > 0 ? (
                  <div className="space-y-3">
                    {[...tenantPayments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)).map((payment, index) => {
                      const isSuccess = payment.status === 'success';
                      const isPending = payment.status === 'pending';

                      return (
                        <div key={index} className="group flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-50 hover:border-indigo-100 hover:bg-primary/10/30 transition-all">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSuccess ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                isPending ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                              }`}>
                              {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : isPending ? <Clock className="w-6 h-6" /> : <X className="w-6 h-6" />}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-foreground text-sm sm:text-base truncate flex items-center gap-2">
                                {payment.month}
                                <span className="text-muted-foreground font-normal text-xs sm:text-sm">
                                  {payment.isAdvanced ? 'Advanced' : 'Rent'}
                                </span>
                                {payment.approvedBy && (!payment.barcodeImage || (payment.paymentMode && payment.paymentMode !== 'Online')) && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20">
                                    💵 Cash Payment
                                  </span>
                                )}
                              </h5>
                              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5">
                                {new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {' • '}
                                {payment.approvedBy && (!payment.barcodeImage || (payment.paymentMode && payment.paymentMode !== 'Online'))
                                  ? `Admin Recorded${payment.paymentMode && payment.paymentMode !== 'Online' ? ` • ${payment.paymentMode}` : ''}`
                                  : isSuccess ? 'Verified' : isPending ? 'Processing' : 'Declined'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {payment.barcodeImage && (!payment.paymentMode || payment.paymentMode === 'Online') && (
                              <button
                                onClick={() => setFullScreenImage(payment.barcodeImage)}
                                className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-card transition-all shadow-sm"
                                title="View Receipt"
                              >
                                <ImageIcon className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePayment(payment._id, selectedHistoryTenant?._id || selectedHistoryTenant?.id)}
                              className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:border-rose-200 hover:bg-card transition-all shadow-sm"
                              title="Delete Record"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-muted/30 rounded-2xl border-2 border-dashed border-border">
                    <p className="text-muted-foreground font-medium">No transactions found</p>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-8 bg-muted/30 rounded-3xl border border-border">
                <LegendItem color="bg-emerald-500" bg="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" label="Settled" />
                <LegendItem color="bg-amber-500" bg="bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400" label="Verifying" />
                <LegendItem color="bg-rose-500" bg="bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400" label="Overdue" />
                <LegendItem color="bg-slate-300" bg="bg-muted/30 border-border/50 text-muted-foreground" label="Upcoming" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const LegendItem = ({ color, bg, label }) => (
  <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl ${bg} border transition-transform hover:scale-105`}>
    <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`}></div>
    <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
  </div>
);

export default PaymentHistoryModal;
