import React, { useState, useEffect } from 'react';
import { Cloud, Flower2, Printer, Star } from 'lucide-react';
import {
  ALL_SCENES,
  BackgroundFit,
  BackgroundPosition,
  BackgroundType,
  BadgePlacement,
  IntroBadgeGap,
  IntroButtonSize,
  IntroFloatAnimation,
  SceneBackgroundSetting,
  SceneId,
  StartButtonPlacement,
} from '../lib/backgrounds/types';
import { useSceneBackgrounds } from '../lib/backgrounds/context';

const POSITION_OPTIONS: { id: BackgroundPosition; label: string }[] = [
  { id: 'top left', label: 'Top Left' },
  { id: 'top', label: 'Top' },
  { id: 'top right', label: 'Top Right' },
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' },
  { id: 'bottom left', label: 'Bottom Left' },
  { id: 'bottom', label: 'Bottom' },
  { id: 'bottom right', label: 'Bottom Right' },
];

const BADGE_PLACEMENT_OPTIONS: { id: BadgePlacement; label: string }[] = [
  { id: 'below-start-button', label: 'Below Start Button (Recommended)' },
  { id: 'top-center', label: 'Top Center (Default)' },
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'bottom-center', label: 'Bottom Center' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'hidden', label: 'Hidden' },
];

const START_BUTTON_PLACEMENT_OPTIONS: { id: StartButtonPlacement; label: string }[] = [
  { id: 'right-center', label: 'Right Center (Recommended)' },
  { id: 'center', label: 'Center' },
  { id: 'bottom-center', label: 'Bottom Center' },
  { id: 'bottom-right', label: 'Bottom Right' },
  { id: 'top-right', label: 'Top Right' },
];

const START_BUTTON_SIZE_OPTIONS: { id: IntroButtonSize; label: string }[] = [
  { id: 'extra-large', label: 'Extra Large (Recommended)' },
  { id: 'large', label: 'Large' },
];

const BADGE_GAP_OPTIONS: { id: IntroBadgeGap; label: string }[] = [
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'relaxed', label: 'Relaxed' },
];

const FLOAT_ANIMATION_OPTIONS: { id: IntroFloatAnimation; label: string }[] = [
  { id: 'gentle', label: 'Gentle Float (Recommended)' },
  { id: 'slow', label: 'Slow Float' },
  { id: 'none', label: 'Off' },
];

const PREVIEW_BADGES = [
  { label: 'Choose', Icon: Star, iconClass: 'bg-amber-100 text-amber-500', fillClass: 'fill-amber-400 stroke-amber-500' },
  { label: 'Color', Icon: Cloud, iconClass: 'bg-cyan-100 text-cyan-500', fillClass: 'fill-cyan-400 stroke-cyan-500' },
  { label: 'Play', Icon: Flower2, iconClass: 'bg-purple-100 text-purple-500', fillClass: 'fill-purple-400 stroke-purple-500' },
  { label: 'Print', Icon: Printer, iconClass: 'bg-sky-100 text-sky-500', fillClass: 'fill-sky-400 stroke-sky-500' },
];

