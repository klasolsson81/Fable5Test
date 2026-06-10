import { useEffect, useRef, useState } from 'react';
import { useStore } from '../core/store';
import { useT, useL } from '../core/i18n';
import { audio } from '../core/audio';
import { getProject } from '../data/projects';

export function ProjectModal({ projectId }: { projectId: string }) {
  const t = useT();
  const l = useL();
  const setActiveProject = useStore((s) => s.setActiveProject);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const project = getProject(projectId);

  const close = () => {
    audio.play('click');
    setActiveProject(null);
  };

  const count = project?.slides.length ?? 0;
  const go = (dir: 1 | -1) => {
    if (!count) return;
    audio.play('hover');
    setIndex((i) => (i + dir + count) % count);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  if (!project) return null;
  const slide = project.slides[index]!;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={project.name} onClick={close}>
      <div
        className="modal__window"
        style={{ '--accent': project.accent } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
          if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <header className="modal__head">
          <div className="modal__id">
            <span className="modal__code">{project.code}</span>
            <h2 className="modal__name">{project.name}</h2>
            <span className="modal__year">{project.year}</span>
          </div>
          <button className="btn btn--ghost" onClick={close} aria-label={t.a11y.closeModal}>
            {t.panels.close} <kbd>{t.panels.esc}</kbd>
          </button>
        </header>

        <p className="modal__tagline">{l(project.tagline)}</p>

        <div className="modal__stage">
          {slide.image ? (
            <img className="modal__img" src={slide.image} alt={l(slide.title)} loading="lazy" />
          ) : (
            <div className="modal__holo" aria-hidden="true">
              <span className="modal__holo-code">{project.code}</span>
              <span className="modal__holo-name">{project.name}</span>
              <span className="modal__holo-scan" />
            </div>
          )}

          {count > 1 && (
            <>
              <button className="modal__arrow modal__arrow--prev" onClick={() => go(-1)} aria-label={t.projects.prev}>
                ◂
              </button>
              <button className="modal__arrow modal__arrow--next" onClick={() => go(1)} aria-label={t.projects.next}>
                ▸
              </button>
            </>
          )}
        </div>

        <div className="modal__slide-meta">
          <span className="modal__slide-count">
            {t.projects.slide} {index + 1} {t.projects.of} {count}
          </span>
          <div className="modal__dots">
            {project.slides.map((_, i) => (
              <button
                key={i}
                className={`modal__dot ${i === index ? 'is-active' : ''}`}
                onClick={() => { audio.play('hover'); setIndex(i); }}
                aria-label={`${t.projects.slide} ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="modal__text">
          <h3>{l(slide.title)}</h3>
          <p>{l(slide.body)}</p>
        </div>

        <footer className="modal__foot">
          <div className="modal__facts">
            <div><span>{t.projects.status}</span><strong>{l(project.status)}</strong></div>
            <div><span>{t.projects.role}</span><strong>{l(project.role)}</strong></div>
          </div>
          <div className="modal__stack">
            {project.stack.map((s) => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>
          <div className="modal__links">
            {project.links.live && (
              <a className="btn btn--accent" href={project.links.live} target="_blank" rel="noreferrer">
                ⚡ {t.projects.live}
              </a>
            )}
            {project.links.repo && (
              <a className="btn" href={project.links.repo} target="_blank" rel="noreferrer">
                ⌥ {t.projects.repo}
              </a>
            )}
            {project.confidential && <span className="modal__confidential">{t.projects.confidential}</span>}
          </div>
        </footer>
      </div>
    </div>
  );
}
