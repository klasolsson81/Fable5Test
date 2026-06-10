import { useStore } from '../core/store';
import { useT } from '../core/i18n';
import { audio } from '../core/audio';

export function Hud() {
  const t = useT();
  const phase = useStore((s) => s.phase);
  const station = useStore((s) => s.station);
  const lang = useStore((s) => s.lang);
  const muted = useStore((s) => s.muted);
  const setPhase = useStore((s) => s.setPhase);
  const setStation = useStore((s) => s.setStation);
  const setLang = useStore((s) => s.setLang);
  const toggleMuted = useStore((s) => s.toggleMuted);
  const setChatOpen = useStore((s) => s.setChatOpen);

  const click = () => audio.play('click');

  return (
    <header className={`hud hud--${phase}`}>
      <button
        className="hud__brand"
        onClick={() => { click(); setPhase('choice'); }}
        title={t.hud.switchReality}
      >
        <span className="hud__brand-text">{t.brand}</span>
        <span className="hud__brand-sub">{t.tagline}</span>
      </button>

      <div className="hud__actions">
        {phase === 'red' && station && (
          <button className="hud__btn" onClick={() => { click(); setStation(null); }}>
            <span className="hud__btn-ico">◂</span>
            <span className="hud__btn-label">{t.hud.backToHub}</span>
          </button>
        )}
        {(phase === 'red' || phase === 'white') && (
          <button className="hud__btn hud__btn--chat" onClick={() => { click(); setChatOpen(true); }}>
            <span className="hud__btn-ico">▸_</span>
            <span className="hud__btn-label">{t.hud.openChat}</span>
          </button>
        )}
        {phase !== 'choice' && (
          <button className="hud__btn hud__btn--ghost" onClick={() => { click(); setPhase('choice'); }}>
            {t.hud.switchReality}
          </button>
        )}

        <button
          className={`hud__btn hud__btn--sound ${muted ? 'is-muted' : ''}`}
          onClick={() => { audio.unlock(); toggleMuted(); audio.play('click'); }}
          aria-label={t.a11y.soundToggle}
        >
          <span className="hud__btn-ico">{muted ? '◌' : '◉'}</span>
          <span className="hud__btn-label">{muted ? t.hud.soundOff : t.hud.soundOn}</span>
        </button>

        <div className="hud__lang" role="group" aria-label={t.a11y.langToggle}>
          <button
            className={`hud__lang-btn ${lang === 'sv' ? 'is-active' : ''}`}
            onClick={() => { click(); setLang('sv'); }}
          >
            SV
          </button>
          <span className="hud__lang-sep">|</span>
          <button
            className={`hud__lang-btn ${lang === 'en' ? 'is-active' : ''}`}
            onClick={() => { click(); setLang('en'); }}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
