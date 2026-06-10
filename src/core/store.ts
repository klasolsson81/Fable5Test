import { create } from 'zustand';
import { readPref, writePref } from './prefs';

export type Phase = 'boot' | 'choice' | 'red' | 'white';
export type StationId = 'projects' | 'skills' | 'experience' | 'chat' | 'contact' | 'cv';
export type Lang = 'sv' | 'en';

export const STATION_IDS: StationId[] = ['projects', 'skills', 'experience', 'chat', 'contact', 'cv'];

interface AppState {
  phase: Phase;
  /** Active red-pill station (camera target). */
  station: StationId | null;
  /** True once the camera has arrived and the station panel may render. */
  panelVisible: boolean;
  /** Project id opened in the fullscreen modal (works in both realities). */
  activeProject: string | null;
  chatOpen: boolean;
  lang: Lang;
  muted: boolean;
  /** Set once when the construct scene has compiled/loaded. */
  sceneReady: boolean;
  /** Easter egg: gold rain while true. */
  rabbitMode: boolean;
  /** Transient toast message. */
  notice: string | null;

  setPhase: (phase: Phase) => void;
  setStation: (station: StationId | null) => void;
  setPanelVisible: (visible: boolean) => void;
  setActiveProject: (id: string | null) => void;
  setChatOpen: (open: boolean) => void;
  setLang: (lang: Lang) => void;
  toggleMuted: () => void;
  setSceneReady: (ready: boolean) => void;
  setRabbitMode: (on: boolean) => void;
  setNotice: (notice: string | null) => void;
}

function initialLang(): Lang {
  const saved = readPref('lang');
  if (saved === 'sv' || saved === 'en') return saved;
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'sv';
  return nav.toLowerCase().startsWith('sv') ? 'sv' : 'en';
}

export const useStore = create<AppState>((set, get) => ({
  phase: 'boot',
  station: null,
  panelVisible: false,
  activeProject: null,
  chatOpen: false,
  lang: initialLang(),
  muted: readPref('muted') === '1',
  sceneReady: false,
  rabbitMode: false,
  notice: null,

  setPhase: (phase) =>
    set({ phase, station: null, panelVisible: false, activeProject: null, chatOpen: false }),
  setStation: (station) => set({ station, panelVisible: false }),
  setPanelVisible: (panelVisible) => set({ panelVisible }),
  setActiveProject: (activeProject) => set({ activeProject }),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  setLang: (lang) => {
    writePref('lang', lang);
    document.documentElement.lang = lang;
    set({ lang });
  },
  toggleMuted: () => {
    const muted = !get().muted;
    writePref('muted', muted ? '1' : '0');
    set({ muted });
  },
  setSceneReady: (sceneReady) => set({ sceneReady }),
  setRabbitMode: (rabbitMode) => set({ rabbitMode }),
  setNotice: (notice) => set({ notice }),
}));

/* ── Hash deep-linking (#red, #white, #red/projects …) ──────────────── */

const PHASE_HASHES: Record<string, Phase> = { red: 'red', white: 'white', choice: 'choice' };

export function applyHash(hash: string): void {
  const [head, sub] = hash.replace(/^#/, '').split('/');
  const phase = PHASE_HASHES[head ?? ''];
  if (!phase) return;
  useStore.getState().setPhase(phase);
  if (phase === 'red' && sub && (STATION_IDS as string[]).includes(sub)) {
    useStore.getState().setStation(sub as StationId);
  }
}

export function syncHash(): void {
  const { phase, station } = useStore.getState();
  let hash = '';
  if (phase === 'red') hash = station ? `#red/${station}` : '#red';
  else if (phase === 'white') hash = '#white';
  else if (phase === 'choice') hash = '#choice';
  if (hash && window.location.hash !== hash) {
    history.replaceState(null, '', hash);
  }
}
