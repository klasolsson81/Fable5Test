import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../core/prefs';

const CHARS = 'アイウエオカキクケコサシスセソタチツテト0123456789KLASON<>+*';

interface Props {
  opacity?: number;
  /** Gold rain during the rabbit easter egg. */
  gold?: boolean;
}

/** Cheap 2D-canvas digital rain for DOM screens (boot/choice). ~24 fps, pauses when hidden. */
export function MatrixRain2D({ opacity = 0.5, gold = false }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const goldRef = useRef(gold);
  goldRef.current = gold;

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = prefersReducedMotion();
    let raf = 0;
    let last = 0;
    let drops: number[] = [];
    const fontSize = 18;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const cols = Math.ceil(canvas.width / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -60);
      ctx.fillStyle = '#020705';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      if (document.hidden) return;
      if (now - last < 42) return; // ~24 fps is plenty for this aesthetic
      last = now;

      ctx.fillStyle = 'rgba(2, 7, 5, 0.16)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)]!;
        const x = i * fontSize;
        const y = drops[i]! * fontSize;
        ctx.fillStyle = goldRef.current ? '#ffd24d' : '#1fdd66';
        if (Math.random() < 0.06) ctx.fillStyle = '#c8ffe0';
        ctx.fillText(ch, x, y);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        else drops[i] = drops[i]! + 1;
      }
    };

    if (reduced) {
      // Single static frame, very faint
      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;
      ctx.fillStyle = 'rgba(31, 221, 102, 0.35)';
      for (let i = 0; i < drops.length; i++) {
        for (let j = 0; j < 14; j++) {
          if (Math.random() < 0.3) {
            ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)]!, i * fontSize, Math.random() * canvas.height);
          }
        }
      }
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="rain2d" style={{ opacity }} aria-hidden="true" />;
}
