import { expect, it, vi } from 'vitest';
import { createInitialState } from '../../../src/core';
import { createControllerRunner } from '../../../src/core/controller/runner';
import { normalizedWorld } from '../../helpers/controlled';
import { robot, worldText } from '../../helpers/world-builder';

it('descarta o comando do robô que falhou e executa os seguintes', () => {
  const world = normalizedWorld(
    worldText({
      robots: [robot({ id: 'a' }), robot({ id: 'b', x: 1, y: 1 })],
    }),
  );
  const runner = createControllerRunner(world);
  const a = runner.bindingsFor('a');
  const b = runner.bindingsFor('b');
  const loopA = vi.fn();
  const scripts = new Map([
    [
      'a',
      {
        setup() {
          a.setSpeed!(1, 0);
          throw new Error('erro a');
        },
        loop: loopA,
      },
    ],
    [
      'b',
      {
        loop() {
          b.setSpeed!(0.5, 0);
        },
      },
    ],
  ]);
  const result = runner.run(createInitialState(world), {}, scripts);
  expect(loopA).not.toHaveBeenCalled();
  expect(result.commands).toEqual({ a: { v: 0, w: 0 }, b: { v: 0.5, w: 0 } });
  expect(result.events).toEqual([
    { type: 'erro_controlador', tick: 1, robotId: 'a', message: 'erro a' },
  ]);
  expect([...result.disabled]).toEqual(['a']);
});

it('persiste a primeira falha quando setSpeed inválido é capturado', () => {
  const world = normalizedWorld(worldText());
  const runner = createControllerRunner(world);
  const api = runner.bindingsFor('r1');
  const scripts = new Map([
    [
      'r1',
      {
        loop() {
          try {
            api.setSpeed!('x', 0);
          } catch {
            api.setSpeed!(1, 0);
          }
          throw new Error('falha seguinte');
        },
      },
    ],
  ]);
  const result = runner.run(createInitialState(world), {}, scripts);
  expect(result.commands.r1).toEqual({ v: 0, w: 0 });
  expect(result.events[0]?.message).toBe(
    'setSpeed exige dois números finitos.',
  );
});

it('registra uma mensagem quando o valor lançado não é conversível em texto', () => {
  const world = normalizedWorld(worldText());
  const runner = createControllerRunner(world);
  const scripts = new Map([
    [
      'r1',
      {
        loop() {
          throw Object.create(null);
        },
      },
    ],
  ]);
  const result = runner.run(createInitialState(world), {}, scripts);
  expect(result.events[0]?.message).toBe(
    'O controlador lançou um valor sem mensagem.',
  );
});
