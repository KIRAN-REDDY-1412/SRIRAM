'use client';

import React, { useState, useEffect } from 'react';
import { Hospital } from '../types';
import { api } from '../services/api';
import { Hospital as HospitalIcon, PhoneCall, BedDouble, Activity, Plus } from 'lucide-react';

export const HospitalsView: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHospitals()
      .then((res) => setHospitals(res.hospitals))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-pink-500/20 text-pink-400 text-xs font-bold px-2.5 py-0.5 rounded border border-pink-500/30">
              TRAUMA & MEDICAL NETWORK
            </span>
            <span className="text-slate-400 text-xs">Andhra Pradesh Regional Hospitals</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Emergency Hospital Facilities</h1>
        </div>
      </div>

      {/* Grid of Hospital Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((h) => (
          <div key={h.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl hover:border-pink-500/40 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold shrink-0">
                  <HospitalIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base leading-tight">{h.name}</h3>
                  <span className="text-[11px] text-slate-400">Coords: {h.latitude}, {h.longitude}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Available Beds</span>
                <span className="text-2xl font-black text-emerald-400">{h.available_beds}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">ER Capacity</span>
                <span className="text-2xl font-black text-pink-400">{h.emergency_capacity}</span>
              </div>
            </div>

            {h.phone && (
              <a
                href={`tel:${h.phone}`}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Call Trauma Hotline ({h.phone})
              </a>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
