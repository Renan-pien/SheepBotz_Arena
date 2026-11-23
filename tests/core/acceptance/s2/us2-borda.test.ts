import { expect, it } from 'vitest';
import { prepareSimulation } from '../../../../src/core';
import {
  controllerOptions,
  normalizedWorld,
  runControlled,
} from '../../../helpers/controlled';
import { robot, worldText } from '../../../helpers/world-builder';

const read = 'function loop() { log(JSON.stringify(readEdge())); }';
const interior = { front: false, rear: false, left: false, right: false };

function sumo(
  sensor: Record<string, number>,
  other: Record<string, number> = { x: -0.2 },
  radius = 0.385,
) {
  return worldText({
    dt: 0.02,
    arena: { radius },
    match: { mode: 'sumo', maxTicks: 100 },
    robots: [
      robot({ id: 'sensor', radius: 0.05, ...sensor }),
      robot({ id: 'outro', radius: 0.05, ...other }),
    ],
  });
}

it.each([
  [0, 'front'],
  [Math.PI, 'rear'],
  [-Math.PI / 2, 'left'],
  [Math.PI / 2, 'right'],
] as const)(
  'S2-US2-AC13: a orientação %d ativa o lado %s, em uma estratégia personalizada sem laser',
  (theta, side) => {
    const { state } = runControlled(
      sumo({ x: 0.33, theta }),
      { sensor: read, outro: read },
      1,
    );
    expect(state.events.map((e) => JSON.parse(e.message))).toEqual([
      { ...interior, [side]: true },
      interior,
    ]);
  },
);

it.each([
  [0.325374, false],
  [0.325375, true],
  [0.36, true],
] as const)(
  'S2-US2-AC13: em x=%d o sensor frontal observa a faixa inclusive depois do limite externo',
  (x, front) => {
    const { state } = runControlled(sumo({ x }), { sensor: read }, 1);
    expect(JSON.parse(state.events[0]!.message)).toEqual({
      ...interior,
      front,
    });
  },
);

it('S2-US2-AC13: usa os raios configurados e admite lados simultâneos', () => {
  const radius = 0.5;
  const { state } = runControlled(
    sumo({ x: 0.46, radius: 0.08, theta: Math.PI / 4 }, { x: -0.2 }, radius),
    { sensor: read },
    1,
  );
  expect(JSON.parse(state.events[0]!.message)).toEqual({
    ...interior,
    front: true,
    right: true,
  });
  const farther = runControlled(
    sumo({ x: 0.46, radius: 0.08, theta: Math.PI / 4 }, { x: -0.2 }, 0.6),
    { sensor: read },
    1,
  );
  expect(JSON.parse(farther.state.events[0]!.message)).toEqual(interior);
});

it.each([undefined, { radius: 0.385 }])(
  'S2-US2-AC14: modo livre retorna null, com ou sem arena (%j)',
  (arena) => {
    const { state } = runControlled(worldText({ arena }), { r1: read }, 1);
    expect(state.events[0]?.message).toBe('null');
  },
);

it('S2-US2-AC14: setup e loop leem a pose real e a estratégia reage ao empurrão lateral após o tick observado', () => {
  const world = normalizedWorld(
    sumo({ x: 0, y: 0.32 }, { x: 0, y: 0.215, theta: Math.PI / 2 }),
  );
  const prepared = prepareSimulation(
    world,
    controllerOptions({
      sensor: `
      function setup() {
        const copy = readEdge(); copy.left = true;
        log('inicial', readEdge().left);
      }
      function loop() {
        const edge = readEdge();
        log('esquerda', edge.left);
        if(edge.left) setSpeed(-0.2,0);
      }`,
      outro: 'function loop(){setSpeed(1,0);}',
    }),
  );
  if (!prepared.ok) throw Error(JSON.stringify(prepared.errors));
  const sim = prepared.simulation;
  const first = sim.step();
  expect(first.events.map((e) => e.message)).toEqual([
    'inicial false',
    'esquerda false',
  ]);
  expect(first.robots[0]!.bumper).toBe(true);
  expect(first.robots[0]!.odometry.y).toBeCloseTo(0.32, 12);
  expect(first.robots[0]!.pose.y).toBeGreaterThan(0.325375);
  const second = sim.step();
  expect(second.events.at(-1)?.message).toBe('esquerda true');
  expect(second.robots[0]!.command.v).toBe(-0.2);
  sim.reset();
  expect(sim.stepN(2)).toEqual(second);
});

it('S2-US2-AC13: o avanço próprio pode cruzar a faixa em um tick e o recuo desativa a leitura', () => {
  const { state } = runControlled(
    sumo({ x: 0.325 }),
    {
      sensor:
        'function loop(){const front=readEdge().front; log(front); setSpeed(front ? -1 : 1, 0);}',
    },
    3,
  );
  expect(state.events.map((event) => event.message)).toEqual([
    'false',
    'true',
    'false',
  ]);
});
