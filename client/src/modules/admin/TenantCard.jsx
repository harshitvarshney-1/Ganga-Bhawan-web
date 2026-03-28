import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, CreditCard, MapPin, Calendar, Clock, CheckCircle2, Eye, Trash2 } from 'lucide-react';
import { API_URL } from '../../infra/config';

const TenantCard = ({ tenant, isPending, setSelectedTenant, setShowModal, setSelectedAadhaar, handleApprove, handleReject, handleDisable, handleEnable }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
      className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden group relative flex flex-col h-full"
    >
      {/* Top Banner Gradient */}
      <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-400 relative overflow-hidden">
        {/* Animated Background Patterns */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-900/20 rounded-full blur-2xl -ml-10 -mb-10 group-hover:scale-150 transition-transform duration-700" />
        
        {/* Status Badge Top Right */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
            tenant.isDisabled ? 'bg-rose-500/90 text-white' :
            isPending ? 'bg-amber-400/90 text-amber-900' : 'bg-emerald-400/90 text-emerald-900'
          }`}>
            {tenant.isDisabled ? <Trash2 className="w-3.5 h-3.5" /> : 
             isPending ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {tenant.isDisabled ? 'DISABLED' : (isPending ? 'PENDING' : 'APPROVED')}
          </span>
        </div>
      </div>

      <div className="px-6 pb-6 pt-0 relative flex-1 flex flex-col">
        {/* Overlapping Profile Photo & Header Info */}
        <div className="flex gap-4 mb-6 relative">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.1 }}
            className="w-24 h-24 rounded-[1.5rem] bg-indigo-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-3xl font-black text-indigo-300 relative -mt-10 z-20 shrink-0"
          >
            {tenant.profilePicture ? (
              <img 
                src={tenant.profilePicture.startsWith('data:') || tenant.profilePicture.startsWith('http') 
                  ? tenant.profilePicture 
                  : `${API_URL.replace('/api', '')}/${tenant.profilePicture}`} 
                alt={tenant.fullName} 
                className="w-full h-full object-cover"
              />
            ) : (
              tenant.fullName.charAt(0).toUpperCase()
            )}
          </motion.div>

          <div className="pt-3 min-w-0 flex-1">
            <h3 className="text-xl font-bold text-slate-900 truncate tracking-tight">{tenant.fullName}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Joined {new Date(tenant.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* 2x2 Grid Layout for Details (replaces vertical list) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 mb-6 flex-1">
          <DetailBox icon={Mail} label="Email" value={tenant.email} color="text-sky-500" bg="bg-sky-50" />
          <DetailBox icon={Phone} label="Mobile" value={tenant.mobileNumber} color="text-emerald-500" bg="bg-emerald-50" />
          <DetailBox icon={CreditCard} label="Aadhaar" value={tenant.aadhaarNumber} color="text-violet-500" bg="bg-violet-50" />
          <div className="col-span-2">
            <DetailBox icon={MapPin} label="Address" value={tenant.permanentAddress} color="text-rose-500" bg="bg-rose-50" />
          </div>
        </div>

        {/* Button Section at the bottom */}
        <div className="mt-auto space-y-3 pt-4 border-t border-slate-100">
          {(tenant.aadhaarFront || tenant.aadhaarBack) && (
            <button
              onClick={() => setSelectedAadhaar(tenant)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-[1rem] hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm font-bold border border-slate-200/60"
            >
              <CreditCard className="w-4 h-4 text-slate-400" />
              View Aadhaar Photos
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedTenant(tenant); setShowModal(true); }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-[1rem] font-bold text-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-100 shadow-sm ${
                isPending ? 'flex-1 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200' : 'w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              Full Profile
            </button>
            
            {isPending && (
              <>
                <button
                  onClick={() => handleApprove(tenant._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-[1rem] hover:bg-indigo-500 hover:-translate-y-0.5 transition-all font-bold text-sm shadow-md shadow-indigo-600/20"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(tenant._id)}
                  className="px-4 py-3 bg-rose-50 text-rose-500 rounded-[1rem] hover:bg-rose-500 hover:text-white hover:-translate-y-0.5 transition-all font-bold shadow-sm"
                  title="Reject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            {!isPending && !tenant.isDisabled && (
              <button
                onClick={() => handleDisable(tenant._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 text-amber-600 rounded-[1rem] hover:bg-amber-600 hover:text-white hover:-translate-y-0.5 transition-all font-bold text-sm shadow-sm"
              >
                Disable
              </button>
            )}

            {tenant.isDisabled && (
              <button
                onClick={() => handleEnable(tenant._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-[1rem] hover:bg-indigo-500 hover:-translate-y-0.5 transition-all font-bold text-sm shadow-md shadow-indigo-600/20"
              >
                Enable Acc
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Mini component for the 2x2 grid blocks
const DetailBox = ({ icon: Icon, label, value, color, bg }) => (
  <div className="flex items-start gap-3 group/box">
    <div className={`mt-0.5 w-8 h-8 rounded-xl ${bg} flex items-center justify-center shrink-0 group-hover/box:scale-110 transition-transform`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-semibold text-slate-800 truncate" title={value}>{value}</p>
    </div>
  </div>
);

export default TenantCard;
