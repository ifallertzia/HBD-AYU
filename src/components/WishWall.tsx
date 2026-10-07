import React, { useState, useEffect } from 'react';
import { Wish } from '../types';
import { Heart, Send, Sparkles, Wand2, Loader2, MessageSquareHeart, User, Trash2, Share2 } from 'lucide-react';
import { birthdayAudio } from '../utils/audio';
import confetti from '../utils/confetti';

interface WishWallProps {
  onOpenShare?: () => void;
}

export const WishWall: React.FC<WishWallProps> = ({ onOpenShare }) => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [message, setMessage] = useState('');
  const [sticker, setSticker] = useState('🧁');
  const [theme, setTheme] = useState<'rose' | 'gold' | 'lavender' | 'peach' | 'mint'>('rose');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Gemini AI Assistant state
  const [aiTone, setAiTone] = useState('Sweet & Poetic');
  const [aiCustomNotes, setAiCustomNotes] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [showAiHelper, setShowAiHelper] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadWishes = async () => {
      try {
  const res = await fetch('/wishes.json');

  if (!res.ok) {
    throw new Error('Could not load wishes.json.');
  }

  const data = await res.json();

  if (isMounted) {
    setWishes(data);
  }
} catch (err) {
  console.error('Failed to load wishes:', err);
} finally {
  if (isMounted) {
    setLoading(false);
  }
}
    };

    loadWishes();
    const refreshInterval = window.setInterval(loadWishes, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
    };
  }, []);

  const handleGenerateWithGemini = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/generate-wish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: name || 'A loving friend',
          relationship,
          tone: aiTone,
          customNotes: aiCustomNotes,
        }),
      });
      const data = await res.json();
      if (data.wishText) {
        setMessage(data.wishText);
        setShowAiHelper(false);
      }
    } catch (err) {
      console.error('Gemini wish generation error:', err);
      setMessage(
        'Happy 20th Birthday to the sweetest Cupcake in the universe! May your Libra charm and Venusian radiance illuminate every path you take this year! 🧁✨'
      );
      setShowAiHelper(false);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          relationship,
          message: message.trim(),
          sticker,
          theme,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save your wish.');
      if (!data.wish) throw new Error('The server did not confirm that your wish was saved.');

      birthdayAudio.playSparkleChime();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f472b6', '#fbbf24', '#c084fc'],
        });
      } catch {
        // ignore
      }
      setWishes((prev) => [data.wish, ...prev]);
      setName('');
      setMessage('');
      setAiCustomNotes('');
    } catch (err) {
      console.error('Failed to send wish:', err);
      setSubmitError(err instanceof Error ? err.message : 'Could not save your wish.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeWish = async (id: string) => {
    birthdayAudio.playMusicBoxNote(880, 0.4, 0.1);
    try {
      const res = await fetch(`/api/wishes/${id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setWishes((prev) =>
          prev.map((w) => (w.id === id ? { ...w, likes: data.likes } : w))
        );
      }
    } catch (err) {
      console.error('Failed to like wish:', err);
    }
  };

  const handleDeleteWish = async (id: string, wishName: string) => {
    if (!window.confirm(`Are you sure you want to delete this wish from "${wishName}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/wishes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setWishes((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete wish:', err);
    }
  };

  const themeStyles = {
    rose: 'bg-rose-50/80 border-rose-200/90 text-rose-950',
    gold: 'bg-amber-50/80 border-amber-200/90 text-amber-950',
    lavender: 'bg-purple-50/80 border-purple-200/90 text-purple-950',
    peach: 'bg-orange-50/80 border-orange-200/90 text-orange-950',
    mint: 'bg-emerald-50/80 border-emerald-200/90 text-emerald-950',
  };

  return (
    <section className="rounded-3xl bg-white/80 backdrop-blur-md p-6 md:p-8 border border-rose-100 shadow-xl shadow-rose-100/30 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-rose-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500" />
            <span>Community Birthday Guestbook</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 mt-1">
            Wishes &amp; Love Notes for Koena
          </h2>
          <p className="text-sm text-gray-500">
            Leave your warmest birthday blessing for Koena. Every wish is permanently preserved here!
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 shadow-2xs hover:scale-105 active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share App</span>
            </button>
          )}
          <div className="text-sm font-semibold text-rose-600 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100 flex items-center gap-2">
            <span>{wishes.length} Warm Wishes</span>
            <span>💌</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Side Form, Right Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Form: 5 cols */}
        <div className="lg:col-span-5 bg-gradient-to-b from-rose-50/90 via-pink-50/50 to-white p-6 rounded-3xl border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-gray-800 text-lg flex items-center gap-2">
              <span>Write Koena a Birthday Wish</span>
              <span>🧁</span>
            </h3>
          </div>

          <form onSubmit={handleSubmitWish} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Maya, Ashutosh, Bestie..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl bg-white border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                  required
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Connection / Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-xl bg-white border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              >
                <option value="Best Friend">Best Friend</option>
                <option value="Family">Family Member</option>
                <option value="Soul Sister">Soul Sister</option>
                <option value="Childhood Friend">Childhood Friend</option>
                <option value="College / School Friend">College / School Friend</option>
                <option value="Well-Wisher">Well-Wisher</option>
                <option value="Secret Admirer">Secret Admirer</option>
              </select>
            </div>

            {/* Sticker Picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Choose a Sticker Token
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['🧁', '💖', '🎂', '🕯️', '🌸', '✨', '👑', '🎉', '🎁'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSticker(s)}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                      sticker === s
                        ? 'bg-rose-500 text-white scale-110 shadow-sm ring-2 ring-rose-300'
                        : 'bg-white hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Card Theme Color
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'rose', label: 'Rose', bg: 'bg-rose-400' },
                  { id: 'gold', label: 'Golden', bg: 'bg-amber-400' },
                  { id: 'lavender', label: 'Lavender', bg: 'bg-purple-400' },
                  { id: 'peach', label: 'Peach', bg: 'bg-orange-400' },
                  { id: 'mint', label: 'Mint', bg: 'bg-emerald-400' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setTheme(th.id as any)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      theme === th.id
                        ? 'bg-white border-gray-800 text-gray-900 shadow-xs'
                        : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${th.bg}`} />
                    <span>{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Area with Gemini AI helper toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Your Birthday Message
                </label>
                <button
                  type="button"
                  onClick={() => setShowAiHelper(!showAiHelper)}
                  className="inline-flex items-center gap-1 text-[11px] text-purple-700 font-semibold hover:text-purple-900 bg-purple-100/80 px-2 py-0.5 rounded-md border border-purple-200"
                >
                  <Wand2 className="w-3 h-3 text-purple-600" />
                  <span>Gemini Wish Assistant</span>
                </button>
              </div>

              {/* Gemini helper expandable drawer */}
              {showAiHelper && (
                <div className="mb-2 p-3 rounded-xl bg-purple-50/90 border border-purple-200 text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Gemini 3.8 Flash
                    </span>
                    <span className="text-[10px] text-purple-600">Google AI Studio</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="text-xs bg-white border border-purple-200 rounded-lg px-2 py-1.5 text-gray-700"
                    >
                      <option value="Sweet & Poetic">Tone: Sweet &amp; Poetic</option>
                      <option value="Warm & Heartfelt">Tone: Warm &amp; Heartfelt</option>
                      <option value="Playful & Fun">Tone: Playful &amp; Fun</option>
                      <option value="Libra Astrological Blessing">Tone: Libra Blessing</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleGenerateWithGemini}
                      disabled={isGeneratingAi}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      {isGeneratingAi ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <span>✨ Craft Wish</span>
                      )}
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Optional inside joke or special memories..."
                    value={aiCustomNotes}
                    onChange={(e) => setAiCustomNotes(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white border border-purple-200"
                  />
                </div>
              )}

              <textarea
                rows={3}
                placeholder="Share your sweetest wishes, blessings, or childhood memories..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-xl bg-white border border-rose-200 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !message.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-bold text-sm shadow-md shadow-rose-200 hover:shadow-lg hover:opacity-95 active:scale-98 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting Wish...' : 'Post Birthday Wish 💌'}</span>
            </button>
            {submitError && (
              <p role="alert" className="text-sm text-red-600">
                {submitError}
              </p>
            )}
          </form>
        </div>

        {/* Right Wall: 7 cols */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Recent Birthday Notes ({wishes.length})
            </h3>
            <span className="text-xs text-rose-600 font-medium">Tap &hearts; to send love</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400">Loading wishes...</div>
          ) : wishes.length === 0 ? (
            <div className="py-12 text-center text-gray-400 bg-white/50 rounded-2xl border border-rose-100">
              No wishes yet. Be the first to leave a sweet note!
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[640px] overflow-y-auto pr-1">
              {wishes.map((w) => (
                <div
                  key={w.id}
                  className={`p-4 rounded-2xl border shadow-xs transition-all hover:shadow-md ${
                    themeStyles[w.theme] || themeStyles.rose
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-xl shrink-0 border border-black/5">
                        {w.sticker || '🧁'}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-gray-900 text-sm">
                          {w.name}
                        </h4>
                        <div className="text-[11px] text-gray-500 font-medium">
                          {w.relationship || 'Friend'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleLikeWish(w.id)}
                        className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-rose-600 border border-rose-200 text-xs font-semibold shadow-2xs hover:scale-105 active:scale-95 transition-all"
                        title="Send love"
                      >
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 group-hover:scale-125 transition-transform" />
                        <span>{w.likes || 0}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteWish(w.id, w.name)}
                        className="p-1.5 rounded-full bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200/60 hover:border-red-200 transition-all text-xs"
                        title="Delete this wish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-xs md:text-sm text-gray-800 leading-relaxed font-sans whitespace-pre-wrap">
                    {w.message}
                  </p>

                  <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-gray-400">
                    <span>
                      {new Date(w.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="font-handwriting text-rose-600 text-xs font-bold">
                      sweet love note
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
