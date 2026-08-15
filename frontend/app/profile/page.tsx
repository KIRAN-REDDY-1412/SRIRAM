'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { User, HeartHandshake, Shield, Phone, Mail, MapPin, Award, Truck } from 'lucide-react';
import { api } from '../../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState(user?.availability ?? true);

  const handleToggle = async () => {
    const nextVal = !availability;
    setAvailability(nextVal);
    try {
      await api.updateVolunteerAvailability(nextVal);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="border-b border-slate-800 pb-4">
        <span className="text-xs font-bold text-red-400 uppercase tracking-widest">USER & RESPONDER PROFILE</span>
        <h1 className="text-3xl font-black text-white mt-1">My Account Details</h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl">
        
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-red-500 text-white font-black text-2xl flex items-center justify-center">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{user?.name || 'Emergency System User'}</h2>
            <span className="inline-block px-3 py-0.5 rounded-full text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 uppercase mt-1">
              {user?.role || 'victim'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <Mail className="w-5 h-5 text-red-400" />
            <div>
              <span className="text-slate-400 block font-semibold">Email Address</span>
              <strong className="text-white">{user?.email || 'user@example.com'}</strong>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <Phone className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-slate-400 block font-semibold">Contact Phone</span>
              <strong className="text-white">{user?.phone || '+91 98765 43210'}</strong>
            </div>
          </div>
        </div>

        {/* Volunteer Specific Section */}
        {user?.role === 'volunteer' && (
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-400" /> Volunteer Responder Qualifications
            </h3>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Availability Status</span>
                <button
                  onClick={handleToggle}
                  className={`px-3 py-1 rounded-full font-black text-xs transition ${
                    availability ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {availability ? '🟢 AVAILABLE' : '🔴 OFFLINE'}
                </button>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold mb-1">Registered Skills</span>
                <div className="flex flex-wrap gap-1">
                  {(user?.skills || ['First Aid', 'Paramedic', 'Boat Rescue']).map((s) => (
                    <span key={s} className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-200 font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> Paramedic Certified
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-400" /> 4x4 Offroad Vehicle
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
