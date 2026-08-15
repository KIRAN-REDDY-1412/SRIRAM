'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, PhoneCall, Heart, MapPin, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand & Tagline */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-white">ResQ<span className="text-red-500">AI</span></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Connecting People, Resources, and AI to Save Lives during critical disaster events.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-red-400 font-semibold bg-red-500/10 p-2 rounded border border-red-500/20 w-fit">
            <Zap className="w-3.5 h-3.5 text-red-400 animate-pulse" /> 24/7 AI Priority Assessment Engine
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Quick Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/dashboard" className="hover:text-red-400 transition">Emergency Dashboard</Link></li>
            <li><Link href="/hospitals" className="hover:text-red-400 transition">Hospitals & Trauma Centers</Link></li>
            <li><Link href="/shelters" className="hover:text-red-400 transition">Evacuation Shelters</Link></li>
            <li><Link href="/resources" className="hover:text-red-400 transition">Emergency Supplies</Link></li>
          </ul>
        </div>

        {/* Col 3: Andhra Pradesh Disaster Operations */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Regional Command Hub</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-400" /> Visakhapatnam Coastal Zone</li>
            <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-400" /> Vijayawada Central Operations</li>
            <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-red-400" /> Guntur Emergency Response Base</li>
          </ul>
        </div>

        {/* Col 4: Emergency Contacts */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">National Emergency Hotlines</h4>
          <div className="space-y-2 text-xs">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">NDRF Disaster Control</span>
              <a href="tel:1078" className="text-red-400 font-bold flex items-center gap-1 hover:underline">
                <PhoneCall className="w-3 h-3" /> 1078
              </a>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Ambulance & Trauma</span>
              <a href="tel:108" className="text-emerald-400 font-bold flex items-center gap-1 hover:underline">
                <PhoneCall className="w-3 h-3" /> 108
              </a>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 ResQAI Emergency Response Network. All Rights Reserved.</p>
        <p className="flex items-center gap-1">
          Powered by Advanced AI & Spatial Mapping for Pandemic Redlines Response
        </p>
      </div>
    </footer>
  );
};
