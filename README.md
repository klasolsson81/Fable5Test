# KLAS://OLSSON — The Construct

> **Interaktiv portfolio i Matrix-tema.** Två piller, två verkligheter: det röda ger en 3D-värld med digital rain, hologram och generativ musik — det vita ger ren, utskriftsvänlig fakta för rekryteraren med ont om tid.

## Konceptet

```
        BOOT-SEKVENS ──▸ VÄLJ DIN VERKLIGHET
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
      🔴 DET RÖDA PILLRET             ⚪ DET VITA PILLRET
      The Construct (Three.js)        Dossier (ren DOM)
      ───────────────────────         ─────────────────
      · Kamerafärd in i 3D-rummet     · All fakta direkt
      · Digital rain-shaders          · Kompetensmatris 1–5
      · Hologram + partiklar          · Projektgrid → modaler
      · 6 svävande stationer          · Tidslinje + LIA-banner
      · Generativ ambient-musik       · Print = färdigt pappers-CV
      · Vit kanin-easter egg          · Noll animationer, noll 3D
              │                               │
              └───────┬───────────────────────┘
                      ▼
        Gemensamt: SV/EN · AI-chat · projektmodaler med slides
        kontaktformulär · CV-nedladdning · ljud på/av · djuplänkar
```

## Funktioner

- **Två verkligheter, en datakälla** — allt innehåll (projekt, skills, erfarenhet, chat-kunskap) ligger i `src/data/` på både svenska och engelska. Red/white är bara två presentationer.
- **3D-konstruktionen** — ren Three.js (ingen react-three-fiber): digital rain som GLSL-shader på dubbla cylindrar, hologram-porträtt med scanlines/glitch, partikelhalo, projektorkon, 6 klickbara stationer med kamerafärd, draggbar orbit och en vit kanin som dyker upp då och då. Klicka på den.
- **Generativt ljud** — all musik och alla effekter syntetiseras i WebAudio vid körning: drönare genom ett "andande" lågpassfilter, pentatoniska datablippar, whoosh/glitch/typningstick. **Noll ljudfiler, noll licensproblem.** Mute-knapp i HUD:en, läget sparas.
- **AI-chat ("Konstruktionen")** — pratar via `/api/chat` (OpenAI, samma env-variabel som gamla sajten). Utan API faller den tillbaka på en inbyggd offline-kunskapsbas med ordgräns-matchning — chatten funkar alltså även lokalt och på statisk hosting, ärligt markerad som OFFLINE-LÄGE.
- **Prestanda som krav** — FPS-vakt som sänker pixel ratio och stänger av partiklar/inre regn vid behov, dpr-tak, pausad rendering i dolda flikar, 3D-chunken (139 kB gz) laddas **bara** om man väljer rött piller. Vita pillret är rent DOM.
- **Tillgänglighet** — `prefers-reduced-motion` respekteras överallt (ingen intro, statiskt regn, inga glitchar), stationerna har parallell knappnavigering för tangentbord/skärmläsare, ESC stänger allt.
- **Djuplänkar** — `#white`, `#red`, `#red/projects` osv. Skicka rekryteraren direkt till rätt verklighet.
- **Easter eggs** — Konami-koden (↑↑↓↓←→←→BA), den vita kaninen i 3D-rummet, och ett meddelande i konsolen.

## Stack

| Lager | Val |
|---|---|
| Bygge | Vite 8 + TypeScript (strict) |
| UI | React 19, handskriven CSS (inga UI-bibliotek) |
| 3D | Three.js med egna GLSL-shaders |
| State | Zustand |
| Ljud | WebAudio (helt generativt) |
| Serverless | Vercel functions: `/api/chat` (OpenAI) + `/api/contact` (Nodemailer) |
| Test | Vitest + Testing Library (21 tester: i18n-paritet, chatmotor, dataintegritet, render-smoke) |
| Typsnitt | Rajdhani + Share Tech Mono, självhostade woff2 (~60 kB totalt) |

## Kom igång

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 21 tester
npm run build      # typecheck + produktionsbygge → dist/
npm run preview    # servera dist/ lokalt
```

## Deploy till Vercel

Projektet är byggt Vercel-first — importera repot i Vercel så detekteras Vite automatiskt.

**Miljövariabler** (samma namn som i `portfolio-klas`, återanvänd dina befintliga värden):

| Variabel | Används av | Utan den |
|---|---|---|
| `OPENAI_API_KEY` | `/api/chat` | Chatten kör offline-konstruktionen i stället |
| `GMAIL_USER` | `/api/contact` | Formuläret faller tillbaka på förifylld mailto |
| `GMAIL_PASS` | `/api/contact` (app-lösenord) | — |

Sajten är alltså **helt funktionell även utan nycklar** — degraderingen är medveten och synlig för besökaren.

## Struktur

```
api/                  Vercel serverless (chat + contact)
public/
  cv/                 CV_Klas_Olsson.pdf
  fonts/              självhostade woff2
  img/                optimerade webp (profil + projektscreenshots)
src/
  core/               store (zustand), i18n, audio-motor, prefs
  data/               ALL fakta: profil, projekt+slides, skills, erfarenhet, chat-KB (SV/EN)
  i18n/               UI-strängar sv.ts / en.ts (typad paritet)
  three/              ConstructScene, GLSL-shaders, canvas-genererade texturer
  chat/               offline-fallbackmotor
  components/         boot, pillerval, HUD, röd upplevelse, vit dossier, modaler, chat
tests/                vitest-sviten
```

## Uppdatera innehåll

Allt innehåll är data, inte komponenter:

- **Nytt projekt** → lägg till i `src/data/projects.ts` (+ ev. bilder i `public/img/projects/<id>/`). Testerna verifierar att alla bildsökvägar finns.
- **Ny kompetens** → `src/data/skills.ts`
- **Tidslinjen** → `src/data/experience.ts`
- **Chat-svar offline** → `src/data/chatKb.ts`
- **Nytt CV** → ersätt `public/cv/CV_Klas_Olsson.pdf`

---

© Klas Olsson · Byggd med React · TypeScript · Three.js · WebAudio
