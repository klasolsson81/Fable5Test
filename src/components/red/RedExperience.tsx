import { useEffect, useRef, useState } from 'react';
import { ConstructScene } from '../../three/ConstructScene';
import { useStore, STATION_IDS } from '../../core/store';
import type { StationId } from '../../core/store';
import { useT, getT, DICTS } from '../../core/i18n';
import { audio } from '../../core/audio';
import { prefersReducedMotion } from '../../core/prefs';
import { StationPanel } from './StationPanel';

export default function RedExperience() {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const station = useStore((s) => s.station);
  const panelVisible = useStore((s) => s.panelVisible);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let scene: ConstructScene;
    try {
      scene = new ConstructScene(canvas, prefersReducedMotion(), {
        onSelect: (id) => {
          audio.play('whoosh');
          useStore.getState().setStation(id);
        },
        onArrive: () => {
          audio.play('confirm');
          useStore.getState().setPanelVisible(true);
        },
        onRabbit: () => {
          const st = useStore.getState();
          audio.play('rabbit');
          st.setRabbitMode(true);
          st.setNotice(getT().red.rabbit);
          window.setTimeout(() => {
            useStore.getState().setRabbitMode(false);
            useStore.getState().setNotice(null);
          }, 9000);
        },
        onHover: (hovering) => {
          if (hovering) audio.play('hover');
        },
      });
    } catch (err) {
      console.warn('WebGL unavailable, falling back to the white pill', err);
      useStore.getState().setNotice(getT().red.sceneFallback);
      useStore.getState().setPhase('white');
      window.setTimeout(() => useStore.getState().setNotice(null), 6000);
      return;
    }

    const applyLabels = (lang: 'sv' | 'en') => {
      const dict = DICTS[lang];
      scene.setLabels(
        Object.fromEntries(STATION_IDS.map((id) => [id, dict.stations[id].label])) as Record<StationId, string>,
      );
    };
    applyLabels(useStore.getState().lang);
    // Canvas-rendered labels need the display font; redraw once it's loaded
    document.fonts?.ready
      ?.then(() => applyLabels(useStore.getState().lang))
      .catch(() => { /* fallback font already rendered */ });

    // If deep-linked straight to a station (#red/projects), fly there immediately
    const initialStation = useStore.getState().station;
    if (initialStation) scene.focusStation(initialStation);

    const unsub = useStore.subscribe((s, prev) => {
      if (s.station !== prev.station) scene.focusStation(s.station);
      if (s.lang !== prev.lang) applyLabels(s.lang);
      if (s.rabbitMode !== prev.rabbitMode) scene.setRabbitMode(s.rabbitMode);
      if (s.activeProject !== prev.activeProject) scene.setPaused(s.activeProject !== null);
    });

    audio.startMusic();
    const hintId = window.setTimeout(() => setShowHint(false), 9000);

    return () => {
      unsub();
      window.clearTimeout(hintId);
      audio.stopMusic();
      scene.dispose();
    };
  }, []);

  return (
    <div className="red">
      <canvas ref={canvasRef} className="construct-canvas" />

      {showHint && !station && <div className="red__hint">{t.red.hint}</div>}

      {/* Keyboard/screen-reader parallel navigation for the 3D nodes */}
      <nav className="red__nav" aria-label={t.a11y.stationNav}>
        {STATION_IDS.map((id) => (
          <button
            key={id}
            className={`red__nav-btn ${station === id ? 'is-active' : ''}`}
            onClick={() => {
              audio.play('whoosh');
              useStore.getState().setStation(id);
            }}
          >
            {t.stations[id].label}
          </button>
        ))}
      </nav>

      {station && panelVisible && <StationPanel station={station} />}
    </div>
  );
}
