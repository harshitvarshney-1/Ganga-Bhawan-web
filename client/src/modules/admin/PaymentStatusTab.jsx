import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CreditCard, User, History } from 'lucide-react';

const PaymentStatusTab = ({ approvedTenants, openHistoryModal }) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-outfit">Tenant Payment Tracking</h2>
          <p className="text-slate-500 font-medium">Monitor monthly dues and payment verification history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvedTenants.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-card/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No History Available</h3>
            <p className="text-slate-500">Approve tenants first to start tracking their payments.</p>
          </div>
        ) : (
          approvedTenants.map((tenant, index) => (
            <motion.div 
              key={tenant._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => openHistoryModal(tenant)}
              className="group bg-card rounded-3xl p-6 border border-slate-100 hover:border-primary hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-indigo-500" />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-primary font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                  {tenant.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors font-outfit">{tenant.fullName}</h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                    <User className="w-3 h-3" />
                    <span>ID: {tenant._id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</span>
                  <span className="text-sm font-semibold text-slate-700">{tenant.mobileNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-emerald-600 uppercase">Active Tenant</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                <History className="w-4 h-4" />
                <span className="text-sm font-bold">View History</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentStatusTab;
