'use client';

import React, { useState } from 'react';
import { SOSButton } from '../../components/SOSButton';
import { EmergencyModal } from '../../components/EmergencyModal';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EmergencyPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 text-center">
      
      <div className="space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
          <AlertTriangle className="w-4 h-4 text-red-400" /> IMMEDIATE DISASTER SOS PORTAL
        </span>
        <h1 className="text-4xl font-black text-white">Emergency Request Center</h1>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          Press the 🚨 SOS EMERGENCY button to trigger automatic AI priority classification and instant dispatch of field responders.
        </p>
      </div>

      <div className="glass-panel p-10 rounded-3xl border border-red-900/40 shadow-2xl flex flex-col items-center justify-center">
        <SOSButton onClick={() => setModalOpen(true)} size="large" />
      </div>

      <EmergencyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          router.push('/my-emergency');
        }}
      />
    </div>
  );
}
