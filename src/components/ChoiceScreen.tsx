import { useEffect, useState } from 'react';
import { useStore } from '../core/store';
import { useT } from '../core/i18n';
import { audio } from '../core/audio';
import { MatrixRain2D } from './MatrixRain2D';

/** Start fetching the heavy 3D chunk the moment the choice is on screen. */
function preloadRed(): void {
  void import('./red/RedExperience');
}

export function ChoiceScreen() {
  const t = useT();
  const setPhase = useStore((s) => s.setPhase);
  const rabbitMode = useStore((s) => s.rabbitMode);
  const [leaving, setLeaving] = useState<'red' | 'white' | null>(null);

  useEffect(() => {
    const id = window.setTimeout(preloadRed, 1200);
    return () => window.clearTimeout(id);
  }, []);

  const chooseRed = () => {
    if (leaving) return;
    audio.unlock();
    audio.play('whoosh');
    setLeaving('red');
    preloadRed();
    window.setTimeout(() => setPhase('red'), 950);
  };

  const chooseWhite = () => {
    if (leaving) return;
    audio.unlock();
    audio.play('click');
    setLeaving('white');
    window.setTimeout(() => setPhase('white'), 350);
  };

  return (
    <div className={`choice ${leaving ? `choice--leaving-${leaving}` : ''}`}>
      <MatrixRain2D opacity={0.55} gold={rabbitMode} />
      <div className="choice__inner">
        <h1 className="choice__title glitch" data-text={t.choice.title}>
          {t.choice.title}
        </h1>
        <p className="choice__subtitle">{t.choice.subtitle}</p>

        <div className="choice__pills">
          <button
            className="pill-card pill-card--red"
            onClick={chooseRed}
            onMouseEnter={() => { audio.play('hover'); preloadRed(); }}
          >
            <span className="pill-card__name">{t.choice.red.name}</span>
            <span className="pill pill--red" aria-hidden="true">
              <span className="pill__half pill__half--a" />
              <span className="pill__half pill__half--b" />
              <span className="pill__shine" />
            </span>
            <span className="pill-card__desc">{t.choice.red.desc}</span>
            <span className="pill-card__cta">{t.choice.red.cta}</span>
          </button>

          <button
            className="pill-card pill-card--white"
            onClick={chooseWhite}
            onMouseEnter={() => audio.play('hover')}
          >
            <span className="pill-card__name">{t.choice.white.name}</span>
            <span className="pill pill--white" aria-hidden="true">
              <span className="pill__half pill__half--a" />
              <span className="pill__half pill__half--b" />
              <span className="pill__shine" />
            </span>
            <span className="pill-card__desc">{t.choice.white.desc}</span>
            <span className="pill-card__cta">{t.choice.white.cta}</span>
          </button>
        </div>

        <p className="choice__hint">{t.choice.hint}</p>
        <p className="choice__audio-hint">{t.choice.audioHint}</p>
      </div>

      {leaving === 'red' && <div className="reality-warp" aria-hidden="true" />}
    </div>
  );
}
