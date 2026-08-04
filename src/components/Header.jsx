import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

export const Header = ({ onOpenPricing, onOpenContact }) => {
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHomeClick = (e) => {
    e.preventDefault();
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'glass-header py-3 shadow-sm border-b border-slate-200/50 dark:border-slate-800/60'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Left: PharmDVerse Logo */}
          <a
            href="#hero"
            onClick={handleHomeClick}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="relative flex items-center justify-center">
              <img
                src="/logo.png"
                alt="PharmDVerse Logo"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                PharmD<span className="text-emerald-600 dark:text-emerald-400">Verse</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Clinical ERP Platform
              </span>
            </div>
          </a>

          {/* Center Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-full border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-md shadow-inner">
            <a
              href="#hero"
              onClick={handleHomeClick}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              Home
            </a>

            <button
              onClick={onOpenPricing}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              Pricing
            </button>

            <button
              onClick={onOpenContact}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              Contact
            </button>
          </nav>

          {/* Right: Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="relative px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200/80 dark:border-slate-700/80 focus:outline-none shadow-xs flex items-center gap-2 cursor-pointer group"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Light and Dark Mode"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                  <span className="text-xs font-semibold text-slate-200 hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform" />
                  <span className="text-xs font-semibold text-slate-700 hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
