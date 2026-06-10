import { useStore } from '../core/store';
import { useT, useL } from '../core/i18n';
import { audio } from '../core/audio';
import { PROFILE, profileAge } from '../data/profile';
import { ProjectsGrid } from './panels/ProjectsGrid';
import { SkillsMatrix } from './panels/SkillsMatrix';
import { ExperienceTimeline } from './panels/ExperienceTimeline';
import { ContactForm } from './panels/ContactForm';

export function WhiteDossier() {
  const t = useT();
  const l = useL();
  const setPhase = useStore((s) => s.setPhase);

  const nav = [
    { id: 'profile', label: t.white.nav.profile },
    { id: 'skills', label: t.white.nav.skills },
    { id: 'projects', label: t.white.nav.projects },
    { id: 'experience', label: t.white.nav.experience },
    { id: 'contact', label: t.white.nav.contact },
  ];

  return (
    <div className="dossier">
      <div className="dossier__inner">
        <header className="dossier__header" id="profile">
          <p className="dossier__kicker">{t.white.title}</p>
          <h1 className="dossier__title">
            {PROFILE.name.toUpperCase()} <span className="dossier__title-cursor" aria-hidden="true" />
          </h1>

          <div className="dossier__profile">
            <img className="dossier__photo" src={PROFILE.photo} alt={PROFILE.name} width={132} height={132} />
            <dl className="dossier__facts">
              <div><dt>{t.white.fields.name}</dt><dd>{PROFILE.name}</dd></div>
              <div><dt>{t.white.fields.role}</dt><dd>{l(PROFILE.role)}</dd></div>
              <div><dt>{t.white.fields.age}</dt><dd>{profileAge()}</dd></div>
              <div><dt>{t.white.fields.city}</dt><dd>{l(PROFILE.city)}</dd></div>
              <div><dt>{t.white.fields.status}</dt><dd className="is-accent">{t.white.values.status}</dd></div>
              <div><dt>{t.white.fields.family}</dt><dd>{t.white.values.family}</dd></div>
              <div><dt>{t.white.fields.languages}</dt><dd>{t.white.values.languages}</dd></div>
            </dl>
          </div>

          <p className="dossier__intro">{l(PROFILE.intro)}</p>

          <div className="dossier__actions">
            <a className="btn btn--accent" href={PROFILE.cvPath} download onClick={() => audio.play('confirm')}>
              ⭳ {t.white.cvLink}
            </a>
            <a className="btn" href={PROFILE.linkedin} target="_blank" rel="noreferrer">in LinkedIn</a>
            <a className="btn" href={PROFILE.github} target="_blank" rel="noreferrer">⌥ GitHub</a>
            <button className="btn no-print" onClick={() => window.print()}>⎙ {t.white.print}</button>
          </div>
        </header>

        <nav className="dossier__nav no-print" aria-label="dossier">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => audio.play('hover')}>
              {n.label}
            </a>
          ))}
        </nav>

        <section className="dossier__section" id="skills">
          <h2 className="dossier__h2">▙ {t.white.skillsTitle}</h2>
          <SkillsMatrix />
        </section>

        <section className="dossier__section" id="projects">
          <h2 className="dossier__h2">▙ {t.white.projectsTitle}</h2>
          <ProjectsGrid />
        </section>

        <section className="dossier__section" id="experience">
          <h2 className="dossier__h2">▙ {t.white.experienceTitle}</h2>
          <ExperienceTimeline mode="white" />
        </section>

        <section className="dossier__section" id="contact">
          <h2 className="dossier__h2">▙ {t.white.contactTitle}</h2>
          <ContactForm />
        </section>

        <footer className="dossier__footer">
          <button className="linklike no-print" onClick={() => { audio.play('whoosh'); setPhase('red'); }}>
            {t.white.redLink}
          </button>
          <p>© {new Date().getFullYear()} {PROFILE.name} · {t.footer.built}</p>
        </footer>
      </div>
    </div>
  );
}
