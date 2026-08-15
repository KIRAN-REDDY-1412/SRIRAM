'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../services/api';
import { EmergencyRequest } from '../../types';
import { 
  ShieldAlert, User, PhoneCall, CheckCircle, Clock, MapPin, Sparkles, AlertTriangle 
} from 'lucide-react';
import { LiveMapComponent } from '../../components/LiveMapComponent';
import Link from 'next/link';

export default function MyEmergencyPage() {
  const { user } = useAuth();
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyEmergencies = async () => {
    try {
      setLoading(true);
      const res = await api.getEmergencies(user ? { userId: user.id } : undefined);
      setEmergencies(res.emergencies);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEmergencies();
  }, [user]);

  const activeEmergency = emergencies.find((e) => e.status !== 'Resolved') || emergencies[0];

  const trackingSteps = [
    { label: 'Request submitted', key: 'Submitted' },
    { label: 'AI assessment', key: 'Submitted' },
    { label: 'Authority notified', key: 'Assigned' },
    { label: 'Volunteer assigned', key: 'Assigned' },
    { label: 'Volunteer en route', key: 'En Route' },
    { label: 'Volunteer arrived', key: 'Arrived' },
    { label: 'Resolved', key: 'Resolved' },
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const order = ['Submitted', 'Assigned', 'En Route', 'Arrived', 'Resolved'];
    const currentIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(stepKey);
    return stepIdx <= currentIdx;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold text-red-400 uppercase tracking-widest">VICTIM EMERGENCY TRACKER</span>
          <h1 className="text-3xl font-black text-white mt-1">My Current Emergency</h1>
        </div>

        <Link
          href="/emergency"
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center gap-1.5"
        >
          <ShieldAlert className="w-4 h-4" /> New SOS Request
        </Link>
      </div>

      {!activeEmergency ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Active Emergency Requests</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You currently have no active emergency SOS requests registered under your account.
          </p>
          <Link
            href="/emergency"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition"
          >
            🚨 Press SOS Emergency
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main Status & Tracking Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <span className="text-xs font-mono text-slate-400">Emergency #RQ{activeEmergency.id.substring(0, 6).toUpperCase()}</span>
                <h2 className="text-2xl font-extrabold text-white mt-0.5">{activeEmergency.disaster_type} Emergency</h2>
                <p className="text-xs text-slate-300 mt-1">{activeEmergency.description}</p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase border ${
                  activeEmergency.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }`}>
                  🔴 {activeEmergency.priority} ({activeEmergency.priority_score}/100)
                </span>
                <span className="text-xs text-slate-400 block mt-1 font-semibold">Status: <strong className="text-white">{activeEmergency.status}</strong></span>
              </div>
            </div>

            {/* AI Priority Reason */}
            <div className="bg-red-950/30 border border-red-900/40 p-4 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-400">AI Priority Assessment</h4>
                <p className="text-xs text-slate-200 mt-0.5">{activeEmergency.priority_reason}</p>
              </div>
            </div>

            {/* Detailed 7-Step Timeline Stepper */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time Resolution Timeline</h3>
              <div className="space-y-2">
                {trackingSteps.map((step) => {
                  const isDone = getStepStatus(step.key, activeEmergency.status);
                  return (
                    <div key={step.label} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <span className={`font-semibold ${isDone ? 'text-white' : 'text-slate-500'}`}>
                        {step.label}
                      </span>
                      <span className={`font-bold ${isDone ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {isDone ? '✓ Completed' : '○ Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assigned Volunteer Details */}
            {activeEmergency.volunteer_name && (
              <div className="bg-emerald-950/30 border border-emerald-800/40 p-5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Assigned Field Responder: {activeEmergency.volunteer_name}</h4>
                    <p className="text-xs text-slate-400">Status: {activeEmergency.status}</p>
                  </div>
                </div>

                {activeEmergency.volunteer_phone && (
                  <a
                    href={`tel:${activeEmergency.volunteer_phone}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    <PhoneCall className="w-4 h-4" /> Call Responder
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Interactive Map view */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" /> GPS Location Map
            </h3>
            <LiveMapComponent
              emergencies={[activeEmergency]}
              center={[activeEmergency.latitude, activeEmergency.longitude]}
              zoom={13}
            />
          </div>

        </div>
      )}

    </div>
  );
}
