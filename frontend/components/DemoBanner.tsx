'use client';

import React from 'react';
import { useAuth } from '../lib/authContext';
import { Shield, User, HeartHandshake, Zap, Radio } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { demoLogin, user, logout } = useAuth();

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-xs py-2 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/15 text-red-400 border border-red-500/30">
            <Radio className="w-3 h-3 text-red-400 animate-pulse" /> DISASTER NETWORK ACTIVE
          </span>
          <span className="text-slate-400 hidden md:inline text-[11px]">
            National Emergency Dispatch System • Andhra Pradesh Region
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400 font-semibold hidden lg:inline">Quick Portal Access:</span>
          
          <button
            onClick={() => demoLogin('victim')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              user?.role === 'victim' 
                ? 'bg-red-600 text-white shadow-sm' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5 text-red-400" /> Victim Portal
          </button>

          <button
            onClick={() => demoLogin('volunteer')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              user?.role === 'volunteer' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" /> Responder Portal
          </button>

          <button
            onClick={() => demoLogin('admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              user?.role === 'admin' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" /> Command Center
          </button>

          {user && (
            <button
              onClick={logout}
              className="ml-2 text-slate-400 hover:text-white underline text-[11px]"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
