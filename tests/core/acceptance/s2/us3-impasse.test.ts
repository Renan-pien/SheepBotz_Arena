import { expect, it } from 'vitest';
import {
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
