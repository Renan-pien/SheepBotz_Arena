import { expect, it } from 'vitest';
import { loadWorld } from '../../../src/core';
import { readLasers } from '../../../src/core/sensors/laser';
import { duel } from '../../helpers/duel';
import { expectClose } from '../../helpers/tolerance';
import { robot, worldText } from '../../helpers/world-builder';

const laser = { rays: 3, fov: Math.PI / 3, maxRange: 3 };
function read(text: string) {
  const loaded = loadWorld(text);
  if (!loaded.ok) throw new Error(JSON.stringify(loaded.errors));
  return readLasers(
    loaded.world,
    loaded.world.robots.map((r) => r.initialPose),
  );
}

it.each([
  [worldText({ robots: [robot({ laser })] }), [2.309401, 2, 2.309401]],
  [
    worldText({
      map: { width: 4, height: 2 },
      robots: [robot({ laser, theta: Math.PI / 2 })],
    }),
    [1.154701, 1, 1.154701],
  ],
  [
    worldText({
      robots: [robot({ laser })],
      obstacles: [{ id: 'caixa', x: 1, y: 0, width: 0.2, height: 0.4 }],
    }),
    [2.309401, 0.9, 2.309401],
  ],
  [
    worldText({ robots: [robot({ laser: { ...laser, maxRange: 1.5 } })] }),
    [1.5, 1.5, 1.5],
  ],
  [
    worldText({
      robots: [
        robot({ laser: { ...laser, rays: 1 } }),
        robot({ id: 'b', x: 0.5 }),
      ],
    }),
    [0.4],
  ],
  [
    worldText({
      robots: [
        robot({ laser: { rays: 5, fov: Math.PI / 2, maxRange: 1 } }),
        robot({ id: 'b', x: 0.5, y: 0.05 }),
      ],
    }),
    [1, 1, 0.413397, 1, 1],
  ],
])('reproduz um vetor do Anexo A', (text, expected) => {
  const readings = read(text)[0]!;
  expect(readings).toHaveLength(expected.length);
  expected.forEach((distance, i) => expectClose(readings[i]!, distance));
});

it('ignora emissor e arena e preserva a ordem dos robôs', () => {
  const scan = read(duel);
  expect(scan).toHaveLength(2);
  for (const readings of scan)
    [0.8, 0.8, 0.35, 0.8, 0.8].forEach((r, i) => expectClose(readings[i]!, r));
});

it('coincide os raios extremos de uma volta completa e deixa vazio sem laser', () => {
  const scan = read(
    worldText({
      robots: [
        robot({ x: -0.5, theta: 0.21, laser: { ...laser, fov: 2 * Math.PI } }),
        robot({ id: 'r2', x: 1 }),
      ],
    }),
  );
  expect(scan[0]![0]).toBe(scan[0]![2]);
  expect(scan[1]).toEqual([]);
});
