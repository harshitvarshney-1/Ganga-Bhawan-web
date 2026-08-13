import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CreditCard, User, History } from 'lucide-react';

const PaymentStatusTab = ({ approvedTenants, openHistoryModal }) => {
  const groupedTenants = approvedTenants.reduce((acc, tenant) => {
    const room = tenant.roomNumber || 'Unassigned';
    if (!acc[room]) {
      acc[room] = [];
    }
    acc[room].push(tenant);
    return acc;
  }, {});

  const sortedRooms = Object.keys(groupedTenants).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-outfit">Tenant Payment Tracking</h2>
          <p className="text-muted-foreground font-medium">Monitor monthly dues and payment verification history.</p>
        </div>
      </div>

      {approvedTenants.length === 0 ? (
        <div className="py-20 text-center bg-card/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-border/50">
          <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No History Available</h3>
          <p className="text-muted-foreground">Approve tenants first to start tracking their payments.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {sortedRooms.map((room) => (
            <div key={room} className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-border/50"></div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-5 py-2 bg-muted/40 rounded-full border border-border/60 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                  {room === 'Unassigned' ? 'Unassigned' : `Room ${room}`}
                </h3>
                <div className="h-[1px] flex-1 bg-border/50"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedTenants[room].map((tenant, index) => (
                  <motion.div 
                    key={tenant._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openHistoryModal(tenant)}
                    className="group bg-card rounded-3xl p-6 border border-border/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-5 h-5 text-indigo-500" />
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                        {tenant.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors font-outfit">{tenant.fullName}</h3>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                          <User className="w-3 h-3" />
                          <span>ID: {tenant._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact</span>
                        <span className="text-sm font-semibold text-foreground">{tenant.mobileNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Active Tenant</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                      <History className="w-4 h-4" />
                      <span className="text-sm font-bold">View History</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentStatusTab;
