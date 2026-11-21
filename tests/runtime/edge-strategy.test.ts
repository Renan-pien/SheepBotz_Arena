import { expect, it } from 'vitest';
import { ArenaSession } from '../../src/ui/arena/session';

it('S2-US2-AC14: código próprio aplicado no editor lê a borda e decide o movimento', () => {
  const session = new ArenaSession();
  const world = JSON.parse(session.getSnapshot().worldText);
  world.robots[0].x = 0.325;
  world.robots[1].x = -0.2;
  session.openWorld(JSON.stringify(world));
  session.editSource(
    'vermelho',
    'function loop(){ const edge = readEdge(); log(edge.front); setSpeed(edge.front ? -1 : 1, 0); }',
  );
  session.apply('vermelho');
  session.step();
  session.step();
  const second = session.getSnapshot().snapshot;
  expect(second.events.map((e) => e.message)).toEqual(['false', 'true']);
  expect(second.robots[0]!.command.v).toBe(-1);
  session.back();
  session.step();
  expect(session.getSnapshot().snapshot).toEqual(second);
});
