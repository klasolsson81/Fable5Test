import { useStore } from '../../core/store';
import { useT, useL } from '../../core/i18n';
import { audio } from '../../core/audio';
import { PROJECTS } from '../../data/projects';
import { PROFILE } from '../../data/profile';

export function ProjectsGrid({ compactThumbs = false }: { compactThumbs?: boolean }) {
  const t = useT();
  const l = useL();
  const setActiveProject = useStore((s) => s.setActiveProject);

  return (
    <div className="projects">
      <p className="panel-intro">{t.projects.intro}</p>
      <div className="projects__grid">
        {PROJECTS.map((p) => {
          const thumb = p.slides.find((s) => s.image)?.image;
          const live = p.links.live;
          return (
            <button
              key={p.id}
              className="project-card"
              style={{ '--accent': p.accent } as React.CSSProperties}
              onClick={() => { audio.play('confirm'); setActiveProject(p.id); }}
              onMouseEnter={() => audio.play('hover')}
            >
              <span className="project-card__top">
                <span className="project-card__code">{p.code}</span>
                <span className="project-card__year">{p.year}</span>
              </span>
              {thumb && !compactThumbs ? (
                <span className="project-card__thumb">
                  <img src={thumb} alt="" loading="lazy" />
                </span>
              ) : (
                <span className="project-card__thumb project-card__thumb--holo" aria-hidden="true">
                  <span>{p.code}</span>
                </span>
              )}
              <span className="project-card__name">{p.name}</span>
              <span className="project-card__tagline">{l(p.tagline)}</span>
              <span className="project-card__meta">
                {live && <span className="dot dot--live" />}
                <span className="project-card__status">{l(p.status)}</span>
              </span>
              <span className="project-card__stack">
                {p.stack.slice(0, 3).map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
                {p.stack.length > 3 && <span className="chip chip--more">+{p.stack.length - 3}</span>}
              </span>
              <span className="project-card__cta">{t.projects.open} ▸</span>
            </button>
          );
        })}
      </div>
      <a className="projects__more" href={PROFILE.github} target="_blank" rel="noreferrer">
        {t.projects.more}
      </a>
    </div>
  );
}
