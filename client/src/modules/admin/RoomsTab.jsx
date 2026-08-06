import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Users, ChevronRight, User } from 'lucide-react';

const RoomsTab = ({ tenants, onTenantClick }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Group tenants by room number
  const rooms = Array.from({ length: 12 }, (_, i) => {
    const roomNo = i + 1;
    const roomTenants = tenants.filter(t => Number(t.roomNumber) === roomNo);
    return {
      number: roomNo,
      tenants: roomTenants
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Room Management</h1>
        <p className="text-muted-foreground text-[13px] mt-0.5">View tenants assigned to each of the 12 rooms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <motion.div
            key={room.number}
            layoutId={`room-${room.number}`}
            onClick={() => setSelectedRoom(room)}
            className={`cursor-pointer group relative overflow-hidden rounded-xl border border-border p-5 transition-all hover:shadow-md ${
              room.tenants.length > 0 ? 'bg-card' : 'bg-muted/30'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Home className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Room</p>
                <p className="text-xl font-bold text-foreground">{room.number}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{room.tenants.length} Tenant{room.tenants.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {room.tenants.length > 0 && (
              <div className="mt-4 flex -space-x-2 overflow-hidden">
                {room.tenants.slice(0, 3).map((tenant, idx) => (
                  <div 
                    key={tenant._id} 
                    className="flex shrink-0 h-8 w-8 rounded-full ring-2 ring-card bg-primary items-center justify-center text-[11px] font-bold text-primary-foreground"
                  >
                    {tenant.fullName.charAt(0)}
                  </div>
                ))}
                {room.tenants.length > 3 && (
                  <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-card bg-muted text-[10px] font-bold text-muted-foreground">
                    +{room.tenants.length - 3}
                  </div>
                )}
              </div>
            )}

            <div className="absolute bottom-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedRoom && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoom(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              layoutId={`room-${selectedRoom.number}`}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Room {selectedRoom.number}</h2>
                    <p className="text-[12px] text-muted-foreground">{selectedRoom.tenants.length} Active Tenant{selectedRoom.tenants.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRoom(null)}
                  className="text-muted-foreground hover:text-foreground transition p-2"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {selectedRoom.tenants.length === 0 ? (
                  <div className="text-center py-10">
                    <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">This room is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedRoom.tenants.map((tenant) => (
                      <div 
                        key={tenant._id}
                        onClick={() => { onTenantClick(tenant); setSelectedRoom(null); }}
                        className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                            {tenant.fullName.charAt(0)}
                          </div>
                          <div className="min-w-0 pr-2">
                            <p className="text-[14px] font-semibold text-foreground truncate">{tenant.fullName}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{tenant.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted/30 border-t border-border">
                <button 
                  onClick={() => setSelectedRoom(null)}
                  className="w-full py-2.5 bg-background border border-border rounded-lg text-[13px] font-medium text-foreground hover:bg-accent transition-colors"
                >
                  Close View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoomsTab;
