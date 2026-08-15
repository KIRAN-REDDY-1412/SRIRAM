'use client';

import React, { useState, useEffect } from 'react';
import { EmergencyRequest, VolunteerProfile, Hospital, Shelter, Resource, DashboardStats } from '../types';
import { api } from '../services/api';
import { 
  Shield, AlertTriangle, Users, Activity, Package, CheckCircle2, 
  MapPin, UserPlus, PhoneCall, Sparkles, PieChart as PieChartIcon, BarChart3 
} from 'lucide-react';
import { LiveMapComponent } from './LiveMapComponent';

export const AdminDashboard: React.FC = () => {
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyRequest | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [emRes, volRes, hospRes, sheltRes, resRes, statsRes] = await Promise.all([
        api.getEmergencies(),
        api.getVolunteers(),
        api.getHospitals(),
        api.getShelters(),
        api.getResources(),
        api.getDashboardStatistics(),
      ]);
      setEmergencies(emRes.emergencies);
      setVolunteers(volRes.volunteers);
      setHospitals(hospRes.hospitals);
      setShelters(sheltRes.shelters);
      setResources(resRes.resources);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load admin command center data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAssignVolunteerSubmit = async () => {
    if (!selectedEmergency || !selectedVolunteerId) return;
    try {
      await api.assignVolunteer(selectedEmergency.id, selectedVolunteerId);
      setAssignModalOpen(false);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    }
  };

  const handleResolveEmergency = async (id: string) => {
    try {
      await api.updateEmergencyStatus(id, 'Resolved', 'Resolved by Admin Command Center');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve emergency');
    }
  };

  const criticalList = emergencies.filter((e) => e.priority === 'CRITICAL' && e.status !== 'Resolved');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-2.5 py-0.5 rounded border border-indigo-500/30">
              NATIONAL COMMAND CENTER
            </span>
            <span className="text-slate-400 text-xs">Andhra Pradesh Regional Operations</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1 tracking-tight">Authority Disaster Command Center</h1>
        </div>
        
        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-2"
        >
          <Activity className="w-4 h-4 text-emerald-400 animate-spin" /> Refresh Live Feeds
        </button>
      </div>

      {/* Top Statistic Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Requests</span>
          <p className="text-2xl font-black text-white">{stats?.statistics.totalEmergencies || emergencies.length}</p>
        </div>

        <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-red-400 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-400" /> Critical
          </span>
          <p className="text-2xl font-black text-red-400">{stats?.statistics.criticalEmergencies || criticalList.length}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Active Responders</span>
          <p className="text-2xl font-black text-blue-400">{stats?.statistics.activeVolunteers || volunteers.length}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Active Missions</span>
          <p className="text-2xl font-black text-amber-400">{stats?.statistics.activeMissions || 2}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Stock Supplies</span>
          <p className="text-2xl font-black text-purple-400">{stats?.statistics.availableResources || 5850}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Resolved Today</span>
          <p className="text-2xl font-black text-emerald-400">{stats?.statistics.resolvedToday || 0}</p>
        </div>
      </div>

      {/* Main Grid: Live Map + Critical Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Leaflet Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" /> LIVE DISASTER COMMAND MAP
            </h2>
            <span className="text-xs text-slate-400">Real-time GPS Tracking</span>
          </div>

          <LiveMapComponent
            emergencies={emergencies}
            volunteers={volunteers}
            hospitals={hospitals}
            shelters={shelters}
            onSelectEmergency={(e) => setSelectedEmergency(e)}
          />
        </div>

        {/* Right Col: Critical Emergencies Side Panel */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl flex flex-col h-[550px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" /> Critical Triage Queue
            </h3>
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded font-black">
              {criticalList.length} Critical
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {emergencies.map((e) => (
              <div 
                key={e.id}
                className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${
                  e.priority === 'CRITICAL' 
                    ? 'bg-red-950/30 border-red-900/50 hover:border-red-500' 
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    e.priority === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    {e.priority} ({e.priority_score})
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{e.status}</span>
                </div>

                <p className="font-bold text-white text-sm">{e.disaster_type} Emergency</p>
                <p className="text-slate-300 text-[11px] line-clamp-2">{e.description}</p>
                
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>People: {e.people_count} | Injured: <strong className="text-red-400">{e.injured_count}</strong></span>
                  <span>{new Date(e.created_at).toLocaleTimeString()}</span>
                </div>

                {e.volunteer_name ? (
                  <p className="text-[11px] text-emerald-400 font-bold">Assigned: {e.volunteer_name}</p>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedEmergency(e);
                        setAssignModalOpen(true);
                      }}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[11px] transition flex items-center justify-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" /> Assign Volunteer
                    </button>

                    <button
                      onClick={() => handleResolveEmergency(e.id)}
                      className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-[11px] transition"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        {/* Disaster Type Distribution */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" /> Emergencies by Disaster Type
          </h3>
          <div className="space-y-2">
            {stats?.charts.disasterTypes.map((item) => (
              <div key={item.disaster_type} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{item.disaster_type}</span>
                  <span className="text-slate-400">{item.count} Incidents</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500" 
                    style={{ width: `${Math.min(100, parseInt(item.count) * 25)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-red-400" /> Priority Severity Spread
          </h3>
          <div className="space-y-2">
            {stats?.charts.priorityDistribution.map((item) => (
              <div key={item.priority} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{item.priority}</span>
                  <span className="text-slate-400">{item.count} Requests</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      item.priority === 'CRITICAL' ? 'bg-red-500' : item.priority === 'HIGH' ? 'bg-orange-500' : 'bg-amber-500'
                    }`} 
                    style={{ width: `${Math.min(100, parseInt(item.count) * 30)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volunteer & Resource Status */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" /> Field Personnel & Capacity
          </h3>
          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-300">Registered Volunteers</span>
              <strong className="text-emerald-400">{volunteers.length} Active</strong>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-300">Hospital Emergency Beds</span>
              <strong className="text-pink-400">148 Available</strong>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-300">Evacuation Shelter Spaces</span>
              <strong className="text-purple-400">1,230 Available</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Volunteer Manual Assignment Modal */}
      {assignModalOpen && selectedEmergency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Assign Volunteer Responder</h3>
            <p className="text-xs text-slate-300">
              Assign emergency request <strong className="text-red-400">#{selectedEmergency.id.substring(0, 8)} ({selectedEmergency.disaster_type})</strong> to an available field team.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Select Volunteer</label>
              <select
                value={selectedVolunteerId}
                onChange={(e) => setSelectedVolunteerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Available Volunteer --</option>
                {volunteers.map((v) => (
                  <option key={v.id} value={v.user_id}>
                    {v.name || 'Volunteer'} (Skills: {(v.skills || []).join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignVolunteerSubmit}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-indigo-600/30"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
