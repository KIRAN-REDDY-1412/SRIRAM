'use client';

import React, { useState, useEffect } from 'react';
import { Resource } from '../types';
import { api } from '../services/api';
import { useAuth } from '../lib/authContext';
import { Package, Plus, Minus, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

export const ResourcesView: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.getResources();
      setResources(res.resources);
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleUpdateQuantity = async (id: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    const newStatus = newQty === 0 ? 'Depleted' : newQty < 200 ? 'Low Stock' : 'Available';

    try {
      await api.updateResource(id, { quantity: newQty, status: newStatus });
      fetchResources();
    } catch (err) {
      console.error('Failed to update resource quantity', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Low Stock': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Depleted': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded border border-emerald-500/30">
              NATIONAL LOGISTICS DEPOT
            </span>
            <span className="text-slate-400 text-xs">Emergency Relief Stockpile</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Emergency Resources & Supplies</h1>
        </div>
      </div>

      {/* Grid of Resource Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((r) => (
          <div key={r.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base leading-tight">{r.name}</h3>
                  <span className="text-xs text-slate-400">{r.type} • {r.location}</span>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(r.status)}`}>
                {r.status}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Quantity Available</span>
                <span className="text-3xl font-black text-white">{r.quantity}</span>
              </div>

              {/* Admin Stock Adjuster */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateQuantity(r.id, r.quantity, -50)}
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition"
                  title="Decrease Stock"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUpdateQuantity(r.id, r.quantity, +50)}
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition"
                  title="Increase Stock"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
