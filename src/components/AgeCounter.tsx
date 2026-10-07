import React from 'react';
import { AgeBreakdown } from '../types';
import { Calendar, Clock, Heart, Sparkles, Hourglass, Compass } from 'lucide-react';

interface AgeCounterProps {
  ageData: AgeBreakdown;
}

export const AgeCounter: React.FC<AgeCounterProps> = ({ ageData }) => {
  const formattedBirthDate = '7 October 2006, 11:30 PM';

  return (
    <section className="rounded-3xl bg-white/80 backdrop-blur-md p-6 md:p-8 border border-rose-100 shadow-xl shadow-rose-100/40 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-pink-100/60 to-rose-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-rose-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            <span>Official Birth Record</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 mt-1">
            Koena&apos;s Life Chronology &amp; Exact Age
          </h2>
          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span>Born: <strong className="text-gray-700">{formattedBirthDate}</strong> (Saturday Night) &bull; Koena</span>
          </p>
        </div>

        {/* Milestone Badge */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-5 py-3 rounded-2xl shadow-md shadow-pink-200">
          <div className="text-3xl font-black font-serif">
            {ageData.years}
          </div>
          <div className="text-xs leading-tight">
            <span className="block font-bold uppercase tracking-wider">Years of Sweetness</span>
            <span className="opacity-90">Turning {ageData.years + 1} next</span>
          </div>
        </div>
      </div>

      {/* Real-time Detailed Age Grid */}
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-3 flex items-center gap-1.5">
          <Hourglass className="w-3.5 h-3.5" />
          <span>Real-Time Precise Age Elapsed</span>
        </h3>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 md:gap-3.5">
          {[
            { label: 'Years', val: ageData.years, sub: 'solar orbits' },
            { label: 'Months', val: ageData.months, sub: 'lunar cycles' },
            { label: 'Days', val: ageData.days, sub: 'days passed' },
            { label: 'Hours', val: ageData.hours, sub: 'hours' },
            { label: 'Minutes', val: ageData.minutes, sub: 'minutes' },
            { label: 'Seconds', val: ageData.seconds, sub: 'seconds' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group relative bg-gradient-to-b from-rose-50/70 via-pink-50/40 to-white p-3.5 rounded-2xl border border-rose-100 hover:border-rose-300 transition-all text-center shadow-sm hover:shadow-md"
            >
              <div className="text-2xl md:text-3xl font-serif font-black text-gray-800 tracking-tight font-mono group-hover:scale-105 transition-transform">
                {String(item.val).padStart(2, '0')}
              </div>
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mt-0.5">
                {item.label}
              </div>
              <div className="text-[10px] text-gray-400 hidden sm:block">
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lifetime Cumulative Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-black text-gray-800 font-mono">
              {ageData.totalDays.toLocaleString()} Days
            </div>
            <div className="text-xs text-amber-800/80 font-medium">
              Total Days Living on Earth
            </div>
          </div>
        </div>

        <div className="bg-pink-50/70 border border-pink-200/60 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
          </div>
          <div>
            <div className="text-base font-black text-gray-800 font-mono">
              ~{ageData.totalHeartbeats.toLocaleString()}
            </div>
            <div className="text-xs text-pink-800/80 font-medium">
              Loving Heartbeats Beaten
            </div>
          </div>
        </div>

        <div className="bg-purple-50/70 border border-purple-200/60 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <div className="text-base font-black text-gray-800 font-mono">
              {ageData.totalHours.toLocaleString()} Hours
            </div>
            <div className="text-xs text-purple-800/80 font-medium">
              Hours of Laughter &amp; Memories
            </div>
          </div>
        </div>
      </div>

      {/* Countdown to Next Birthday on October 7 */}
      <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-rose-100/70 via-pink-100/60 to-amber-100/70 border border-rose-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rose-800">
            Countdown to Next 7 October (11:30 PM)
          </div>
          <div className="text-sm text-gray-700 font-medium">
            {ageData.isBirthdayToday
              ? '✨ Today is the magical day! Birthday candles are glowing! ✨'
              : `Anticipating the sweet celebration of Year ${ageData.years + 1}!`}
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-sm md:text-base font-bold text-gray-800 bg-white/90 px-4 py-2 rounded-xl shadow-xs border border-rose-200">
          <span>{ageData.nextBirthdayDays}d</span>
          <span>:</span>
          <span>{String(ageData.nextBirthdayHours).padStart(2, '0')}h</span>
          <span>:</span>
          <span>{String(ageData.nextBirthdayMinutes).padStart(2, '0')}m</span>
          <span>:</span>
          <span>{String(ageData.nextBirthdaySeconds).padStart(2, '0')}s</span>
        </div>
      </div>
    </section>
  );
};
