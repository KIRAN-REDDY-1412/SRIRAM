'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Sparkles, MapPin, Users, HeartHandshake, Zap, 
  ArrowRight, ShieldCheck, Activity, CheckCircle2, Hospital, Home, Package 
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { EmergencyModal } from './EmergencyModal';

export const LandingPage: React.FC = () => {
  const { demoLogin, user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-24 pb-16 overflow-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-red-600/10">
            <Zap className="w-4 h-4 text-red-400 animate-pulse" /> PANDEMIC REDLINES DISASTER RESPONSE
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-none">
            RESQ<span className="text-red-500">AI</span>
          </h1>

          <p className="text-xl sm:text-2xl font-extrabold text-slate-200 tracking-tight">
            "Connecting People, Resources, and AI to Save Lives."
          </p>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            AI-powered emergency coordination platform designed for instant triage, real-time rescue dispatch, live Leaflet spatial maps, and seamless resource allocation.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-700 via-red-600 to-rose-500 hover:from-red-600 hover:to-red-400 text-white font-black rounded-2xl shadow-xl shadow-red-600/40 flex items-center justify-center gap-2 text-base transition transform hover:scale-105"
            >
              🚨 Request Emergency Help
            </button>

            <button
              onClick={() => demoLogin('volunteer')}
              className="w-full sm:w-auto px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-sm transition"
            >
              🤝 Join as Volunteer
            </button>

            <button
              onClick={() => demoLogin('admin')}
              className="w-full sm:w-auto px-6 py-4 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-sm transition"
            >
              📊 Authority Dashboard
            </button>
          </div>
        </motion.div>
      </section>

      {/* 2. Key Modules Feature Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Platform Core Modules</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">How ResQAI Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: AI Priority */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800 hover:border-red-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white">AI Priority Triage</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              FastAPI machine learning engine analyzes disaster severity, victim count, trapped state, injuries, and NLP urgency cues to calculate priority scores (0-100) instantly.
            </p>
          </div>

          {/* Card 2: Real-time Volunteer Dispatch */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800 hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Volunteer Coordination</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Socket.IO WebSocket broadcast alerts nearby available volunteers, enabling 1-click mission acceptance, live GPS route navigation, and status progress updates.
            </p>
          </div>

          {/* Card 3: Live Map Command Center */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800 hover:border-indigo-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Live Disaster Map</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Interactive Leaflet spatial map displays color-coded emergency markers, active volunteer responders, trauma hospitals, and relief shelters with layer filters.
            </p>
          </div>

        </div>
      </section>

      {/* 3. Impact & Benefits Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Core Value Proposition</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Impact & Strategic Benefits</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-2">
            <Zap className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="font-extrabold text-white text-base">⚡ Faster Response</h4>
            <p className="text-xs text-slate-400">Cuts dispatch time by 75% via automated AI prioritization.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-2">
            <Sparkles className="w-8 h-8 text-red-400 mx-auto" />
            <h4 className="font-extrabold text-white text-base">🧠 24/7 AI Monitoring</h4>
            <p className="text-xs text-slate-400">Continuous NLP & ML triage evaluation without human fatigue.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-2">
            <Activity className="w-8 h-8 text-blue-400 mx-auto" />
            <h4 className="font-extrabold text-white text-base">📊 Better Planning</h4>
            <p className="text-xs text-slate-400">Real-time command center analytics and resource management.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-2">
            <Package className="w-8 h-8 text-purple-400 mx-auto" />
            <h4 className="font-extrabold text-white text-base">💰 Cost Effective</h4>
            <p className="text-xs text-slate-400">Open-source tech stack running on local models without API costs.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-extrabold text-white text-base">🛡️ Saves Lives</h4>
            <p className="text-xs text-slate-400">Directly links victims, volunteers, and hospitals in real time.</p>
          </div>
        </div>
      </section>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          window.location.href = '/dashboard';
        }}
      />
    </div>
  );
};
