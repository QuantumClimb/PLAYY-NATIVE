import React, { useEffect, useState } from 'react';
import { BrandShadow, BrandStroke, logoSrc, refreshBrand, useBrand } from '../../lib/brand/brand';
import { api } from '../../data/api';
import { CmsPanel } from '../CmsPanel';
import { ShadowSection } from './ShadowSection';
import { StrokeSection } from './StrokeSection';

/** Command center: the logo (SVG slot), its tight drop shadow in the app, and its stroke on finished artwork. */
export const LogoPanel: React.FC = () => {
  const brand = useBrand();
  const [shadow, setShadow] = useState<BrandShadow>(brand.shadow);
  const [stroke, setStroke] = useState<BrandStroke>(brand.stroke);
  const [synced, setSynced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // Load the saved settings into the editable copies once
  useEffect(() => {
    void refreshBrand();
  }, []);
  useEffect(() => {
    if (synced) return;
    setShadow(brand.shadow);
    setStroke(brand.stroke);
    setSynced(true);
  }, [brand, synced]);

  const run = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      await action();
      await refreshBrand();
      setNote(done);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const upload = (file: File) =>
    run(async () => {
      if (!/\.svg$/i.test(file.name) && file.type !== 'image/svg+xml') throw new Error('Choose an .svg file.');
      await api.put('/api/cc/brand/logo', { svg: await file.text() });
    }, 'Logo replaced. The kiosk shows it the next time a page loads.');
  const useBuiltIn = () => run(() => api.put('/api/cc/brand/logo', { svg: null }), 'Back to the built-in logo.');
  const save = () => run(() => api.put('/api/cc/brand/settings', { shadow, stroke }), 'Saved.');

  return (
    <CmsPanel
      title="Logo"
      description={`Used in the app (intro screen and the creation-screen header) and on the finished artwork. Currently: ${brand.logoUrl ? 'your uploaded SVG' : 'the built-in SVG'}.`}
      error={error}
      note={note}
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="cc-btn cc-btn-primary cursor-pointer">
          Upload SVG logo
          <input
            type="file"
            accept=".svg,image/svg+xml"
            hidden
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void upload(file);
            }}
          />
        </label>
        {brand.logoUrl && (
          <button type="button" onClick={useBuiltIn} disabled={busy} className="cc-btn">
            Go back to the built-in logo
          </button>
        )}
      </div>
      <ul className="text-xs text-gray-500 list-disc pl-5 space-y-0.5">
        <li>
          Name the layers: the black-and-white version keeps dark layers (eyes, boxes) black and turns the colored ones
          white.
        </li>
        <li>
          Convert text to outlines. Flat vector shapes only: embedded bitmaps, scripts and external links are rejected.
          Under 2 MB.
        </li>
      </ul>

      <ShadowSection logoSrc={logoSrc(brand)} shadow={shadow} onChange={setShadow} />
      <StrokeSection stroke={stroke} onChange={setStroke} />

      <button type="button" onClick={save} disabled={busy} className="cc-btn cc-btn-primary">
        Save logo settings
      </button>
    </CmsPanel>
  );
};
