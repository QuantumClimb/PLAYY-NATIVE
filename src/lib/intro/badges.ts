import { isHexColor } from '../../../shared/validation.mjs';
import { useServerSetting } from '../../data/useServerSetting';
import {
  Brush,
  Camera,
  Cloud,
  Crown,
  Flame,
  Flower2,
  Gamepad2,
  Gift,
  Heart,
  Image as ImageIcon,
  Moon,
  Music,
  Palette,
  PawPrint,
  Pencil,
  Printer,
  Rocket,
  Smile,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Wand2,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/** A shortcut badge on the intro screen. Static: it only tells kids what the kiosk does. */
export interface IntroBadgeData {
  id: string;
  label: string;
  /** `lucide:Star`, `media:<id>` (uploaded PNG/JPG/WebP) or `emoji:🎨` */
  icon: string;
  /** Accent color: border, icon and the darker edge are all derived from it */
  color: string;
}

export const MAX_INTRO_BADGES = 5;
export const MAX_BADGE_LABEL = 14;

export const DEFAULT_INTRO_BADGES: IntroBadgeData[] = [
  { id: 'choose', label: 'Choose', icon: 'lucide:Star', color: '#f6ae00' },
  { id: 'color', label: 'Color', icon: 'lucide:Palette', color: '#18a8ee' },
  { id: 'play', label: 'Play', icon: 'lucide:Gamepad2', color: '#ce3bc8' },
  { id: 'print', label: 'Print', icon: 'lucide:Printer', color: '#18cdb1' },
];

/** Icons offered in the command center (lucide names). */
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  Star,
  Palette,
  Gamepad2,
  Printer,
  Heart,
  Sparkles,
  Camera,
  Music,
  Rocket,
  Crown,
  Gift,
  Smile,
  Brush,
  Pencil,
  Image: ImageIcon,
  Trophy,
  Wand2,
  Sun,
  Moon,
  Cloud,
  Flame,
  Zap,
  PawPrint,
  Flower2,
};

export const COLOR_PRESETS = ['#f6ae00', '#18a8ee', '#ce3bc8', '#18cdb1', '#f26a21', '#e5385f', '#7c4dff', '#43b02a'];

/** Checks a list from the server or the CMS; returns null when it is not usable. */
export function cleanBadges(input: unknown): IntroBadgeData[] | null {
  if (!Array.isArray(input)) return null;
  const out = input
    .filter((b) => b && typeof b.label === 'string' && typeof b.icon === 'string')
    .slice(0, MAX_INTRO_BADGES)
    .map((b, i) => ({
      id: typeof b.id === 'string' && b.id ? b.id : `badge-${i + 1}`,
      label: b.label.slice(0, MAX_BADGE_LABEL),
      icon: b.icon,
      color: isHexColor(b.color) ? b.color : COLOR_PRESETS[i % COLOR_PRESETS.length],
    }));
  return out;
}

const INTRO_BADGES_SETTING = {
  url: '/api/intro-badges',
  key: 'badges',
  clean: (raw: unknown): IntroBadgeData[] | null => cleanBadges(raw) ?? DEFAULT_INTRO_BADGES,
};

/** The badges from the command center. `null` until they have loaded, so the intro screen never flashes the wrong ones. */
export const useIntroBadges = (): IntroBadgeData[] | null =>
  useServerSetting<IntroBadgeData[] | null>(INTRO_BADGES_SETTING, null);
