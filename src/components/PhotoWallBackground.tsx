import React, { useEffect, useMemo, useState } from 'react';
import { useWallPhotos, type WallPhoto } from '../utils/photoWall';

/**
 * The dim, self-scrolling photo wall that lives behind the whole site.
 *
 * All 42 pictures are split across three horizontal marquee rows that drift in
 * opposite directions at different speeds, faded and blurred so the birthday page
 * stays readable on top of them. Pure CSS animation (GPU transform only) — no timers,
 * no layout thrash. Paused while Photo Mode is on.
 */

interface RowConfig {
  /** Which slice of the photo list this row carries. */
  offset: number;
  /** Relative height of the row (drives tile size). */
  grow: number;
  /** Seconds for one full loop — bigger is slower. */
  duration: number;
  reverse: boolean;
  opacity: number;
  blur: number;
  /** Vertical nudge so rows don't line up into a grid. */
  shift: number;
  /** Negative animation delay, so rows start mid-scroll on load. */
  phase: number;
}

const ROWS: RowConfig[] = [
  { offset: 0, grow: 1.25, duration: 96, reverse: false, opacity: 0.5, blur: 0, shift: -1.2, phase: 12 },
  { offset: 1, grow: 0.72, duration: 148, reverse: true, opacity: 0.32, blur: 1.1, shift: 0.8, phase: 44 },
  { offset: 2, grow: 1.05, duration: 74, reverse: false, opacity: 0.24, blur: 1.9, shift: 1.4, phase: 26 },
];

/** Background + filmstrip use small previews; fall back to the full file if none were built. */
const useFullImage = (event: React.SyntheticEvent<HTMLImageElement>, photo: WallPhoto) => {
  const img = event.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = '1';
  img.src = photo.src;
};

export const PhotoWallBackground: React.FC<{ paused?: boolean }> = ({ paused = false }) => {
  const { photos } = useWallPhotos();
  const [ready, setReady] = useState(false);

  // Fade the wall in after first paint so the page never flashes a block of images.
  useEffect(() => {
    if (photos.length === 0) return;
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [photos.length]);

  const rows = useMemo(() => {
    if (photos.length === 0) return [];
    return ROWS.map((config) => {
      const slice: WallPhoto[] = [];
      for (let i = config.offset; i < photos.length; i += ROWS.length) slice.push(photos[i]);
      return { config, tiles: [...slice, ...slice] };
    });
  }, [photos]);

  if (rows.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className={`photo-wall ${ready ? 'is-ready' : ''} ${paused ? 'is-paused' : ''}`}
    >
      <div className="photo-wall-inner">
        {rows.map(({ config, tiles }, rowIndex) => (
          <div
            key={rowIndex}
            className="photo-wall-row"
            style={
              {
                '--row-grow': config.grow,
                '--row-opacity': config.opacity,
                '--row-blur': `${config.blur}px`,
                '--row-shift': `${config.shift}vh`,
              } as React.CSSProperties
            }
          >
            <div
              className={`photo-wall-track ${config.reverse ? 'is-reverse' : ''}`}
              style={{
                animationDuration: `${config.duration}s`,
                animationDelay: `-${config.phase}s`,
              }}
            >
              {tiles.map((photo, tileIndex) => (
                <figure
                  key={`${photo.id}-${tileIndex}`}
                  className="photo-wall-tile"
                  style={{ '--tile-shift': `${(tileIndex % 5) - 2}px` } as React.CSSProperties}
                >
                  <img
                    src={photo.thumb}
                    alt=""
                    loading={rowIndex === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable={false}
                    onError={(event) => useFullImage(event, photo)}
                  />
                </figure>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Soft wash so text on top of the wall stays crisp. */}
      <div className="photo-wall-veil" />
    </div>
  );
};
