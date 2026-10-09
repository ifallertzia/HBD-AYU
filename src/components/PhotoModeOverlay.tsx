import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Shuffle, LayoutGrid, Image as ImageIcon, Heart } from 'lucide-react';
import { birthdayAudio } from '../utils/audio';
import confetti from '../utils/confetti';
import { createShuffledOrder, preloadPhoto, type WallPhoto } from '../utils/photoWall';

/** Preview files are optional (npm run photos builds them) — fall back to the full photo. */
const useFullImage = (event: React.SyntheticEvent<HTMLImageElement>, photo: WallPhoto) => {
  const img = event.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = '1';
  img.src = photo.src;
};

/** How long each photo gets before it slides itself away. */
const SLIDE_MS = 5200;

interface SlideState {
  position: number;
  direction: number;
  count: number;
}

type SlideAction = { type: 'step'; delta: number } | { type: 'seek'; position: number };

/**
 * All slide movement goes through here, so a burst of arrow-key presses can never
 * be swallowed by a stale closure (each update sees the latest position).
 */
const slideReducer = (state: SlideState, action: SlideAction): SlideState => {
  const { position, count } = state;
  if (count === 0) return state;
  const next =
    action.type === 'step'
      ? (((position + action.delta) % count) + count) % count
      : (((action.position % count) + count) % count);
  const direction = action.type === 'step' ? (action.delta < 0 ? -1 : 1) : next >= position ? 1 : -1;
  if (next === position) return state;
  return { position: next, direction, count };
};

interface PhotoModeOverlayProps {
  photos: WallPhoto[];
  startIndex?: number;
  onClose: () => void;
}

/**
 * Photo Mode — the whole site steps aside and Ayush's 42 pictures take the stage.
 * Itself: big photo pops forward, then slides away on its own every few seconds.
 */
