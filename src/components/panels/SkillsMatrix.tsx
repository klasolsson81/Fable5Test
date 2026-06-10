import { useT, useL } from '../../core/i18n';
import { SKILLS, TOOLS } from '../../data/skills';

function Dots({ level }: { level: number }) {
  return (
    <span className="dots" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`dots__dot ${i <= level ? 'is-on' : ''}`} />
      ))}
    </span>
  );
}

export function SkillsMatrix() {
  const t = useT();
  const l = useL();
  const core = SKILLS.filter((s) => s.group === 'core');
  const langs = SKILLS.filter((s) => s.group === 'lang');

  return (
    <div className="skills">
      <p className="panel-intro">{t.skills.intro}</p>

      <div className="skills__head">
        <span>{t.skills.competence}</span>
        <span>{t.skills.scale}</span>
      </div>
      <ul className="skills__list">
        {core.map((s) => (
          <li key={s.label.sv} className="skills__row">
            <span className="skills__label">{l(s.label)}</span>
            <span className="skills__level">
              <Dots level={s.level} />
              <span className="skills__num">{s.level} / 5</span>
            </span>
          </li>
        ))}
      </ul>

      <h3 className="skills__subtitle">{t.skills.langTitle}</h3>
      <ul className="skills__list">
        {langs.map((s) => (
          <li key={s.label.sv} className="skills__row">
            <span className="skills__label">{l(s.label)}</span>
            <span className="skills__level">
              <Dots level={s.level} />
              <span className="skills__num">{s.level} / 5</span>
            </span>
          </li>
        ))}
      </ul>

      <h3 className="skills__subtitle">{t.skills.toolsTitle}</h3>
      <div className="skills__tools">
        {TOOLS.map((tool) => (
          <span key={tool} className="chip">{tool}</span>
        ))}
      </div>
    </div>
  );
}
