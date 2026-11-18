import { expect, it } from 'vitest';
import { createSimulation, loadWorld, step } from '../../../../src/core';
import { expectPoseClose } from '../../../helpers/tolerance';
import { robot, worldText } from '../../../helpers/world-builder';

const wallWorld = worldText({
  map: { width: 2, height: 2 },
  robots: [robot({ x: 0.8 })],
});
const obstacleWorld = worldText({
  obstacles: [{ id: 'caixa', x: 0.55, y: 0, width: 0.2, height: 0.2 }],
});

function simulation(text: string, speed: number) {
  const loaded = loadWorld(text);
  if (!loaded.ok) throw new Error(JSON.stringify(loaded.errors));
  return createSimulation(loaded.world, {
    commands: { r1: { v: speed, w: 0 } },
  });
}

it('S1-US4-AC1: para contra a parede com bumper ativo', () => {
  const robot = simulation(wallWorld, 1).stepN(10).robots[0]!;
  expectPoseClose(robot.pose, { x: 0.9, y: 0, theta: 0 });
  expect(robot.bumper).toBe(true);
});

it('S1-US4-AC2: mantém o bumper inativo antes de alcançar o obstáculo', () => {
  const robot = simulation(obstacleWorld, 1).stepN(3).robots[0]!;
  expectPoseClose(robot.pose, { x: 0.3, y: 0, theta: 0 });
  expect(robot.bumper).toBe(false);
});

it('S1-US4-AC3: para junto ao obstáculo com bumper ativo', () => {
  const robot = simulation(obstacleWorld, 1).stepN(10).robots[0]!;
  expectPoseClose(robot.pose, { x: 0.35, y: 0, theta: 0 });
  expect(robot.bumper).toBe(true);
});

it('S1-US4-AC4: mantém o bumper inativo quando está parado e sem contato', () => {
  const robot = simulation(worldText(), 0).step().robots[0]!;
  expect(robot.bumper).toBe(false);
});

it('S1-US4-AC5: libera o bumper no primeiro tick em que se afasta da parede', () => {
  const sim = simulation(wallWorld, 1);
  const touching = sim.stepN(10);
  expect(touching.robots[0]?.bumper).toBe(true);
  const robot = step(sim.world, touching, { r1: { v: -1, w: 0 } }).robots[0]!;
  expectPoseClose(robot.pose, { x: 0.8, y: 0, theta: 0 });
  expect(robot.bumper).toBe(false);
});

it('atravessa a borda da arena sem tratar o círculo como parede do mapa', () => {
  const summit = worldText({
    arena: { radius: 0.385 },
    match: { mode: 'free', maxTicks: 1 },
    robots: [robot({ x: 0.385 }), robot({ id: 'r2', x: -0.25 })],
  });
  const loaded = loadWorld(summit);
  if (!loaded.ok) throw new Error(JSON.stringify(loaded.errors));
  const simulation = createSimulation(loaded.world, {
    commands: { r1: { v: 1, w: 0 } },
  });
  const next = simulation.stepN(2);
  expect(next.tick).toBe(2);
  expectPoseClose(next.robots[0]!.pose, { x: 0.585, y: 0, theta: 0 });
  expect(next.robots[0]!.bumper).toBe(false);
});
