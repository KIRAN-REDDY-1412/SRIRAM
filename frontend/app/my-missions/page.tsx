'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../services/api';
import { EmergencyRequest } from '../../types';
import { Target, CheckCircle2, Navigation, MapPin, PhoneCall, ShieldAlert } from 'lucide-react';
import { LiveMapComponent } from '../../components/LiveMapComponent';

export default function MyMissionsPage() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const res = await api.getEmergencies();
      const myMissions = res.emergencies.filter((e) => e.volunteer_id === user?.id);
      setMissions(myMissions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, [user]);

  const activeMission = missions.find((m) => m.status !== 'Resolved') || missions[0];

  const handleUpdateStatus = async (emergencyId: string, assignmentId: string, nextStatus: string) => {
    try {
      if (assignmentId) {
        await api.updateAssignmentStatus(assignmentId, nextStatus);
      } else {
        await api.updateEmergencyStatus(emergencyId, nextStatus);
      }
      fetchMissions();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="border-b border-slate-800 pb-4">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">RESPONDER MISSIONS GRID</span>
        <h1 className="text-3xl font-black text-white mt-1">My Active Missions</h1>
      </div>

      {!activeMission ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Missions Accepted Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse the live emergency feed to accept available disaster response missions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          <div className="bg-slate-900 border-2 border-emerald-500/40 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <span className="text-xs font-mono text-slate-400">Mission #MQ{activeMission.id.substring(0, 6).toUpperCase()}</span>
                <h2 className="text-2xl font-black text-white mt-0.5">{activeMission.disaster_type} Rescue Mission</h2>
                <p className="text-xs text-slate-300 mt-1">{activeMission.description}</p>
              </div>

              <div className="text-right">
                <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  ✓ ACCEPTED MISSION
                </span>
                <span className="text-xs text-slate-400 block mt-1">Current Status: <strong className="text-white">{activeMission.status}</strong></span>
              </div>
            </div>

            {/* Workflow Progress Buttons */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300">Update Mission Progress Workflow:</span>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleUpdateStatus(activeMission.id, activeMission.assignment_id || '', 'en_route')}
                  className={`py-3 rounded-xl font-extrabold text-xs transition ${
                    activeMission.status === 'En Route' 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  🚗 En Route
                </button>

                <button
                  onClick={() => handleUpdateStatus(activeMission.id, activeMission.assignment_id || '', 'arrived')}
                  className={`py-3 rounded-xl font-extrabold text-xs transition ${
                    activeMission.status === 'Arrived' 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  📍 Arrived
                </button>

                <button
                  onClick={() => handleUpdateStatus(activeMission.id, activeMission.assignment_id || '', 'completed')}
                  className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 text-xs transition"
                >
                  ✅ Resolve Mission
                </button>
              </div>
            </div>

            {/* Victim details card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <p className="text-slate-400">Victim Name: <strong className="text-white">{activeMission.victim_name || 'Stranded Citizen'}</strong></p>
                <p className="text-slate-400 mt-0.5">Location: <strong className="text-white">{activeMission.latitude}, {activeMission.longitude}</strong></p>
              </div>
              {activeMission.victim_phone && (
                <a href={`tel:${activeMission.victim_phone}`} className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" /> Call Victim
                </a>
              )}
            </div>

          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" /> Route Navigation Map
            </h3>
            <LiveMapComponent
              emergencies={[activeMission]}
              center={[activeMission.latitude, activeMission.longitude]}
              zoom={13}
            />
          </div>

        </div>
      )}

    </div>
  );
}
