import { expect, it, vi } from 'vitest';
import { loadWorld } from '../../../src/core';
import { prepareInputs } from '../../../src/core/controller/inputs';
import { robot, worldText } from '../../helpers/world-builder';

function world() {
  const loaded = loadWorld(
    worldText({
      robots: [robot({ id: 'r1' }), robot({ id: 'r2', x: 1 })],
    }),
  );
  if (!loaded.ok) throw new Error(JSON.stringify(loaded.errors));
  return loaded.world;
}

it('agrupa erros sem tentar carregar entradas inelegíveis', () => {
  const load = vi.fn(() => ({ ok: false as const, message: 'erro de carga' }));
  const bindings = vi.fn(() => ({}));
  const result = prepareInputs(
    world(),
    {
      commands: { fantasma: { v: Infinity, w: 0 }, r1: { v: 0, w: 0 } },
      controllers: {
        r2: 'falha elegível',
        r1: 'conflito',
        fantasma: 'ausente',
      },
      controllerEngine: { load },
    },
    bindings,
  );
  if (result.ok) throw new Error('O preparo deveria falhar.');
  expect(result.errors.map(({ code, path }) => [code, path])).toEqual([
    ['ROBO_INEXISTENTE', 'commands.fantasma'],
    ['COMANDO_INVALIDO', 'commands.fantasma'],
    ['ENTRADA_CONFLITANTE', 'controllers.r1'],
    ['ROBO_INEXISTENTE', 'controllers.fantasma'],
    ['ENTRADA_CONFLITANTE', 'controllers.fantasma'],
    ['CONTROLADOR_INVALIDO', 'controllers.r2'],
  ]);
  expect(load).toHaveBeenCalledExactlyOnceWith('falha elegível', {});
  expect(bindings).toHaveBeenCalledExactlyOnceWith('r2');
});

it('carrega em ordem do mundo, mesmo quando os scripts chegam na ordem inversa', () => {
  const loop = vi.fn();
  const load = vi.fn(() => ({ ok: true as const, value: { loop } }));
  const result = prepareInputs(
    world(),
    {
      controllers: { r2: 'segundo', r1: 'primeiro' },
      controllerEngine: { load },
    },
    () => ({}),
  );
  expect(load.mock.calls).toEqual([
    ['primeiro', {}],
    ['segundo', {}],
  ]);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  expect([...result.controllers.keys()]).toEqual(['r1', 'r2']);
});
