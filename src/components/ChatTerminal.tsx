import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useStore } from '../core/store';
import { useT } from '../core/i18n';
import { audio } from '../core/audio';
import { answerOffline } from '../chat/fallbackEngine';
import { PROFILE } from '../data/profile';

interface Msg {
  role: 'user' | 'assistant';
  text: string;
}

async function askApi(message: string, lang: string, history: Msg[]): Promise<string> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        lang,
        conversationHistory: history.slice(-8).map((m) => ({ role: m.role, content: m.text })),
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { reply?: string };
    if (!data.reply) throw new Error('empty reply');
    return data.reply;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function ChatTerminal({ variant }: { variant: 'embedded' | 'overlay' }) {
  const t = useT();
  const lang = useStore((s) => s.lang);
  const setChatOpen = useStore((s) => s.setChatOpen);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [typing, setTyping] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  useEffect(() => {
    if (variant !== 'overlay') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChatOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [variant, setChatOpen]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const typeOut = (full: string) => {
    let i = 0;
    setTyping('');
    const id = window.setInterval(() => {
      if (!aliveRef.current) { window.clearInterval(id); return; }
      i += 2;
      setTyping(full.slice(0, i));
      if (i % 6 === 0) audio.play('type');
      if (i >= full.length) {
        window.clearInterval(id);
        setTyping('');
        setMessages((prev) => [...prev, { role: 'assistant', text: full }]);
        setBusy(false);
      }
    }, 12);
  };

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    audio.play('click');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    setBusy(true);
    let reply: string;
    try {
      reply = await askApi(q, lang, messages);
    } catch {
      setOffline(true);
      reply = answerOffline(q, lang);
    }
    if (aliveRef.current) typeOut(reply);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  const body = (
    <div className={`chat chat--${variant}`}>
      <header className="chat__head">
        <img className="chat__avatar" src={PROFILE.aiAvatar} alt="" />
        <div className="chat__head-text">
          <strong>{t.chat.title}</strong>
          <span>{t.chat.subtitle}</span>
        </div>
        {variant === 'overlay' && (
          <button className="btn btn--ghost" onClick={() => { audio.play('click'); setChatOpen(false); }} aria-label={t.a11y.closeModal}>
            {t.panels.close}
          </button>
        )}
      </header>

      {offline && <div className="chat__offline">{t.chat.offline}</div>}

      <div className="chat__scroll" ref={scrollRef}>
        <div className="chat__msg chat__msg--assistant">{t.chat.greeting}</div>
        {messages.map((m, i) => (
          <div key={i} className={`chat__msg chat__msg--${m.role}`}>{m.text}</div>
        ))}
        {typing && (
          <div className="chat__msg chat__msg--assistant">
            {typing}
            <span className="cursor" />
          </div>
        )}
        {busy && !typing && <div className="chat__msg chat__msg--assistant chat__msg--thinking">{t.chat.thinking}</div>}
      </div>

      {messages.length === 0 && (
        <div className="chat__suggestions">
          {t.chat.suggestions.map((s) => (
            <button key={s} className="chip chip--btn" onClick={() => void ask(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form className="chat__inputrow" onSubmit={onSubmit}>
        <span className="chat__prompt">▸</span>
        <input
          className="chat__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chat.placeholder}
          maxLength={500}
          autoFocus={variant === 'overlay'}
        />
        <button className="btn btn--accent" type="submit" disabled={busy || !input.trim()}>
          {t.chat.send}
        </button>
      </form>
    </div>
  );

  if (variant === 'overlay') {
    return (
      <div className="chat-overlay" onClick={() => setChatOpen(false)}>
        <div className="chat-overlay__window" onClick={(e) => e.stopPropagation()}>
          {body}
        </div>
      </div>
    );
  }
  return body;
}
