// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/App';
import { useStore } from '../src/core/store';

/**
 * Renders the real app in jsdom and walks the white-pill path end to end.
 * The red pill (WebGL) can't run headless — it is covered by the type system
 * and by graceful-fallback logic instead.
 */

beforeEach(() => {
  window.history.replaceState(null, '', '#');
  sessionStorage.clear();
  localStorage.setItem('kx_lang', 'sv');
  useStore.setState({
    phase: 'boot',
    station: null,
    panelVisible: false,
    activeProject: null,
    chatOpen: false,
    lang: 'sv',
    notice: null,
  });
});

afterEach(() => cleanup());

describe('app smoke (white path)', () => {
  it('boots, skips to the choice screen, and shows both pills', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Boot screen → skip by clicking
    await user.click(screen.getByRole('button', { name: /hoppa över/i }));
    expect(await screen.findByText('VÄLJ DIN VERKLIGHET')).toBeTruthy();
    expect(screen.getByText('DET RÖDA PILLRET')).toBeTruthy();
    expect(screen.getByText('DET VITA PILLRET')).toBeTruthy();
  });

  it('white pill renders the full dossier with real data', async () => {
    useStore.getState().setPhase('white');
    render(<App />);

    expect(screen.getByText('KLAS OLSSON')).toBeTruthy();
    expect(screen.getByText(/KOMPETENSMATRIS/)).toBeTruthy();
    expect(screen.getByText('JobbPilot')).toBeTruthy();
    expect(screen.getByText('KalasKoll')).toBeTruthy();
    expect(screen.getAllByText(/LIA 2: 8 mar/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/LIA 1 \(hösten 2026\) är redan säkrad/).length).toBeGreaterThan(0);
    expect(document.querySelector(`a[href='/cv/CV_Klas_Olsson.pdf']`)).toBeTruthy();
  });

  it('opens a project deep-dive modal from the dossier', async () => {
    const user = userEvent.setup();
    useStore.getState().setPhase('white');
    render(<App />);

    await user.click(screen.getByText('JobbPilot'));
    const dialog = await screen.findByRole('dialog', { name: 'JobbPilot' });
    expect(within(dialog).getByText(/Clean Architecture/)).toBeTruthy();

    // slide navigation works
    await user.click(within(dialog).getByRole('button', { name: 'NÄSTA' }));
    expect(within(dialog).getByText(/BILD 2 AV/)).toBeTruthy();
  });

  it('switches language to English everywhere', async () => {
    const user = userEvent.setup();
    useStore.getState().setPhase('white');
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'EN' }));
    expect(await screen.findByText(/SKILLS MATRIX/)).toBeTruthy();
    expect(screen.getAllByText(/Seeking internship/i).length).toBeGreaterThan(0);
    expect(document.documentElement.lang).toBe('en');
  });

  it('chat overlay opens and the offline construct answers', async () => {
    const user = userEvent.setup();
    useStore.getState().setPhase('white');
    render(<App />);

    await user.click(screen.getByRole('button', { name: /AI-TERMINAL/ }));
    const input = await screen.findByPlaceholderText(/Skriv din fråga/);
    await user.type(input, 'Berätta om JobbPilot');
    await user.click(screen.getByRole('button', { name: 'SÄND' }));

    // fetch fails in jsdom → offline fallback answers, typed out over time
    const reply = await screen.findByText(/flaggskeppet/, undefined, { timeout: 8000 });
    expect(reply).toBeTruthy();
  }, 15000);
});
