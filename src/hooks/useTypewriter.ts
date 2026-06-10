import { useEffect, useRef, useState } from 'react';

/**
 * Types out `text` character by character.
 * `onTick` fires every few characters (for sfx), `onDone` once at the end.
 */
export function useTypewriter(
  text: string,
  opts: { speedMs?: number; enabled?: boolean; onTick?: () => void; onDone?: () => void } = {},
): string {
  const { speedMs = 14, enabled = true, onTick, onDone } = opts;
  const [shown, setShown] = useState(enabled ? '' : text);
  const cbRef = useRef({ onTick, onDone });
  cbRef.current = { onTick, onDone };

  useEffect(() => {
    if (!enabled) {
      setShown(text);
      return;
    }
    setShown('');
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i % 3 === 0) cbRef.current.onTick?.();
      if (i >= text.length) {
        window.clearInterval(id);
        cbRef.current.onDone?.();
      }
    }, speedMs);
    return () => window.clearInterval(id);
  }, [text, speedMs, enabled]);

  return shown;
}
