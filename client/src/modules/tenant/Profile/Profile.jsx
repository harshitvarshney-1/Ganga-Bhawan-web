import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, ShieldAlert, BadgeCheck } from 'lucide-react';

const Profile = ({ userData }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto space-y-6">

      {/* Page Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-slate-900">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
        <div className="relative z-10 px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5">Ganga Bhawan</p>
            <h1 className="text-2xl lg:text-3xl font-black text-white font-outfit">My Profile</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Personal information locked for security</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-400">Profile Locked</span>
          </div>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div variants={itemVariants} className="p-5 bg-white border border-slate-100 rounded-3xl flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
          <BadgeCheck className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-0.5">Information Security Note</h3>
          <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
            For security and compliance, your personal information is locked. Only your profile photo can be updated from the sidebar. To update other details, please contact the building administration.
          </p>
        </div>
      </motion.div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ProfileCard variants={itemVariants} icon={User}       title="Full Name"        value={userData?.fullName}        accent="indigo" />
        <ProfileCard variants={itemVariants} icon={Mail}       title="Email Address"    value={userData?.email}           accent="sky" />
        <ProfileCard variants={itemVariants} icon={Phone}      title="Mobile Number"    value={userData?.mobileNumber}    accent="emerald" />
        <ProfileCard variants={itemVariants} icon={User}       title="Gender"           value={userData?.gender}          accent="violet" />
        <ProfileCard variants={itemVariants} icon={Calendar}   title="Date of Birth"
          value={userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          accent="pink" size="lg:col-span-2"
        />
        <ProfileCard variants={itemVariants} icon={CreditCard} title="Aadhaar Number"  value={userData?.aadhaarNumber}   accent="fuchsia" size="lg:col-span-2" />
        <ProfileCard variants={itemVariants} icon={MapPin}     title="Permanent Address" value={userData?.permanentAddress} accent="rose"   size="lg:col-span-2" />
      </div>
    </motion.div>
  );
};

const accentMap = {
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  ring: 'ring-indigo-100' },
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-600',     ring: 'ring-sky-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  ring: 'ring-violet-100' },
  pink:    { bg: 'bg-pink-50',    text: 'text-pink-600',    ring: 'ring-pink-100' },
  fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', ring: 'ring-fuchsia-100' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    ring: 'ring-rose-100' },
};

const ProfileCard = ({ icon: Icon, title, value, accent = 'indigo', size = '', variants }) => {
  const a = accentMap[accent] ?? accentMap.indigo;
  return (
    <motion.div
      variants={variants}
      className={`bg-white rounded-3xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group ${size}`}
    >
      <div className="flex items-start gap-4 h-full">
        <div className={`p-3 rounded-2xl ring-1 ${a.bg} ${a.text} ${a.ring} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">{title}</h4>
          <p className="text-lg font-bold text-slate-800 break-words">{value || 'Not provided'}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
