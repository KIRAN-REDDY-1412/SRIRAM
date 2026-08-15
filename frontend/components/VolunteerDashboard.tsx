'use client';

import React, { useState, useEffect } from 'react';
import { EmergencyRequest, VolunteerProfile } from '../types';
import { api } from '../services/api';
import { useAuth } from '../lib/authContext';
import { 
  HeartHandshake, CheckCircle2, Clock, MapPin, Navigation, PhoneCall, 
  Users, AlertCircle, ShieldAlert, Sparkles, UserCheck 
} from 'lucide-react';
import { LiveMapComponent } from './LiveMapComponent';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<boolean>(true);
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [emRes, volRes] = await Promise.all([
        api.getEmergencies(),
        api.getVolunteers(),
      ]);
      setEmergencies(emRes.emergencies);
      setVolunteers(volRes.volunteers);

      // Check if logged-in volunteer has an active mission
      const active = emRes.emergencies.find(
        (e) => e.volunteer_id === user?.id && e.status !== 'Resolved' && e.status !== 'Cancelled'
      );
      setActiveAssignment(active || null);
    } catch (err) {
      console.error('Failed to load volunteer data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleToggleAvailability = async () => {
    const newStatus = !availability;
    setAvailability(newStatus);
    try {
      await api.updateVolunteerAvailability(newStatus);
    } catch (err) {
      console.error('Failed to update availability', err);
    }
  };

  const handleAcceptEmergency = async (emergencyId: string) => {
    try {
      await api.assignVolunteer(emergencyId, user?.id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept emergency assignment');
    }
  };

  const handleUpdateStatus = async (emergencyId: string, assignmentId: string, nextStatus: string) => {
    try {
      if (assignmentId) {
        await api.updateAssignmentStatus(assignmentId, nextStatus);
      } else {
        await api.updateEmergencyStatus(emergencyId, nextStatus);
      }
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const activeMissionsCount = emergencies.filter((e) => e.volunteer_id === user?.id && e.status !== 'Resolved').length;
  const completedMissionsCount = emergencies.filter((e) => e.volunteer_id === user?.id && e.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Availability Toggle */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Volunteer Command Grid</h1>
            <p className="text-xs text-slate-400">Welcome, {user?.name || 'Emergency Responder'}. Respond to active disaster missions in AP.</p>
          </div>
        </div>

        {/* Availability Toggle Switch */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-slate-300">Available for Response:</span>
          <button
            onClick={handleToggleAvailability}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
              availability ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
          <span className={`text-xs font-black uppercase ${availability ? 'text-emerald-400' : 'text-slate-500'}`}>
            {availability ? 'ACTIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold block">Response Status</span>
          <span className="text-2xl font-black text-emerald-400">{availability ? 'Ready' : 'Standby'}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold block">Active Missions</span>
          <span className="text-2xl font-black text-amber-400">{activeMissionsCount}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold block">Completed Rescues</span>
          <span className="text-2xl font-black text-blue-400">{completedMissionsCount}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold block">Avg Response Time</span>
          <span className="text-2xl font-black text-purple-400">8.4 mins</span>
        </div>
      </div>

      {/* Active Accepted Mission Workflow */}
      {activeAssignment && (
        <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border-2 border-red-500/50 p-6 rounded-2xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-red-400 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" /> CURRENT ACTIVE MISSION
            </span>
            <span className="bg-red-500/20 text-red-400 text-xs px-2.5 py-0.5 rounded font-black border border-red-500/30">
              STATUS: {activeAssignment.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-white">{activeAssignment.disaster_type} Rescue Mission</h3>
              <p className="text-xs text-slate-300 mt-1">{activeAssignment.description}</p>
              <div className="mt-3 text-xs text-slate-400 space-y-1">
                <p>Victim Name: <strong className="text-white">{activeAssignment.victim_name || 'Victim Stranded'}</strong></p>
                <p>Location: <strong className="text-white">{activeAssignment.latitude}, {activeAssignment.longitude}</strong></p>
                <p>People Count: <strong className="text-white">{activeAssignment.people_count}</strong> | Injured: <strong className="text-red-400">{activeAssignment.injured_count}</strong></p>
              </div>
            </div>

            {/* Action Buttons for Mission Progress */}
            <div className="flex flex-col justify-center space-y-2">
              <span className="text-xs font-bold text-slate-300">Update Mission Progress:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateStatus(activeAssignment.id, activeAssignment.assignment_id, 'en_route')}
                  className={`py-2 rounded-lg text-xs font-bold transition ${
                    activeAssignment.status === 'En Route'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  En Route
                </button>
                <button
                  onClick={() => handleUpdateStatus(activeAssignment.id, activeAssignment.assignment_id, 'arrived')}
                  className={`py-2 rounded-lg text-xs font-bold transition ${
                    activeAssignment.status === 'Arrived'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  Arrived
                </button>
                <button
                  onClick={() => handleUpdateStatus(activeAssignment.id, activeAssignment.assignment_id, 'completed')}
                  className="py-2 rounded-lg text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition"
                >
                  Resolve Mission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Response Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" /> Active Emergency Feed
          </h2>
          <span className="text-xs text-slate-400">{emergencies.length} Emergencies Nearby</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencies.map((e) => {
            const isAssignedToOther = e.volunteer_name && e.volunteer_id !== user?.id;
            const isAssignedToMe = e.volunteer_id === user?.id;

            return (
              <div key={e.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                    e.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  }`}>
                    {e.priority} PRIORITY
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Score: {e.priority_score}/100</span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white">{e.disaster_type} Emergency</h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{e.description}</p>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1 text-slate-400">
                  <p>Requested: <strong className="text-white">{e.requested_help}</strong></p>
                  <p>Affected: <strong className="text-white">{e.people_count} People</strong> | Injured: <strong className="text-red-400">{e.injured_count}</strong></p>
                  <p>Location: <strong className="text-white">{e.latitude}, {e.longitude}</strong></p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {isAssignedToMe ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                      ✓ Accepted by You
                    </span>
                  ) : isAssignedToOther ? (
                    <span className="text-xs text-slate-500 italic">Assigned to {e.volunteer_name}</span>
                  ) : (
                    <button
                      onClick={() => handleAcceptEmergency(e.id)}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md shadow-red-600/30 transition text-xs"
                    >
                      ACCEPT MISSION & DISPATCH
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map View */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" /> Interactive Mission Map
        </h2>
        <LiveMapComponent
          emergencies={emergencies}
          volunteers={volunteers}
        />
      </div>

    </div>
  );
};
