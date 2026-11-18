import { expect, it } from 'vitest';
import { duel, runControlled } from '../../../helpers/controlled';
import { prepared } from '../../../helpers/prepared';
import {
  avanca,
  cacador,
  duelWithMatch,
  edgeWorld,
  parado,
} from '../../../helpers/sumo';
import { expectClose } from '../../../helpers/tolerance';

it('S2-US3-AC1: publica vitória por empurrão no tick 34', () => {
  const { state } = runControlled(duel, { vermelho: avanca, azul: parado }, 34);
  expect(state).toMatchObject({
    tick: 34,
    status: 'finalizada',
    resultado: { vencedor: 'vermelho', motivo: 'saida_da_arena', tick: 34 },
  });
  expectClose(state.robots[0]!.pose.x, 0.29);
  expectClose(state.robots[1]!.pose.x, 0.39);
  expect(state.events).toEqual([
    {
      type: 'fim_da_luta',
      tick: 34,
      robotId: null,
      message: "Fim da luta: vitória de 'vermelho' por saída da arena.",
    },
  ]);
});
it('S2-US3-AC2: Caçador vence Parado no tick 34', () => {
  const { state } = runControlled(
    duel,
    { vermelho: cacador, azul: parado },
    34,
  );
  expect(state.resultado).toEqual({
    vencedor: 'vermelho',
    motivo: 'saida_da_arena',
    tick: 34,
  });
});
it('S2-US3-AC3: dois robôs parados empatam no limite', () => {
  const { state } = runControlled(
    duelWithMatch('sumo', 100),
    { vermelho: parado, azul: parado },
    100,
  );
  expect(state.resultado).toEqual({
    vencedor: null,
    motivo: 'tempo_esgotado',
    tick: 100,
  });
  expect(state.events).toEqual([
    {
      type: 'fim_da_luta',
      tick: 100,
      robotId: null,
      message: 'Fim da luta: empate por tempo esgotado.',
    },
  ]);
});
it('S2-US3-AC4: registra empate quando ambos saem no mesmo tick', () => {
  const world = JSON.parse(duel);
  Object.assign(world.robots[0], { x: -0.3, theta: Math.PI });
  Object.assign(world.robots[1], { x: 0.3, theta: 0 });
  const { state } = runControlled(
    JSON.stringify(world),
    { vermelho: avanca, azul: avanca },
    5,
  );
  expect(state.resultado).toEqual({
    vencedor: null,
    motivo: 'ambos_sairam',
    tick: 5,
  });
  expect(state.events.at(-1)?.message).toBe(
    'Fim da luta: empate. Os dois robôs saíram da arena.',
  );
});
it('S2-US3-AC5: publica o laser da pose final e o evento da luta depois do log', () => {
  const { state } = runControlled(
    duel,
    {
      vermelho: 'function loop() { log(readLaser()[2]); setSpeed(-1, 0); }',
      azul: parado,
    },
    10,
  );
  expect(state.resultado).toEqual({
    vencedor: 'azul',
    motivo: 'saida_da_arena',
    tick: 10,
  });
  expectClose(state.robots[0]!.laser[2]!, 0.55);
  expect(state.events.slice(-2).map((event) => event.type)).toEqual([
    'log',
    'fim_da_luta',
  ]);
});
it('S2-US3-AC9: centro sobre a borda ainda está dentro', () => {
  const sim = prepared(edgeWorld, { vermelho: avanca, azul: parado });
  const state = sim.step();
  expectClose(state.robots[0]!.pose.x, 0.5);
  expect(state).toMatchObject({
    tick: 1,
    status: 'em_andamento',
    resultado: null,
  });
});
it('S2-US3-AC10: a saída prevalece no tick de limite', () => {
  const sim = prepared(edgeWorld, { vermelho: avanca, azul: parado });
  sim.step();
  const final = sim.step();
  expectClose(final.robots[0]!.pose.x, 0.5625);
  expect(final.resultado).toEqual({
    vencedor: 'azul',
    motivo: 'saida_da_arena',
    tick: 2,
  });
});
