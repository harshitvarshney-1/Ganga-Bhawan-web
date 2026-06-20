import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, ShieldAlert, BadgeCheck } from 'lucide-react';

const Profile = ({ userData }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-xl bg-background border border-border">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
        <div className="relative z-10 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-primary text-[10px] font-semibold uppercase tracking-[0.15em] mb-1">Ganga Bhawan</p>
            <h1 className="text-xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground text-[12px] mt-0.5">Personal information locked for security</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[12px] font-semibold text-amber-500">Profile Locked</span>
          </div>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div variants={itemVariants} className="p-4 bg-card border border-border rounded-xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <BadgeCheck className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-foreground mb-0.5">Information Security Note</h3>
          <p className="text-[12px] text-muted-foreground leading-relaxed max-w-3xl">
            Your personal information is locked. Only your profile photo can be updated from the sidebar. To update other details, please contact the building administration.
          </p>
        </div>
      </motion.div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ProfileCard variants={itemVariants} icon={User}       title="Full Name"        value={userData?.fullName} />
        <ProfileCard variants={itemVariants} icon={Mail}       title="Email Address"    value={userData?.email} />
        <ProfileCard variants={itemVariants} icon={Phone}      title="Mobile Number"    value={userData?.mobileNumber} />
        <ProfileCard variants={itemVariants} icon={User}       title="Gender"           value={userData?.gender} />
        <ProfileCard variants={itemVariants} icon={Calendar}   title="Date of Birth"
          value={userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          size="lg:col-span-2"
        />
        <ProfileCard variants={itemVariants} icon={CreditCard} title="Aadhaar Number"  value={userData?.aadhaarNumber} size="lg:col-span-2" />
        <ProfileCard variants={itemVariants} icon={MapPin}     title="Permanent Address" value={userData?.permanentAddress} size="lg:col-span-2" />
      </div>
    </motion.div>
  );
};

const ProfileCard = ({ icon: Icon, title, value, size = '', variants }) => (
  <motion.div
    variants={variants}
    className={`bg-card rounded-lg p-4 border border-border hover:border-primary/30 transition-colors group ${size}`}
  >
    <div className="flex items-start gap-3 h-full">
      <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.06em] mb-1">{title}</h4>
        <p className="text-[14px] font-medium text-foreground break-words">{value || 'Not provided'}</p>
      </div>
    </div>
  </motion.div>
);

export default Profile;
