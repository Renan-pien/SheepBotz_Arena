import { expect, it } from 'vitest';
import { ArenaSession } from '../../src/ui/arena/session';

it('S3-US2-AC15: rodadas consecutivas restauram sensores, pose, closures e PRNG e aguardam um comando', () => {
  const session = new ArenaSession();
  session.editSource(
    'vermelho',
    'let n=0; function setup(){log(random())} function loop(){log(++n, random());setSpeed(0,1)}',
  );
  session.apply('vermelho');
  session.setStallSeconds(5);
  const initial = session.getSnapshot().snapshot;
  session.step();
  const first = session.getSnapshot().snapshot;
  for (let round = 1; round <= 2; round++) {
    for (let tick = 1; tick < 250; tick++) session.step();
    const view = session.getSnapshot();
    expect(view.snapshot).toEqual(initial);
    expect(view).toMatchObject({
      status: 'pausada',
      stallSeconds: 5,
      lastDraw: {
        round,
        result: { vencedor: null, tick: 250, motivo: 'falta_de_progresso' },
      },
    });
    const archive = view.lastDraw!.recording;
    expect(archive.states).toHaveLength(251);
    expect(
      archive.states.at(-1)!.events.filter((e) => e.type === 'fim_da_luta'),
    ).toHaveLength(1);
    expect(archive.controllers).toEqual(view.controllers);
    session.pulse(2000);
    session.back();
    expect(session.history()).toEqual([initial]);
    session.step();
    expect(session.getSnapshot().snapshot).toEqual(first);
  }
});
