import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {CommandCenter} from './command-center/CommandCenter.tsx';
import {AssetLibraryProvider} from './lib/assets/library.tsx';
import './index.css';

// Admin lives at an unlisted path; the kiosk UI never links to it.
const isCommandCenter = window.location.pathname.startsWith('/command-center');

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isCommandCenter ? <CommandCenter /> : <AssetLibraryProvider><App /></AssetLibraryProvider>}</StrictMode>,
);
