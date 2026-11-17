import { expect, it } from 'vitest';
import { runControlled } from '../../../helpers/controlled';
import { prepared } from '../../../helpers/prepared';
import { expectClose } from '../../../helpers/tolerance';
import { robot, worldText } from '../../../helpers/world-builder';

it('S2-US2-AC1: move um robô com comandos do loop', () => {
  const { state } = runControlled(
    worldText(),
    { r1: 'function loop() { setSpeed(1, 0); }' },
    10,
  );
  expectClose(state.robots[0]!.pose.x, 1);
  expectClose(state.robots[0]!.pose.y, 0);
});

it('S2-US2-AC4: usa a última velocidade do passo', () => {
  const { state } = runControlled(
    worldText(),
    {
      r1: 'function loop() { setSpeed(1, 0); setSpeed(0, 1); }',
    },
    1,
  );
  expect(state.robots[0]?.command).toEqual({ v: 0, w: 1 });
});

it('S2-US2-AC5: para a partir do tick 10 usando o laser observado', () => {
  const world = worldText({
    robots: [robot({ laser: { rays: 1, fov: Math.PI / 3, maxRange: 2 } })],
    obstacles: [{ id: 'caixa', x: 1.5, y: 0, width: 0.2, height: 0.4 }],
  });
  const { state, history } = runControlled(
    world,
    {
      r1: 'function loop() { setSpeed(readLaser()[0] > 0.55 ? 1 : 0, 0); }',
    },
    20,
    { history: true },
  );
  expectClose(state.robots[0]!.pose.x, 0.9);
  expect(history?.[9]?.robots[0]?.command.v).toBe(1);
  expect(history?.slice(10).map((entry) => entry.robots[0]?.command.v)).toEqual(
    Array(11).fill(0),
  );
});

it('S2-US2-AC7: executa setup uma vez e loop dez vezes', () => {
  const { state } = runControlled(
    worldText(),
    {
      r1: `let counter;
      function setup() { counter = 0; log('setup'); }
      function loop() { log(++counter); }`,
    },
    10,
  );
  expect(state.events.map((event) => event.message)).toEqual([
    'setup',
    ...Array.from({ length: 10 }, (_, index) => String(index + 1)),
  ]);
});

it('S2-US2-AC8: recarrega o controlador no reset e repete o histórico', () => {
  const simulation = prepared(
    worldText(),
    {
      r1: `let counter;
      function setup() { counter = 0; log('setup'); }
      function loop() { log(++counter); }`,
    },
    true,
  );
  simulation.stepN(10);
  const history = simulation.getHistory();
  const reset = simulation.reset();
  expect(reset.tick).toBe(0);
  expect(reset.events).toEqual([]);
  expect(simulation.getHistory()).toEqual([reset]);
  simulation.stepN(10);
  expect(simulation.getHistory()).toEqual(history);
});

it('S2-US2-AC11: registra a mensagem com o tick e o ID do emissor', () => {
  const { state } = runControlled(
    worldText(),
    {
      r1: 'function loop() { log("olá", 42); }',
    },
    1,
  );
  expect(state.events).toEqual([
    { type: 'log', tick: 1, robotId: 'r1', message: 'olá 42' },
  ]);
});

it('S2-US2-AC12: executa o nível superior uma vez por carga', () => {
  const simulation = prepared(worldText(), {
    r1: `let counter = 0;
      counter++;
      function setup() { log(counter); }
      function loop() { log(++counter); }`,
  });
  const events = simulation.stepN(2).events;
  expect(events.map((event) => [event.tick, event.message])).toEqual([
    [1, '1'],
    [1, '2'],
    [2, '3'],
  ]);
  simulation.reset();
  expect(simulation.step().events.map((event) => event.message)).toEqual([
    '1',
    '2',
  ]);
});

it('produz snapshots e eventos idênticos em lote e entre microtarefas', async () => {
  const world = worldText({
    robots: [robot({ id: 'a' }), robot({ id: 'b', x: 1, y: 1 })],
  });
  const source = `let count = 0;
    function setup() { log('setup', ++count); }
    function loop() { log(++count); setSpeed(0.5, 0); }`;
  const controllers = { b: source, a: source };
  const batch = prepared(world, controllers, true);
  const individual = prepared(world, controllers, true);
  batch.stepN(3);
  for (let i = 0; i < 3; i++) {
    individual.step();
    await Promise.resolve();
  }
  expect(individual.getHistory()).toEqual(batch.getHistory());
  expect(individual.getState().events.map((e) => e.robotId)).toEqual([
    'a',
    'a',
    'b',
    'b',
    'a',
    'b',
    'a',
    'b',
  ]);
});
