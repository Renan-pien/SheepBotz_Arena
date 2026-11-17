import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { loadWorld } from '../../../../src/core';
import { expectAngleClose, expectPoseClose } from '../../../helpers/tolerance';
import { makeWorld, robot, worldText } from '../../../helpers/world-builder';

const duel = readFileSync(
  new URL('../../../../examples/worlds/duelo-padrao.json', import.meta.url),
  'utf8',
);

function errors(text: string) {
  const result = loadWorld(text);
  if (result.ok) throw new Error('Esperava um mundo inválido.');
  return result.errors.map(({ code, path }) => ({ code, path }));
}

it('S1-US1-AC1: carrega o Duelo padrão com os robôs e as poses declaradas', () => {
  const result = loadWorld(duel);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));

  expect(result.world.robots.map(({ id }) => id)).toEqual(['vermelho', 'azul']);
  expectPoseClose(result.world.robots[0]!.initialPose, {
    x: -0.2,
    y: 0,
    theta: 0,
  });
  expectPoseClose(result.world.robots[1]!.initialPose, {
    x: 0.2,
    y: 0,
    theta: Math.PI,
  });
});

it('S1-US1-AC2: rejeita um documento truncado', () => {
  expect(errors('{"map": ')).toEqual([{ code: 'ARQUIVO_INVALIDO', path: '' }]);
});

it('S1-US1-AC3: indica o mapa obrigatório ausente', () => {
  expect(errors(worldText({ map: undefined }))).toContainEqual({
    code: 'CAMPO_OBRIGATORIO',
    path: 'map',
  });
});

it('S1-US1-AC4: indica o raio com tipo incorreto', () => {
  expect(
    errors(worldText({ robots: [robot({ radius: '0.1' })] })),
  ).toContainEqual({
    code: 'TIPO_INVALIDO',
    path: 'robots[0].radius',
  });
});

it('S1-US1-AC5: rejeita um passo de 0.5 s', () => {
  expect(errors(worldText({ dt: 0.5 }))).toContainEqual({
    code: 'VALOR_FORA_DO_INTERVALO',
    path: 'dt',
  });
});

it('S1-US1-AC6: indica a segunda ocorrência do ID', () => {
  expect(
    errors(worldText({ robots: [robot(), robot({ x: 1 })] })),
  ).toContainEqual({
    code: 'ID_DUPLICADO',
    path: 'robots[1].id',
  });
});

it('S1-US1-AC7: indica o campo desconhecido', () => {
  expect(
    errors(worldText({ robots: [robot({ velocidade: 1 })] })),
  ).toContainEqual({
    code: 'CAMPO_DESCONHECIDO',
    path: 'robots[0].velocidade',
  });
});

it('S1-US1-AC8: reúne três erros independentes', () => {
  expect(
    errors(
      worldText({ dt: 0.5, seed: -1, robots: [robot({ radius: 0 })] }),
    ).sort((a, b) => a.path.localeCompare(b.path)),
  ).toEqual(
    ['dt', 'robots[0].radius', 'seed'].map((path) => ({
      code: 'VALOR_FORA_DO_INTERVALO',
      path,
    })),
  );
});

it('S1-US1-AC9: normaliza a orientação na carga do mundo', () => {
  const result = loadWorld(worldText({ robots: [robot({ theta: 7 })] }));
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  expectAngleClose(result.world.robots[0]!.initialPose.theta, 0.716815);
});

it('S1-US1-AC10: rejeita deslocamento por tick maior que o raio', () => {
  const world = makeWorld({ robots: [robot({ maxLinearSpeed: 2 })] });
  expect(errors(JSON.stringify(world))).toContainEqual({
    code: 'DESLOCAMENTO_EXCESSIVO',
    path: 'robots[0].maxLinearSpeed',
  });
});

it('S1-US1-AC11: valida o centro do robô contra a borda da arena', () => {
  const onEdge = duel.replace('"x": 0.2', '"x": 0.385');
  const outside = duel.replace('"x": 0.2', '"x": 0.400');
  const accepted = loadWorld(onEdge);
  if (!accepted.ok) throw new Error(JSON.stringify(accepted.errors));
  expect(accepted.world.robots[1]!.initialPose.x).toBe(0.385);
  expect(errors(outside)).toEqual([
    { code: 'REGRA_DA_MODALIDADE', path: 'robots[1]' },
  ]);
});
