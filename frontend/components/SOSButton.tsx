'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SOSButtonProps {
  onClick: () => void;
  size?: 'large' | 'normal';
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onClick, size = 'large' }) => {
  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Outer Pulse Rings */}
      <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-red-600/20 animate-ping pointer-events-none" />
      <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-red-600/30 animate-pulse pointer-events-none" />

      {/* Interactive Glowing SOS Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        className={`relative z-10 sos-beacon flex flex-col items-center justify-center font-extrabold text-white bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 rounded-full shadow-2xl shadow-red-600/80 border-4 border-red-400 cursor-pointer ${
          size === 'large' ? 'w-36 h-36 sm:w-44 sm:h-44' : 'w-28 h-28 sm:w-32 sm:h-32'
        }`}
      >
        <ShieldAlert className={`${size === 'large' ? 'w-12 h-12 sm:w-16 sm:h-16' : 'w-8 h-8 sm:w-10 sm:h-10'} text-white mb-1 animate-bounce`} />
        <span className={`${size === 'large' ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'} tracking-wider drop-shadow-md`}>
          🚨 SOS
        </span>
        <span className="text-[10px] sm:text-xs font-bold text-red-100 uppercase tracking-widest -mt-0.5">
          EMERGENCY
        </span>
      </motion.button>

      <p className="mt-4 text-xs font-semibold text-red-400 flex items-center gap-1.5 animate-pulse">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        Press for Immediate AI-Triage & Disaster Assistance
      </p>
    </div>
  );
};
