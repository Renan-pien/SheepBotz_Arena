import { expect, it } from 'vitest';
import { createInitialState, type SimState } from '../../../src/core';
import { evaluateSumo } from '../../../src/core/match/sumo';
import { normalizedWorld } from '../../helpers/controlled';
import { duelWithMatch } from '../../helpers/sumo';

const world = normalizedWorld(duelWithMatch('sumo', 2));
const start = createInitialState(world);
function state(x1: number, x2: number, tick: number): SimState {
  return {
    ...start,
    tick,
    robots: start.robots.map((robot, i) => ({
      ...robot,
      pose: { ...robot.pose, x: i === 0 ? x1 : x2 },
    })),
  };
}
it('compara os centros com limite estrito e só aplica regras em sumô', () => {
  expect(evaluateSumo(world, state(-0.385, 0.385, 1))).toBeNull();
  expect(
    evaluateSumo(
      { ...world, match: { ...world.match, mode: 'free' } },
      state(-1, 1, 2),
    ),
  ).toBeNull();
});
it('avalia saída individual e simultânea antes de tempo esgotado', () => {
  expect(evaluateSumo(world, state(-0.4, 0.2, 2))).toEqual({
    vencedor: 'azul',
    motivo: 'saida_da_arena',
    tick: 2,
  });
  expect(evaluateSumo(world, state(-0.4, 0.4, 2))).toEqual({
    vencedor: null,
    motivo: 'ambos_sairam',
    tick: 2,
  });
  expect(evaluateSumo(world, state(-0.2, 0.2, 2))).toEqual({
    vencedor: null,
    motivo: 'tempo_esgotado',
    tick: 2,
  });
});
