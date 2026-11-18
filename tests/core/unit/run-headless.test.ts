import { expect, it } from 'vitest';
import { runHeadless, type Command } from '../../../src/core';
import { worldText } from '../../helpers/world-builder';

const world = worldText();

it('informa o ID de comando que não existe no mundo', () => {
  const result = runHeadless({
    world,
    ticks: 1,
    commands: { ausente: { v: 1, w: 0 } },
  });
  expect(result).toEqual({
    ok: false,
    errors: [
      {
        code: 'ROBO_INEXISTENTE',
        path: 'commands.ausente',
        message: "Não existe robô com id 'ausente' (em 'commands.ausente').",
      },
    ],
  });
});

it('acumula todos os erros de comandos antes de iniciar a simulação', () => {
  const result = runHeadless({
    world,
    ticks: 1,
    commands: {
      r1: { v: '1', w: 0 } as unknown as Command,
      ausente: { v: 0, w: Infinity },
    },
  });
  if (result.ok) throw new Error('Esperava comandos inválidos.');
  expect(result.errors.map(({ code, path }) => [code, path])).toEqual([
    ['COMANDO_INVALIDO', 'commands.r1'],
    ['ROBO_INEXISTENTE', 'commands.ausente'],
    ['COMANDO_INVALIDO', 'commands.ausente'],
  ]);
});

it('devolve primeiro os erros de mundo, sem validar comandos para um mundo inválido', () => {
  expect(
    runHeadless({
      world: '[',
      ticks: 0,
      commands: { ausente: { v: 0, w: 0 } },
    }),
  ).toEqual({
    ok: false,
    errors: [expect.objectContaining({ code: 'ARQUIVO_INVALIDO', path: '' })],
  });
});

it.each([-1, 0.5, NaN, Infinity])(
  'rejeita %s ticks com RangeError',
  (ticks) => {
    expect(() => runHeadless({ world, ticks })).toThrow(RangeError);
  },
);

it('devolve todos os estados de 0 a N quando o histórico é solicitado', () => {
  const result = runHeadless({
    world,
    ticks: 3,
    history: true,
    commands: { r1: { v: 0.5, w: 0 } },
  });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  expect(result.history?.map(({ tick }) => tick)).toEqual([0, 1, 2, 3]);
  expect(result.history?.[3]).toEqual(result.state);
  expect(result.history?.[0]?.robots[0]).toEqual({
    id: 'r1',
    pose: { x: 0, y: 0, theta: 0 },
    command: { v: 0, w: 0 },
    bumper: false,
    odometry: { x: 0, y: 0, theta: 0 },
    laser: [],
    situacao: 'ativo',
  });
});

it('omite o histórico por padrão', () => {
  const result = runHeadless({ world, ticks: 0 });
  expect(result.ok).toBe(true);
  expect(result).not.toHaveProperty('history');
});
