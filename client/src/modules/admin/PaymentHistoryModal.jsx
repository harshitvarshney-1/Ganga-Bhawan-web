import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckCircle2, Clock, AlertTriangle, Image as ImageIcon, Trash2, Rocket, Info } from 'lucide-react';

const PaymentHistoryModal = ({ 
  isHistoryModalOpen, 
  setIsHistoryModalOpen, 
  selectedHistoryTenant, 
  loadingHistory, 
  tenantPayments, 
  setFullScreenImage,
  handleDeletePayment
}) => {
  if (!isHistoryModalOpen || !selectedHistoryTenant) return null;

  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4"
      onClick={() => setIsHistoryModalOpen(false)}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-200">
              {selectedHistoryTenant.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-outfit">{selectedHistoryTenant.fullName}</h2>
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Payment Records for {currentYear}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsHistoryModalOpen(false)}
            className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-600 border border-slate-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loadingHistory ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-slate-500 font-bold font-outfit">Retrieving Financial Records...</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Main Months Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {monthNamesShort.map((month, idx) => {
                  const payment = tenantPayments.find(p => !p.isAdvanced && p.monthIndex === idx && new Date(p.paymentDate).getFullYear() === currentYear);
                  const isPaid = payment?.status === 'success';
                  const isPending = payment?.status === 'pending';
                  const isRejected = payment?.status === 'rejected';
                  const isOverdue = !isPaid && !isPending && idx <= currentMonth;

                  let style = "bg-slate-50 border-slate-100 text-slate-400";
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
                  } else if (isOverdue) {
                    style = "bg-rose-50 border-rose-200 text-rose-800 shadow-sm border-2 animate-pulse";
                    icon = <AlertTriangle className="w-5 h-5 text-rose-600" />;
                    label = "MISSING";
                  }

                  return (
                    <div 
                      key={month}
                      className={`relative p-5 rounded-3xl border transition-all duration-300 ${style} group/card`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-xl font-outfit">{month}</span>
                        {icon}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-70">{label}</p>
                      
                      {(isPaid || isPending || isRejected) && payment.barcodeImage && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setFullScreenImage(payment.barcodeImage)}
                            className="flex-1 py-2 bg-white rounded-xl shadow-sm text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1.5 hover:bg-indigo-600 hover:text-white transition-all border border-slate-100"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            RECEIPT
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePayment(payment._id, selectedHistoryTenant._id);
                            }}
                            className="p-2 bg-white rounded-xl shadow-sm text-rose-500 hover:bg-rose-600 hover:text-white transition-all border border-slate-100"
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
              <div className="relative p-8 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                      <Rocket className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 font-outfit">Advanced Payments</h4>
                      <p className="text-sm font-medium text-indigo-600/80">Future month settlements received</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    {tenantPayments.filter(p => p.isAdvanced).map((payment, idx) => (
                      <div key={idx} className="bg-white px-5 py-4 rounded-2xl border border-indigo-100 shadow-sm flex items-center gap-5 group/adv">
                        <div>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Target Month</p>
                          <span className="font-bold text-slate-900 font-outfit">{payment.month || 'Future'}</span>
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
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              <ImageIcon className="w-5 h-5" />
                            </button>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePayment(payment._id, selectedHistoryTenant._id);
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {tenantPayments.filter(p => p.isAdvanced).length === 0 && (
                      <div className="flex items-center gap-3 text-slate-400 py-4 italic font-medium">
                        <Info className="w-5 h-5" />
                        <span>No advanced payments recorded for this tenant yet.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-8 py-6 px-8 bg-slate-50 rounded-3xl border border-slate-100">
                <LegendItem color="bg-emerald-500" bg="bg-emerald-50" label="Settled" />
                <LegendItem color="bg-amber-500" bg="bg-amber-50" label="Verifying" />
                <LegendItem color="bg-rose-500" bg="bg-rose-50" label="Overdue" />
                <LegendItem color="bg-slate-300" bg="bg-slate-50" label="Upcoming" />
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
    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{label}</span>
  </div>
);

export default PaymentHistoryModal;
