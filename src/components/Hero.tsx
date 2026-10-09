import React from 'react';
import { Sparkles, Heart, Cake, Star, Share2 } from 'lucide-react';

interface HeroProps {
  onScrollTo: (sectionId: string) => void;
  ageTurning: number;
  isBirthdayToday: boolean;
  onOpenShare?: () => void;
  onTogglePhotoMode?: () => void;
  photoCount?: number;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollTo,
  ageTurning,
  isBirthdayToday,
  onOpenShare,
  onTogglePhotoMode,
  photoCount = 0,
}) => {
  return (
    <div id="hero" className="relative pt-4 sm:pt-6 pb-10 sm:pb-12 text-center overflow-hidden">
      {/* Decorative floating badges */}
      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-rose-100/90 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold shadow-xs mb-3 animate-bounce max-w-[95vw]">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
        <span className="truncate">
          {isBirthdayToday
            ? `🎉 Today is October 13th! Celebrating Sweet ${ageTurning} for bbyyy Ayush! 🎂`
            : `Dedicated to my bbyyy Ayu &bull; October 13, 2005 &bull; Taurus ♉ Moolank 4 🔮`}
        </span>
      </div>

      <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-gray-900 tracking-tight leading-tight px-2">
        Happy Birthday, <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent font-serif">Ayush!</span>
      </h1>
      <div className="font-handwriting text-2xl sm:text-5xl text-rose-500 mt-1 px-2">
        my sweetest bbyyy 🧁
      </div>

      <p className="max-w-2xl mx-auto text-sm sm:text-lg text-gray-600 mt-4 leading-relaxed px-4">
        Born on <strong className="text-rose-600">October 13th, 2005</strong> &mdash; my Taurus bull ♉ with moolank 4 ruled by Rahu&apos;s magnetic energy.
        This dedicated sanctuary celebrates Ayu&apos;s living age, reveals his Taurus chart,
        lights birthday candles every year, showcases his yearly memories, and preserves love notes from everyone who adores him.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 px-3">
        <button
          onClick={() => onScrollTo('candles')}
          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm md:text-base shadow-lg shadow-rose-200 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Cake className="w-4 sm:w-5 h-4 sm:h-5 shrink-0" />
          <span>Blow Ayu&apos;s Candles 🎂</span>
        </button>

        {onTogglePhotoMode && photoCount > 0 && (
          <button
            onClick={onTogglePhotoMode}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gray-900 text-white font-bold text-sm md:text-base shadow-lg shadow-gray-400/40 hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all"
            title="All the pictures, no text — slides by itself"
          >
            <span className="text-base sm:text-lg">📸</span>
            <span>Photo Mode</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold tracking-wider">
              {photoCount}
            </span>
          </button>
        )}

        <button
          onClick={() => onScrollTo('wishes')}
          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white text-rose-700 font-bold text-sm md:text-base border border-rose-200 hover:bg-rose-50 shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          <Heart className="w-4 sm:w-5 h-4 sm:h-5 text-rose-500 fill-rose-100 shrink-0" />
          <span>Send Ayush a Wish 💌</span>
        </button>

        <button
          onClick={() => onScrollTo('astro')}
          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-purple-50 text-purple-700 font-semibold text-sm border border-purple-200 hover:bg-purple-100 transition-all"
        >
          <Star className="w-4 h-4 text-purple-500 shrink-0" />
          <span>Ayu&apos;s Astro Chart ♉</span>
        </button>

        {onOpenShare && (
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-amber-50 text-amber-800 font-bold text-sm border border-amber-200 hover:bg-amber-100 shadow-2xs hover:scale-105 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Share App 🎂</span>
          </button>
        )}
      </div>

      {/* Floating Sparkle Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 text-xs text-gray-500 font-medium px-3">
        <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-rose-100">
          ♉ Sun in Taurus
        </span>
        <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-rose-100">
          🌙 Ruled by Venus
        </span>
        <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-rose-100">
          🔮 Moolank 4 • Rahu
        </span>
        <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-rose-100">
          🎂 Turning {ageTurning} Years Old
        </span>
      </div>
    </div>
  );
};
