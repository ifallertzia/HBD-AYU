import React from 'react';
import { Images, X } from 'lucide-react';
import { useWallPhotos } from '../utils/photoWall';

interface PhotoModeButtonProps {
  active: boolean;
  onToggle: () => void;
  variant?: 'nav' | 'fab' | 'inline';
  className?: string;
}

/** The button that swaps the whole site for Ayush's photo slideshow. */
export const PhotoModeButton: React.FC<PhotoModeButtonProps> = ({
  active,
  onToggle,
  variant = 'nav',
  className = '',
}) => {
  const { photos } = useWallPhotos();
  const count = photos.length;

  if (variant === 'fab') {
    return (
      <button
        onClick={onToggle}
        className={`photo-mode-fab group fixed bottom-6 left-4 z-40 flex items-center gap-2.5 rounded-full border border-rose-200/80 bg-white/90 py-2.5 pl-2.5 pr-4 text-left shadow-xl shadow-rose-200/60 backdrop-blur-md transition-all hover:scale-105 hover:border-rose-300 hover:bg-white active:scale-95 sm:bottom-7 sm:left-6 ${className}`}
        title={count ? 'Photo Mode — the site steps aside, the pictures take over' : 'Add photos, then press npm run photos'}
      >
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 text-white shadow-md shadow-rose-300/60">
          <Images className="h-4.5 w-4.5" />
          <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/40 [animation-duration:2.6s]" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[13px] font-extrabold text-gray-900">Photo Mode</span>
          <span className="text-[10px] font-semibold text-rose-500">
            {count > 0 ? `${count} photos · auto-slide` : 'no photos yet'}
          </span>
        </span>
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
          active
            ? 'border border-rose-300 bg-rose-500 text-white shadow-md shadow-rose-200'
            : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
        } ${className}`}
      >
        {active ? <X className="h-4 w-4" /> : <Images className="h-4 w-4" />}
        <span>{active ? 'Exit Photo Mode' : `Photo Mode${count ? ` (${count})` : ''}`}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all hover:scale-105 active:scale-95 sm:px-3 ${
        active
          ? 'border-rose-300 bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200'
          : 'border-rose-200 bg-white text-rose-700 hover:bg-rose-50'
      } ${className}`}
      title="Photo Mode — hide the text, let the pictures run"
    >
      {active ? <X className="h-3.5 w-3.5" /> : <Images className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{active ? 'Exit Photos' : 'Photo Mode'}</span>
    </button>
  );
};
