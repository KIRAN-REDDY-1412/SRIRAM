import 'leaflet/dist/leaflet.css';
import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import { AuthProvider } from '../lib/authContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { DemoBanner } from '../components/DemoBanner';

export const metadata: Metadata = {
  title: 'ResQAI — AI-Powered Disaster Emergency Response Platform',
  description: 'Connecting People, Resources, and AI to Save Lives during critical disaster events.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col antialiased selection:bg-red-500 selection:text-white">
        <AuthProvider>
          <DemoBanner />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
