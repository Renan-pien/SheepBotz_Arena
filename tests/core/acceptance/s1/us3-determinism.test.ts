import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import {
  createInitialState,
  createSimulation,
  loadWorld,
  runHeadless,
  step,
  type HeadlessInput,
} from '../../../../src/core';
import { robot, worldText } from '../../../helpers/world-builder';

const duel = readFileSync(
  new URL('../../../../examples/worlds/duelo-padrao.json', import.meta.url),
  'utf8',
);
const fixedWindowDuel = JSON.stringify({
  ...JSON.parse(duel),
  match: { mode: 'free', maxTicks: 3000 },
});

function loadedWorld(text: string) {
  const result = loadWorld(text);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.world;
}

function run(input: HeadlessInput) {
  const result = runHeadless(input);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result;
}

it('S1-US3-AC1: produz o mesmo estado para cada tick em duas execuções', () => {
  const input = {
    world: fixedWindowDuel,
    ticks: 500,
    history: true,
    commands: { vermelho: { v: 1, w: 0.5 }, azul: { v: 0.3, w: -0.2 } },
  };
  const first = run(input);
  const second = run(input);
  expect(first.history).toHaveLength(501);
  expect(second.history).toEqual(first.history);
});

it('S1-US3-AC2: entrega o estado inicial após zero ticks', () => {
  const result = run({ world: duel, ticks: 0 });
  const initial = createInitialState(loadedWorld(duel));
  expect(result.state).toEqual(initial);
  expect(result.state).toMatchObject({ tick: 0, time: 0 });
  expect(initial.robots.map(({ id, pose }) => [id, pose])).toEqual([
    ['vermelho', { x: -0.2, y: 0, theta: 0 }],
    ['azul', { x: 0.2, y: 0, theta: Math.PI }],
  ]);
});

it('S1-US3-AC3: calcula o tempo como 150 × 0.02 s', () => {
  const { state } = run({ world: worldText({ dt: 0.02 }), ticks: 150 });
  expect(state).toMatchObject({ tick: 150, time: 3 });
});

it('S1-US3-AC4: reinicia o histórico e reproduz os 121 estados', () => {
  const world = loadedWorld(fixedWindowDuel);
  const commands = { vermelho: { v: 0.4, w: 0.1 } };
  const simulation = createSimulation(world, { history: true, commands });
  const initial = simulation.getState();
  expect(simulation.getHistory()).toEqual([initial]);
  simulation.stepN(120);
  const first = simulation.getHistory();
  expect(first).toHaveLength(121);

  expect(simulation.reset()).toEqual(initial);
  expect(simulation.getState()).toEqual(initial);
  expect(simulation.getHistory()).toEqual([initial]);
  simulation.stepN(120);
  expect(simulation.getHistory()).toEqual(first);

  const withoutHistory = createSimulation(world, { commands });
  const next = withoutHistory.step();
  expect(withoutHistory.getState()).toBe(next);
  expect(next.tick).toBe(1);
  expect(withoutHistory.reset()).toEqual(initial);
  expect(withoutHistory.getHistory()).toEqual([]);
});

it('avança uma única vez sem alterar o estado anterior e mantém comandos por ID', () => {
  const world = loadedWorld(
    worldText({
      robots: [robot({ id: 'constructor' }), robot({ id: 'a', x: 1 })],
    }),
  );
  const initial = createInitialState(world);
  const first = step(world, initial, { a: { v: 0.5, w: 0 } });
  const second = step(world, first, {});
  expect(initial.robots.map(({ pose }) => pose.x)).toEqual([0, 1]);
  expect(first.robots.map(({ pose }) => pose.x)).toEqual([0, 1.05]);
  expect(second.robots.map(({ pose }) => pose.x)).toEqual([0, 1.1]);
  expect(second.tick).toBe(2);
});
