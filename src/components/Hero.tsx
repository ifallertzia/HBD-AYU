import React from 'react';
import { Sparkles, Heart, Cake, Star, Share2 } from 'lucide-react';

interface HeroProps {
  onScrollTo: (sectionId: string) => void;
  ageTurning: number;
  isBirthdayToday: boolean;
  onOpenShare?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollTo,
  ageTurning,
  isBirthdayToday,
  onOpenShare,
}) => {
  return (
    <div id="hero" className="relative pt-6 pb-12 text-center overflow-hidden">
      {/* Decorative floating badges */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/90 border border-rose-200 text-rose-800 text-xs md:text-sm font-semibold shadow-xs mb-3 animate-bounce">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>
          {isBirthdayToday
            ? `🎉 Today is October 7th! Celebrating Sweet ${ageTurning} for Koena! 🎂`
            : `Dedicated to Koena &bull; October 7, 2006 &bull; 11:30 PM`}
        </span>
      </div>

      <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-gray-900 tracking-tight leading-tight">
        Happy Birthday, <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent font-serif">Koena!</span>
      </h1>
      <div className="font-handwriting text-3xl sm:text-5xl text-rose-500 mt-1">
        our sweetest cupcakeee 🧁
      </div>

      <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 mt-4 leading-relaxed px-4">
        Born on a starry Saturday night at <strong className="text-rose-600">11:30 PM, October 7th, 2006</strong>.
        This dedicated sanctuary celebrates Koena&apos;s living age, reveals her Venusian Libra chart,
        lights birthday candles every year, showcases her yearly memories, and preserves love notes from everyone who adores her.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8 px-4">
        <button
          onClick={() => onScrollTo('candles')}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm md:text-base shadow-lg shadow-rose-200 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Cake className="w-5 h-5" />
          <span>Blow Koena&apos;s Candles 🎂</span>
        </button>

        <button
          onClick={() => onScrollTo('wishes')}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-rose-700 font-bold text-sm md:text-base border border-rose-200 hover:bg-rose-50 shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
          <span>Send Koena a Wish 💌</span>
        </button>

        <button
          onClick={() => onScrollTo('astro')}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-purple-50 text-purple-700 font-semibold text-sm border border-purple-200 hover:bg-purple-100 transition-all"
        >
          <Star className="w-4 h-4 text-purple-500" />
          <span>Koena&apos;s Astro Chart ♎</span>
        </button>

        {onOpenShare && (
          <button
            onClick={onOpenShare}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-amber-50 text-amber-800 font-bold text-sm border border-amber-200 hover:bg-amber-100 shadow-2xs hover:scale-105 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4 text-amber-600" />
            <span>Share App 🎂</span>
          </button>
        )}
      </div>

      {/* Floating Sparkle Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8 text-xs text-gray-500 font-medium">
        <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-rose-100">
          ✨ Sun in Libra
        </span>
        <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-rose-100">
          🌙 Moon in Aries
        </span>
        <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-rose-100">
          💫 Ruled by Venus
        </span>
        <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-rose-100">
          🌸 Turning {ageTurning} Years Old
        </span>
        <span className="flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full border border-rose-100">
          🤖 Powered by Google AI Studio
        </span>
      </div>
    </div>
  );
};
