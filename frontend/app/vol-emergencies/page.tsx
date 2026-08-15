'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../services/api';
import { EmergencyRequest } from '../../types';
import { AlertCircle, MapPin, Users, CheckCircle, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VolunteerEmergenciesPage() {
  const { user } = useAuth();
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const res = await api.getEmergencies();
      setEmergencies(res.emergencies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const handleAccept = async (emergencyId: string) => {
    try {
      await api.assignVolunteer(emergencyId, user?.id);
      fetchEmergencies();
      router.push('/my-missions');
    } catch (err: any) {
      alert(err.message || 'Failed to accept mission');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">FIELD RESPONDER DISPATCH</span>
          <h1 className="text-3xl font-black text-white mt-1">Nearby Emergency Incidents</h1>
        </div>
        <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl">
          {emergencies.length} Incidents Live
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {emergencies.map((e) => {
          const isAssignedToMe = e.volunteer_id === user?.id;

          return (
            <div key={e.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
                    e.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  }`}>
                    {e.priority} ({e.priority_score}/100)
                  </span>
                  <span className="text-xs font-mono text-slate-400">Status: {e.status}</span>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-white">{e.disaster_type} Emergency</h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-3">{e.description}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Proximity: <strong>2.4 km away</strong></span>
                    <span>People: <strong>{e.people_count}</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <span>Injured: <strong className="text-red-400">{e.injured_count}</strong></span>
                    <span>Trapped: <strong className={e.trapped ? 'text-red-400' : 'text-slate-400'}>{e.trapped ? '⚠️ Yes' : 'No'}</strong></span>
                  </div>
                  <p className="pt-1 text-[11px] text-slate-400">Required: <strong className="text-white">{e.requested_help}</strong></p>
                </div>
              </div>

              <div className="pt-2">
                {isAssignedToMe ? (
                  <button
                    onClick={() => router.push('/my-missions')}
                    className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                  >
                    View Active Mission
                  </button>
                ) : e.volunteer_name ? (
                  <span className="text-xs text-slate-500 block text-center italic">Assigned to {e.volunteer_name}</span>
                ) : (
                  <button
                    onClick={() => handleAccept(e.id)}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-600/30 text-xs transition"
                  >
                    ACCEPT EMERGENCY MISSION
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
