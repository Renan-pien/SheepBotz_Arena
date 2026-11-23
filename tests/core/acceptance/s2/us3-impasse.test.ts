import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { initializeControllerEngine } from '../../../../src/runtime/controller-engine';
import {
  advanceStall,
  createSimulation,
  loadWorld,
  runHeadless,
  step,
} from '../../../../src/core';
import { duel } from '../../../helpers/duel';
import { robot, worldText } from '../../../helpers/world-builder';

function arena(
  robots = [robot({ id: 'a', x: 0 }), robot({ id: 'b', x: 0.5 })],
  maxTicks = 3000,
) {
  return worldText({
    dt: 0.02,
    arena: { radius: 1 },
    match: { mode: 'sumo', maxTicks },
    robots,
  });
}
function simulate(text: string, limit: 5 | 10 | 30, commands = {}) {
  const loaded = loadWorld(text);
  if (!loaded.ok) throw Error(JSON.stringify(loaded.errors));
  return createSimulation(loaded.world, {
    stallSeconds: limit,
    commands,
    history: true,
  });
}
it.each([5, 10, 30] as const)(
  'S2-US3-AC11: empate somente ao completar %i segundos simulados',
  (seconds) => {
    const sim = simulate(arena(), seconds, { a: { v: 0, w: 2 } });
    const end = seconds * 50;
    expect(sim.stepN(end - 1).resultado).toBeNull();
    const final = sim.step();
    expect(final.resultado).toEqual({
      motivo: 'falta_de_progresso',
      vencedor: null,
      tick: end,
    });
    expect(final.events.filter((e) => e.type === 'fim_da_luta')).toHaveLength(
      1,
    );
    expect(sim.stepN(10)).toBe(final);
    expect(sim.reset().stall?.sinceTick).toBe(0);
  },
);
it('S2-US3-AC11: dois motores bloqueados em contato não produzem progresso', () => {
  const sim = simulate(
    arena([robot({ id: 'a', x: -0.1 }), robot({ id: 'b', x: 0.1 })]),
    5,
    { a: { v: 1, w: 0 }, b: { v: -1, w: 0 } },
  );
  const end = sim.stepN(250);
  expect(end.robots.every((r) => r.bumper)).toBe(true);
  expect(end.robots[0]!.odometry.x).toBeGreaterThan(1);
  expect(end.resultado?.motivo).toBe('falta_de_progresso');
});
it('S2-US3-AC12: soma deslocamentos lentos a partir da referência e ignora 1 mm inclusive', () => {
  const sim = simulate(arena(), 5, { a: { v: 0.02, w: 0 } });
  expect(sim.stepN(2).stall?.sinceTick).toBe(0);
  expect(sim.step().stall?.sinceTick).toBe(3);
  const edge = simulate(arena(), 5, { a: { v: 0.05, w: 0 } });
  expect(edge.step().stall?.sinceTick).toBe(0);
  expect(edge.step().stall?.sinceTick).toBe(2);
});
it('S2-US3-AC12: empurrão atualiza as duas referências inclusive do robô passivo', () => {
  const sim = simulate(
    arena([robot({ id: 'a', x: -0.1 }), robot({ id: 'b', x: 0.1 })]),
    5,
    { a: { v: 0.2, w: 0 } },
  );
  const next = sim.step();
  expect(next.robots[1]!.bumper).toBe(true);
  expect(next.robots[1]!.pose.x).toBeGreaterThan(0.101);
  expect(next.robots[1]!.odometry.x).toBeCloseTo(0.1, 10);
  expect(next.stall?.sinceTick).toBe(1);
  expect(next.stall?.centers[1]?.x).toBeCloseTo(next.robots[1]!.pose.x, 10);
});
it('S2-US3-AC13: limite normal tem precedência e detector é opcional e exclusivo do sumô', () => {
  expect(simulate(arena(undefined, 250), 5).stepN(250).resultado?.motivo).toBe(
    'tempo_esgotado',
  );
  expect(runHeadless({ world: duel, ticks: 3000 })).toMatchObject({
    ok: true,
    state: { resultado: { motivo: 'tempo_esgotado' } },
  });
  expect(simulate(worldText(), 5).stepN(2000).stall).toBeUndefined();
});

