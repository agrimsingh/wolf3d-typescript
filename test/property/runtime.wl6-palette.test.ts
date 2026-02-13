import { describe, expect, it } from 'vitest';
import { wl6PaletteIndexToRgb } from '../../src/runtime/wl6Palette';

describe('wl6 palette mapping', () => {
  it('maps known reference colors', () => {
    expect(wl6PaletteIndexToRgb(0)).toEqual([0, 0, 0]);
    expect(wl6PaletteIndexToRgb(1)).toEqual([0, 0, 168]);
    expect(wl6PaletteIndexToRgb(25)).toEqual([112, 112, 112]);
    expect(wl6PaletteIndexToRgb(29)).toEqual([56, 56, 56]);
    expect(wl6PaletteIndexToRgb(255)).toEqual([152, 0, 136]);
  });
});

