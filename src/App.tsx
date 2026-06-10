import { Suspense, lazy, useEffect } from 'react';
import { useStore, applyHash, syncHash } from './core/store';
import { useT } from './core/i18n';
import { audio } from './core/audio';
import { BootSequence } from './components/BootSequence';
import { ChoiceScreen } from './components/ChoiceScreen';
import { Hud } from './components/Hud';
import { ProjectModal } from './components/ProjectModal';
import { ChatTerminal } from './components/ChatTerminal';
import { WhiteDossier } from './components/WhiteDossier';

const RedExperience = lazy(() => import('./components/red/RedExperience'));

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function App() {
  const phase = useStore((s) => s.phase);
  const activeProject = useStore((s) => s.activeProject);
  const chatOpen = useStore((s) => s.chatOpen);
  const notice = useStore((s) => s.notice);
  const t = useT();

  // Initial routing: deep links skip the boot sequence, as do repeat in-session visits
  useEffect(() => {
    document.documentElement.lang = useStore.getState().lang;
    if (window.location.hash) {
      applyHash(window.location.hash);
      if (useStore.getState().phase !== 'boot') return;
    }
    try {
      if (sessionStorage.getItem('kx_booted') === '1') useStore.getState().setPhase('choice');
    } catch { /* no sessionStorage — boot plays again, no harm */ }
  }, []);

  // Keep the URL hash shareable
  useEffect(() => useStore.subscribe(() => syncHash()), []);

  // Unlock audio on the very first gesture (autoplay policy)
  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Mute state → engine
  useEffect(
    () =>
      useStore.subscribe((s, prev) => {
        if (s.muted !== prev.muted) audio.setMuted(s.muted);
      }),
    [],
  );
  useEffect(() => {
    audio.setMuted(useStore.getState().muted);
  }, []);

  // Konami code → follow the white rabbit
  useEffect(() => {
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      idx = e.key === KONAMI[idx] ? idx + 1 : e.key === KONAMI[0] ? 1 : 0;
      if (idx === KONAMI.length) {
        idx = 0;
        const st = useStore.getState();
        st.setRabbitMode(true);
        st.setNotice(t.red.rabbit);
        audio.play('rabbit');
        window.setTimeout(() => {
          useStore.getState().setRabbitMode(false);
          useStore.getState().setNotice(null);
        }, 9000);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [t]);

  return (
    <>
      {phase === 'boot' && <BootSequence />}
      {phase === 'choice' && <ChoiceScreen />}
      {phase === 'red' && (
        <Suspense
          fallback={
            <div className="enter-overlay">
              <span className="enter-overlay__text">{t.red.entering}</span>
            </div>
          }
        >
          <RedExperience />
        </Suspense>
      )}
      {phase === 'white' && <WhiteDossier />}

      {phase !== 'boot' && <Hud />}
      {activeProject && <ProjectModal projectId={activeProject} />}
      {chatOpen && <ChatTerminal variant="overlay" />}
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </>
  );
}
