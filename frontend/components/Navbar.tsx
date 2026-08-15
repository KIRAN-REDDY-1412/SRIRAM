'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/authContext';
import { 
  ShieldAlert, Activity, Hospital, Home, Package, LogIn, UserPlus, 
  Menu, X, Bell, User as UserIcon, MapPin, AlertCircle, BarChart3, 
  HeartHandshake, Target, Navigation, Shield 
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NavbarProps {
  notifications?: NotificationItem[];
}

export const Navbar: React.FC<NavbarProps> = ({ notifications = [] }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Determine navigation links based on user role
  const getNavLinks = () => {
    const role = user?.role || 'victim';

    if (role === 'volunteer') {
      return [
        { href: '/dashboard', label: 'Dashboard', icon: Activity },
        { href: '/vol-emergencies', label: 'Emergencies', icon: AlertCircle },
        { href: '/map', label: 'Map', icon: MapPin },
        { href: '/my-missions', label: 'My Missions', icon: Target },
        { href: '/profile', label: 'Profile', icon: UserIcon },
      ];
    }

    if (role === 'admin') {
      return [
        { href: '/dashboard', label: 'Dashboard', icon: Activity },
        { href: '/map', label: 'Live Map', icon: MapPin },
        { href: '/volunteers', label: 'Volunteers', icon: HeartHandshake },
        { href: '/hospitals', label: 'Hospitals', icon: Hospital },
        { href: '/shelters', label: 'Shelters', icon: Home },
        { href: '/resources', label: 'Resources', icon: Package },
        { href: '/analytics', label: 'Analytics', icon: BarChart3 },
      ];
    }

    // Default Victim Navigation
    return [
      { href: '/', label: 'Home', icon: Home },
      { href: '/emergency', label: 'Emergency SOS', icon: ShieldAlert },
      { href: '/my-emergency', label: 'My Emergency', icon: Target },
      { href: '/hospitals', label: 'Hospitals', icon: Hospital },
      { href: '/shelters', label: 'Shelters', icon: Home },
      { href: '/profile', label: 'Profile', icon: UserIcon },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white">ResQ<span className="text-red-500">AI</span></span>
              <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/20 uppercase">
                {user?.role || 'SYSTEM'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Emergency Dispatch Network</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive 
                    ? 'bg-slate-800 text-red-400 border border-slate-700' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & User Info */}
        <div className="flex items-center gap-3">
          
          {/* Real-time Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping-slow" />
              )}
            </button>

            {/* Notification Dropdown */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Emergency Alerts</h4>
                  <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded font-semibold">{unreadCount} New</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">No active notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 text-xs">
                        <p className="font-bold text-red-400">{n.title}</p>
                        <p className="text-slate-300 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {new Date(n.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Profile */}
          {user ? (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-red-400 flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                  <span className="text-[10px] font-semibold text-emerald-400 capitalize">
                    {user.role}
                  </span>
                </div>
              </Link>
              <button
                onClick={logout}
                className="ml-1 text-[11px] font-semibold text-slate-400 hover:text-red-400 transition"
              >
                Exit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
            >
              <link.icon className="w-4 h-4 text-slate-400" />
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
