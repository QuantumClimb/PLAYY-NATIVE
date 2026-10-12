import React from 'react';
import { IntroBadgesPanel } from '../IntroBadgesPanel';
import { LogoPanel } from '../logo/LogoPanel';
import { PowerQuizPanel } from '../power-quiz/PowerQuizPanel';
import { ProgressTabsPanel } from '../ProgressTabsPanel';
import { SceneBackgroundsPanel } from '../scene-backgrounds/SceneBackgroundsPanel';
import { ShareSettingsPanel } from '../ShareSettingsPanel';
import { SoundsPanel } from '../sounds/SoundsPanel';
import { TrumpCardPanel } from '../TrumpCardPanel';
import { UsersPanel } from '../UsersPanel';

export type TabId =
  | 'characters'
  | 'scene-backgrounds'
  | 'intro-badges'
  | 'progress-tabs'
  | 'trump-card'
  | 'users'
  | 'share'
  | 'power-quiz'
  | 'logo'
  | 'sounds';

interface Tab {
  id: TabId;
  label: string;
  /** The panel to show. The Characters tab is drawn by the shell itself, because it keeps its state between visits. */
  Panel?: React.FC;
}

/** The sections of the command center, in the order they appear. */
export const TABS: Tab[] = [
  { id: 'characters', label: 'Characters' },
  { id: 'scene-backgrounds', label: 'Scene backgrounds', Panel: SceneBackgroundsPanel },
  { id: 'intro-badges', label: 'Intro badges', Panel: IntroBadgesPanel },
  { id: 'progress-tabs', label: 'Progress tabs', Panel: ProgressTabsPanel },
  { id: 'trump-card', label: 'Trump card', Panel: TrumpCardPanel },
  { id: 'users', label: 'Users', Panel: UsersPanel },
  { id: 'share', label: 'Share & email', Panel: ShareSettingsPanel },
  { id: 'power-quiz', label: 'Power quiz', Panel: PowerQuizPanel },
  { id: 'logo', label: 'Logo', Panel: LogoPanel },
  { id: 'sounds', label: 'Sounds', Panel: SoundsPanel },
];
