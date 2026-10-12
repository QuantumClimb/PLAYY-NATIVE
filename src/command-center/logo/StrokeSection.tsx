import React from 'react';
import { BrandStroke } from '../../lib/brand/brand';
import { LogoArt } from '../../lib/brand/logoArt';
import { SliderRow } from './SliderRow';

interface StrokeSectionProps {
  stroke: BrandStroke;
  onChange: (stroke: BrandStroke) => void;
}

/** The stroke the logo gets on the finished artwork, with a preview on colour and on the coloring page. */
export const StrokeSection: React.FC<StrokeSectionProps> = ({ stroke, onChange }) => (
  <section className="rounded-xl border border-gray-300 p-4 space-y-3">
    <div className="font-semibold">On the finished artwork: stroke</div>
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <div className="text-xs text-gray-500 mb-1">Color artwork</div>
        <div
          className="rounded-2xl p-6 flex items-center justify-center h-44"
          style={{
            background: 'repeating-linear-gradient(45deg, #5db7ee 0 24px, #ffd92e 24px 48px, #f49ac1 48px 72px)',
          }}
        >
          <LogoArt mode="color" stroke={stroke} className="h-28 w-full" />
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-1">Black-and-white coloring page</div>
        <div className="rounded-2xl p-6 flex items-center justify-center h-44 bg-white">
          <LogoArt mode="line" stroke={stroke} className="h-28 w-full" />
        </div>
      </div>
    </div>
    <label className="flex items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={stroke.enabled}
        onChange={(e) => onChange({ ...stroke, enabled: e.target.checked })}
      />
      Stroke around the logo
    </label>
    <SliderRow
      label="Width (% of logo height)"
      value={stroke.width}
      min={0}
      max={8}
      step={0.1}
      disabled={!stroke.enabled}
      onChange={(width) => onChange({ ...stroke, width })}
    />
    <label className="flex items-center gap-3 text-sm">
      <span className="w-40">Color (color artwork)</span>
      <input
        type="color"
        value={stroke.color}
        disabled={!stroke.enabled}
        onChange={(e) => onChange({ ...stroke, color: e.target.value })}
        className="h-8 w-12 bg-transparent"
      />
    </label>
    <p className="text-xs text-gray-500">
      Color artwork gets a rounded edge around the whole logo. The coloring page gets a black line around every shape
      (always at least a thin one, so the white shapes show on white paper).
    </p>
  </section>
);
