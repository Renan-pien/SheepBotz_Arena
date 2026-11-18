import { expect, it } from 'vitest';
import { step } from '../../../../src/core';
import { duel, runControlled } from '../../../helpers/controlled';
import { prepared } from '../../../helpers/prepared';
import { avanca, duelWithMatch, parado } from '../../../helpers/sumo';

it('S2-US3-AC6: preserva o estado, eventos e histórico depois do fim', () => {
  const sim = prepared(duel, { vermelho: avanca, azul: parado }, true);
  const end = sim.stepN(34);
  const history = sim.getHistory();
  expect(sim.stepN(10)).toBe(end);
  expect(sim.step()).toBe(end);
  expect(step(sim.world, end, { vermelho: { v: 1, w: 0 } })).toBe(end);
  expect(() => sim.stepN(-1)).toThrow(RangeError);
  expect(history).toHaveLength(35);
  expect(sim.getHistory()).toEqual(history);
  const restarted = sim.reset();
  expect(restarted).toMatchObject({
    tick: 0,
    status: 'em_andamento',
    resultado: null,
    events: [],
  });
  expect(sim.getHistory()).toEqual([restarted]);
});
it('S2-US3-AC7: avança toda a janela em modo livre', () => {
  const { state } = runControlled(
    duelWithMatch('free', 2),
    { vermelho: avanca, azul: parado },
    5000,
  );
  expect(state).toMatchObject({
    tick: 5000,
    status: 'em_andamento',
    resultado: null,
  });
  expect(state.events).toEqual([]);
});
it('S2-US3-AC8: 110 ticks solicitados devolvem 101 estados se a luta acaba em 100', () => {
  const world = duelWithMatch('sumo', 100);
  const controls = { vermelho: parado, azul: parado };
  const first = runControlled(world, controls, 110, { history: true });
  expect(first.state).toMatchObject({ tick: 100, status: 'finalizada' });
  expect(first.history?.map((state) => state.tick)).toEqual(
    Array.from({ length: 101 }, (_, i) => i),
  );
  expect(first.history?.at(-1)).toBe(first.state);
  expect(runControlled(world, controls, 110, { history: true })).toEqual(first);
});
