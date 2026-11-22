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
    const final = sim.stepN(250);
    expect(final.resultado).toEqual({
      motivo: 'queima_da_largada',
      tick: red.includes('249') ? 250 : 1,
      vencedor: winner,
      pontos: {
        vermelho: Number(winner === 'vermelho'),
        azul: Number(winner === 'azul'),
      },
    });
    expect(final.robots.map((r) => r.pose)).toEqual(
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
  ).step();
  expect(end.falseStarters).toEqual(['vermelho', 'azul']);
  expect(end.resultado).toEqual({
    motivo: 'queima_dupla',
    tick: 1,
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
