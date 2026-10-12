import React from 'react';
import { PlayyScene } from '../../components/playys/PlayyScene';
import { copy } from '../copy';
import type { StepProps } from './types';

const PAGES = [
  { mode: 'line', label: copy.preview.coloring },
  { mode: 'color', label: copy.preview.colour },
] as const;

/** The black-and-white coloring page and the full-colour page side by side. */
export const PreviewStep: React.FC<StepProps> = ({ config }) => (
  <div className="preview-pair">
    {PAGES.map(({ mode, label }) => (
      <div key={mode} className={`preview-card preview-card-${mode}`}>
        <div className="preview-card-label">{label}</div>
        <div className="preview-card-art">
          <PlayyScene config={config} mode={mode} finish className="h-full w-full" />
        </div>
      </div>
    ))}
  </div>
);
