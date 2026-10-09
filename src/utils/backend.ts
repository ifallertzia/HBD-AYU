import { useEffect, useState } from 'react';

/**
 * Does this deployment have the companion Express server, or is it the static
 * Vite bundle (e.g. a plain Vercel frontend deploy)?
 *
 * The client only needs one answer: with a server, wishes/uploads persist on disk;
 * without one, the UI quietly switches to saving in the browser instead of failing.
 */

export type BackendMode = 'checking' | 'server' | 'static';

const HEALTH_URL = '/api/health';

let resolved: BackendMode | null = null;
let inflight: Promise<BackendMode> | null = null;

export const detectBackend = (): Promise<BackendMode> => {
  if (resolved) return Promise.resolve(resolved);
  if (!inflight) {
    inflight = fetch(HEALTH_URL, { cache: 'no-store' })
      .then(async (res) => {
        // A static host answers with index.html or a 404 page — only JSON counts.
        if (!res.ok || !(res.headers.get('content-type') ?? '').includes('application/json')) return 'static';
        const data = await res.json().catch(() => null);
        return data && data.ok === true ? 'server' : 'static';
      })
      .catch(() => 'static' as BackendMode)
      .then((mode) => {
        resolved = mode;
        inflight = null;
        return mode;
      });
  }
  return inflight;
};

export const useBackendMode = () => {
  const [mode, setMode] = useState<BackendMode>(resolved ?? 'checking');

  useEffect(() => {
    let active = true;
    detectBackend().then((next) => {
      if (active) setMode(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return { mode, hasServer: mode === 'server', staticOnly: mode === 'static' };
};
