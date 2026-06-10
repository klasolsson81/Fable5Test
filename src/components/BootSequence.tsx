import { useEffect, useRef, useState } from 'react';
import { useStore } from '../core/store';
import { useT } from '../core/i18n';
import { prefersReducedMotion } from '../core/prefs';
import { MatrixRain2D } from './MatrixRain2D';

export function BootSequence() {
  const t = useT();
  const setPhase = useStore((s) => s.setPhase);
  const [lines, setLines] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    try { sessionStorage.setItem('kx_booted', '1'); } catch { /* fine */ }
    setPhase('choice');
  };

  useEffect(() => {
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    let lineIdx = 0;
    let charIdx = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const line = t.boot.lines[lineIdx];
      if (line === undefined) {
        window.setTimeout(finish, 700);
        return;
      }
      charIdx += 2;
      setCurrent(line.slice(0, charIdx));
      if (charIdx >= line.length) {
        setLines((prev) => [...prev, line]);
        setCurrent('');
        lineIdx += 1;
        charIdx = 0;
        window.setTimeout(tick, lineIdx === t.boot.lines.length ? 350 : 110);
      } else {
        window.setTimeout(tick, 9);
      }
    };
    const startId = window.setTimeout(tick, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(startId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="boot" onPointerDown={finish} onKeyDown={finish} tabIndex={0} role="button" aria-label={t.boot.skip} autoFocus>
      <MatrixRain2D opacity={0.14} />
      <div className="boot__terminal">
        {lines.map((l, i) => (
          <div key={i} className="boot__line">{l}</div>
        ))}
        {current && (
          <div className="boot__line">
            {current}
            <span className="cursor" />
          </div>
        )}
        {!current && <span className="cursor" />}
      </div>
      <div className="boot__skip">{t.boot.skip}</div>
    </div>
  );
}
