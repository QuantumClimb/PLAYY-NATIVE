import React from 'react';
import { Cloud, Flower2, Printer, Star } from 'lucide-react';
import { BadgePlacement, SceneId, StartButtonPlacement } from '../../lib/backgrounds/types';
import { mediaUrl } from '../../data/media';
import { SceneForm } from './sceneForm';

const PREVIEW_BADGES = [
  {
    label: 'Choose',
    Icon: Star,
    iconClass: 'bg-amber-100 text-amber-500',
    fillClass: 'fill-amber-400 stroke-amber-500',
  },
  { label: 'Color', Icon: Cloud, iconClass: 'bg-cyan-100 text-cyan-500', fillClass: 'fill-cyan-400 stroke-cyan-500' },
  {
    label: 'Play',
    Icon: Flower2,
    iconClass: 'bg-purple-100 text-purple-500',
    fillClass: 'fill-purple-400 stroke-purple-500',
  },
  { label: 'Print', Icon: Printer, iconClass: 'bg-sky-100 text-sky-500', fillClass: 'fill-sky-400 stroke-sky-500' },
];

const BADGE_CORNER: Record<Exclude<BadgePlacement, 'below-start-button' | 'hidden'>, string> = {
  'top-center': 'top-2 left-1/2 -translate-x-1/2',
  'top-left': 'top-2 left-2',
  'top-right': 'top-2 right-2',
  'bottom-center': 'bottom-2 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-2 left-2',
  'bottom-right': 'bottom-2 right-2',
};

const BUTTON_SPOT: Record<StartButtonPlacement, string> = {
  'right-center': 'right-3 top-1/2 -translate-y-1/2',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'bottom-center': 'bottom-3 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-3 right-3',
  'top-right': 'top-3 right-3',
};

const BELOW_BUTTON_COLUMN = 'w-[44%] max-w-[240px] flex flex-col items-center';
const FLOAT_CLASS = { gentle: 'playys-intro-float', slow: 'playys-intro-float-slow', none: '' };

/** Where the start button sits in the mock-up: on the intro screen it follows the layout, elsewhere it is at the bottom. */
function buttonPlacementClass(sceneId: SceneId, form: SceneForm): string {
  if (sceneId !== 'intro') return 'bottom-3 left-1/2 -translate-x-1/2';
  const spot = BUTTON_SPOT[form.startButtonPlacement];
  return form.badgePlacement === 'below-start-button' ? `${spot} ${BELOW_BUTTON_COLUMN}` : spot;
}

const Background: React.FC<{ sceneId: SceneId; form: SceneForm }> = ({ sceneId, form }) => {
  const src = form.mediaId ? mediaUrl(form.mediaId) : null;
  const poster = form.fallbackMediaId ? mediaUrl(form.fallbackMediaId) : undefined;
  const fill = 'absolute inset-0 w-full h-full pointer-events-none';
  const fitting = { objectFit: form.fit, objectPosition: form.position } as const;

  if (form.bgType === 'video' && src) {
    return <video src={src} poster={poster} autoPlay loop muted playsInline style={fitting} className={fill} />;
  }
  if (form.bgType === 'image' && src) return <img src={src} alt="" style={fitting} className={fill} />;
  if (sceneId === 'intro') {
    return (
      <img
        src="/assets/Cheerful-Mascot-Castle-Adventure.png"
        alt="Intro background"
        className={`${fill} object-cover`}
      />
    );
  }
  return <div className={`${fill} bg-gradient-to-b from-indigo-950 via-slate-950 to-purple-950`} />;
};

interface ScenePreviewProps {
  sceneId: SceneId;
  sceneLabel: string;
  form: SceneForm;
}

/** A 16:9 mock-up of the chosen scene with the current background, overlay and (on the intro) button and badges. */
export const ScenePreview: React.FC<ScenePreviewProps> = ({ sceneId, sceneLabel, form }) => {
  const isIntro = sceneId === 'intro';
  const badgesBelow = isIntro && form.badgePlacement === 'below-start-button';
  const cornerBadge =
    isIntro && form.badgePlacement !== 'hidden' && form.badgePlacement !== 'below-start-button'
      ? BADGE_CORNER[form.badgePlacement]
      : null;
  const buttonSize =
    form.startButtonSize === 'extra-large' ? 'w-full px-3 py-3 text-[12px]' : 'w-full px-2.5 py-2 text-[10px]';

  return (
    <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-3">
      <div className="w-full text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center justify-between">
        <span>Live Scene Preview</span>
        <span className="text-[10px] text-indigo-600 font-mono">16:9 Viewport</span>
      </div>

      <div className="w-full aspect-video bg-gray-50 rounded-xl border-2 border-gray-300 overflow-hidden relative shadow-2xl flex flex-col items-center justify-between p-4 select-none">
        <Background sceneId={sceneId} form={form} />

        {form.overlayOpacity > 0 && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity z-10"
            style={{ backgroundColor: form.overlayColor, opacity: form.overlayOpacity }}
          />
        )}

        <div className="relative z-20 w-full h-full pointer-events-none">
          {cornerBadge && (
            <div
              className={`absolute z-30 transition-all duration-300 flex items-center gap-1 bg-white backdrop-blur border border-gray-300 text-gray-900 text-[9px] font-semibold px-2 py-0.5 rounded-full shadow ${cornerBadge}`}
            >
              <img src="/assets/logo.png" alt="" className="h-3 w-auto object-contain inline-block" />
              <span>PLAYYS STATION</span>
            </div>
          )}

          <div className={`absolute z-30 transition-all duration-300 ${buttonPlacementClass(sceneId, form)}`}>
            <div
              className={`${buttonSize} rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-semibold uppercase tracking-wider shadow-[0_8px_16px_rgba(245,158,11,0.35)] flex items-center justify-center gap-1 border border-yellow-200 ${FLOAT_CLASS[form.floatAnimation]}`}
            >
              <span className="w-2 h-2 rounded-full bg-white flex items-center justify-center text-[7px] text-amber-600 font-semibold">
                ▶
              </span>
              <span>Tap to Start!</span>
            </div>
            {badgesBelow && (
              <div
                className={`absolute left-1/2 top-full z-10 flex max-w-full -translate-x-1/2 flex-wrap sm:flex-nowrap justify-center gap-1.5 sm:gap-2 ${form.badgeGap === 'relaxed' ? 'mt-3' : 'mt-2'}`}
              >
                {PREVIEW_BADGES.map(({ label, Icon, iconClass, fillClass }) => (
                  <div
                    key={label}
                    className="flex min-w-[38px] sm:min-w-[48px] flex-col items-center justify-center rounded-lg border border-slate-100 bg-white px-1.5 py-1.5 shadow-sm"
                  >
                    <span className={`mb-0.5 flex h-4 w-4 items-center justify-center rounded-md ${iconClass}`}>
                      <Icon className={`h-3 w-3 ${fillClass}`} />
                    </span>
                    <span className="text-[7px] sm:text-[8px] font-semibold uppercase text-gray-800">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-[11px] text-gray-500 text-center max-w-xs">
        Preview shows how <span className="text-gray-800">{sceneLabel}</span> will look on the kiosk screen.
      </div>
    </div>
  );
};
