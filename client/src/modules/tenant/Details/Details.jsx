import React from 'react';
import { authAtom } from '../../../shared/hooks/store/auth.atom';
import { useAtomValue } from 'jotai';
import { API_URL } from '../../../infra/config';
import { motion } from 'framer-motion';
import { Users, FileText, Phone, User, FileImage, DownloadCloud, Lock } from 'lucide-react';

const Details = ({ userData }) => {
  const auth = useAtomValue(authAtom);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto space-y-6">

      {/* Page Header */}
      <motion.div variants={cardVariants} className="relative overflow-hidden rounded-3xl bg-slate-900">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
        <div className="relative z-10 px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-1.5">Ganga Bhawan</p>
            <h1 className="text-2xl lg:text-3xl font-black text-white font-outfit">Personal Details</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Family information and official documents</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl">
            <Lock className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-400">Details Locked</span>
          </div>
        </div>
      </motion.div>

      {/* Family Information */}
      <motion.div variants={cardVariants} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-outfit">Family Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailRow icon={User}  label="Father's Name"  value={userData?.fatherName}  iconBg="bg-indigo-50" iconColor="text-indigo-600" />
          <DetailRow icon={Phone} label="Father's Phone" value={userData?.fatherPhone} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
          <DetailRow icon={User}  label="Mother's Name"  value={userData?.motherName}  iconBg="bg-pink-50"   iconColor="text-pink-600" />
          <DetailRow icon={Phone} label="Mother's Phone" value={userData?.motherPhone} iconBg="bg-pink-50"   iconColor="text-pink-600" />
        </div>
      </motion.div>

      {/* Official Documents */}
      <motion.div variants={cardVariants} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-cyan-100 text-cyan-600 rounded-2xl">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-outfit">Official Documents</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {userData?.aadhaarFront ? (
            <motion.a
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              href={userData.aadhaarFront}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between bg-slate-50 rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <FileImage className="w-8 h-8 text-white" />
                </div>
                <div className="p-2 bg-white rounded-full group-hover:bg-indigo-50 transition-colors border border-slate-200">
                  <DownloadCloud className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Identity Proof</p>
                <h4 className="text-xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors font-outfit">Aadhaar Front</h4>
                <p className="text-sm font-medium text-slate-500 mt-1">Front side image</p>
              </div>
            </motion.a>
          ) : (
            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center min-h-[200px]">
              <FileImage className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm font-medium">Front photo not uploaded</p>
            </div>
          )}

          {userData?.aadhaarBack ? (
            <motion.a
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              href={userData.aadhaarBack}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between bg-slate-50 rounded-3xl border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <FileImage className="w-8 h-8 text-white" />
                </div>
                <div className="p-2 bg-white rounded-full group-hover:bg-indigo-50 transition-colors border border-slate-200">
                  <DownloadCloud className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Identity Proof</p>
                <h4 className="text-xl font-bold text-slate-800 group-hover:text-indigo-700 transition-colors font-outfit">Aadhaar Back</h4>
                <p className="text-sm font-medium text-slate-500 mt-1">Back side image</p>
              </div>
            </motion.a>
          ) : (
            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center min-h-[200px]">
              <FileImage className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm font-medium">Back photo not uploaded</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const DetailRow = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-white transition-all group">
    <div className={`p-3 rounded-xl ${iconBg} group-hover:scale-110 transition-transform`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[15px] font-bold text-slate-800 truncate">{value || 'Not provided'}</p>
    </div>
  </div>
);

export default Details;
