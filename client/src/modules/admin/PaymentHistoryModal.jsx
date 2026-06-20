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
  const [assignMonth, setAssignMonth] = React.useState('');
  const [assignAmount, setAssignAmount] = React.useState('');
  const [assigning, setAssigning] = React.useState(false);

  if (!isHistoryModalOpen || !selectedHistoryTenant) return null;

  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const handleAssignRent = async () => {
    if (!assignMonth || !assignAmount) {
      alert("Please select a month and enter an amount.");
      return;
    }
    setAssigning(true);
    try {
      const response = await fetch(`${API_URL}/admin/assign-due-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedHistoryTenant._id,
          month: assignMonth,
          monthIndex: monthNamesShort.indexOf(assignMonth),
          amount: assignAmount,
          isAdvanced: false
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert("✅ Rent assigned/updated successfully! Please close and reopen this record, or refresh, to see changes.");
        setAssignMonth('');
        setAssignAmount('');
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert("❌ Request failed");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
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
            className="w-12 h-12 flex items-center justify-center bg-muted/30 hover:bg-slate-100 rounded-2xl transition-all text-muted-foreground hover:text-foreground border border-border"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loadingHistory ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-muted-foreground font-bold font-outfit">Retrieving Financial Records...</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Assign Manual Rent Section */}
              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-6 border border-indigo-100 shadow-sm flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Assign Month</label>
                  <select 
                    value={assignMonth} 
                    onChange={(e) => setAssignMonth(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none focus:border-ring"
                  >
                    <option value="">Select Month</option>
                    {monthNamesShort.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Rent Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <input 
                      type="number" 
                      value={assignAmount}
                      onChange={(e) => setAssignAmount(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-3 font-semibold text-slate-700 outline-none focus:border-ring"
                      placeholder="e.g. 5000"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAssignRent}
                  disabled={assigning}
                  className="w-full md:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Assign Rent'}
                </button>
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
                    style = "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm";
                    icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
                    label = "Paid";
                  } else if (isPending) {
                    style = "bg-amber-50 border-amber-100 text-amber-700";
                    icon = <Clock className="w-5 h-5 text-amber-500 animate-pulse" />;
                    label = "Verification";
                  } else if (isRejected) {
                    style = "bg-rose-50 border-rose-100 text-rose-700";
                    icon = <AlertTriangle className="w-5 h-5 text-rose-500" />;
                    label = "Issue Found";
                  } else if (isDue) {
                    style = "bg-primary/10 border-indigo-200 text-indigo-800 shadow-sm";
                    icon = <Calendar className="w-5 h-5 text-primary" />;
                    label = "ASSIGNED (DUE)";
                  } else if (isOverdue) {
                    style = "bg-rose-50 border-rose-200 text-rose-800 shadow-sm border-2 animate-pulse";
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
                      
                      {(isPaid || isPending || isRejected) && payment?.barcodeImage && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setFullScreenImage(payment.barcodeImage)}
                            className="flex-1 py-2 bg-card rounded-xl shadow-sm text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1.5 hover:bg-primary hover:text-foreground transition-all border border-border"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            RECEIPT
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePayment(payment._id, selectedHistoryTenant._id);
                            }}
                            className="p-2 bg-card rounded-xl shadow-sm text-rose-500 hover:bg-rose-600 hover:text-foreground transition-all border border-border"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Target Month</p>
                          <span className="font-bold text-foreground">{payment.month || 'Future'}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          payment.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 
                          payment.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
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
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-muted-foreground" /> Recent Transactions
                </h3>

                {tenantPayments.length > 0 ? (
                  <div className="space-y-3">
                    {[...tenantPayments].sort((a,b) => new Date(b.paymentDate) - new Date(a.paymentDate)).map((payment, index) => {
                      const isSuccess = payment.status === 'success';
                      const isPending = payment.status === 'pending';
                      
                      return (
                        <div key={index} className="group flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-50 hover:border-indigo-100 hover:bg-primary/10/30 transition-all">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                              isSuccess ? 'bg-emerald-50 text-emerald-600' : 
                              isPending ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : isPending ? <Clock className="w-6 h-6" /> : <X className="w-6 h-6" />}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                                {payment.month} <span className="text-muted-foreground font-normal text-xs sm:text-sm ml-1">Rent</span>
                              </h5>
                              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-0.5">
                                {new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {isSuccess ? 'Verified' : isPending ? 'Processing' : 'Declined'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {payment.barcodeImage && (
                              <button 
                                onClick={() => setFullScreenImage(payment.barcodeImage)}
                                className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-indigo-200 hover:bg-card transition-all shadow-sm"
                                title="View Receipt"
                              >
                                <ImageIcon className="w-5 h-5" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeletePayment(payment._id, selectedHistoryTenant._id)}
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
                <LegendItem color="bg-emerald-500" bg="bg-emerald-50" label="Settled" />
                <LegendItem color="bg-amber-500" bg="bg-amber-50" label="Verifying" />
                <LegendItem color="bg-rose-500" bg="bg-rose-50" label="Overdue" />
                <LegendItem color="bg-slate-300" bg="bg-muted/30" label="Upcoming" />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const LegendItem = ({ color, bg, label }) => (
  <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl ${bg} border border-white transition-transform hover:scale-105`}>
    <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`}></div>
    <span className="text-xs font-bold text-foreground uppercase tracking-widest">{label}</span>
  </div>
);

export default PaymentHistoryModal;
