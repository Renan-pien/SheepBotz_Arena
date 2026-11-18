import { expect, it } from 'vitest';
import { runControlled } from '../../../helpers/controlled';
import { prepared } from '../../../helpers/prepared';
import { robot, worldText } from '../../../helpers/world-builder';

const robots = [robot({ id: 'a' }), robot({ id: 'b', x: 1, y: 1 })];
const source = 'function loop() { log(random()); }';
const controls = { a: source, b: source };

it('S2-US2-AC10: repete estados e eventos na mesma semente', () => {
  const options = { history: true };
  const world = worldText({ seed: 1, robots });
  const first = runControlled(world, controls, 10, options);
  expect(runControlled(world, controls, 10, options)).toEqual(first);
  const second = runControlled(
    worldText({ seed: 2, robots }),
    controls,
    10,
    options,
  );
  for (const id of ['a', 'b']) {
    const events = first.state.events.filter((event) => event.robotId === id);
    expect(events).toHaveLength(10);
    expect(
      second.state.events.filter((event) => event.robotId === id),
    ).not.toEqual(events);
  }
});
it('separa o consumo por robô e reinicia as sequências no reset', () => {
  const world = worldText({ seed: 0, robots });
  const first = runControlled(world, controls, 5);
  const alternate = runControlled(
    world,
    {
      a: source,
      b: 'function loop() { random(); random(); log(random()); }',
    },
    5,
  );
  expect(
    alternate.state.events.filter((event) => event.robotId === 'a'),
  ).toEqual(first.state.events.filter((event) => event.robotId === 'a'));
  const simulator = prepared(world, controls, true);
  const before = simulator.stepN(5);
  simulator.reset();
  expect(simulator.stepN(5)).toEqual(before);
});
