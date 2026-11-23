import { expect, it } from 'vitest';
import { ArenaSession } from '../../../src/ui/arena/session';
import { testEngine } from './support';

it('S3-US3-AC17: valida a escalação de um arquivo e conserva a rodada em caso de erro', () => {
  const session = new ArenaSession(testEngine);
  const original = JSON.parse(session.getSnapshot().worldText);
  original.robots.reverse();
  original.robots[0].x = 0.05;
  original.robots[1].x = -0.05;
  session.openWorld(JSON.stringify(original));
  const before = session.getSnapshot();
  expect(session.selectModels('nimbo', 'nimbo')).toBe(false);
  expect(session.selectModels('brontes', 'baluarte')).toBe(false);
  expect(session.getSnapshot().world).toBe(before.world);
  expect(session.getSnapshot().snapshot).toBe(before.snapshot);
  expect(session.getSnapshot().errors[0]?.code).toBe(
    'POSICAO_INICIAL_INVALIDA',
  );
  expect(session.selectModels('nimbo', 'zarpa')).toBe(true);
  expect(
    session.getSnapshot().world.robots.map((r) => [r.id, r.model]),
  ).toEqual([
    ['azul', 'zarpa'],
    ['vermelho', 'nimbo'],
  ]);
});
