import { useT } from '../../core/i18n';
import { useStore } from '../../core/store';
import { audio } from '../../core/audio';
import { PROFILE, profileAge } from '../../data/profile';
import { useL } from '../../core/i18n';

export function CvBlock() {
  const t = useT();
  const l = useL();
  const setPhase = useStore((s) => s.setPhase);

  return (
    <div className="cvblock">
      <p className="panel-intro">{t.cv.text}</p>

      <div className="cvblock__card">
        <div className="cvblock__row"><span>NAME</span><strong>{PROFILE.name}</strong></div>
        <div className="cvblock__row"><span>ROLE</span><strong>{l(PROFILE.role)}</strong></div>
        <div className="cvblock__row"><span>BASE</span><strong>{l(PROFILE.city)} · {profileAge()}</strong></div>
        <div className="cvblock__row"><span>LIA</span><strong>{l(PROFILE.lia)}</strong></div>
      </div>

      <a
        className="btn btn--accent btn--big"
        href={PROFILE.cvPath}
        download
        onClick={() => audio.play('confirm')}
      >
        ⭳ {t.cv.download}
      </a>

      <p className="cvblock__tip">
        {t.cv.print}{' '}
        <button className="linklike" onClick={() => { audio.play('click'); setPhase('white'); }}>
          → {t.choice.white.name}
        </button>
      </p>
    </div>
  );
}
