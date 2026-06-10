import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

console.log(
  '%c\n  KLAS://OLSSON — THE CONSTRUCT v5.0\n  Wake up, recruiter…\n  The code you are looking for: https://github.com/klasolsson81\n',
  'color:#2eff7e; font-family:monospace; font-size:13px;',
);

createRoot(document.getElementById('root')!).render(<App />);
