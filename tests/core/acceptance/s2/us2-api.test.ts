import { expect, it } from 'vitest';
import { duel, runControlled } from '../../../helpers/controlled';
import { expectClose } from '../../../helpers/tolerance';
import { robot, worldText } from '../../../helpers/world-builder';

it('S2-US2-AC2: mantém o comando sem nova chamada a setSpeed', () => {
  const { state } = runControlled(
    worldText(),
    {
      r1: 'function loop() { if (getInfo().tick === 0) setSpeed(1, 0); }',
    },
    10,
  );
  expectClose(state.robots[0]!.pose.x, 1);
  expect(state.robots[0]?.command).toEqual({ v: 1, w: 0 });
});
it('S2-US2-AC3: a parada usa o tick do estado observado', () => {
  const { state } = runControlled(
    worldText(),
    {
      r1: 'function loop() { setSpeed(getInfo().tick < 5 ? 1 : 0, 0); }',
    },
    10,
  );
  expectClose(state.robots[0]!.pose.x, 0.5);
  expect(state.robots[0]?.command).toEqual({ v: 0, w: 0 });
});
it('S2-US2-AC6: reage ao bumper e preserva a odometria', () => {
  const world = worldText({
    map: { width: 2, height: 2 },
    robots: [robot({ x: 0.75 })],
  });
  const { state } = runControlled(
    world,
    {
      r1: `let reverse = false;
      function loop() { if (readBumper()) reverse = true; setSpeed(reverse ? -1 : 1, 0); }`,
    },
    10,
  );
  expectClose(state.robots[0]!.pose.x, 0.1);
  expectClose(state.robots[0]!.odometry.x, 0.15);
  expect(state.robots[0]?.bumper).toBe(false);
});
it('S2-US2-AC9: informa configuração e tempo do estado observado', () => {
  const { state } = runControlled(
    duel,
    {
      vermelho: 'function loop() { log(JSON.stringify(getInfo())); }',
    },
    1,
  );
  const info = JSON.parse(state.events[0]!.message);
  expect(info).toEqual({
    id: 'vermelho',
    tick: 0,
    time: 0,
    dt: 0.02,
    radius: 0.05,
    maxLinearSpeed: 1,
    maxAngularSpeed: 6,
    arenaRadius: 0.385,
    laser: { rays: 5, fov: Math.PI / 3, maxRange: 0.8 },
  });
});
it('devolve cópias da odometria e da configuração do laser', () => {
  const { state } = runControlled(
    duel,
    {
      vermelho: `function loop() {
      getInfo().laser.maxRange = 100;
      readOdometry().x = 100;
      log(getInfo().laser.maxRange, readOdometry().x);
    }`,
    },
    1,
  );
  expect(state.events[0]?.message).toBe('0.8 -0.2');
  const withoutLaser = runControlled(
    worldText(),
    {
      r1: 'function loop() { log(getInfo().arenaRadius, getInfo().laser); }',
    },
    1,
  );
  expect(withoutLaser.state.events[0]?.message).toBe('null null');
});
