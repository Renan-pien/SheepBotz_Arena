import { expect, it } from 'vitest';
import { createControllerRandom } from '../../../src/core/controller/random';

it.each([
  [0, 0, [1013904223, 1196435762, 3519870697]],
  [1, 0, [1015568748, 1586005467, 2165703038]],
  [1, 1, [1122647505, 6184188, 4007793707]],
  [4294967295, 7, [1761790997, 2633018992, 588803855]],
])(
  'reproduz os três primeiros valores para semente %i, posição %i',
  (seed, index, expected) => {
    const draw = createControllerRandom(seed, index);
    const values = Array.from({ length: 3 }, draw);
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
    expect(values.map((value) => value * 4294967296)).toEqual(expected);
  },
);
