import { describe, expect, it } from 'vitest';
import { angleDiff, normalizeAngle } from '../../../src/core/math/angle';
import { expectClose } from '../../helpers/tolerance';

describe('ângulos', () => {
  it.each([
    [7, 0.716815],
    [3.5, -2.783185],
  ])('normaliza %s rad', (value, expected) => {
    expectClose(normalizeAngle(value), expected);
  });

  it.each([
    [-Math.PI, Math.PI],
    [Math.PI, Math.PI],
    [0, 0],
  ])('preserva os limites de (−π, π] para %s rad', (value, expected) => {
    expect(normalizeAngle(value)).toBe(expected);
  });

  it('calcula a menor diferença angular orientada', () => {
    expect(angleDiff(Math.PI, -Math.PI)).toBe(0);
    expectClose(angleDiff(-Math.PI + 0.1, Math.PI - 0.1), 0.2);
  });

  it.each([266841470250327.16, -56594001507807190])(
    'mantém o intervalo quando o cancelamento numérico afeta %s rad',
    (value) => {
      const normalized = normalizeAngle(value);
      expect(normalized).toBeGreaterThan(-Math.PI);
      expect(normalized).toBeLessThanOrEqual(Math.PI);
    },
  );
});
