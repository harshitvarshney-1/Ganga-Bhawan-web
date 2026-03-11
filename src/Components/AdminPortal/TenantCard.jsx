import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, CreditCard, User, MapPin, Calendar, CheckCircle2, Clock, Eye, Trash2 } from 'lucide-react';
import { BASE_URL } from '../../services/api';

const TenantCard = ({ tenant, isPending, setSelectedTenant, setShowModal, setSelectedAadhaar, handleApprove, handleReject }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden group transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl shadow-inner group-hover:scale-105 transition-transform duration-300">
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
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
              isPending ? 'bg-amber-500' : 'bg-emerald-500'
            }`}>
              {isPending ? <Clock className="w-3 h-3 text-white" /> : <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-slate-900 mb-1 truncate font-outfit">{tenant.fullName}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <Calendar className="w-4 h-4" />
              <span>{new Date(tenant.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
          <InfoRow icon={Mail} label="Email" value={tenant.email} />
          <InfoRow icon={Phone} label="Mobile" value={tenant.mobileNumber} />
          <InfoRow icon={CreditCard} label="Aadhaar" value={tenant.aadhaarNumber} />
          <InfoRow icon={MapPin} label="Address" value={tenant.permanentAddress} />
        </div>

        {tenant.aadhaarFile && (
          <button
            onClick={() => setSelectedAadhaar(tenant)}
            className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-sm font-semibold border border-slate-100"
          >
            <CreditCard className="w-4 h-4" />
            View Aadhaar Document
          </button>
        )}

        <div className="flex gap-2 pt-4 border-t border-slate-50">
          <button
            onClick={() => { setSelectedTenant(tenant); setShowModal(true); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold text-sm"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          {isPending && (
            <>
              <button
                onClick={() => handleApprove(tenant._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-200"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(tenant._id)}
                className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:border-slate-200 transition-all group/row">
    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover/row:text-indigo-500 transition-colors">
      <Icon className="w-4 h-4" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-tight">{label}</p>
      <p className="text-sm font-semibold text-slate-700 truncate">{value}</p>
    </div>
  </div>
);

export default TenantCard;