export const SceneBackgroundsPanel: React.FC = () => {
  const { scenes, refreshBackgrounds } = useSceneBackgrounds();
  const [selectedSceneId, setSelectedSceneId] = useState<SceneId>('intro');

  // Form state for selected scene
  const [bgType, setBgType] = useState<BackgroundType>('default');
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [fallbackMediaId, setFallbackMediaId] = useState<string | null>(null);
  const [fallbackMediaUrl, setFallbackMediaUrl] = useState<string | null>(null);
  const [fit, setFit] = useState<BackgroundFit>('cover');
  const [position, setPosition] = useState<BackgroundPosition>('center');
  const [overlayColor, setOverlayColor] = useState<string>('#000000');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0);
  const [badgePlacement, setBadgePlacement] = useState<BadgePlacement>('below-start-button');
  const [startButtonPlacement, setStartButtonPlacement] = useState<StartButtonPlacement>('right-center');
  const [startButtonSize, setStartButtonSize] = useState<IntroButtonSize>('extra-large');
  const [badgeGap, setBadgeGap] = useState<IntroBadgeGap>('comfortable');
  const [floatAnimation, setFloatAnimation] = useState<IntroFloatAnimation>('gentle');

  // Status & Progress feedback
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<'main' | 'fallback' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedSceneDef = ALL_SCENES.find((s) => s.id === selectedSceneId)!;
  const previewButtonSizeClass = startButtonSize === 'extra-large'
    ? 'w-full px-3 py-3 text-[12px]'
    : 'w-full px-2.5 py-2 text-[10px]';
  const previewBadgeGapClass = badgeGap === 'relaxed' ? 'mt-3' : 'mt-2';
  const previewFloatClass = floatAnimation === 'gentle'
    ? 'playys-intro-float'
    : floatAnimation === 'slow'
    ? 'playys-intro-float-slow'
    : '';

  // Load current scene settings into form state
  useEffect(() => {
    const s = scenes[selectedSceneId];
    if (s) {
      setBgType(s.bgType || 'default');
      setMediaId(s.mediaId || null);
      setMediaUrl(s.mediaUrl || null);
      setFallbackMediaId(s.fallbackMediaId || null);
      setFallbackMediaUrl(s.fallbackMediaUrl || null);
      setFit(s.fit || 'cover');
      setPosition(s.position || 'center');
      setOverlayColor(s.overlayColor || '#000000');
      setOverlayOpacity(s.overlayOpacity ?? 0);
      setBadgePlacement(s.badgePlacement || 'top-center');
      setStartButtonPlacement(s.startButtonPlacement || 'right-center');
      setStartButtonSize(s.startButtonSize || 'extra-large');
      setBadgeGap(s.badgeGap || 'comfortable');
      setFloatAnimation(s.floatAnimation || 'gentle');
    } else {
      setBgType('default');
      setMediaId(null);
      setMediaUrl(null);
      setFallbackMediaId(null);
      setFallbackMediaUrl(null);
      setFit('cover');
      setPosition('center');
      setOverlayColor('#000000');
      setOverlayOpacity(0);
      setBadgePlacement('below-start-button');
      setStartButtonPlacement('right-center');
      setStartButtonSize('extra-large');
      setBadgeGap('comfortable');
      setFloatAnimation('gentle');
    }
    setError(null);
    setSuccessMsg(null);
  }, [selectedSceneId, scenes]);

  // Upload handler for images and videos
  const handleFileUpload = async (file: File, target: 'main' | 'fallback') => {
    setError(null);
    setSuccessMsg(null);
    setUploadingTarget(target);
    setUploadProgress(10);

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (target === 'fallback' && !isImage) {
      setError('Fallback file must be an image (PNG, JPG, WebP).');
      setUploadingTarget(null);
      setUploadProgress(null);
      return;
    }

    if (!isImage && !isVideo) {
      setError('Unsupported file type. Please upload PNG, JPG, WebP images or MP4, WebM videos.');
      setUploadingTarget(null);
      setUploadProgress(null);
      return;
    }

    const maxBytes = isVideo ? 30 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(
        `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(
          1
        )}MB) exceeds maximum limit of ${isVideo ? '30MB for video' : '10MB for image'}.`
      );
      setUploadingTarget(null);
      setUploadProgress(null);
      return;
    }

    try {
      setUploadProgress(30);
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round(30 + (e.loaded / e.total) * 40));
        }
      };

      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1]);
        };
        reader.onerror = () => reject(new Error('Failed to read file bytes'));
        reader.readAsDataURL(file);
      });

      setUploadProgress(85);

      const res = await fetch('/api/cc/scene-backgrounds/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          base64,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadProgress(100);

      if (target === 'main') {
        setMediaId(data.mediaId);
        setMediaUrl(data.mediaUrl);
        setBgType(isVideo ? 'video' : 'image');
        setSuccessMsg(`Uploaded ${file.name} successfully! Click "Save Settings" to apply.`);
      } else {
        setFallbackMediaId(data.mediaId);
        setFallbackMediaUrl(data.mediaUrl);
        setSuccessMsg(`Uploaded fallback image ${file.name} successfully!`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingTarget(null);
      setUploadProgress(null);
    }
  };

  // Save current settings to server DB
  const handleSave = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSaving(true);

    try {
      const res = await fetch(`/api/cc/scene-backgrounds/${selectedSceneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bgType,
          mediaId,
          fallbackMediaId,
          fit,
          position,
          overlayColor,
          overlayOpacity,
          badgePlacement,
          startButtonPlacement,
          startButtonSize,
          badgeGap,
          floatAnimation,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save scene settings');

      await refreshBackgrounds();
      setSuccessMsg(`Scene "${selectedSceneDef.label}" background settings saved!`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset selected scene to default
  const handleReset = async () => {
    if (!window.confirm(`Reset "${selectedSceneDef.label}" background to existing default?`)) return;

    setError(null);
    setSuccessMsg(null);
    setIsSaving(true);

    try {
      const res = await fetch(`/api/cc/scene-backgrounds/${selectedSceneId}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset scene');

      await refreshBackgrounds();
      setSuccessMsg(`Reset "${selectedSceneDef.label}" to default.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Storage Information */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🖼️</span> Scene Backgrounds CMS
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Customize background images, videos, and overlays for each kiosk scene.
          </p>
        </div>
        <div className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-2 rounded-lg space-y-1 shrink-0">
          <div><span className="font-bold text-teal-400">Supported Formats:</span> Images (PNG, JPG, WebP) | Videos (MP4, WebM)</div>
          <div><span className="font-bold text-teal-400">Upload Limits:</span> Max 10MB per Image | Max 30MB per Video</div>
        </div>
      </div>

      {/* Notifications Banner */}
      {error && (
        <div className="rounded-xl bg-red-950/80 border border-red-800 p-4 text-sm text-red-200 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button type="button" onClick={() => setError(null)} className="text-xs text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl bg-emerald-950/80 border border-emerald-800 p-4 text-sm text-emerald-200 flex items-center justify-between">
          <span>✅ {successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-xs text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 2. Scene Selector Cards Grid */}
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-bold">
          Select Scene ({ALL_SCENES.length})
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ALL_SCENES.map((scene) => {
            const currentSetting = scenes[scene.id];
            const isSelected = scene.id === selectedSceneId;
            const currentType = currentSetting?.bgType || 'default';

            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => setSelectedSceneId(scene.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-teal-950/60 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-white line-clamp-1">{scene.label}</div>
                  <div className="text-xs text-slate-400 line-clamp-1">{scene.description}</div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    ID: {scene.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      currentType === 'video'
                        ? 'bg-purple-900 text-purple-200'
                        : currentType === 'image'
                        ? 'bg-blue-900 text-blue-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {currentType === 'video' ? '📹 Video' : currentType === 'image' ? '🖼️ Image' : 'Default'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Scene Background Editor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        {/* LEFT COLUMN: Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>⚙️</span> Background Settings for: <span className="text-teal-400">{selectedSceneDef.label}</span>
            </h3>
            <p className="text-xs text-slate-400">{selectedSceneDef.description}</p>
          </div>

          {/* Background Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Background Source</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'default', label: 'Existing Default', desc: 'Default background' },
                { id: 'image', label: 'Custom Image', desc: 'PNG, JPG, WebP' },
                { id: 'video', label: 'Custom Video', desc: 'MP4, WebM' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setBgType(t.id as BackgroundType)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    bgType === t.id
                      ? 'bg-teal-900/50 border-teal-500 text-white font-bold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-sm">{t.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Media Uploads Section */}
          {bgType !== 'default' && (
            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {bgType === 'video' ? 'Video File' : 'Image File'} Upload
                </label>
                {mediaUrl && (
                  <span className="text-xs text-emerald-400 font-mono">
                    ✓ {mediaId}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm text-slate-200 cursor-pointer flex items-center justify-center gap-2 transition-all">
                  <span>📁</span>
                  <span>Select & Upload {bgType === 'video' ? 'Video (MP4/WebM)' : 'Image (PNG/JPG/WebP)'}</span>
                  <input
                    type="file"
                    accept={bgType === 'video' ? '.mp4,.webm,video/mp4,video/webm' : '.png,.jpg,.jpeg,.webp,image/*'}
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = '';
                      if (f) handleFileUpload(f, 'main');
                    }}
                  />
                </label>
              </div>

              {/* Upload Progress Bar */}
              {uploadingTarget === 'main' && uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-teal-400">
                    <span>Uploading file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Optional Poster / Fallback Image for Video */}
              {bgType === 'video' && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Poster / Fallback Image (Optional)
                    </label>
                    {fallbackMediaUrl && (
                      <span className="text-xs text-emerald-400 font-mono">
                        ✓ {fallbackMediaId}
                      </span>
                    )}
                  </div>
                  <label className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 cursor-pointer flex items-center justify-center gap-2">
                    <span>🖼️</span>
                    <span>Upload Poster Image (PNG, JPG, WebP)</span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,image/*"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = '';
                        if (f) handleFileUpload(f, 'fallback');
                      }}
                    />
                  </label>
                  {uploadingTarget === 'fallback' && uploadProgress !== null && (
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Fit & Focal Position Controls */}
          {bgType !== 'default' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fit toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Display Fit</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['cover', 'contain'] as BackgroundFit[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFit(f)}
                      className={`py-2 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
                        fit === f ? 'bg-teal-900 border-teal-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Focal Position Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Focal Point Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as BackgroundPosition)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {POSITION_OPTIONS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Overlay Color & Opacity Slider */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Content Readability Overlay
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={overlayColor}
                  onChange={(e) => setOverlayColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer p-1"
                />
                <div>
                  <div className="text-xs font-bold text-white">Overlay Color</div>
                  <input
                    type="text"
                    value={overlayColor}
                    onChange={(e) => setOverlayColor(e.target.value)}
                    className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-mono text-slate-300 mt-0.5"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Overlay Opacity</span>
                  <span className="font-mono font-bold text-teal-400">{Math.round(overlayOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Intro UI Placement Controls (Only for Intro / Startup page) */}
          {selectedSceneId === 'intro' && (
            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <span>🎨</span> Startup Page UI Placement Controls
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Intro Badge Placement */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Intro Badge Position</label>
                  <select
                    value={badgePlacement}
                    onChange={(e) => setBadgePlacement(e.target.value as BadgePlacement)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                  >
                    {BADGE_PLACEMENT_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Button Placement */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Start Button Position</label>
                  <select
                    value={startButtonPlacement}
                    onChange={(e) => setStartButtonPlacement(e.target.value as StartButtonPlacement)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                  >
                    {START_BUTTON_PLACEMENT_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Start Button Size</label>
                  <select
                    value={startButtonSize}
                    onChange={(e) => setStartButtonSize(e.target.value as IntroButtonSize)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                  >
                    {START_BUTTON_SIZE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Badge Spacing</label>
                  <select
                    value={badgeGap}
                    onChange={(e) => setBadgeGap(e.target.value as IntroBadgeGap)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                  >
                    {BADGE_GAP_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Button Float Animation</label>
                  <select
                    value={floatAnimation}
                    onChange={(e) => setFloatAnimation(e.target.value as IntroFloatAnimation)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                  >
                    {FLOAT_ANIMATION_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 px-6 rounded-xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <span>💾</span>
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>🔄</span>
              <span>Reset Scene</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-3">
          <div className="w-full text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Live Scene Preview</span>
            <span className="text-[10px] text-teal-400 font-mono">16:9 Viewport</span>
          </div>

          <div className="w-full aspect-video bg-slate-950 rounded-xl border-2 border-slate-700 overflow-hidden relative shadow-2xl flex flex-col items-center justify-between p-4 select-none">
            {/* Background preview layer */}
            {bgType === 'video' && mediaUrl ? (
              <video
                src={mediaUrl}
                poster={fallbackMediaUrl || undefined}
                autoPlay
                loop
                muted
                playsInline
                style={{ objectFit: fit, objectPosition: position }}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
            ) : bgType === 'image' && mediaUrl ? (
              <img
                src={mediaUrl}
                alt=""
                style={{ objectFit: fit, objectPosition: position }}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
            ) : (
              <>
                {selectedSceneId === 'intro' ? (
                  <img
                    src="/assets/Cheerful-Mascot-Castle-Adventure.png"
                    alt="Start up Hero Background"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-indigo-950 via-slate-950 to-purple-950 pointer-events-none" />
                )}
              </>
            )}

            {/* Overlay preview layer */}
            {overlayOpacity > 0 && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity z-10"
                style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
              />
            )}

            {/* UI Mockup Placeholder overlay */}
            <div className="relative z-20 w-full h-full pointer-events-none">
              {/* Badges preview */}
              {selectedSceneId === 'intro' && badgePlacement !== 'hidden' && badgePlacement !== 'below-start-button' && (
                <div
                  className={`absolute z-30 transition-all duration-300 flex items-center gap-1 bg-slate-900/80 backdrop-blur border border-slate-700 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow ${
                    badgePlacement === 'top-center'
                      ? 'top-2 left-1/2 -translate-x-1/2'
                      : badgePlacement === 'top-left'
                      ? 'top-2 left-2'
                      : badgePlacement === 'top-right'
                      ? 'top-2 right-2'
                      : badgePlacement === 'bottom-center'
                      ? 'bottom-2 left-1/2 -translate-x-1/2'
                      : badgePlacement === 'bottom-left'
                      ? 'bottom-2 left-2'
                      : 'bottom-2 right-2'
                  }`}
                >
                  <img src="/assets/logo.png" alt="" className="h-3 w-auto object-contain inline-block" />
                  <span>PLAYYS STATION</span>
                </div>
              )}

              {/* Start Button preview position */}
              <div
                className={`absolute z-30 transition-all duration-300 ${
                  selectedSceneId === 'intro'
                    ? badgePlacement === 'below-start-button'
                      ? startButtonPlacement === 'right-center'
                        ? 'right-3 top-1/2 -translate-y-1/2 w-[44%] max-w-[240px] flex flex-col items-center'
                        : startButtonPlacement === 'center'
                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44%] max-w-[240px] flex flex-col items-center'
                        : startButtonPlacement === 'bottom-center'
                        ? 'bottom-3 left-1/2 -translate-x-1/2 w-[44%] max-w-[240px] flex flex-col items-center'
                        : startButtonPlacement === 'bottom-right'
                        ? 'bottom-3 right-3 w-[44%] max-w-[240px] flex flex-col items-center'
                        : 'top-3 right-3 w-[44%] max-w-[240px] flex flex-col items-center'
                      : startButtonPlacement === 'right-center'
                      ? 'right-3 top-1/2 -translate-y-1/2'
                      : startButtonPlacement === 'center'
                      ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                      : startButtonPlacement === 'bottom-center'
                      ? 'bottom-3 left-1/2 -translate-x-1/2'
                      : startButtonPlacement === 'bottom-right'
                      ? 'bottom-3 right-3'
                      : 'top-3 right-3'
                    : 'bottom-3 left-1/2 -translate-x-1/2'
                }`}
              >
                <div className={`${previewButtonSizeClass} rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black uppercase tracking-wider shadow-[0_8px_16px_rgba(245,158,11,0.35)] flex items-center justify-center gap-1 border border-yellow-200 ${previewFloatClass}`}>
                  <span className="w-2 h-2 rounded-full bg-white flex items-center justify-center text-[7px] text-amber-600 font-bold">▶</span>
                  <span>Tap to Start!</span>
                </div>
                {selectedSceneId === 'intro' && badgePlacement === 'below-start-button' && (
                  <div className={`absolute left-1/2 top-full z-10 flex max-w-full -translate-x-1/2 flex-wrap sm:flex-nowrap justify-center gap-1.5 sm:gap-2 ${previewBadgeGapClass}`}>
                    {PREVIEW_BADGES.map(({ label, Icon, iconClass, fillClass }) => (
                      <div key={label} className="flex min-w-[38px] sm:min-w-[48px] flex-col items-center justify-center rounded-lg border border-slate-100 bg-white px-1.5 py-1.5 shadow-sm">
                        <span className={`mb-0.5 flex h-4 w-4 items-center justify-center rounded-md ${iconClass}`}>
                          <Icon className={`h-3 w-3 ${fillClass}`} />
                        </span>
                        <span className="text-[7px] sm:text-[8px] font-black uppercase text-slate-800">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center max-w-xs">
            Preview shows how <span className="text-slate-200">{selectedSceneDef.label}</span> will look on the kiosk screen.
          </div>
        </div>
      </div>
    </div>
  );
};
