import { describe, expect, it } from 'vitest';
import { colorPanels, regionLabel } from '../../src/kiosk/steps/colorPanels';
import type { PartsConfig } from '../../src/lib/assets/svgParts';

const part = { mode: 'fixed' as const, bw: 'auto' as const };
const body = {
  parts: Object.fromEntries(
    ['soles', 'pose_outline', 'gloves', 'hoodie', 'trim', 'trousers', 'strange_part'].map((k) => [k, part]),
  ) as PartsConfig,
};

describe('colorPanels', () => {
  it('simple mode has a main and a secondary colour panel showing the chosen colors', () => {
    const panels = colorPanels('simple', body, { main: '#ff0000', highlight: '#00ff00' });
    expect(panels.map((p) => [p.key, p.value])).toEqual([
      ['main', '#ff0000'],
      ['highlight', '#00ff00'],
    ]);
  });

  it('advanced mode starts with the head, then the parts in a sensible order, without gloves and outlines', () => {
    const panels = colorPanels('advanced', body);
    expect(panels.map((p) => p.key)).toEqual(['head', 'hoodie', 'trousers', 'trim', 'soles', 'strange_part']);
    expect(panels.find((p) => p.key === 'soles')?.label).toBe('Shoe Soles');
  });

  it('shows the color each part currently has', () => {
    const panels = colorPanels('advanced', body, { mode: 'advanced', parts: { hoodie: '#123456' } });
    expect(panels.find((p) => p.key === 'hoodie')?.value).toBe('#123456');
  });
});

describe('regionLabel', () => {
  it('has friendly names and tidies the rest', () => {
    expect(regionLabel('tassles')).toBe('Hoodie Strings');
    expect(regionLabel('strange_part')).toBe('Strange Part');
  });
});
