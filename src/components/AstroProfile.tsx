import React, { useState } from 'react';
import { ASTROLOGICAL_PROFILE } from '../utils/ageAndAstro';
import { Sparkles, Moon, Sun, Heart, Compass, Shield, Wand2, Loader2 } from 'lucide-react';

export const AstroProfile: React.FC = () => {
  const [oracleReading, setOracleReading] = useState<{
    cosmicBlessing?: string;
    planetaryHighlights?: string;
    luckyElements?: string[];
    secretSuperpower?: string;
  } | null>(null);
  const [isLoadingOracle, setIsLoadingOracle] = useState(false);
  const [oracleTopic, setOracleTopic] = useState('Love, Creativity & Soul Bloom');

  const handleAskOracle = async () => {
    setIsLoadingOracle(true);
    try {
      const res = await fetch('/api/gemini/oracle-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentYear: 2026, focus: oracleTopic }),
      });
      const data = await res.json();
      if (data.reading) {
        setOracleReading(data.reading);
      }
    } catch (err) {
      console.error('Failed to get oracle reading:', err);
      setOracleReading({
        cosmicBlessing: 'May Venus guide your every step with effortless charm, gentle joy, and boundless sweet inspiration.',
        planetaryHighlights: 'Your 20th solar cycle activates deep creative mastery. Your Libra grace and passionate Aries moon harmonize into unmatched charismatic leadership.',
        luckyElements: ['Pink Tourmaline', 'Rose Water Scent', 'Sweet Peony Blossom'],
        secretSuperpower: 'The Midnight Diplomat: You instinctively make everyone feel seen, treasured, and loved.',
      });
    } finally {
      setIsLoadingOracle(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white/80 backdrop-blur-md p-6 md:p-8 border border-pink-100 shadow-xl shadow-pink-100/30 relative overflow-hidden">
      {/* Background celestial ornament */}
      <div className="absolute top-2 right-4 text-4xl opacity-15 pointer-events-none">♎</div>
      <div className="absolute bottom-4 left-6 text-3xl opacity-10 pointer-events-none">✨</div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-pink-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-semibold">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Natal Chart &amp; Celestial Essence</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 mt-1">
            Koena&apos;s Astrological Profile: The Venusian Libra
          </h2>
          <p className="text-sm text-gray-500">
            Natal chart for Koena &bull; 7 October 2006 at 11:30 PM (Midnight Libra with Aries Moon).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-2xl shadow-sm text-sm font-medium">
          <span className="text-2xl">♎</span>
          <div>
            <div className="font-bold leading-none">Libra Sun</div>
            <div className="text-[11px] opacity-90">Venus Governed</div>
          </div>
        </div>
      </div>

      {/* Core Chart Attributes Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
        <div className="p-4 rounded-2xl bg-gradient-to-b from-pink-50/80 to-white border border-pink-100 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-pink-600 flex items-center gap-1">
            <Sun className="w-3 h-3 text-amber-500" /> Sun Sign
          </div>
          <div className="text-base font-bold text-gray-800 mt-1">
            {ASTROLOGICAL_PROFILE.sunSign} {ASTROLOGICAL_PROFILE.sunSymbol}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Harmonizer &amp; Artist</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-50/80 to-white border border-purple-100 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1">
            <Moon className="w-3 h-3 text-purple-500" /> Moon Sign
          </div>
          <div className="text-base font-bold text-gray-800 mt-1">
            {ASTROLOGICAL_PROFILE.moonSign}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Inner Fire &amp; Passion</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-50/80 to-white border border-rose-100 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-500" /> Ruling Planet
          </div>
          <div className="text-base font-bold text-gray-800 mt-1">
            Venus
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Beauty, Love, Confections</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50/80 to-white border border-amber-100 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
            <Compass className="w-3 h-3 text-amber-500" /> Element &amp; Modality
          </div>
          <div className="text-base font-bold text-gray-800 mt-1">
            Air &bull; Cardinal
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Radiant Initiator</div>
        </div>
      </div>

      {/* Traits Breakdown */}
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Core Astrological Virtues
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {ASTROLOGICAL_PROFILE.personalityTraits.map((trait, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white border border-rose-100/80 shadow-2xs hover:shadow-sm transition-all flex items-start gap-3.5"
            >
              <div className="text-2xl p-2 rounded-xl bg-rose-50 border border-rose-100 shrink-0">
                {trait.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">{trait.title}</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {trait.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lucky Correspondences */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div>
          <div className="text-[10px] font-bold uppercase text-gray-400">Birth Gemstones</div>
          <div className="text-xs md:text-sm font-bold text-gray-800 mt-0.5">{ASTROLOGICAL_PROFILE.gemstone}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase text-gray-400">Sacred Flower</div>
          <div className="text-xs md:text-sm font-bold text-gray-800 mt-0.5">{ASTROLOGICAL_PROFILE.flower}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase text-gray-400">Lucky Numbers</div>
          <div className="text-xs md:text-sm font-bold text-rose-600 mt-0.5">
            {ASTROLOGICAL_PROFILE.luckyNumbers.join(' &bull; ')}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase text-gray-400">Tarot Affinity</div>
          <div className="text-xs md:text-sm font-bold text-gray-800 mt-0.5">Justice &amp; Empress</div>
        </div>
      </div>

      {/* Gemini AI Powered: Venus Cupcake Oracle Reading */}
      <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-pink-50/50 to-rose-50/80 border border-purple-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-200/60 text-purple-700 flex items-center justify-center">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
                <span>Venus Cupcake Oracle</span>
                <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                  Google AI Studio &bull; Gemini
                </span>
              </h4>
              <p className="text-xs text-purple-800/80">
                Receive a cosmic blessing customized for Koena&apos;s 7 Oct 2006 chart.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={oracleTopic}
              onChange={(e) => setOracleTopic(e.target.value)}
              className="text-xs bg-white border border-purple-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-purple-300"
            >
              <option value="Love, Creativity & Soul Bloom">Theme: Love &amp; Soul Bloom</option>
              <option value="Career, Ambition & Radiance">Theme: Ambition &amp; Radiance</option>
              <option value="Friendships & Social Harmony">Theme: Friendships &amp; Charm</option>
              <option value="Turning 20: Golden Milestone Blessing">Theme: 20th Milestone Blessing</option>
            </select>

            <button
              onClick={handleAskOracle}
              disabled={isLoadingOracle}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold shadow-md shadow-purple-200 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all shrink-0"
            >
              {isLoadingOracle ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Consulting Stars...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Consult Oracle</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Oracle Output */}
        {oracleReading && (
          <div className="mt-4 pt-4 border-t border-purple-200/60 animate-fade-in space-y-3">
            <div className="p-3.5 rounded-xl bg-white/90 border border-purple-100 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                Cosmic Blessing
              </div>
              <p className="text-sm text-gray-800 font-serif italic mt-1 leading-relaxed">
                &ldquo;{oracleReading.cosmicBlessing}&rdquo;
              </p>
            </div>

            {oracleReading.planetaryHighlights && (
              <div className="p-3.5 rounded-xl bg-white/90 border border-pink-100 shadow-2xs text-xs text-gray-700 leading-relaxed">
                <span className="font-bold text-pink-700 block mb-1">Planetary Pulse:</span>
                {oracleReading.planetaryHighlights}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {oracleReading.secretSuperpower && (
                <div className="p-3 rounded-xl bg-white/90 border border-amber-100 text-xs">
                  <span className="font-bold text-amber-700 block mb-0.5">🌟 Midnight Superpower</span>
                  <span className="text-gray-700">{oracleReading.secretSuperpower}</span>
                </div>
              )}

              {oracleReading.luckyElements && oracleReading.luckyElements.length > 0 && (
                <div className="p-3 rounded-xl bg-white/90 border border-rose-100 text-xs">
                  <span className="font-bold text-rose-700 block mb-0.5">🌸 Lucky Tokens</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {oracleReading.luckyElements.map((el, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md text-[11px] border border-rose-100">
                        {el}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
