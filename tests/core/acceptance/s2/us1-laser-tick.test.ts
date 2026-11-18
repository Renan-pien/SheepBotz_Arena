import { expect, it } from 'vitest';
import { runControlled } from '../../../helpers/controlled';
import { prepared } from '../../../helpers/prepared';
import { expectClose } from '../../../helpers/tolerance';
import { robot, worldText } from '../../../helpers/world-builder';

const world = worldText({
  robots: [robot({ laser: { rays: 1, fov: Math.PI / 3, maxRange: 3 } })],
});
const controls = {
  r1: `function setup() { log(readLaser()[0]); }
    function loop() { log(readLaser()[0]); setSpeed(1, 0); }`,
};

it('S2-US1-AC9: readLaser retorna lista vazia sem sensor', () => {
  const { state } = runControlled(
    worldText(),
    {
      r1: 'function loop() { log(Array.isArray(readLaser()), readLaser().length); }',
    },
    1,
  );
  expect(state.events[0]?.message).toBe('true 0');
});
it('S2-US1-AC10: setup e loop observam 2 m e o estado publica 1.9 m', () => {
  const { state } = runControlled(world, controls, 1);
  expect(state.events.map((event) => event.message)).toEqual(['2', '2']);
  expectClose(state.robots[0]!.pose.x, 0.1);
  expectClose(state.robots[0]!.laser[0]!, 1.9);
});
it('S2-US1-AC11: reset publica as leituras do tick 0', () => {
  const sim = prepared(world, controls, true);
  const first = sim.step();
  const afterReset = sim.reset();
  expect(afterReset.tick).toBe(0);
  expectClose(afterReset.robots[0]!.pose.x, 0);
  expectClose(afterReset.robots[0]!.laser[0]!, 2);
  expectClose(first.robots[0]!.laser[0]!, 1.9);
});
it('readLaser devolve cópia e o estado publicado mantém as leituras anteriores', () => {
  const sim = prepared(
    world,
    {
      r1: `function setup() { const readings = readLaser(); readings[0] = 42; }
      function loop() { log(readLaser()[0]); setSpeed(1, 0); }`,
    },
    true,
  );
  const initial = sim.getState();
  const first = sim.step();
  expect(first.events[0]?.message).toBe('2');
  expect(initial.robots[0]!.laser).toEqual([2]);
  sim.step();
  expectClose(first.robots[0]!.laser[0]!, 1.9);
});
