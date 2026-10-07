import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Twitter, Sparkles, Globe, Smartphone, ShieldCheck } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Compute public shared URL (converts private ais-dev- to public ais-pre- so anyone can access it)
  const getPublicUrl = () => {
    if (typeof window === 'undefined') return '';
    let url = window.location.href;
    if (url.includes('ais-dev-')) {
      url = url.replace('ais-dev-', 'ais-pre-');
    }
    // Remove query params or hashes for clean link
    try {
      const u = new URL(url);
      return `${u.origin}${u.pathname}`;
    } catch {
      return url;
    }
  };

  const publicUrl = getPublicUrl();
  const shareText = `🎂 Join me in wishing Koena a Happy 20th Birthday on cupcakeee! Blow virtual candles, view her photo memories, and leave her a sweet wish:`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = publicUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'cupcakeee - Happy Birthday Koena! 🧁',
          text: shareText,
          url: publicUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText} ${publicUrl}`
  )}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Celebrating Koena's 20th Birthday on cupcakeee! 🧁✨`
  )}&url=${encodeURIComponent(publicUrl)}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-100 animate-scale-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-400 to-pink-500 text-white flex items-center justify-center text-2xl shadow-md shadow-pink-200">
            🧁
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-gray-800">
              Share Koena&apos;s Website
            </h3>
            <p className="text-xs text-rose-600 font-semibold">
              Public link that opens on everyone&apos;s phone!
            </p>
          </div>
        </div>

        {/* Important Mobile Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed mb-4">
          <div className="font-bold flex items-center gap-1.5 text-emerald-800 mb-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Public Access Enabled for All Phones</span>
          </div>
          <p className="text-[11px] text-emerald-700">
            This link is the <strong>Public Shared Link</strong> (<code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">ais-pre-...</code>), which opens instantly on anyone&apos;s iPhone or Android without requiring any login!
          </p>
        </div>

        {/* Public Link Box */}
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-rose-500" />
              <span>Public Share Link</span>
            </label>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
              Works for Everyone
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 select-all focus:outline-hidden"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-500 text-white hover:bg-rose-600'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </a>

          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Twitter className="w-4 h-4" />
            <span>Share on X</span>
          </a>
        </div>

        {/* Native mobile share button */}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <button
            onClick={handleNativeShare}
            className="w-full mt-2.5 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors border border-gray-200"
          >
            <Smartphone className="w-4 h-4 text-gray-600" />
            <span>Open Phone Share Menu</span>
          </button>
        )}

        <p className="text-[11px] text-gray-400 text-center mt-4">
          Anyone with this link can view Koena&apos;s exact age, blow her birthday candles, listen to the music, and post wishes!
        </p>
      </div>
    </div>
  );
};
