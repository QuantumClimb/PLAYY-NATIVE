import React from 'react';
import { Play } from 'lucide-react';
import { SYNTHS } from '../../lib/sfx/synth';
import { playRef } from '../../lib/sfx/engine';
import { EVENT_DEFS, SFX_EVENTS, SfxEvent, SoundSettings } from '../../lib/sfx/settings';

interface ButtonSoundsTableProps {
  settings: SoundSettings;
  onChange: (event: SfxEvent, change: Partial<SoundSettings['events'][SfxEvent]>) => void;
}

/** One row per kiosk action: which sound it plays, how loud, and a play button to try it. */
export const ButtonSoundsTable: React.FC<ButtonSoundsTableProps> = ({ settings, onChange }) => (
  <section className="cc-card overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-200">
      <h3 className="text-sm">Buttons</h3>
    </div>
    <table className="cc-table w-full text-sm">
      <thead>
        <tr>
          <th>Action</th>
          <th>Sound</th>
          <th className="w-40">Volume</th>
          <th className="w-16" />
        </tr>
      </thead>
      <tbody>
        {SFX_EVENTS.map((event) => {
          const { sound, volume } = settings.events[event];
          return (
            <tr key={event}>
              <td>
                <div className="font-medium">{EVENT_DEFS[event].label}</div>
                <div className="text-xs cc-muted">{EVENT_DEFS[event].help}</div>
              </td>
              <td>
                <select
                  value={sound}
                  className="cc-select w-full"
                  onChange={(e) => onChange(event, { sound: e.target.value })}
                >
                  <option value="none">No sound</option>
                  <optgroup label="Built-in">
                    {SYNTHS.map((s) => (
                      <option key={s.id} value={`synth:${s.id}`}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>
                  {settings.custom.length > 0 && (
                    <optgroup label="Uploaded">
                      {settings.custom.map((c) => (
                        <option key={c.id} value={`custom:${c.id}`}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </td>
              <td>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => onChange(event, { volume: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </td>
              <td className="text-right">
                <button
                  type="button"
                  className="cc-btn cc-btn-sm"
                  onClick={() => playRef(sound, volume, settings)}
                  aria-label={`Play ${EVENT_DEFS[event].label}`}
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </section>
);