export const PhotoModeOverlay: React.FC<PhotoModeOverlayProps> = ({ photos, startIndex = 0, onClose }) => {
  const [order, setOrder] = useState<number[]>(() => photos.map((_, i) => i));
  const [slide, dispatchSlide] = useReducer(slideReducer, {
    position: Math.min(Math.max(startIndex, 0), Math.max(photos.length - 1, 0)),
    direction: 1,
    count: photos.length,
  });
  const { position, direction } = slide;
  const [playing, setPlaying] = useState(true);
  const [view, setView] = useState<'show' | 'wall'>('show');
  const [loved, setLoved] = useState<Record<string, boolean>>({});
  const [closing, setClosing] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const draggingRef = useRef(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const count = order.length;
  const active = photos[order[position]] as WallPhoto | undefined;
  const canAutoPlay = playing && !closing && view === 'show' && count > 1;

  /* Fade ourselves out first, then let the parent unmount us — the takeover can
     never get stuck on screen waiting for an animation event that may not fire. */
  const requestClose = useCallback(() => {
    setClosing(true);
    setPlaying(false);
    window.setTimeout(onClose, 340);
  }, [onClose]);

  const step = useCallback((delta: number) => dispatchSlide({ type: 'step', delta }), []);

  const jumpToPhoto = useCallback(
    (photoIndex: number) => {
      const target = order.indexOf(photoIndex);
      if (target === -1) return;
      setView('show');
      dispatchSlide({ type: 'seek', position: target });
    },
    [order],
  );

  // Re-roll the walking order, but leave the photo on screen exactly where it is.
  const toggleShuffle = useCallback(() => {
    setOrder(createShuffledOrder(photos.length, active ? photos.indexOf(active) : undefined, position));
    setPlaying(true);
    birthdayAudio.playSparkleChime();
  }, [active, photos, position]);

  // Auto-slide: the photo advances itself while nobody is pausing it.
  useEffect(() => {
    if (!canAutoPlay) return;
    const timer = window.setTimeout(() => step(1), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [canAutoPlay, position, step]);

  // Keep the next frame ready so the slide never flashes an empty box.
  useEffect(() => {
    preloadPhoto(photos[order[(position + 1) % count]]);
    preloadPhoto(photos[order[(position - 1 + count) % count]]);
  }, [count, order, photos, position]);

  // Hand focus to the dialog so Esc works straight away.
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Keyboard: ←/→ browse, space pauses, S shuffles, Esc leaves.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          step(1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          step(-1);
          break;
        case ' ':
          event.preventDefault();
          setPlaying((prev) => !prev);
          break;
        case 'Escape':
          event.preventDefault();
          if (closing) break;
          if (view === 'wall') setView('show');
          else requestClose();
          break;
        case 's':
        case 'S':
          toggleShuffle();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closing, requestClose, step, toggleShuffle, view]);

  // Keep the active thumbnail centred in the filmstrip.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const activeThumb = strip.querySelector('[data-active="true"]');
    activeThumb?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [position]);

  const love = useCallback((photo: WallPhoto) => {
    setLoved((prev) => ({ ...prev, [photo.id]: !prev[photo.id] }));
    if (!loved[photo.id]) {
      birthdayAudio.playSparkleChime();
      confetti({ particleCount: 50, spread: 78, origin: { y: 0.55 }, colors: ['#fb7185', '#f472b6', '#fcd34d', '#ffffff'] });
    }
  }, [loved]);

  const slideVariants = useMemo(
    () => ({
      enter: (dir: number) => ({ opacity: 0, scale: 0.84, x: dir * 60, y: 12, filter: 'blur(16px)' }),
      centre: { opacity: 1, scale: 1, x: 0, y: 0, filter: 'blur(0px)' },
      exit: (dir: number) => ({ opacity: 0, scale: 1.14, x: dir * -70, y: -18, filter: 'blur(12px)' }),
    }),
    [],
  );

  if (!active) return null;

  return (
    <div
      className={`fixed inset-0 z-[70] flex flex-col overflow-hidden bg-[#0d0708] text-white photo-mode-root ${closing ? 'is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Ayush photo mode"
    >
      {/* Ambient glow from the photo itself, so the picture "lifts" off the dark. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img src={active.thumb} alt="" className="h-full w-full scale-125 object-cover opacity-35 blur-[64px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,7,8,0.35),rgba(13,7,8,0.92)_72%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0708] via-transparent to-[#0d0708]" />
      </div>

      {/* Auto-advance progress line */}
      {canAutoPlay && (
        <div className="absolute top-0 left-0 right-0 z-20 h-[3px] bg-white/10">
          <motion.div
            key={`progress-${position}`}
            className="h-full origin-left bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }}
          />
        </div>
      )}

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between gap-3 px-4 sm:px-6 pt-4 sm:pt-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-base shadow-lg shadow-rose-900/40">
            🧁
          </span>
          <div className="min-w-0">
            <p className="font-handwriting text-xl leading-none font-bold text-rose-200 truncate">Photo Mode</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-semibold truncate">
              Ayush &bull; {String(position + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setView((prev) => (prev === 'show' ? 'wall' : 'show'))}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/85 backdrop-blur-sm transition hover:bg-white/20"
            title={view === 'show' ? 'See all 42 at once' : 'Back to slideshow'}
          >
            {view === 'show' ? <LayoutGrid className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{view === 'show' ? 'All Photos' : 'Slideshow'}</span>
          </button>
          <button
            ref={closeRef}
            onClick={requestClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white/85 backdrop-blur-sm transition hover:bg-rose-500 hover:text-white"
            aria-label="Exit photo mode"
            title="Exit photo mode (Esc)"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {view === 'show' ? (
        <>
          {/* Stage */}
          <div className="relative z-10 flex-1 min-h-0">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={active.id}
                className="absolute inset-0 flex cursor-pointer items-center justify-center px-3 py-2"

                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="centre"
                exit="exit"
                transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.55}
                dragTransition={{ power: 0.2, timeConstant: 180 }}
                onDragStart={() => {
                  draggingRef.current = true;
                }}
                onDragEnd={(_, info) => {
                  window.setTimeout(() => {
                    draggingRef.current = false;
                  }, 0);
                  if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 650) step(info.offset.x < 0 ? 1 : -1);
                }}
                onClick={() => {
                  if (!draggingRef.current) step(1);
                }}
              >
                <figure className="pointer-events-none flex max-h-full flex-col items-center gap-2.5 rounded-[1.7rem] bg-white/[0.97] p-2.5 pb-9 shadow-[0_45px_130px_-25px_rgba(0,0,0,0.9)] ring-1 ring-white/25 sm:p-3 sm:pb-10">
                  <motion.img
                    src={active.src}
                    alt={active.title}
                    className="block max-h-[calc(100vh-330px)] min-h-0 w-auto max-w-[88vw] rounded-[1.25rem] object-contain sm:max-h-[calc(100vh-300px)] sm:max-w-[min(78vw,1000px)]"
                    draggable={false}
                    initial={{ scale: 1 }}
                    animate={{ scale: canAutoPlay ? 1.045 : 1 }}
                    transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }}
                  />
                  <figcaption className="flex w-full items-end justify-between gap-3 px-1.5 text-left">
                    <span className="font-handwriting text-lg leading-tight font-bold text-gray-800 sm:text-2xl truncate">
                      {active.caption || active.title}
                    </span>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-rose-500">
                      Ayu &bull; {String(position + 1).padStart(2, '0')}
                    </span>
                  </figcaption>
                </figure>
              </motion.div>
            </AnimatePresence>

            {/* Tap zones / arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="group absolute left-0 top-0 z-20 hidden h-full w-[16%] items-center justify-start bg-gradient-to-r from-black/45 to-transparent pl-3 outline-none sm:flex"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-7 w-7 text-white/70 transition group-hover:scale-110 group-hover:text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="group absolute right-0 top-0 z-20 hidden h-full w-[16%] items-center justify-end bg-gradient-to-l from-black/45 to-transparent pr-3 outline-none sm:flex"
              aria-label="Next photo"
            >
              <ChevronRight className="h-7 w-7 text-white/70 transition group-hover:scale-110 group-hover:text-white" />
            </button>
          </div>

          {/* Controls + filmstrip */}
          <footer className="relative z-20 px-3 pb-3 sm:px-6 sm:pb-5">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <ControlButton onClick={() => step(-1)} label="Previous photo" className="sm:hidden">
                <ChevronLeft className="h-4.5 w-4.5" />
              </ControlButton>
              <ControlButton onClick={() => setPlaying((prev) => !prev)} label={playing ? 'Pause slideshow' : 'Play slideshow'}>
                {playing ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
              </ControlButton>
              <ControlButton onClick={() => step(1)} label="Next photo" className="sm:hidden">
                <ChevronRight className="h-4.5 w-4.5" />
              </ControlButton>
              <ControlButton onClick={toggleShuffle} label="Shuffle the order">
                <Shuffle className="h-4 w-4" />
              </ControlButton>
              <button
                onClick={() => love(active)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-bold backdrop-blur-sm transition ${
                  loved[active.id]
                    ? 'border-rose-300 bg-rose-500 text-white shadow-lg shadow-rose-900/40'
                    : 'border-white/15 bg-white/10 text-white/85 hover:bg-rose-500/80 hover:text-white'
                }`}
                title="Send Ayush a little love"
              >
                <Heart className={`h-4 w-4 ${loved[active.id] ? 'fill-white' : ''}`} />
                <span className="hidden sm:inline">{loved[active.id] ? 'Loved!' : 'Love this'}</span>
              </button>
            </div>

            <div ref={stripRef} className="scrollbar-none mt-2.5 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:gap-2">
              {order.map((photoIndex, stripPosition) => {
                const photo = photos[photoIndex];
                const isActive = stripPosition === position;
                return (
                  <button
                    key={photo.id}
                    data-active={isActive}
                    onClick={() => {
                      dispatchSlide({ type: 'seek', position: stripPosition });
                      setPlaying(false);
                    }}
                    className={`relative aspect-3/4 shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'h-14 opacity-100 ring-2 ring-rose-300 sm:h-16'
                        : 'h-10 opacity-45 hover:opacity-90 sm:h-12'
                    }`}
                    aria-label={`Show photo ${stripPosition + 1}: ${photo.title}`}
                  >
                    <img
                      src={photo.thumb}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      onError={(event) => useFullImage(event, photo)}
                    />
                  </button>
                );
              })}
            </div>

            <p className="mt-1 text-center text-[10px] font-medium tracking-wide text-white/35">
              {canAutoPlay ? 'slides by itself · ' : 'paused · '}
              {view === 'show' ? 'drag or click to move · ← → · space · S shuffle · Esc to exit' : 'pick any photo to play it'}
            </p>
          </footer>
        </>
      ) : (
        /* Wall view: every photo at once */
        <div className="relative z-10 mt-4 flex-1 overflow-y-auto px-3 pb-8 sm:px-6">
          <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6">
            {photos.map((photo, photoIndex) => (
              <button
                key={photo.id}
                onClick={() => jumpToPhoto(photoIndex)}
                className="animate-fade-in group relative aspect-3/4 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition hover:ring-rose-300"
                style={{ animationDelay: `${Math.min(photoIndex * 22, 700)}ms`, animationFillMode: 'both' }}
                aria-label={`Open ${photo.title} in the slideshow`}
              >
                <img
                  src={photo.thumb}
                  alt={photo.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.08] group-hover:opacity-100"
                  onError={(event) => useFullImage(event, photo)}
                />
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/80 to-transparent px-1.5 pt-6 pb-1 text-left text-[9px] font-bold text-white/85 opacity-0 transition group-hover:opacity-100">
                  {photo.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ControlButton: React.FC<{
  onClick: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
}> = ({ onClick, label, className = '', children }) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white/85 backdrop-blur-sm transition hover:bg-white/25 hover:text-white active:scale-95 sm:h-11 sm:w-11 ${className}`}
  >
    {children}
  </button>
);
