'use client';

import React from 'react';
import { useAuth } from '../../lib/authContext';
import { VictimDashboard } from '../../components/VictimDashboard';
import { VolunteerDashboard } from '../../components/VolunteerDashboard';
import { AdminDashboard } from '../../components/AdminDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading ResQAI Command Grid...</p>
      </div>
    );
  }

  if (user?.role === 'volunteer') {
    return <VolunteerDashboard />;
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Default to Victim Dashboard for guests / victims
  return <VictimDashboard />;
}
