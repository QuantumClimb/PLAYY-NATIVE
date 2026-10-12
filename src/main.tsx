import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { CommandCenter } from './command-center/shell/CommandCenter.tsx';
import { AssetLibraryProvider } from './lib/assets/library.tsx';
import { SfxProvider } from './lib/sfx/engine.tsx';
import { SceneBackgroundsProvider } from './lib/backgrounds/context.tsx';
import './index.css';

// Admin lives at an unlisted path; the kiosk UI never links to it.
const isCommandCenter = window.location.pathname.startsWith('/command-center');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SceneBackgroundsProvider>
      {isCommandCenter ? (
        <CommandCenter />
      ) : (
        <SfxProvider>
          <AssetLibraryProvider>
            <App />
          </AssetLibraryProvider>
        </SfxProvider>
      )}
    </SceneBackgroundsProvider>
  </StrictMode>,
);
