'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DashboardStats } from '../../types';
import { BarChart3, PieChart as PieChartIcon, Activity, TrendingUp, ShieldCheck, Clock } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStatistics()
      .then((res) => setStats(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const disasterData = stats?.charts.disasterTypes || [
    { disaster_type: 'Flood', count: '14' },
    { disaster_type: 'Cyclone', count: '9' },
    { disaster_type: 'Fire', count: '5' },
    { disaster_type: 'Landslide', count: '3' },
    { disaster_type: 'Earthquake', count: '2' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">DISASTER ANALYTICS & INSIGHTS</span>
          <h1 className="text-3xl font-black text-white mt-1">Response Performance & Trends</h1>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" /> Avg Dispatch Time
          </span>
          <p className="text-3xl font-black text-white">8.4 mins</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Resolution Rate
          </span>
          <p className="text-3xl font-black text-emerald-400">94.2%</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Active Incidents
          </span>
          <p className="text-3xl font-black text-amber-400">{stats?.statistics.totalEmergencies || 33}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-pink-400" /> AI Triage Accuracy
          </span>
          <p className="text-3xl font-black text-pink-400">98.6%</p>
        </div>
      </div>

      {/* Main Charts Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Disaster Type Bar Graph */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> Emergencies by Disaster Type
          </h3>
          
          <div className="space-y-4">
            {disasterData.map((d) => (
              <div key={d.disaster_type} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-200">{d.disaster_type}</span>
                  <span className="text-indigo-400">{d.count} Incidents</span>
                </div>
                <div className="h-3 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full"
                    style={{ width: `${Math.min(100, parseInt(d.count) * 12)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Spread */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-red-400" /> AI Severity Distribution
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-red-400">🔴 CRITICAL (Immediate Life Threat)</span>
                <span className="text-red-400">7 Incidents</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-orange-400">🟠 HIGH (Urgent Assistance)</span>
                <span className="text-orange-400">12 Incidents</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-400">🟡 MEDIUM (Standard Relief)</span>
                <span className="text-amber-400">10 Incidents</span>
              </div>
              <div className="h-3 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
