'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { EmergencyRequest, VolunteerProfile, Hospital, Shelter } from '../types';

const DynamicMap = dynamic(
  () => import('./LiveMap').then((mod) => mod.LiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[550px] bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 font-semibold text-xs animate-pulse">
        Initializing Interactive Disaster Map Grid...
      </div>
    ),
  }
);

interface LiveMapComponentProps {
  emergencies: EmergencyRequest[];
  volunteers?: VolunteerProfile[];
  hospitals?: Hospital[];
  shelters?: Shelter[];
  onSelectEmergency?: (emergency: EmergencyRequest) => void;
  center?: [number, number];
  zoom?: number;
}

export const LiveMapComponent: React.FC<LiveMapComponentProps> = (props) => {
  return <DynamicMap {...props} />;
};
