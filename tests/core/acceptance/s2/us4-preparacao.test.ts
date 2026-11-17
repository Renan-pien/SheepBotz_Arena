import { describe, expect, it } from 'vitest';
import { runHeadless, type Command } from '../../../../src/core';
import { controllerOptions, duel } from '../../../helpers/controlled';
import { worldText } from '../../../helpers/world-builder';

const parado = 'function loop() {}';
const sintaxeInvalida = 'function loop( {';
const falha = 'function loop() {}\nthrow new Error("falha no carregamento");';

function problems(
  controllers: Record<string, string>,
  commands?: Record<string, Command>,
  world = duel,
) {
  const result = runHeadless({
    world,
    ticks: 0,
    commands,
    ...controllerOptions(controllers),
  });
  expect(result.ok).toBe(false);
  expect(result).not.toHaveProperty('state');
  if (result.ok) throw new Error('A simulação foi iniciada.');
  return result.errors;
}

describe('falhas anteriores ao tick 0', () => {
  it('S2-US4-AC1: preserva o erro de sintaxe no caminho do controlador', () => {
    expect(problems({ vermelho: sintaxeInvalida })).toEqual([
      {
        code: 'CONTROLADOR_INVALIDO',
        path: 'controllers.vermelho',
        message: expect.stringMatching(
          /controllers\.vermelho.*Unexpected token/,
        ),
      },
    ]);
  });

  it('S2-US4-AC2: exige loop()', () => {
    expect(problems({ vermelho: 'const contador = 1;' })).toEqual([
      {
        code: 'CONTROLADOR_INVALIDO',
        path: 'controllers.vermelho',
        message: expect.stringContaining('A função loop() é obrigatória.'),
      },
    ]);
  });

  it('S2-US4-AC7: recusa controlador para robô inexistente', () => {
    expect(problems({ fantasma: parado })).toMatchObject([
      { code: 'ROBO_INEXISTENTE', path: 'controllers.fantasma' },
    ]);
  });

  it('S2-US4-AC8: preserva a exceção original da carga', () => {
    expect(problems({ azul: falha })).toMatchObject([
      {
        code: 'CONTROLADOR_INVALIDO',
        path: 'controllers.azul',
        message: expect.stringContaining('falha no carregamento'),
      },
    ]);
  });

  it('S2-US4-AC9: a API não existe durante a avaliação inicial', () => {
    expect(
      problems({ vermelho: 'readLaser(); function loop() {}' }),
    ).toMatchObject([
      {
        code: 'CONTROLADOR_INVALIDO',
        path: 'controllers.vermelho',
        message: expect.stringContaining('readLaser'),
      },
    ]);
  });

  it('S2-US4-AC10: devolve cada falha de carga na ordem dos robôs', () => {
    expect(problems({ azul: falha, vermelho: sintaxeInvalida })).toMatchObject([
      { code: 'CONTROLADOR_INVALIDO', path: 'controllers.vermelho' },
      { code: 'CONTROLADOR_INVALIDO', path: 'controllers.azul' },
    ]);
  });

  it('S2-US4-AC11: acusa comando e controlador simultâneos', () => {
    expect(
      problems({ vermelho: parado }, { vermelho: { v: 0, w: 0 } }),
    ).toMatchObject([
      { code: 'ENTRADA_CONFLITANTE', path: 'controllers.vermelho' },
    ]);
  });

  it('S2-US4-AC12: reúne erros de entrada e falhas de cargas elegíveis', () => {
    const commands = { vermelho: { v: 0, w: 0 } };
    const controllers = {
      vermelho: sintaxeInvalida,
      azul: falha,
      fantasma: parado,
    };
    expect(problems(controllers, commands)).toMatchObject([
      { code: 'ENTRADA_CONFLITANTE', path: 'controllers.vermelho' },
      { code: 'ROBO_INEXISTENTE', path: 'controllers.fantasma' },
      { code: 'CONTROLADOR_INVALIDO', path: 'controllers.azul' },
    ]);
  });

  it('recusa forma assíncrona antes de executar a carga', () => {
    expect(problems({ vermelho: 'async function loop() {}' })).toMatchObject([
      {
        code: 'CONTROLADOR_INVALIDO',
        path: 'controllers.vermelho',
        message: expect.stringContaining('assíncrono'),
      },
    ]);
  });

  it('só reporta erros do mundo quando o mundo não é válido', () => {
    expect(
      problems({ fantasma: sintaxeInvalida }, undefined, '{'),
    ).toMatchObject([{ code: 'ARQUIVO_INVALIDO', path: '' }]);
  });

  it('deixa parado o robô sem associação de comando nem script', () => {
    const result = runHeadless({ world: worldText(), ticks: 1 });
    if (!result.ok) throw new Error(JSON.stringify(result.errors));
    expect(result.state.robots[0]?.command).toEqual({ v: 0, w: 0 });
    expect(result.state.robots[0]?.pose).toEqual({ x: 0, y: 0, theta: 0 });
  });
});
