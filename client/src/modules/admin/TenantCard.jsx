import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, CreditCard, MapPin, Calendar, Clock, CheckCircle2, Eye, Trash2 } from 'lucide-react';
import { API_URL } from '../../infra/config';

const TenantCard = ({ tenant, isPending, setSelectedTenant, setShowModal, setSelectedAadhaar, setFullScreenImage, handleApprove, handleReject, handleDisable, handleEnable }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className="bg-card rounded-xl border border-border overflow-hidden group relative flex flex-col h-full hover:border-primary/30 transition-colors"
    >
      {/* Top strip */}
      <div className="h-20 bg-gradient-to-r from-primary via-primary/80 to-primary/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-card/10 rounded-full blur-xl -mr-8 -mt-8" />
        <div className="absolute top-3 right-3 z-10">
          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm ${
            tenant.isDisabled ? 'bg-destructive/80 text-foreground' :
            isPending ? 'bg-amber-400/90 text-amber-900' : 'bg-emerald-400/90 text-emerald-900'
          }`}>
            {tenant.isDisabled ? <Trash2 className="w-3 h-3" /> :
             isPending ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            {tenant.isDisabled ? 'DISABLED' : (isPending ? 'PENDING' : 'APPROVED')}
          </span>
        </div>
      </div>

      <div className="px-5 pb-5 pt-0 relative flex-1 flex flex-col">
        {/* Profile photo + name */}
        <div className="flex gap-3 mb-4 relative">
          <div className="w-16 h-16 rounded-xl bg-primary/10 border-2 border-card shadow-sm overflow-hidden flex items-center justify-center text-xl font-bold text-primary relative -mt-8 z-20 shrink-0">
            {tenant.profilePicture ? (
              <img
                src={tenant.profilePicture.startsWith('data:') || tenant.profilePicture.startsWith('http')
                  ? tenant.profilePicture
                  : `${API_URL.replace('/api', '')}/${tenant.profilePicture}`}
                alt={tenant.fullName}
                onClick={(e) => {
                  e.stopPropagation();
                  if (setFullScreenImage) {
                    setFullScreenImage(
                      tenant.profilePicture.startsWith('data:') || tenant.profilePicture.startsWith('http')
                        ? tenant.profilePicture
                        : `${API_URL.replace('/api', '')}/${tenant.profilePicture}`
                    );
                  }
                }}
                className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
              />
            ) : (
              tenant.fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="pt-1 min-w-0 flex-1">
            <h3 className="text-[14px] font-semibold text-foreground truncate">{tenant.fullName}</h3>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
              <Calendar className="w-3 h-3" />
              <span>Joined {new Date(tenant.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 flex-1">
          <DetailBox icon={Mail} label="Email" value={tenant.email} />
          <DetailBox icon={Phone} label="Mobile" value={tenant.mobileNumber} />
          <DetailBox icon={CreditCard} label="Aadhaar" value={tenant.aadhaarNumber} />
          <div className="col-span-2">
            <DetailBox icon={MapPin} label="Address" value={tenant.permanentAddress} />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-2 pt-3 border-t border-border">
          {(tenant.aadhaarFront || tenant.aadhaarBack) && (
            <button
              onClick={() => setSelectedAadhaar(tenant)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-accent text-foreground rounded-md hover:bg-accent/80 transition-colors text-[12px] font-medium border border-border"
            >
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
              View Aadhaar Photos
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setSelectedTenant(tenant); setShowModal(true); }}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md font-medium text-[12px] transition-colors border border-border ${
                isPending ? 'flex-1 bg-accent text-foreground hover:bg-accent/80' : (!tenant.isDisabled ? 'flex-1 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20' : 'w-full bg-primary/10 text-primary hover:bg-primary/20 border-primary/20')
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Full Profile
            </button>

            {isPending && (
              <>
                <button
                  onClick={() => handleApprove(tenant._id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-[12px] font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(tenant._id)}
                  className="px-3 py-2 bg-destructive/10 text-destructive rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  title="Reject"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {!isPending && !tenant.isDisabled && (
              <button
                onClick={() => handleDisable(tenant._id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/20 border border-amber-500 text-amber-600 dark:text-amber-400 rounded-md hover:bg-amber-500/30 transition-colors text-[12px] font-medium"
              >
                🚫 Disable
              </button>
            )}

            {tenant.isDisabled && (
              <button
                onClick={() => handleEnable(tenant._id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-[12px] font-medium"
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

const DetailBox = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <div className="mt-0.5 w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-3.5 h-3.5 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">{label}</p>
      <p className="text-[12px] font-medium text-foreground truncate" title={value}>{value}</p>
    </div>
  </div>
);

export default TenantCard;
