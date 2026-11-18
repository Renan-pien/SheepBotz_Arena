import { expect, it } from 'vitest';
import { step } from '../../../../src/core';
import { duel } from '../../../helpers/controlled';
import { prepared } from '../../../helpers/prepared';
import { avanca } from '../../../helpers/sumo';
import { expectClose } from '../../../helpers/tolerance';

it('S2-US4-AC6: o robô desativado no tick 1 pode ser empurrado para fora', () => {
  const sim = prepared(
    duel,
    {
      vermelho: avanca,
      azul: `function setup() { throw Error('azul inativo'); }
      function loop() { log('não executado'); setSpeed(1, 0); }`,
    },
    true,
  );
  expectClose(sim.getState().robots[1]!.pose.x, 0.2);
  const first = sim.step();
  expect(first.robots[1]).toMatchObject({
    situacao: 'desativado',
    command: { v: 0, w: 0 },
  });
  const explicit = step(sim.world, first, { azul: { v: 1, w: 0 } });
  expect(explicit.robots[1]?.command).toEqual({ v: 0, w: 0 });
  const end = sim.stepN(100);
  expectClose(end.robots[1]!.pose.x, 0.39);
  expect(end.resultado).toEqual({
    vencedor: 'vermelho',
    motivo: 'saida_da_arena',
    tick: 34,
  });
  expect(end.events.map((event) => event.type)).toEqual([
    'erro_controlador',
    'fim_da_luta',
  ]);
  expect(sim.reset().robots[1]?.situacao).toBe('ativo');
});
