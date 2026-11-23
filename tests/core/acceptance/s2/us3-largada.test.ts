import { expect, it } from 'vitest';
import { prepareSimulation } from '../../../../src/core';
import {
  controllerOptions,
  duel,
  normalizedWorld,
} from '../../../helpers/controlled';

const idle = 'function loop() {}';
function battle(red = idle, blue = idle, dt = 0.02, maxTicks = 3000) {
  const world = normalizedWorld(duel);
  const result = prepareSimulation(
    { ...world, dt, match: { ...world.match, maxTicks } },
    {
      ...controllerOptions({ vermelho: red, azul: blue }),
      sumoStartDelay: true,
      stallSeconds: 5,
    },
  );
  if (!result.ok) throw Error(JSON.stringify(result.errors));
  return result.simulation;
}

it.each([
  [
    'function setup(){setSpeed(1,0)} function loop(){setSpeed(0,0)}',
    idle,
    'azul',
  ],
  [idle, 'function loop(){setSpeed(0,-1); throw Error("falha")}', 'vermelho'],
  ['function loop(){if(getInfo().tick === 249)setSpeed(-0.1,0)}', idle, 'azul'],
])(
  'S2-US3-AC16: uma tentativa válida concede um ponto ao adversário %s',
  (red, blue, winner) => {
    const sim = battle(red, blue);
    const initial = sim.getState();
    const start = red.includes('249') ? 250 : 1;
    const first = sim.stepN(start);
    expect(first.resultado).toBeNull();
    expect(first.falseStartTick).toBe(start);
    expect(sim.stepN(23).status).toBe('em_andamento');
    const final = sim.step();
    expect(final.resultado).toEqual({
      motivo: 'queima_da_largada',
      tick: start + 24,
      vencedor: winner,
      pontos: {
        vermelho: Number(winner === 'vermelho'),
        azul: Number(winner === 'azul'),
      },
    });
    expect(final.robots.map((r) => r.pose)).not.toEqual(
      initial.robots.map((r) => r.pose),
    );
    expect(final.events.filter((e) => e.type === 'fim_da_luta')).toHaveLength(
      1,
    );
    expect(sim.step()).toBe(final);
  },
);

it('S2-US3-AC17: julga os dois infratores juntos, com zero pontos', () => {
  const end = battle(
    'function loop(){setSpeed(0,1)}',
    'function loop(){setSpeed(-1,0);setSpeed(0,0)}',
  ).stepN(25);
  expect(end.falseStarters).toEqual(['vermelho', 'azul']);
  expect(end.resultado).toEqual({
    motivo: 'queima_dupla',
    tick: 25,
    vencedor: null,
    pontos: { vermelho: 0, azul: 0 },
  });
});

it.each([
  [0.02, 250],
  [0.03, 167],
])(
  'S2-US3-AC18: permite movimento a partir de cinco segundos com dt %s',
  (dt, release) => {
    const sim = battle(
      'function loop(){readLaser();setSpeed(getInfo().startReleased ? 0.1 : 0,0)}',
      idle,
      dt,
      2,
    );
    const initial = sim.getState();
    expect(sim.stepN(release).robots).toEqual(initial.robots);
    expect(sim.getState().resultado).toBeNull();
    const first = sim.step();
    expect(first.robots[0]!.pose.x).toBeGreaterThan(initial.robots[0]!.pose.x);
    expect(first.resultado).toBeNull();
    expect(sim.step().resultado).toMatchObject({
      tick: release + 2,
      motivo: 'tempo_esgotado',
    });
    sim.reset();
    expect(sim.stepN(release + 1)).toEqual(first);
  },
);

it('S2-US3-AC18: sensores, log, zero e erro de API preservam a espera', () => {
  const sim = battle(
    'function setup(){log(getInfo().startReleased, readBumper());setSpeed(0,-0)} function loop(){}',
    'function loop(){setSpeed(NaN,0)}',
  );
  const state = sim.step();
  expect(state.resultado).toBeNull();
  expect(state.events.map((event) => event.type)).toEqual([
    'log',
    'erro_controlador',
  ]);
  expect(state.events[0]!.message).toContain('false');
  expect(state.robots[1]!.situacao).toBe('desativado');
});

it('S2-US3-AC19: mantém o primeiro comando e o veredito mesmo com tentativa posterior do adversário', () => {
  const sim = battle(
    'function setup(){setSpeed(-0.6,0);setSpeed(1,0)} function loop(){log("uma vez");setSpeed(0,0)}',
    'function loop(){if(getInfo().tick > 0)setSpeed(0,1)}',
    0.03,
    1,
  );
  const initial = sim.getState().robots;
  const before = sim.stepN(16);
  expect(before.robots[0]!.pose.x).toBeCloseTo(
    initial[0]!.pose.x - 0.6 * 0.48,
    10,
  );
  expect(before.events.map((e) => e.type)).toEqual(['log']);
  expect(before.resultado).toBeNull();
  const end = sim.step();
  expect(end.tick).toBe(17);
  expect(end.robots[0]!.pose.x).toBeCloseTo(initial[0]!.pose.x - 0.6 * 0.5, 10);
  expect(end.robots[1]!.pose).toEqual(initial[1]!.pose);
  expect(end.falseStarters).toEqual(['vermelho']);
  expect(end.resultado).toMatchObject({
    vencedor: 'azul',
    pontos: { azul: 1, vermelho: 0 },
  });
  sim.reset();
  expect(sim.stepN(80)).toEqual(end);
});

it('S2-US3-AC19: o empurrão move o adversário sem mudar os infratores', () => {
  const sim = battle('function loop(){setSpeed(1,0)}');
  const start = sim.getState().robots[1]!;
  const end = sim.stepN(25);
  const blue = end.robots[1]!;
  expect(blue.bumper).toBe(true);
  expect(blue.pose.x).toBeGreaterThan(start.pose.x);
  expect(blue.odometry).toEqual(start.odometry);
  expect(blue.laser).not.toEqual(start.laser);
  expect(end.resultado?.vencedor).toBe('azul');
});

it('S2-US3-AC19: um infrator bloqueado conserva a indicação, o contato e a decisão', () => {
  const world = normalizedWorld(duel);
  const prepared = prepareSimulation(
    {
      ...world,
      obstacles: [{ id: 'parede', x: -0.1, y: 0, width: 0.1, height: 0.3 }],
    },
    { sumoStartDelay: true, commands: { vermelho: { v: 0.5, w: 0 } } },
  );
  if (!prepared.ok) throw Error(JSON.stringify(prepared.errors));
  const sim = prepared.simulation;
  const before = sim.getState().robots[0]!;
  const mid = sim.stepN(12);
  expect(mid.falseStarters).toEqual(['vermelho']);
  expect(mid.resultado).toBeNull();
  const red = mid.robots[0]!;
  expect(red.bumper).toBe(true);
  expect(red.pose.x).toBeCloseTo(before.pose.x, 10);
  expect(red.odometry.x).toBeGreaterThan(before.pose.x);
  expect(sim.stepN(13).resultado).toMatchObject({ tick: 25, vencedor: 'azul' });
});
