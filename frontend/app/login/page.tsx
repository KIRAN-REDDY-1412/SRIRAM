'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { ShieldAlert, LogIn, User, HeartHandshake, Shield } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'victim' | 'volunteer' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(role);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Portal authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 mx-auto">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Sign In to ResQAI</h1>
          <p className="text-xs text-slate-400">Access emergency response, volunteer dispatch, or command center</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. victim@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Portal Access Buttons */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block text-center">
            ⚡ Quick Portal Access
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('victim')}
              className="py-2.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition"
            >
              <User className="w-4 h-4 text-red-400" />
              <span>Victim Portal</span>
            </button>

            <button
              onClick={() => handleQuickLogin('volunteer')}
              className="py-2.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>Volunteer</span>
            </button>

            <button
              onClick={() => handleQuickLogin('admin')}
              className="py-2.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition"
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{' '}
          <Link href="/register" className="text-red-400 hover:underline font-bold">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
