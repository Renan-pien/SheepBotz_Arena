import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { loadWorld } from '../../../src/core';
import { robot, worldText } from '../../helpers/world-builder';

function readFixture(name: string): string {
  return readFileSync(
    new URL(`../../fixtures/worlds/${name}.json`, import.meta.url),
    'utf8',
  );
}

function expectError(text: string, code: string, path: string): void {
  const result = loadWorld(text);
  if (result.ok) throw new Error('Esperava um mundo inválido.');
  const error = result.errors.find(
    (candidate) => candidate.code === code && candidate.path === path,
  );
  expect(error).toBeDefined();
  expect(error?.message).toContain(path ? `'${path}'` : '');
}

it.each([
  ['invalido-json', 'ARQUIVO_INVALIDO', ''],
  ['invalido-falta-mapa', 'CAMPO_OBRIGATORIO', 'map'],
  ['invalido-campo-extra', 'CAMPO_DESCONHECIDO', 'extra'],
  ['invalido-tipo', 'TIPO_INVALIDO', 'dt'],
  ['invalido-formato', 'FORMATO_INVALIDO', 'robots[0].id'],
  ['invalido-intervalo', 'VALOR_FORA_DO_INTERVALO', 'seed'],
  ['invalido-duplicado', 'ID_DUPLICADO', 'robots[1].id'],
  ['invalido-fora-do-mapa', 'FORA_DO_MAPA', 'robots[0]'],
  ['invalido-sobreposicao', 'POSICAO_INICIAL_INVALIDA', 'robots[1]'],
  [
    'invalido-deslocamento',
    'DESLOCAMENTO_EXCESSIVO',
    'robots[0].maxLinearSpeed',
  ],
  ['invalido-modalidade', 'REGRA_DA_MODALIDADE', 'robots'],
])('devolve código, caminho e mensagem para %s', (name, code, path) => {
  expectError(readFixture(name), code, path);
});

it('lista de uma vez os erros independentes e evita erros geométricos em cascata', () => {
  const result = loadWorld(readFixture('invalido-tres-erros'));
  if (result.ok) throw new Error('Esperava um mundo inválido.');
  expect(result.errors.map((error) => [error.code, error.path]).sort()).toEqual(
    [
      ['VALOR_FORA_DO_INTERVALO', 'dt'],
      ['VALOR_FORA_DO_INTERVALO', 'robots[0].radius'],
      ['VALOR_FORA_DO_INTERVALO', 'seed'],
    ],
  );
});

it('normaliza valores padrão, pose inicial, ausência de arena e laser', () => {
  const result = loadWorld(
    '{"map":{"width":2,"height":2},"robots":[{"id":"r1","x":0,"y":0}]}',
  );
  expect(result).toEqual({
    ok: true,
    world: {
      name: 'Mundo sem nome',
      seed: 1,
      dt: 0.02,
      map: { width: 2, height: 2 },
      arena: null,
      match: { mode: 'free', maxTicks: 3000 },
      obstacles: [],
      robots: [
        {
          id: 'r1',
          initialPose: { x: 0, y: 0, theta: 0 },
          radius: 0.05,
          maxLinearSpeed: 1,
          maxAngularSpeed: 6,
          color: '#E53935',
          laser: null,
        },
      ],
    },
  });
});

it('mantém a ordem dos robôs, aplica cores por índice e normaliza o laser', () => {
  const result = loadWorld(
    worldText({
      robots: [
        robot({ id: 'b', x: -1, laser: {} }),
        robot({ id: 'a', x: 1, laser: { rays: 1 }, color: '#Aabb01' }),
      ],
    }),
  );
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  expect(
    result.world.robots.map(({ id, color, laser }) => ({ id, color, laser })),
  ).toEqual([
    {
      id: 'b',
      color: '#E53935',
      laser: { rays: 5, fov: Math.PI / 3, maxRange: 1 },
    },
    {
      id: 'a',
      color: '#Aabb01',
      laser: { rays: 1, fov: Math.PI / 3, maxRange: 1 },
    },
  ]);
});

it.each([
  ['[]', 'ARQUIVO_INVALIDO', ''],
  ['null', 'ARQUIVO_INVALIDO', ''],
  [worldText({ map: [] }), 'TIPO_INVALIDO', 'map'],
  [worldText({ obstacles: {} }), 'TIPO_INVALIDO', 'obstacles'],
  [worldText({ robots: [null] }), 'TIPO_INVALIDO', 'robots[0]'],
  [worldText({ name: 10 }), 'TIPO_INVALIDO', 'name'],
  [worldText({ name: '' }), 'VALOR_FORA_DO_INTERVALO', 'name'],
  [worldText({ name: 'a'.repeat(81) }), 'VALOR_FORA_DO_INTERVALO', 'name'],
  [worldText({ seed: 1.5 }), 'TIPO_INVALIDO', 'seed'],
  [worldText({ seed: 4294967296 }), 'VALOR_FORA_DO_INTERVALO', 'seed'],
  [
    '{"map":{"width":1e999,"height":2},"robots":[{"x":0,"y":0,"id":"r"}]}',
    'TIPO_INVALIDO',
    'map.width',
  ],
  [worldText({ robots: [] }), 'VALOR_FORA_DO_INTERVALO', 'robots'],
  [
    worldText({ map: { width: 0, height: 2 } }),
    'VALOR_FORA_DO_INTERVALO',
    'map.width',
  ],
  [worldText({ match: { mode: 'corrida' } }), 'FORMATO_INVALIDO', 'match.mode'],
  [
    worldText({ robots: [robot({ color: 'red' })] }),
    'FORMATO_INVALIDO',
    'robots[0].color',
  ],
  [
    worldText({ robots: [robot({ laser: { rays: 1, maxRange: 0 } })] }),
    'VALOR_FORA_DO_INTERVALO',
    'robots[0].laser.maxRange',
  ],
  [
    worldText({ robots: [robot({ laser: { rays: 361 } })] }),
    'VALOR_FORA_DO_INTERVALO',
    'robots[0].laser.rays',
  ],
  [
    worldText({ robots: [robot({ laser: { fov: 2 * Math.PI + 0.01 } })] }),
    'VALOR_FORA_DO_INTERVALO',
    'robots[0].laser.fov',
  ],
  [
    worldText({ obstacles: [{ id: 'a', x: 1.9, y: 0, width: 1, height: 1 }] }),
    'FORA_DO_MAPA',
    'obstacles[0]',
  ],
  [
    worldText({ obstacles: [{ id: 'a', x: 0, y: 0, width: 1, height: 1 }] }),
    'POSICAO_INICIAL_INVALIDA',
    'robots[0]',
  ],
  [worldText({ arena: { radius: 2.01 } }), 'FORA_DO_MAPA', 'arena.radius'],
  [
    worldText({
      match: { mode: 'sumo' },
      robots: [robot(), robot({ id: 'r2', x: 1 })],
    }),
    'REGRA_DA_MODALIDADE',
    'arena',
  ],
])('valida a restrição estrutural ou geométrica %#: %s', (text, code, path) => {
  expectError(text, code, path);
});
