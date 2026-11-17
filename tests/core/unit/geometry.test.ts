import { expect, it } from 'vitest';
import { closestPointOnRect, distance } from '../../../src/core/math/geometry';

const rectangle = { x: 1, y: 2, width: 2, height: 2 };

it('mede a distância euclidiana entre dois pontos', () => {
  expect(distance({ x: 0, y: 0 }, { x: 3, y: -4 })).toBe(5);
  expect(distance({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(0);
});

it.each([
  [-1, 5, 0, 3],
  [3, 0, 2, 1],
  [2, 2, 2, 2],
  [1, 1.5, 1, 1.5],
])('encontra o ponto do retângulo mais próximo de (%s, %s)', (x, y, qx, qy) => {
  expect(closestPointOnRect({ x, y }, rectangle)).toEqual({ x: qx, y: qy });
});
