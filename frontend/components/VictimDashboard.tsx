'use client';

import React, { useState, useEffect } from 'react';
import { SOSButton } from './SOSButton';
import { EmergencyModal } from './EmergencyModal';
import { EmergencyRequest, Hospital, Shelter } from '../types';
import { api } from '../services/api';
import { useAuth } from '../lib/authContext';
import { 
  ShieldAlert, Hospital as HospitalIcon, Home, PhoneCall, CheckCircle2, 
  Clock, MapPin, User, Sparkles, AlertTriangle 
} from 'lucide-react';
import { LiveMapComponent } from './LiveMapComponent';

export const VictimDashboard: React.FC = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [myEmergencies, setMyEmergencies] = useState<EmergencyRequest[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVictimData = async () => {
    try {
      setLoading(true);
      const [emRes, hospRes, sheltRes] = await Promise.all([
        api.getEmergencies(user ? { userId: user.id } : undefined),
        api.getHospitals(),
        api.getShelters(),
      ]);
      setMyEmergencies(emRes.emergencies);
      setHospitals(hospRes.hospitals);
      setShelters(sheltRes.shelters);
    } catch (err) {
      console.error('Failed to load victim dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVictimData();
  }, [user]);

  const latestEmergency = myEmergencies.length > 0 ? myEmergencies[0] : null;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Assigned': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'En Route': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Arrived': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'Resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-red-900/30 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-4 h-4 text-red-400" /> DISASTER EMERGENCY PORTAL
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Are you in danger?</h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Press the SOS button below for immediate AI priority triage and rapid dispatch of local Andhra Pradesh emergency teams.
          </p>
        </div>

        {/* SOS Action Button */}
        <SOSButton onClick={() => setModalOpen(true)} size="large" />
      </div>

      {/* Real-time Status Tracker (If Victim has an active emergency) */}
      {latestEmergency && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase">My Request #{latestEmergency.id.substring(0, 8)}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(latestEmergency.status)}`}>
                  {latestEmergency.status}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mt-1">
                {latestEmergency.disaster_type} Emergency Request
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">AI Priority Level</span>
                <span className="text-sm font-black text-red-400 uppercase">{latestEmergency.priority} ({latestEmergency.priority_score}/100)</span>
              </div>
            </div>
          </div>

          {/* AI Reason Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">AI Priority Explanation</h4>
              <p className="text-xs text-slate-300 mt-0.5">{latestEmergency.priority_reason}</p>
            </div>
          </div>

          {/* Progress Timeline Stepper */}
          <div className="grid grid-cols-5 gap-2 text-center pt-2">
            {['Submitted', 'Assigned', 'En Route', 'Arrived', 'Resolved'].map((step, idx) => {
              const statusOrder = ['Submitted', 'Assigned', 'En Route', 'Arrived', 'Resolved'];
              const currentIdx = statusOrder.indexOf(latestEmergency.status);
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={step} className="space-y-2">
                  <div className={`h-2 rounded-full transition-all ${
                    isCompleted ? 'bg-red-500 shadow-md shadow-red-500/50' : 'bg-slate-800'
                  }`} />
                  <span className={`text-[11px] font-bold block ${
                    isCurrent ? 'text-white font-extrabold' : isCompleted ? 'text-red-400' : 'text-slate-500'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Assigned Volunteer Card */}
          {latestEmergency.volunteer_name && (
            <div className="bg-emerald-950/30 border border-emerald-800/40 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Assigned Volunteer: {latestEmergency.volunteer_name}</h4>
                  <p className="text-xs text-slate-400">Status: {latestEmergency.status}</p>
                </div>
              </div>

              {latestEmergency.volunteer_phone && (
                <a
                  href={`tel:${latestEmergency.volunteer_phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Responder
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setModalOpen(true)}
          className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-red-500/50 rounded-2xl text-left group transition shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-base">Request Emergency Help</h3>
          <p className="text-xs text-slate-400 mt-1">Submit immediate rescue form with GPS location</p>
        </button>

        <a
          href="/hospitals"
          className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-pink-500/50 rounded-2xl text-left group transition shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <HospitalIcon className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-base">Nearby Hospitals</h3>
          <p className="text-xs text-slate-400 mt-1">View Trauma Centers & Bed Capacity</p>
        </a>

        <a
          href="/shelters"
          className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500/50 rounded-2xl text-left group transition shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Home className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-base">Nearby Shelters</h3>
          <p className="text-xs text-slate-400 mt-1">Evacuation camps & available space</p>
        </a>

        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl text-left shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-base">Emergency Contacts</h3>
          <p className="text-xs text-emerald-400 font-bold mt-1">NDRF Control: 1078 | Ambulance: 108</p>
        </div>
      </div>

      {/* Interactive Map View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" /> Live Disaster & Support Map
          </h2>
          <span className="text-xs text-slate-400">Andhra Pradesh Emergency Zone</span>
        </div>

        <LiveMapComponent
          emergencies={myEmergencies}
          hospitals={hospitals}
          shelters={shelters}
        />
      </div>

      {/* Submission Modal */}
      <EmergencyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchVictimData()}
      />
    </div>
  );
};
