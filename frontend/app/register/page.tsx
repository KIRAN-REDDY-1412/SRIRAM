'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { ShieldAlert, UserPlus, User, HeartHandshake, Shield } from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '../../types';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('victim');
  const [skills, setSkills] = useState('First Aid, Paramedic');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      await register({
        name,
        email,
        password,
        role,
        phone,
        skills: skillsArray,
        latitude: 17.6868,
        longitude: 83.2185,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 mx-auto">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Create ResQAI Account</h1>
          <p className="text-xs text-slate-400">Join emergency network as Victim, Volunteer, or Authority</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Select Your Role</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('victim')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition ${
                  role === 'victim' 
                    ? 'bg-red-600/20 text-red-400 border-red-500' 
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <User className="w-4 h-4" /> Victim
              </button>

              <button
                type="button"
                onClick={() => setRole('volunteer')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition ${
                  role === 'volunteer' 
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500' 
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <HeartHandshake className="w-4 h-4" /> Volunteer
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition ${
                  role === 'admin' 
                    ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500' 
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Shield className="w-4 h-4" /> Authority
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {role === 'volunteer' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Skills & Specializations (Comma separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. First Aid, Paramedic, Boat Rescue, Firefighting"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm mt-2"
          >
            <UserPlus className="w-4 h-4" /> {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Already registered?{' '}
          <Link href="/login" className="text-red-400 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
