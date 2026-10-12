import React from 'react';
import { BwRule, PartConfig, PartMode, deriveColor, normalizeColor, parseSvgAsset } from '../../../lib/assets/svgParts';
import { AssetDraft } from './useAssetDraft';

const field = 'bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 text-sm';
const Swatch: React.FC<{ color: string }> = ({ color }) => (
  <span className="inline-block w-5 h-5 rounded border border-gray-300 align-middle" style={{ background: color }} />
);

type ParsedPart = ReturnType<typeof parseSvgAsset>['parts'][number];

interface PartRowProps {
  part: ParsedPart;
  config: PartConfig;
  mainHex: string;
  onChange: (key: string, patch: Partial<PartConfig>) => void;
}

/** One named part: how its color is decided in colour mode and in black and white. */
const PartRow: React.FC<PartRowProps> = ({ part, config, mainHex, onChange }) => (
  <tr className="border-t border-gray-200">
    <td className="p-2">
      {part.id}
      {part.isGroup && <span className="text-gray-500 text-xs"> (group)</span>}
    </td>
    <td>
      <Swatch color={part.fill ?? 'transparent'} />
    </td>
    <td>
      <select
        value={config.mode}
        onChange={(e) => onChange(part.key, { ...config, mode: e.target.value as PartMode })}
        className={field}
      >
        <option value="main">Main color</option>
        <option value="derived">Derived from main</option>
        <option value="fixed">Fixed color</option>
        <option value="line">Line art</option>
      </select>
    </td>
    <td>
      {config.mode === 'derived' && (
        <span className="flex items-center gap-2">
          <input
            type="number"
            step={1}
            value={config.dL ?? 0}
            onChange={(e) => onChange(part.key, { ...config, dL: Number(e.target.value) })}
            className={`${field} w-20`}
          />
          <span className="text-xs text-gray-500">lightness</span>
          <Swatch color={deriveColor(mainHex, config.dL ?? 0)} />
        </span>
      )}
      {config.mode === 'fixed' && (
        <span className="flex items-center gap-2">
          <input
            type="color"
            value={normalizeColor(config.color) ?? normalizeColor(part.fill) ?? '#000000'}
            onChange={(e) => onChange(part.key, { ...config, color: e.target.value })}
            className="h-7 w-10 bg-transparent"
          />
          {config.color && (
            <button
              type="button"
              onClick={() => onChange(part.key, { ...config, color: undefined })}
              className="text-xs text-gray-500 underline"
            >
              use drawn
            </button>
          )}
        </span>
      )}
    </td>
    <td>
      <select
        value={config.bw}
        onChange={(e) => onChange(part.key, { ...config, bw: e.target.value as BwRule })}
        className={field}
      >
        <option value="auto">Auto (light becomes white)</option>
        <option value="white">White</option>
        <option value="keep">Keep drawn color</option>
      </select>
    </td>
  </tr>
);

/** Every named layer of the SVG with its color rules. */
export const PartsTable: React.FC<{ d: AssetDraft }> = ({ d }) => {
  const { parsed } = d;
  const anchors = parsed ? Object.entries(parsed.anchors) : [];
  return (
    <div>
      <div className="text-sm mb-2">Named parts ({parsed?.parts.length ?? 0})</div>
      <div className="overflow-x-auto rounded-xl border border-gray-300">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 text-left">
            <tr>
              <th className="p-2">Part</th>
              <th>Drawn</th>
              <th>Mode</th>
              <th>Setting</th>
              <th>Black &amp; white</th>
            </tr>
          </thead>
          <tbody>
            {parsed?.parts.map((part) => (
              <PartRow
                key={part.key}
                part={part}
                config={d.parts[part.key] ?? part.defaults}
                mainHex={d.mainHex}
                onChange={d.setPart}
              />
            ))}
          </tbody>
        </table>
      </div>
      {anchors.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          Anchors found: {anchors.map(([key, pt]) => `${key} (${pt.x.toFixed(0)}, ${pt.y.toFixed(0)})`).join(', ')}
        </div>
      )}
    </div>
  );
};
