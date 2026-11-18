import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { loadWorld } from '../../../../src/core';
import { duel } from '../../../helpers/duel';
import { expectClose } from '../../../helpers/tolerance';

it('S2-US5-AC1: os dois mundos de exemplo passam pelo validador', () => {
  expect(loadWorld(duel).ok).toBe(true);
  const sala = readFileSync(
    new URL(
      '../../../../examples/worlds/sala-com-obstaculos.json',
      import.meta.url,
    ),
    'utf8',
  );
  const loaded = loadWorld(sala);
  if (!loaded.ok) throw new Error(JSON.stringify(loaded.errors));
  expect(loaded.world).toMatchObject({
    name: 'Sala com obstáculos',
    seed: 7,
    dt: 0.05,
    map: { width: 4, height: 4 },
    match: { mode: 'free' },
    arena: null,
    obstacles: [
      { id: 'caixa-a', x: 0, y: 0, width: 0.6, height: 0.6 },
      { id: 'caixa-b', x: 1.2, y: -1, width: 0.4, height: 1 },
      { id: 'parede-c', x: -1, y: 1.2, width: 1.2, height: 0.2 },
    ],
    robots: [
      {
        id: 'explorador',
        initialPose: { x: -1.5, y: -1.5 },
        radius: 0.1,
        maxLinearSpeed: 1,
        maxAngularSpeed: 4,
        color: '#43A047',
        laser: { rays: 9, fov: Math.PI, maxRange: 1.5 },
      },
    ],
  });
  expectClose(loaded.world.robots[0]!.initialPose.theta, Math.PI / 4);
});
