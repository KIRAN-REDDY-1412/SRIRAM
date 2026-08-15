'use client';

import React, { useState } from 'react';
import { EmergencyRequest, VolunteerProfile, Hospital, Shelter } from '../types';
import { Filter, Layers, Hospital as HospitalIcon, Home, Users, AlertTriangle } from 'lucide-react';

// Leaflet dynamically loaded inside wrapper
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';

// Create custom icons for Leaflet markers
const createCustomIcon = (color: string, symbol: string) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 0 10px ${color};
      ">
        ${symbol}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const criticalIcon = createCustomIcon('#ef4444', '🚨');
const highIcon = createCustomIcon('#f97316', '⚠️');
const mediumIcon = createCustomIcon('#eab308', '⚡');
const lowIcon = createCustomIcon('#22c55e', 'ℹ️');
const volunteerIcon = createCustomIcon('#3b82f6', '🔵');
const hospitalIcon = createCustomIcon('#ec4899', '🏥');
const shelterIcon = createCustomIcon('#8b5cf6', '🏠');

interface LiveMapProps {
  emergencies: EmergencyRequest[];
  volunteers?: VolunteerProfile[];
  hospitals?: Hospital[];
  shelters?: Shelter[];
  onSelectEmergency?: (emergency: EmergencyRequest) => void;
  center?: [number, number];
  zoom?: number;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  emergencies = [],
  volunteers = [],
  hospitals = [],
  shelters = [],
  onSelectEmergency,
  center = [17.7000, 83.2500], // Visakhapatnam AP center
  zoom = 11,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showVolunteers, setShowVolunteers] = useState<boolean>(true);
  const [showHospitals, setShowHospitals] = useState<boolean>(true);
  const [showShelters, setShowShelters] = useState<boolean>(true);

  const filteredEmergencies = emergencies.filter((e) => {
    if (filterPriority !== 'ALL' && e.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && e.status !== filterStatus) return false;
    return true;
  });

  const getEmergencyIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return criticalIcon;
      case 'HIGH': return highIcon;
      case 'MEDIUM': return mediumIcon;
      default: return lowIcon;
    }
  };

  return (
    <div className="relative w-full h-[550px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      
      {/* Interactive Layer & Filter Controls Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-xl max-w-xs text-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-red-400" /> Map Filters
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{filteredEmergencies.length} Active</span>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Priority</label>
          <div className="grid grid-cols-5 gap-1">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`py-1 rounded text-[10px] font-bold transition ${
                  filterPriority === p 
                    ? 'bg-red-600 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p === 'CRITICAL' ? 'CRIT' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-3.5 h-3.5 text-blue-400" /> Volunteers ({volunteers.length})
            </span>
            <input
              type="checkbox"
              checked={showVolunteers}
              onChange={(e) => setShowVolunteers(e.target.checked)}
              className="accent-blue-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-1.5 text-slate-300">
              <HospitalIcon className="w-3.5 h-3.5 text-pink-400" /> Hospitals ({hospitals.length})
            </span>
            <input
              type="checkbox"
              checked={showHospitals}
              onChange={(e) => setShowHospitals(e.target.checked)}
              className="accent-pink-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Home className="w-3.5 h-3.5 text-purple-400" /> Shelters ({shelters.length})
            </span>
            <input
              type="checkbox"
              checked={showShelters}
              onChange={(e) => setShowShelters(e.target.checked)}
              className="accent-purple-500 rounded"
            />
          </label>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Emergency Markers */}
        {filteredEmergencies.map((e) => (
          <Marker
            key={e.id}
            position={[e.latitude, e.longitude]}
            icon={getEmergencyIcon(e.priority)}
          >
            <Popup>
              <div className="p-1 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                  <span className="font-extrabold text-red-400 uppercase">{e.priority} priority</span>
                  <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-bold">{e.status}</span>
                </div>
                <p className="font-bold text-white text-sm">{e.disaster_type} Emergency</p>
                <p className="text-slate-300">{e.description}</p>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <p>People: <strong>{e.people_count}</strong> | Injured: <strong className="text-red-400">{e.injured_count}</strong></p>
                  <p>Requested: <strong>{e.requested_help}</strong></p>
                  {e.volunteer_name && (
                    <p className="text-emerald-400 font-bold mt-1">Assigned: {e.volunteer_name}</p>
                  )}
                </div>
                {onSelectEmergency && (
                  <button
                    onClick={() => onSelectEmergency(e)}
                    className="w-full mt-2 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-[11px] transition"
                  >
                    View Emergency Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Volunteer Markers */}
        {showVolunteers && volunteers.map((v) => (
          <Marker
            key={v.id}
            position={[v.latitude || 17.6868, v.longitude || 83.2185]}
            icon={volunteerIcon}
          >
            <Popup>
              <div className="p-1 text-xs space-y-1">
                <p className="font-bold text-blue-400 text-sm">🔵 Volunteer: {v.name || 'Emergency Responder'}</p>
                <p className="text-slate-300">Phone: {v.phone || '+91 98765 43211'}</p>
                <p className="text-slate-400">Skills: {(v.skills || []).join(', ')}</p>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${v.availability ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {v.availability ? 'Available for Mission' : 'Busy / Offline'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hospital Markers */}
        {showHospitals && hospitals.map((h) => (
          <Marker
            key={h.id}
            position={[h.latitude, h.longitude]}
            icon={hospitalIcon}
          >
            <Popup>
              <div className="p-1 text-xs space-y-1">
                <p className="font-bold text-pink-400 text-sm">🏥 {h.name}</p>
                <p className="text-slate-300">Available Beds: <strong className="text-emerald-400">{h.available_beds}</strong></p>
                <p className="text-slate-300">Emergency Capacity: {h.emergency_capacity}</p>
                <p className="text-slate-400">Emergency Contact: {h.phone}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Shelter Markers */}
        {showShelters && shelters.map((s) => (
          <Marker
            key={s.id}
            position={[s.latitude, s.longitude]}
            icon={shelterIcon}
          >
            <Popup>
              <div className="p-1 text-xs space-y-1">
                <p className="font-bold text-purple-400 text-sm">🏠 {s.name}</p>
                <p className="text-slate-300">Occupancy: <strong>{s.occupied} / {s.capacity}</strong></p>
                <p className="text-slate-400">Supplies: {s.resources}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
