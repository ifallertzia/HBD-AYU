import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Share2 } from 'lucide-react';
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

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    birthdayAudio.setMuted(nextMuted);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-rose-100/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => onScrollTo('hero')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-400 to-pink-500 text-white flex items-center justify-center text-lg shadow-sm shadow-pink-200 group-hover:scale-105 transition-transform">
            🧁
          </div>
          <div className="flex flex-col">
            <span className="font-handwriting text-2xl font-bold tracking-wide text-gray-900 group-hover:text-rose-600 transition-colors leading-none">
              cupcakeee
            </span>
            <span className="text-[10px] text-rose-500 font-semibold tracking-wider uppercase">
              Koena &bull; 7 Oct 2006 (11:30 PM)
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-gray-600">
          <button
            onClick={() => onScrollTo('candles')}
            className="px-3 py-1.5 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            🎂 Candles &amp; Music
          </button>
          <button
            onClick={() => onScrollTo('age')}
            className="px-3 py-1.5 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            ⏳ Exact Age
          </button>
          <button
            onClick={() => onScrollTo('astro')}
            className="px-3 py-1.5 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            ♎ Astro Chart
          </button>
          <button
            onClick={() => onScrollTo('gallery')}
            className="px-3 py-1.5 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            📸 Yearly Photos
          </button>
          <button
            onClick={() => onScrollTo('wishes')}
            className="px-3 py-1.5 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            💌 Wish Wall
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all"
              title="Share this app"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
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
            <span>{celebrationMode ? 'Party Mode: Active' : 'October 7th Sparkle'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
