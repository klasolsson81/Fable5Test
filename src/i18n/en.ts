import type { Dict } from './sv';

export const en: Dict = {
  brand: 'KLAS://OLSSON',
  tagline: '.NET SYSTEM DEVELOPER · AI',

  boot: {
    lines: [
      'KLAS://OS v5.0 — booting kernel .............. [OK]',
      'connecting to GBG node (57.7N, 11.9E) ........ [OK]',
      'loading profile: KLAS OLSSON ................. [OK]',
      'compiling 22 years of work experience ........ [OK]',
      'injecting C# · TypeScript · AI ............... [OK]',
      'WARNING: reality is optional.',
    ],
    skip: 'CLICK TO SKIP',
  },

  choice: {
    title: 'CHOOSE YOUR REALITY',
    subtitle: 'Welcome to my portfolio. The choice is yours — how do you want to experience my world?',
    red: {
      name: 'THE RED PILL',
      desc: '3D world, sound and full interactivity. Step down the rabbit hole.',
      cta: 'TAKE THE RED PATH',
    },
    white: {
      name: 'THE WHITE PILL',
      desc: 'Pure facts, zero effects, print-friendly. For people short on time.',
      cta: 'TAKE THE WHITE PATH',
    },
    hint: 'Recruiter in a hurry? The white pill was built for you.',
    audioHint: 'The red pill plays audio — you can mute it at any time.',
  },

  hud: {
    soundOn: 'SOUND: ON',
    soundOff: 'SOUND: OFF',
    switchReality: 'SWITCH REALITY',
    backToHub: 'BACK TO HUB',
    openChat: 'AI TERMINAL',
  },

  stations: {
    projects: { label: 'PROJECTS', tagline: 'Shipped products, not course exercises' },
    skills: { label: 'SKILLS', tagline: 'Stack, tools and levels' },
    experience: { label: 'EXPERIENCE', tagline: 'The journey: automotive → software' },
    chat: { label: 'AI TERMINAL', tagline: 'Ask the construct about Klas' },
    contact: { label: 'CONTACT', tagline: 'Form and direct links' },
    cv: { label: 'RESUME', tagline: 'Download as PDF' },
  },

  red: {
    entering: 'JACKING YOU INTO THE CONSTRUCT…',
    hint: 'CLICK A NODE — OR DRAG TO LOOK AROUND',
    sceneFallback: 'Your device cannot run the 3D mode. The white pill has been chosen for you.',
    rabbit: 'YOU FOLLOWED THE WHITE RABBIT',
  },

  panels: {
    close: 'CLOSE',
    esc: 'ESC',
  },

  projects: {
    intro: 'Real products with real users. Click a project for a deep dive.',
    open: 'DEEP DIVE',
    live: 'LIVE DEMO',
    repo: 'SOURCE CODE',
    confidential: 'Client work — the code is not public.',
    slide: 'SLIDE',
    of: 'OF',
    next: 'NEXT',
    prev: 'PREV',
    status: 'STATUS',
    stack: 'STACK',
    year: 'YEAR',
    role: 'ROLE',
    more: 'More projects on my GitHub →',
  },

  skills: {
    intro: 'Self-assessed level 1–5, calibrated against what I have actually shipped.',
    scale: 'SCALE (1–5)',
    competence: 'COMPETENCE',
    langTitle: 'LANGUAGES',
    toolsTitle: 'TOOLS & PLATFORMS',
  },

  experience: {
    intro: 'In 2024 I took the red pill for real: after 22 years in the automotive industry I went all in on software development.',
    liaTitle: 'SEEKING INTERNSHIP (LIA)',
    liaText: 'LIA 1: Aug 31 – Nov 6, 2026 · LIA 2: Mar 8 – Jun 11, 2027 · Gothenburg or remote. I also take consulting work alongside my studies.',
    liaCta: 'CONTACT ME',
  },

  contact: {
    intro: 'Fastest via email or LinkedIn. The form works too — it lands straight in my inbox.',
    name: 'NAME',
    email: 'EMAIL',
    message: 'MESSAGE',
    send: 'SEND TRANSMISSION',
    sending: 'SENDING…',
    sent: 'TRANSMISSION RECEIVED. I will get back to you within 24h.',
    error: 'Transmission failed. Opening your mail client instead…',
    mailtoNote: 'No server available — the form opens your mail client with everything pre-filled.',
    direct: 'DIRECT LINKS',
    required: 'Please fill in all fields.',
  },

  cv: {
    title: 'CURRICULUM VITAE',
    text: 'Full resume as PDF — .NET, AI integration, projects and education.',
    download: 'DOWNLOAD CV (PDF)',
    print: 'Tip: the white pill has a print-friendly dossier view.',
  },

  chat: {
    title: 'THE CONSTRUCT v5.0',
    subtitle: 'AI copy of Klas — ask about projects, stack, internships or background',
    placeholder: 'Type your question…',
    send: 'SEND',
    thinking: 'thinking…',
    offline: 'OFFLINE MODE: responses are generated locally without an AI server.',
    error: 'Connection lost. The construct answers in offline mode.',
    greeting:
      "Hi! I'm an AI copy of Klas Olsson, jacked into his portfolio. Ask me about the projects, the tech stack, the internship periods — or why a 45-year-old left the automotive industry for code.",
    suggestions: ['Who is Klas?', 'Tell me about JobbPilot', 'What stack do you use?', 'Open for internships?'],
  },

  white: {
    title: 'WHITE PILL DOSSIER',
    nav: {
      profile: 'PROFILE',
      skills: 'SKILLS',
      projects: 'PROJECTS',
      experience: 'EXPERIENCE',
      contact: 'CONTACT',
    },
    profileTitle: 'USER PROFILE',
    fields: {
      name: 'NAME',
      role: 'ROLE',
      age: 'AGE',
      city: 'LOCATION',
      status: 'STATUS',
      family: 'FAMILY',
      languages: 'LANGUAGES',
    },
    values: {
      status: 'Studying .NET · building products · seeking internship 2026/2027',
      family: 'Married, father',
      languages: 'Swedish / English',
    },
    projectsTitle: 'PROJECTS & LINKS',
    experienceTitle: 'EXPERIENCE & EDUCATION',
    skillsTitle: 'SKILLS MATRIX',
    contactTitle: 'CONTACT',
    cvLink: 'VIEW CV (PDF)',
    redLink: 'FEELING ADVENTUROUS? TAKE THE RED PILL →',
    print: 'PRINT DOSSIER',
  },

  footer: {
    built: 'Built with React · TypeScript · Three.js · WebAudio — by Klas, for you.',
  },

  a11y: {
    soundToggle: 'Toggle sound on/off',
    langToggle: 'Byt språk till svenska',
    closeModal: 'Close window',
    stationNav: 'Navigate to station',
  },
};
