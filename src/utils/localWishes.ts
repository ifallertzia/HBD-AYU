import type { Wish } from '../types';

/**
 * Browser-side persistence for the wish wall.
 *
 * Used only when the deployment has no Express server behind it (a static Vercel
 * frontend, a preview, an offline tab). Wishes then live in localStorage on that
 * device instead of failing with a scary error — everything else about the wall
 * keeps working exactly the same.
 */

const WISHES_KEY = 'cupcakeee:wishes:v1';
const LIKES_KEY = 'cupcakeee:wish-likes:v1';
const HIDDEN_KEY = 'cupcakeee:wish-hidden:v1';

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (Array.isArray(fallback) ? Array.isArray(parsed) : typeof parsed === typeof fallback)
      ? (parsed as T)
      : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // private mode / quota exceeded — the wall just keeps the session state
  }
};

export const readLocalWishes = (): Wish[] => readJson<Wish[]>(WISHES_KEY, []);

export const saveLocalWish = (wish: Wish): Wish[] => {
  const next = [wish, ...readLocalWishes().filter((entry) => entry.id !== wish.id)].slice(0, 200);
  writeJson(WISHES_KEY, next);
  return next;
};

/** Taps on this device, added on top of whatever like count the wish ships with. */
export const readLocalLikeDeltas = (): Record<string, number> => readJson<Record<string, number>>(LIKES_KEY, {});

export const bumpLocalLike = (id: string): number => {
  const deltas = readLocalLikeDeltas();
  deltas[id] = (deltas[id] ?? 0) + 1;
  writeJson(LIKES_KEY, deltas);
  return deltas[id];
};

export const readHiddenWishIds = (): string[] => readJson<string[]>(HIDDEN_KEY, []);

export const hideLocalWish = (id: string): string[] => {
  const next = Array.from(new Set([...readHiddenWishIds(), id]));
  writeJson(HIDDEN_KEY, next);
  return next;
};

export const createLocalWishId = (): string =>
  `local-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : Date.now().toString(36)}`;
