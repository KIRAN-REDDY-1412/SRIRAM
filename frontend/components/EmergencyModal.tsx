'use client';

import React, { useState } from 'react';
import { X, MapPin, AlertCircle, Sparkles, CheckCircle, Navigation, Users, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { AIPriorityResult, EmergencyRequest } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (emergency: EmergencyRequest, aiResult: AIPriorityResult) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [disasterType, setDisasterType] = useState('Flood');
  const [description, setDescription] = useState('');
  const [peopleCount, setPeopleCount] = useState(4);
  const [injuredCount, setInjuredCount] = useState(1);
  const [trapped, setTrapped] = useState(true);
  const [requestedHelp, setRequestedHelp] = useState('Rescue & Medical');
  const [latitude, setLatitude] = useState(17.7000);
  const [longitude, setLongitude] = useState(83.2500);

  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIPriorityResult | null>(null);
  const [submittedEmergency, setSubmittedEmergency] = useState<EmergencyRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
        },
        () => {
          // Fallback to Andhra Pradesh Visakhapatnam default
          setLatitude(17.7000);
          setLongitude(83.2500);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.createEmergency({
        disaster_type: disasterType,
        description,
        latitude,
        longitude,
        people_count: peopleCount,
        injured_count: injuredCount,
        trapped,
        requested_help: requestedHelp
      });

      setSubmittedEmergency(res.emergency);
      setAiResult(res.ai_prediction);
      if (onSuccess) {
        onSuccess(res.emergency, res.ai_prediction);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit emergency request');
    } finally {
      setLoading(false);
    }
  };

  const priorityColorMap: Record<string, string> = {
    CRITICAL: 'bg-red-500 text-white border-red-400',
    HIGH: 'bg-orange-500 text-white border-orange-400',
    MEDIUM: 'bg-amber-500 text-white border-amber-400',
    LOW: 'bg-emerald-500 text-white border-emerald-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {aiResult ? (
          /* Step 2: Instant AI Priority Results Screen */
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">🚨 Emergency Submitted</span>
              <h3 className="text-2xl font-black text-white mt-1">AI Triage Priority Generated</h3>
            </div>

            {/* AI Priority Result Card */}
            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-xl text-left space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400">AI Assigned Priority</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${priorityColorMap[aiResult.priority]}`}>
                      {aiResult.priority}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400">Priority Score</span>
                  <p className="text-2xl font-black text-white">{aiResult.score} <span className="text-xs text-slate-400 font-normal">/ 100</span></p>
                </div>
              </div>

              {/* Score Bar */}
              <div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      aiResult.score >= 80 ? 'bg-red-500' : aiResult.score >= 60 ? 'bg-orange-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${aiResult.score}%` }}
                  />
                </div>
              </div>

              {/* AI Reason */}
              <div className="bg-red-950/30 border border-red-900/40 p-3 rounded.lg">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Priority Analysis & Reason:
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">{aiResult.reason}</p>
              </div>

              <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
                <span>Location: {latitude}, {longitude}</span>
                <span>Request ID: #{submittedEmergency?.id?.substring(0, 8)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition"
              >
                Track Live Rescue Response
              </button>
            </div>
          </div>
        ) : (
          /* Step 1: Emergency Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-red-500 font-black text-lg border-b border-slate-800 pb-3">
              <AlertCircle className="w-6 h-6" />
              <span>Request Immediate Emergency Assistance</span>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg">
                {error}
              </div>
            )}

            {/* Disaster Type */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Type of Disaster</label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="Flood">🌊 Flood / Flash Water Rising</option>
                <option value="Cyclone">🌀 Cyclone / Severe Wind Damage</option>
                <option value="Landslide">⛰️ Landslide / Debris Flow</option>
                <option value="Fire">🔥 Structural / Forest Fire</option>
                <option value="Earthquake">🏚️ Earthquake / Structural Collapse</option>
                <option value="Building Collapse">🏗️ Building Collapse</option>
                <option value="Chemical Leak">☣️ Chemical / Gas Leak</option>
                <option value="Medical Emergency">🚑 Critical Medical Emergency</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Emergency Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe situation, exact danger, or landmarks (e.g. 4 family members trapped on roof in Visakhapatnam)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            {/* People & Injuries Count */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> People Count
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-red-400" /> Injured Count
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={injuredCount}
                  onChange={(e) => setInjuredCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Trapped Toggle & Requested Help */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800 mt-1">
                <input
                  type="checkbox"
                  id="trapped-check"
                  checked={trapped}
                  onChange={(e) => setTrapped(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded"
                />
                <label htmlFor="trapped-check" className="text-xs font-bold text-red-400 cursor-pointer">
                  Are you trapped inside / roof?
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Required Help</label>
                <select
                  value={requestedHelp}
                  onChange={(e) => setRequestedHelp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Rescue & Evacuation">Rescue & Evacuation</option>
                  <option value="Medical Assistance">Medical Assistance / Paramedic</option>
                  <option value="Food & Drinking Water">Food & Drinking Water</option>
                  <option value="Shelter & Blankets">Shelter & Blankets</option>
                  <option value="Heavy Equipment">Heavy Equipment / Boat</option>
                </select>
              </div>
            </div>

            {/* Location Coordinates */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> Current Coordinates (GPS)
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="text-[11px] text-red-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Navigation className="w-3 h-3" /> Detect My GPS
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="bg-slate-900 border border-slate-800 p-1.5 rounded text-white"
                  placeholder="Latitude"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="bg-slate-900 border border-slate-800 p-1.5 rounded text-white"
                  placeholder="Longitude"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-extrabold rounded-xl shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Analyzing AI Priority & Dispatching...</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Submit & Predict AI Priority
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
