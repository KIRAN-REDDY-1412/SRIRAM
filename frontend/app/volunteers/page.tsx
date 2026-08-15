'use client';

import React, { useState, useEffect } from 'react';
import { VolunteerProfile } from '../../types';
import { api } from '../../services/api';
import { HeartHandshake, PhoneCall, MapPin, CheckCircle, Award, Truck } from 'lucide-react';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVolunteers()
      .then((res) => setVolunteers(res.volunteers))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">FIELD PERSONNEL ROSTER</span>
          <h1 className="text-3xl font-black text-white mt-1">Volunteer Responders Network</h1>
        </div>
        <span className="bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl">
          {volunteers.length} Active Volunteers
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {volunteers.map((v) => (
          <div key={v.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base leading-tight">{v.name || 'Emergency Responder'}</h3>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-red-400" /> {v.latitude || 17.6868}, {v.longitude || 83.2185}
                  </span>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                v.availability ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {v.availability ? '🟢 AVAILABLE' : '🔴 OFFLINE'}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Specialized Skills & Qualifications</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(v.skills || ['First Aid', 'Rescue']).map((skill) => (
                    <span key={skill} className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-1 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                <span className="flex items-center gap-1 text-slate-400">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Paramedic Certified
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Truck className="w-3.5 h-3.5 text-blue-400" /> 4x4 Offroad Ready
                </span>
              </div>
            </div>

            {v.phone && (
              <a
                href={`tel:${v.phone}`}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Dispatch Call ({v.phone})
              </a>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
