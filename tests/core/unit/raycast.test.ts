import { expect, it } from 'vitest';
import { rayBox, rayCircle } from '../../../src/core/math/ray';

const origin = { x: 0, y: 0 };
const east = { x: 1, y: 0 };
const north = { x: 0, y: 1 };
const rect = { x: 2, y: 0, width: 2, height: 2 };

it('calcula entrada e saída pelo intervalo de cada eixo', () => {
  expect(rayBox(origin, east, rect)).toEqual({ enter: 1, exit: 3 });
  expect(rayBox({ x: 2, y: 0 }, east, rect)).toEqual({ enter: -1, exit: 1 });
  expect(rayBox({ x: 4, y: 0 }, east, rect)).toBeUndefined();
  expect(rayBox({ x: 0, y: 3 }, { x: 1, y: 1 }, rect)).toBeUndefined();
});
it('conta um raio alinhado com a borda e exclui paralelos fora da faixa', () => {
  expect(rayBox({ x: 1, y: -3 }, north, rect)).toEqual({ enter: 2, exit: 4 });
  expect(rayBox({ x: 0, y: -3 }, north, rect)).toBeUndefined();
  expect(rayBox({ x: 0, y: 1 }, east, rect)).toEqual({ enter: 1, exit: 3 });
});
it('mede o círculo e inclui a tangência e a origem sobre ou dentro dele', () => {
  expect(rayCircle(origin, east, { x: 2, y: 0 }, 1)).toBe(1);
  expect(rayCircle(origin, east, { x: 2, y: 1 }, 1)).toBe(2);
  expect(rayCircle(origin, east, { x: 0.5, y: 0 }, 1)).toBe(0);
  expect(rayCircle(origin, east, { x: -1, y: 0 }, 1)).toBe(0);
  expect(rayCircle(origin, east, { x: -2, y: 0 }, 1)).toBeUndefined();
  expect(rayCircle(origin, east, { x: 2, y: 2 }, 1)).toBeUndefined();
});
