/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BirthdayCakeCandles } from './components/BirthdayCakeCandles';
import { AgeCounter } from './components/AgeCounter';
import { AstroProfile } from './components/AstroProfile';
import { YearlyGallery } from './components/YearlyGallery';
import { WishWall } from './components/WishWall';
import { ShareModal } from './components/ShareModal';
import { calculateAgeBreakdown } from './utils/ageAndAstro';

export default function App() {
  const [celebrationMode, setCelebrationMode] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [ageState, setAgeState] = useState(() => calculateAgeBreakdown());

  useEffect(() => {
    const timer = setInterval(() => {
      setAgeState(calculateAgeBreakdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F6] text-gray-800 font-sans selection:bg-rose-200 selection:text-rose-900">
      {/* Background radial gradient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <Navbar
        onScrollTo={handleScrollTo}
        celebrationMode={celebrationMode}
        onToggleCelebration={() => setCelebrationMode((prev) => !prev)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-12">
        {/* Hero Section */}
        <Hero
          onScrollTo={handleScrollTo}
          ageTurning={ageState.ageTurning}
          isBirthdayToday={ageState.isBirthdayToday}
          onOpenShare={() => setIsShareOpen(true)}
        />

        {/* 1. Birthday Cake & Music Section */}
        <div id="candles">
          <BirthdayCakeCandles
            ageTurning={ageState.ageTurning}
            isBirthdayToday={ageState.isBirthdayToday}
            celebrationMode={celebrationMode}
            onToggleCelebration={() => setCelebrationMode((prev) => !prev)}
          />
        </div>

        {/* 2. Exact Age Breakdown & Time Elapsed */}
        <div id="age">
          <AgeCounter ageData={ageState} />
        </div>

        {/* 3. Astrological Profile & Gemini Oracle */}
        <div id="astro">
          <AstroProfile />
        </div>

        {/* 4. Yearly Picture Gallery (2005 to 2026+) */}
        <div id="gallery">
          <YearlyGallery />
        </div>

        {/* 5. Birthday Wishes & Guestbook Wall */}
        <div id="wishes">
          <WishWall onOpenShare={() => setIsShareOpen(true)} />
        </div>
      </main>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-20 border-t border-rose-100 bg-white/80 py-10 text-center text-xs text-gray-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧁</span>
            <span className="font-handwriting text-2xl font-bold text-gray-800">
              cupcakeee
            </span>
          </div>
          <p className="max-w-md text-gray-600 px-2">
            Lovingly created for <strong className="text-rose-600">Ayush</strong> (bbyyy) to commemorate 13 October 2005 — my favorite Taurus bull ♉ Moolank 4 🔮.
            May each year bring brighter smiles, sweeter memories, and endless joy to my Ayu. 💖
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-rose-500 font-medium text-[11px] mt-1">
            <span>Happy 13th October Every Year bbyyy 🎂</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
