import { useEffect } from 'react';
import { useStore } from '../../core/store';
import type { StationId } from '../../core/store';
import { useT } from '../../core/i18n';
import { audio } from '../../core/audio';
import { ProjectsGrid } from '../panels/ProjectsGrid';
import { SkillsMatrix } from '../panels/SkillsMatrix';
import { ExperienceTimeline } from '../panels/ExperienceTimeline';
import { ContactForm } from '../panels/ContactForm';
import { CvBlock } from '../panels/CvBlock';
import { ChatTerminal } from '../ChatTerminal';

export function StationPanel({ station }: { station: StationId }) {
  const t = useT();
  const setStation = useStore((s) => s.setStation);

  const close = () => {
    audio.play('click');
    setStation(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !useStore.getState().activeProject && !useStore.getState().chatOpen) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <aside className={`station-panel station-panel--${station}`} role="dialog" aria-label={t.stations[station].label}>
      <header className="station-panel__head">
        <div>
          <h2 className="station-panel__title">{t.stations[station].label}</h2>
          <p className="station-panel__tagline">{t.stations[station].tagline}</p>
        </div>
        <button className="btn btn--ghost" onClick={close} aria-label={t.a11y.closeModal}>
          {t.panels.close} <kbd>{t.panels.esc}</kbd>
        </button>
      </header>

      <div className="station-panel__body">
        {station === 'projects' && <ProjectsGrid />}
        {station === 'skills' && <SkillsMatrix />}
        {station === 'experience' && <ExperienceTimeline mode="red" />}
        {station === 'contact' && <ContactForm />}
        {station === 'cv' && <CvBlock />}
        {station === 'chat' && <ChatTerminal variant="embedded" />}
      </div>
    </aside>
  );
}
