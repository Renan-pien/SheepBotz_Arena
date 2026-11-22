import { expect, it } from 'vitest';
import { ArenaSession } from '../../src/ui/arena/session';

it('S3-US2-AC12: retomar preserva closures, sorteios, contatos, falhas e logs no motor real', () => {
  function duel() {
    const session = new ArenaSession();
    session.editSource(
      'vermelho',
      `
      let count = 0;
      let offset;
      function setup() { offset = random(); }
      function loop() {
        if (getInfo().startReleased === false) return;
        log(++count, offset, random(), readBumper());
        setSpeed(1, 0);
      }
    `,
    );
    session.apply('vermelho');
    session.editSource(
      'azul',
      `
      function loop() {
        if (getInfo().startReleased === false) return;
        if (readBumper()) throw Error('contato');
        setSpeed(0, random());
      }
    `,
    );
    session.apply('azul');
    return session;
  }
  const baseline = duel();
  const reviewed = duel();
  for (let tick = 0; tick < 275; tick++) {
    baseline.step();
    reviewed.step();
  }
  const states = baseline.history();
  expect(states.some((s) => s.robots.some((r) => r.bumper))).toBe(true);
  expect(states[275]!.events.some((e) => e.type === 'erro_controlador')).toBe(
    true,
  );
  for (let tick = 274; tick >= 253; tick--) {
    reviewed.back();
    expect(reviewed.getSnapshot().snapshot).toEqual(states[tick]);
  }
  reviewed.play();
  reviewed.pulse(500);
  reviewed.pause();
  for (let tick = 275; tick < 278; tick++) baseline.step();
  expect(reviewed.history()).toEqual(baseline.history());
  reviewed.step();
  baseline.step();
  expect(reviewed.getSnapshot().snapshot).toEqual(
    baseline.getSnapshot().snapshot,
  );
});
