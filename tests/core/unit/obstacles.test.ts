import { expect, it } from 'vitest';
import { resolveObstaclesAndWalls } from '../../../src/core/sim/obstacles';

const obstacle = { id: 'caixa', x: 0, y: 0, width: 2, height: 2 };
const map = { width: 10, height: 10 };

it('projeta para fora mantendo o raio e a orientação quando 0 < d < r', () => {
  const result = resolveObstaclesAndWalls(
    { x: 1.25, y: 0.2, theta: 0.7 },
    0.5,
    [obstacle],
    map,
  );
  expect(result).toEqual({
    pose: { x: 1.5, y: 0.2, theta: 0.7 },
    contacted: true,
  });
});

it.each([
  [-0.8, 0, -1.5, 0],
  [0.8, 0, 1.5, 0],
  [0, -0.8, 0, -1.5],
  [0, 0.8, 0, 1.5],
  [0, 0, -1.5, 0],
  [1, 0, 1.5, 0],
])(
  'para d = 0 projeta (%s, %s) pelo lado mais próximo e aplica o desempate',
  (x, y, expectedX, expectedY) => {
    const result = resolveObstaclesAndWalls(
      { x, y, theta: 1 },
      0.5,
      [obstacle],
      map,
    );
    expect(result).toEqual({
      pose: { x: expectedX, y: expectedY, theta: 1 },
      contacted: true,
    });
  },
);

it('limita os dois eixos pelas paredes após os obstáculos', () => {
  const result = resolveObstaclesAndWalls(
    { x: 1.2, y: -1.2, theta: -0.2 },
    0.1,
    [],
    { width: 2, height: 2 },
  );
  expect(result).toEqual({
    pose: { x: 0.9, y: -0.9, theta: -0.2 },
    contacted: true,
  });
});

it('não registra contato quando o robô apenas tangencia um obstáculo', () => {
  const pose = { x: 1.5, y: 0, theta: 0 };
  expect(resolveObstaclesAndWalls(pose, 0.5, [obstacle], map)).toEqual({
    pose,
    contacted: false,
  });
});
