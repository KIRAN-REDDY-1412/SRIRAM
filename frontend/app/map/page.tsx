'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { EmergencyRequest, VolunteerProfile, Hospital, Shelter } from '../../types';
import { LiveMapComponent } from '../../components/LiveMapComponent';
import { MapPin, Filter } from 'lucide-react';

export default function FullMapPage() {
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getEmergencies(),
      api.getVolunteers(),
      api.getHospitals(),
      api.getShelters(),
    ])
      .then(([emRes, volRes, hospRes, sheltRes]) => {
        setEmergencies(emRes.emergencies);
        setVolunteers(volRes.volunteers);
        setHospitals(hospRes.hospitals);
        setShelters(sheltRes.shelters);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold text-red-400 uppercase tracking-widest">SPATIAL COMMAND GRID</span>
          <h1 className="text-3xl font-black text-white mt-1">Live Disaster Spatial Map</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Real-time GPS Tracking
        </div>
      </div>

      <LiveMapComponent
        emergencies={emergencies}
        volunteers={volunteers}
        hospitals={hospitals}
        shelters={shelters}
      />
    </div>
  );
}
