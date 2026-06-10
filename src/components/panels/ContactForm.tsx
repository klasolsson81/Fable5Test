import { useState } from 'react';
import type { FormEvent } from 'react';
import { useT } from '../../core/i18n';
import { useStore } from '../../core/store';
import { audio } from '../../core/audio';
import { PROFILE } from '../../data/profile';

type Status = 'idle' | 'sending' | 'sent' | 'mailto' | 'invalid';

export function ContactForm() {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const [status, setStatus] = useState<Status>('idle');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const honeypot = String(data.get('website') ?? '');
    if (honeypot) return; // bot — drop silently

    if (!name || !email || !message) {
      setStatus('invalid');
      audio.play('deny');
      return;
    }

    setStatus('sending');
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, lang }),
        signal: controller.signal,
      });
      window.clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('sent');
      audio.play('confirm');
      form.reset();
    } catch {
      // No backend (local/static hosting) → graceful mailto fallback
      setStatus('mailto');
      audio.play('glitch');
      const subject = encodeURIComponent(`Portfolio: meddelande från ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
    }
  };

  return (
    <div className="contact">
      <p className="panel-intro">{t.contact.intro}</p>

      <form className="contact__form" onSubmit={onSubmit}>
        <label className="field">
          <span className="field__label">{t.contact.name}</span>
          <input className="field__input" name="name" autoComplete="name" maxLength={100} />
        </label>
        <label className="field">
          <span className="field__label">{t.contact.email}</span>
          <input className="field__input" name="email" type="email" autoComplete="email" maxLength={200} />
        </label>
        <label className="field">
          <span className="field__label">{t.contact.message}</span>
          <textarea className="field__input field__input--area" name="message" rows={5} maxLength={3000} />
        </label>
        {/* Honeypot — humans never see it */}
        <input className="field__trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />

        <button className="btn btn--accent" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? t.contact.sending : t.contact.send}
        </button>

        {status === 'sent' && <p className="contact__status contact__status--ok">{t.contact.sent}</p>}
        {status === 'invalid' && <p className="contact__status contact__status--err">{t.contact.required}</p>}
        {status === 'mailto' && (
          <p className="contact__status contact__status--warn">
            {t.contact.error} {t.contact.mailtoNote}
          </p>
        )}
      </form>

      <h3 className="contact__direct-title">{t.contact.direct}</h3>
      <ul className="contact__links">
        <li><a href={`mailto:${PROFILE.email}`}>✉ {PROFILE.email}</a></li>
        <li><a href={PROFILE.linkedin} target="_blank" rel="noreferrer">in LinkedIn /klasolsson81</a></li>
        <li><a href={PROFILE.github} target="_blank" rel="noreferrer">⌥ GitHub /klasolsson81</a></li>
        <li><a href={PROFILE.cvPath} download>⭳ CV_Klas_Olsson.pdf</a></li>
      </ul>
    </div>
  );
}
