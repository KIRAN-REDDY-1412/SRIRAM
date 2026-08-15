'use client';

import React, { useState, useEffect } from 'react';
import { Shelter } from '../types';
import { api } from '../services/api';
import { Home, Users, Package, MapPin } from 'lucide-react';

export const SheltersView: React.FC = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getShelters()
      .then((res) => setShelters(res.shelters))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2.5 py-0.5 rounded border border-purple-500/30">
              DISASTER RELIEF CAMPS
            </span>
            <span className="text-slate-400 text-xs">Andhra Pradesh Evacuation Centers</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Disaster Relief Shelters</h1>
        </div>
      </div>

      {/* Grid of Shelter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shelters.map((s) => {
          const occupancyPercent = Math.min(100, Math.round((s.occupied / (s.capacity || 1)) * 100));

          return (
            <div key={s.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl hover:border-purple-500/40 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold shrink-0">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base leading-tight">{s.name}</h3>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-400" /> {s.latitude}, {s.longitude}
                    </span>
                  </div>
                </div>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Occupancy Level</span>
                  <span className="text-purple-400 font-bold">{s.occupied} / {s.capacity} ({occupancyPercent}%)</span>
                </div>
                <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      occupancyPercent >= 80 ? 'bg-red-500' : occupancyPercent >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
              </div>

              {/* Resources list */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">On-Site Resources</span>
                <p className="text-slate-300">{s.resources || 'Food Packets, Drinking Water, Tents, First Aid Kits'}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
