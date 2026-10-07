import React, { useState, useEffect } from 'react';
import confetti from '../utils/confetti';
import { birthdayAudio } from '../utils/audio';
import { Volume2, VolumeX, Sparkles, Wind, Flame, Music, RotateCcw } from 'lucide-react';

const DISCO_THEMES = [
  { name: 'Neon', colors: ['#f472b6', '#22d3ee', '#c084fc', '#fde047'] },
  { name: 'Sunset', colors: ['#fb7185', '#f97316', '#facc15', '#e879f9'] },
  { name: 'Ocean', colors: ['#22d3ee', '#818cf8', '#34d399', '#f0abfc'] },
  { name: 'Candy', colors: ['#fb7185', '#f0abfc', '#a3e635', '#60a5fa'] },
] as const;

interface BirthdayCakeCandlesProps {
  ageTurning: number;
  isBirthdayToday: boolean;
  celebrationMode: boolean;
  onToggleCelebration: () => void;
}

export const BirthdayCakeCandles: React.FC<BirthdayCakeCandlesProps> = ({
  ageTurning,
  isBirthdayToday,
  celebrationMode,
  onToggleCelebration,
}) => {
  const [candlesLit, setCandlesLit] = useState(true);
  const [hasMadeWish, setHasMadeWish] = useState(false);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [candleCount] = useState(20); // 20 years for 2006 -> 2026
  const [discoTheme, setDiscoTheme] = useState<number | null>(null);

  useEffect(() => {
    // If today is birthday or celebration mode is turned on, trigger confetti burst once
    if (isBirthdayToday || celebrationMode) {
      triggerSparkles();
    }
  }, [isBirthdayToday, celebrationMode]);

  useEffect(() => {
    if (discoTheme === null) return;

    const timeout = window.setTimeout(() => setDiscoTheme(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [discoTheme]);

  const triggerSparkles = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f472b6', '#fb7185', '#fbbf24', '#c084fc', '#fde047'],
      });
    } catch {
      // ignore in test environments
    }
  };

  const handleThrowConfetti = () => {
    const nextTheme = ((discoTheme ?? -1) + 1) % DISCO_THEMES.length;
    setDiscoTheme(nextTheme);

    const colors = [...DISCO_THEMES[nextTheme].colors];
    [
      { x: 0, y: 0, angle: 45 },
      { x: 1, y: 0, angle: 135 },
      { x: 0, y: 1, angle: 315 },
      { x: 1, y: 1, angle: 225 },
    ].forEach(({ x, y, angle }) => {
      confetti({
        particleCount: 38,
        spread: 65,
        origin: { x, y },
        angle,
        colors,
      });
    });
  };

  const handleBlowCandles = () => {
    if (!candlesLit) return;

    birthdayAudio.playCandleBlowSound();
    setCandlesLit(false);
    setHasMadeWish(true);

    try {
      // Big celebratory fireworks confetti
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#f472b6', '#fbcfe8', '#f59e0b', '#fbbf24', '#e879f9'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch {
      // ignore
    }

    // Auto-play the birthday song if not already playing
    if (!isPlayingSong) {
      handleToggleSong();
    }
  };

  const handleRelight = () => {
    birthdayAudio.playSparkleChime();
    setCandlesLit(true);
    setHasMadeWish(false);
  };

  const handleToggleSong = () => {
    if (isPlayingSong) {
      birthdayAudio.stop();
      setIsPlayingSong(false);
    } else {
      setIsPlayingSong(true);
      birthdayAudio.playHappyBirthdaySong(() => {
        setIsPlayingSong(false);
      });
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    birthdayAudio.setMuted(nextMuted);
    if (nextMuted) {
      setIsPlayingSong(false);
    }
  };

  return (
    <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-b from-rose-50/90 via-pink-50/50 to-amber-50/70 p-6 md:p-10 border border-rose-200/80 shadow-xl shadow-rose-100/50 backdrop-blur-sm${discoTheme === null ? '' : ` disco-lights disco-theme-${discoTheme}`}`}>
      {/* Decorative background stars & sparkle blobs */}
      <div className="absolute top-4 right-6 text-2xl opacity-40 animate-pulse">✨</div>
      <div className="absolute bottom-6 left-6 text-3xl opacity-30 animate-bounce">🧁</div>
      <div className="absolute top-1/2 -left-12 w-48 h-48 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-12 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            <span>October 7th Annual Tradition</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 mt-2">
            Koena&apos;s Birthday Cupcake &amp; Candles
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Lit every year on October 7th for Koena. Make a wish and blow out the flames!
          </p>
        </div>

        {/* Music & Mode controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSong}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
              isPlayingSong
                ? 'bg-rose-500 text-white shadow-rose-200 ring-2 ring-rose-400 ring-offset-2'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
            title="Play Music Box Birthday Tune"
          >
            <Music className={`w-4 h-4 ${isPlayingSong ? 'animate-bounce' : ''}`} />
            <span>{isPlayingSong ? 'Playing Tune 🎶' : 'Birthday Music'}</span>
          </button>

          <button
            onClick={handleToggleMute}
            className="p-2 rounded-full bg-white text-gray-600 hover:text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleCelebration}
            className={`px-3 py-2 rounded-full text-xs font-semibold tracking-wide transition-all border ${
              celebrationMode
                ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-sm'
                : 'bg-white/80 text-gray-600 border-gray-200 hover:bg-amber-50 hover:text-amber-800'
            }`}
          >
            {celebrationMode ? '🎉 Party Mode ON' : '🎈 Preview Party'}
          </button>
        </div>
      </div>

      {/* Interactive Cupcake and Candles Display */}
      <div className="flex flex-col items-center justify-center my-6">
        {/* Floating Wish Banner if blown */}
        {hasMadeWish && (
          <div className="animate-fade-in mb-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm md:text-base font-medium shadow-lg shadow-pink-200 flex items-center gap-2">
            <span>✨ Your wish has flown to the stars! Happy {ageTurning}th Birthday Koena! ✨</span>
          </div>
        )}

        {/* Cupcake & Candles Container */}
        <div className="relative flex flex-col items-center pt-8 pb-4">
          {/* Row of glowing candles on top */}
          <div className="flex items-end justify-center gap-1.5 md:gap-2 mb-1 px-4 z-10">
            {Array.from({ length: Math.min(candleCount, 12) }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center">
                {/* Flame or smoke */}
                <div className="h-7 flex items-center justify-center">
                  {candlesLit ? (
                    <div
                      className="relative w-3.5 h-6 rounded-full bg-gradient-to-t from-amber-500 via-yellow-300 to-white shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse"
                      style={{
                        animationDuration: `${0.6 + (idx % 4) * 0.2}s`,
                        transformOrigin: 'bottom center',
                      }}
                    >
                      <div className="absolute inset-x-1 bottom-0 h-2 bg-rose-400/60 rounded-full blur-[1px]" />
                    </div>
                  ) : (
                    <div className="w-1.5 h-4 bg-gray-400/40 rounded-full blur-[1px] animate-pulse -translate-y-1" />
                  )}
                </div>

                {/* Candle wick */}
                <div className="w-0.5 h-1.5 bg-gray-700" />

                {/* Candle Body */}
                <div
                  className="w-2 md:w-2.5 rounded-t-sm shadow-sm"
                  style={{
                    height: `${28 + (idx % 3) * 6}px`,
                    background:
                      idx % 3 === 0
                        ? 'linear-gradient(to bottom, #f472b6, #ec4899)'
                        : idx % 3 === 1
                        ? 'linear-gradient(to bottom, #fbbf24, #f59e0b)'
                        : 'linear-gradient(to bottom, #c084fc, #a855f7)',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Central Milestone Candle Badge */}
          <div className="relative -mt-2 z-20 flex items-center justify-center">
            <div className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 text-white font-serif font-black text-xs md:text-sm tracking-wider shadow-md border-2 border-white flex items-center gap-1.5">
              <span>{candlesLit ? '🔥' : '✨'}</span>
              <span>SWEET {ageTurning} FOR KOENA</span>
            </div>
          </div>

          {/* The Cupcake Structure */}
          <div className="relative flex flex-col items-center -mt-3">
            {/* Swirled Frosting Top Tier */}
            <div className="relative z-10 w-48 md:w-64 h-20 md:h-24 bg-gradient-to-b from-rose-100 via-pink-200 to-pink-300 rounded-t-full shadow-inner border-t-2 border-white/60 flex items-center justify-center overflow-hidden">
              {/* Frosting Swirl lines */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_70%)]" />

              {/* Colorful sprinkles on frosting */}
              <div className="absolute top-3 left-8 w-2 h-1 bg-amber-400 rounded-full rotate-45" />
              <div className="absolute top-6 left-16 w-2.5 h-1 bg-rose-500 rounded-full -rotate-12" />
              <div className="absolute top-4 right-10 w-2 h-1 bg-purple-400 rounded-full rotate-24" />
              <div className="absolute top-8 right-20 w-2.5 h-1 bg-emerald-400 rounded-full -rotate-45" />
              <div className="absolute top-10 left-24 w-2 h-1 bg-yellow-300 rounded-full rotate-12" />
              <div className="absolute top-5 left-36 w-2 h-1 bg-pink-500 rounded-full rotate-90" />

              {/* Cherry on top if blown */}
              <div className="relative -top-2 flex flex-col items-center">
                <span className="text-2xl drop-shadow-sm">🍓</span>
              </div>
            </div>

            {/* Frosting Scalloped Ruffles */}
            <div className="relative z-10 flex -mt-2 w-52 md:w-68 justify-around px-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="w-7 md:w-9 h-6 md:h-8 rounded-full bg-gradient-to-b from-pink-300 to-rose-300 -mx-1 shadow-sm border-b-2 border-pink-400/30"
                />
              ))}
            </div>

            {/* Cupcake Liner / Base */}
            <div
              className="relative w-40 md:w-52 h-24 md:h-30 rounded-b-2xl shadow-lg flex flex-col items-center justify-center overflow-hidden border-b-4 border-amber-900/20"
              style={{
                background: 'linear-gradient(180deg, #d97706 0%, #b45309 60%, #92400e 100%)',
                clipPath: 'polygon(5% 0%, 95% 0%, 82% 100%, 18% 100%)',
              }}
            >
              {/* Fluted ridges of cupcake paper */}
              <div className="absolute inset-0 flex justify-between px-3 opacity-30">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="w-1 h-full bg-amber-950" />
                ))}
              </div>

              {/* Brand stamp on cupcake liner */}
              <span className="relative z-10 font-handwriting text-xl md:text-2xl text-amber-100 font-bold tracking-wider drop-shadow-sm rotate-[-4deg]">
                cupcakeee
              </span>
              <span className="relative z-10 text-[10px] md:text-xs text-amber-200/90 font-medium">
                Est. 7 Oct 2006
              </span>
            </div>

            {/* Cake Stand / Plate */}
            <div className="relative -mt-2 w-56 md:w-72 h-4 bg-gradient-to-r from-gray-200 via-white to-gray-200 rounded-full shadow-md border-t border-white" />
            <div className="w-24 md:w-32 h-3 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b-lg shadow-sm" />
          </div>
        </div>

        {/* Action Buttons: Blow Candles or Relight */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {candlesLit ? (
            <button
              onClick={handleBlowCandles}
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-semibold text-sm md:text-base shadow-lg shadow-rose-200 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Wind className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span>Blow Out the Candles 💨</span>
            </button>
          ) : (
            <button
              onClick={handleRelight}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold text-sm md:text-base shadow-lg shadow-amber-200 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4 animate-spin-reverse" />
              <span>Relight the Candles 🕯️</span>
            </button>
          )}

          <button
            onClick={handleThrowConfetti}
            aria-label={`Throw confetti with ${DISCO_THEMES[((discoTheme ?? -1) + 1) % DISCO_THEMES.length].name} disco lights`}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-full bg-white text-rose-700 font-medium text-sm border border-rose-200 hover:bg-rose-50 shadow-sm active:scale-95 transition-all${discoTheme === null ? '' : ' ring-2 ring-fuchsia-300 ring-offset-2'}`}
          >
            <Sparkles className={`w-4 h-4 text-amber-500${discoTheme === null ? '' : ' animate-spin'}`} />
            <span>{discoTheme === null ? 'Throw Confetti 🎉' : `${DISCO_THEMES[discoTheme].name} Disco! 🎉`}</span>
          </button>
        </div>

        {/* October 7th Message */}
        <p className="text-xs text-gray-500 mt-4 text-center max-w-md">
          {isBirthdayToday
            ? "🌟 Today is October 7th! The candles are burning especially bright in your honor!"
            : "Born 7 October 2006 at 11:30 PM. Every year on October 7th, this cake lights up in sweet celebration."}
        </p>
      </div>
    </section>
  );
};
