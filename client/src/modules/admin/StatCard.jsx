import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, index, trend }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      icon: 'bg-indigo-600',
      iconShadow: 'shadow-indigo-200',
      text: 'text-indigo-600',
      glow: 'before:bg-indigo-400/10',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      icon: 'bg-amber-500',
      iconShadow: 'shadow-amber-200',
      text: 'text-amber-600',
      glow: 'before:bg-amber-400/10',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      icon: 'bg-emerald-600',
      iconShadow: 'shadow-emerald-200',
      text: 'text-emerald-600',
      glow: 'before:bg-emerald-400/10',
    },
    violet: {
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      icon: 'bg-violet-600',
      iconShadow: 'shadow-violet-200',
      text: 'text-violet-600',
      glow: 'before:bg-violet-400/10',
    },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={`group relative overflow-hidden bg-card rounded-3xl p-7 border ${c.border} shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 cursor-default`}
    >
      {/* Top section */}
      <div className="flex items-start justify-between mb-6">
        <div className={`w-14 h-14 ${c.icon} rounded-2xl flex items-center justify-center shadow-lg ${c.iconShadow} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-foreground" strokeWidth={1.8} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${c.text} opacity-80`}>
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend || 'Live'}</span>
        </div>
      </div>

      {/* Value */}
      <div className="mb-1">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="text-5xl font-black text-slate-900 tracking-tight font-outfit"
        >
          {value}
        </motion.span>
      </div>

      {/* Label */}
      <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{title}</p>

      {/* Bottom accent bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: index * 0.1 + 0.5, duration: 0.6, ease: 'easeOut' }}
        className={`absolute bottom-0 left-0 right-0 h-1 ${c.icon} origin-left`}
        style={{ borderRadius: '0 0 1.5rem 1.5rem' }}
      />
    </motion.div>
  );
};

export default StatCard;
