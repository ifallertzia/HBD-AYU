import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Share2, Menu, X } from 'lucide-react';
import { birthdayAudio } from '../utils/audio';

interface NavbarProps {
  onScrollTo: (sectionId: string) => void;
  celebrationMode: boolean;
  onToggleCelebration: () => void;
  onOpenShare?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onScrollTo,
  celebrationMode,
  onToggleCelebration,
  onOpenShare,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    birthdayAudio.setMuted(nextMuted);
  };

  const handleNavClick = (id: string) => {
    onScrollTo(id);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'candles', label: '🎂 Candles', short: 'Candles' },
    { id: 'age', label: '⏳ Exact Age', short: 'Age' },
    { id: 'astro', label: '♎ Astro', short: 'Astro' },
    { id: 'gallery', label: '📸 Photos', short: 'Photos' },
    { id: 'wishes', label: '💌 Wishes', short: 'Wishes' },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-rose-100/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => handleNavClick('hero')}
          className="flex items-center gap-2 cursor-pointer group min-w-0"
        >
          <div className="w-9 h-9 shrink-0 rounded-2xl bg-gradient-to-tr from-rose-400 to-pink-500 text-white flex items-center justify-center text-lg shadow-sm shadow-pink-200 group-hover:scale-105 transition-transform">
            🧁
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-handwriting text-xl sm:text-2xl font-bold tracking-wide text-gray-900 group-hover:text-rose-600 transition-colors leading-none truncate">
              cupcakeee
            </span>
            <span className="text-[9px] sm:text-[10px] text-rose-500 font-semibold tracking-wider uppercase truncate">
              Ayush &bull; 13 Oct 2005 ♉
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-gray-600">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="px-3 py-1.5 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all"
              title="Share this app"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-700 transition-colors border border-rose-200/60"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleCelebration}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              celebrationMode
                ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-xs'
                : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{celebrationMode ? 'Party Mode: ON' : 'Oct 13 Sparkle'}</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-rose-700 transition-colors border border-rose-200/60"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-rose-100 bg-white/95 backdrop-blur-md animate-fade-in">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-sm font-semibold text-gray-700 transition-colors text-left"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                onToggleCelebration();
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all mt-1 ${
                celebrationMode
                  ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-xs'
                  : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{celebrationMode ? '🎉 Party Mode: Active' : '🎈 October 13th Sparkle'}</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
