import { useStore } from '../../core/store';
import { useT, useL } from '../../core/i18n';
import { audio } from '../../core/audio';
import { EXPERIENCE } from '../../data/experience';

export function ExperienceTimeline({ mode }: { mode: 'red' | 'white' }) {
  const t = useT();
  const l = useL();
  const setStation = useStore((s) => s.setStation);

  const goContact = () => {
    audio.play('click');
    if (mode === 'red') setStation('contact');
    else document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="experience">
      <p className="panel-intro">{t.experience.intro}</p>

      <div className="lia-banner">
        <span className="lia-banner__pulse" aria-hidden="true" />
        <div>
          <strong>{t.experience.liaTitle}</strong>
          <p>{t.experience.liaText}</p>
        </div>
        <button className="btn btn--accent" onClick={goContact}>
          {t.experience.liaCta}
        </button>
      </div>

      <ol className="timeline">
        {EXPERIENCE.map((e) => (
          <li key={e.period + e.title.sv} className={`timeline__item timeline__item--${e.tag} ${e.highlight ? 'is-highlight' : ''}`}>
            <span className="timeline__period">{e.period}</span>
            <div className="timeline__content">
              <h3>{l(e.title)}</h3>
              <p>{l(e.body)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