it('S2-US3-AC12: progresso no último passo zera o prazo e pequenas oscilações não o zeram', () => {
  const sim = simulate(arena(), 5);
  let state = sim.getState();
  for (let i = 0; i < 249; i++)
    state = step(sim.world, state, {
      a: { v: i % 2 === 0 ? 0.02 : -0.02, w: 0 },
    });
  expect(state.stall?.sinceTick).toBe(0);
  const saved = step(sim.world, state, { a: { v: 0.1, w: 0 } });
  expect(saved.stall?.sinceTick).toBe(250);
  expect(saved.resultado).toBeNull();
});
it('S2-US3-AC13: saída da arena no vencimento vence mesmo com movimento menor que 1 mm', () => {
  const sim = simulate(
    arena([robot({ id: 'a', x: 1 }), robot({ id: 'b', x: 0 })]),
    5,
  );
  const final = step(sim.world, sim.stepN(249), { a: { v: 0.02, w: 0 } });
  expect(final.resultado).toEqual({
    vencedor: 'b',
    motivo: 'saida_da_arena',
    tick: 250,
  });
});

it('S2-US3-AC11: prazo não divisível por dt encerra no primeiro tick que o alcança', () => {
  const sim = simulate(JSON.stringify({ ...JSON.parse(arena()), dt: 0.03 }), 5);
  expect(sim.stepN(166).resultado).toBeNull();
  expect(sim.step().resultado).toEqual({
    motivo: 'falta_de_progresso',
    tick: 167,
    vencedor: null,
  });
});

it.each([5, 10, 30] as const)(
  'S2-US3-AC14: dois Caçadores empatam %i s após o contato no tick 8',
  (stallSeconds) => {
    const hunter = readFileSync(
      new URL('../../../../examples/controllers/cacador.js', import.meta.url),
      'utf8',
    );
    const end = 8 + stallSeconds * 50;
    const result = runHeadless({
      world: duel,
      controllers: { vermelho: hunter, azul: hunter },
      controllerEngine: initializeControllerEngine(),
      stallSeconds,
      history: true,
      ticks: end + 10,
    });
    if (!result.ok) throw Error(JSON.stringify(result.errors));
    expect(result.history![7]!.stall?.pair).toBeUndefined();
    expect(result.history![8]!.stall?.pair?.sinceTick).toBe(8);
    expect(result.history![end - 1]!.resultado).toBeNull();
    expect(result.state.resultado).toEqual({
      vencedor: null,
      motivo: 'falta_de_progresso',
      tick: end,
    });
    expect(
      result.state.events.filter((event) => event.type === 'fim_da_luta'),
    ).toHaveLength(1);
  },
);

it('S2-US3-AC15: só contato inicia o giro e as duas tolerâncias têm fronteiras inclusivas', () => {
  // Raios diferentes e ponto médio fora da origem.
  const sim = simulate(
    arena([
      robot({ id: 'a', x: 0, radius: 0.04 }),
      robot({ id: 'b', x: 0.2, radius: 0.06 }),
    ]),
    5,
  );
  const base = sim.getState();
  let monitor = base.stall!;
  let tick = 0;
  function observe(mid: number, gap: number, pairContact = false) {
    const half = (0.1 + gap) / 2;
    const robots = base.robots.map((robot, i) => ({
      ...robot,
      pose: { ...robot.pose, x: mid + (i ? half : -half) },
      bumper: true,
    }));
    monitor = advanceStall(monitor, robots, ++tick, sim.world, pairContact);
    return monitor.pair?.sinceTick;
  }
  expect(observe(0.2, 0.001)).toBeUndefined();
  expect(observe(0.2, 0)).toBe(2);
  expect(observe(0.201, 0.002)).toBe(2);
  expect(observe(0.2011, 0.002)).toBe(4);
  expect(observe(0.2011, 0.0021)).toBeUndefined();
  expect(observe(0.2011, 0.001)).toBeUndefined();
  // Colisão oblíqua detectada pelo resolvedor, com pequena folga após correção.
  expect(observe(0.2011, 0.001, true)).toBe(7);
  expect(observe(0.2011, 0.0021, true)).toBeUndefined();
});

it('S2-US3-AC15: dupla tangente no estado inicial usa o tick zero', () => {
  const sim = simulate(
    arena([robot({ id: 'a', x: -0.1 }), robot({ id: 'b', x: 0.1 })]),
    5,
  );
  expect(sim.getState().stall?.pair).toEqual({
    center: { x: 0, y: 0 },
    sinceTick: 0,
  });
  expect(sim.stepN(250).resultado?.tick).toBe(250);
});
