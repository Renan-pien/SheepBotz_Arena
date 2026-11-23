import { expect, it } from 'vitest';
import {
  loadWorld,
  modelIds,
  robotModels,
  runHeadless,
} from '../../../../src/core';

function document() {
  return {
    dt: 0.02,
    map: { width: 2, height: 2 },
    arena: { radius: 0.385 },
    match: { mode: 'sumo' },
    robots: [
      { id: 'a', x: -0.06, y: 0, theta: 0, model: 'baluarte' },
      { id: 'b', x: 0.04, y: 0, theta: Math.PI, model: 'nimbo' },
    ],
  };
}
function fight(v: number, w: number, reversed = false) {
  const world = document();
  if (reversed) world.robots.reverse();
  const result = runHeadless({
    world: JSON.stringify(world),
    commands: { a: { v: 0.5, w: 0 }, b: { v, w } },
    ticks: 1,
    history: true,
  });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result;
}
it('S1-US5-AC6: a força e o peso de Baluarte vencem o contato frontal em ambas as ordens', () => {
  const duel = fight(0.5, 0);
  expect(fight(0.5, 0).history).toEqual(duel.history);
  for (const { state } of [duel, fight(0.5, 0, true)]) {
    const strong = state.robots.find((robot) => robot.id === 'a')!;
    const light = state.robots.find((robot) => robot.id === 'b')!;
    expect(strong.pose.x).toBeCloseTo(-0.051538, 5);
    expect(light.pose.x).toBeCloseTo(0.048462, 5);
    expect(strong.bumper && light.bumper).toBe(true);
  }
});
it('S1-US5-AC7: Nimbo cede menos ao mesmo empurrão quando está parado', () => {
  expect(fight(0, 0).state.robots[1]!.pose.x).toBeCloseTo(0.046667, 5);
  expect(fight(0, 1).state.robots[1]!.pose.x).toBeCloseTo(0.049231, 5);
});
it('S1-US1-AC13: o perfil define o raio antes da validação geométrica', () => {
  const doc = document();
  const loaded = loadWorld(JSON.stringify(doc));
  if (!loaded.ok) throw new Error(JSON.stringify(loaded.errors));
  expect(loaded.world.robots.map((robot) => robot.radius)).toEqual([
    0.06, 0.04,
  ]);
  doc.robots[1]!.x = 0.039;
  expect(loadWorld(JSON.stringify(doc))).toMatchObject({
    ok: false,
    errors: expect.arrayContaining([
      {
        code: 'POSICAO_INICIAL_INVALIDA',
        path: 'robots[1]',
        message: expect.any(String),
      },
    ]),
  });
});
it('S1-US1-AC13: modelo desconhecido, raio divergente e dupla repetida são diagnosticados', () => {
  for (const [fields, code, path] of [
    [{ model: 'ausente' }, 'FORMATO_INVALIDO', 'robots[1].model'],
    [{ radius: 0.07 }, 'FORMATO_INVALIDO', 'robots[1].radius'],
    [{ model: 'baluarte' }, 'REGRA_DA_MODALIDADE', 'robots[1].model'],
  ] as const) {
    const doc = document();
    Object.assign(doc.robots[1]!, fields);
    const loaded = loadWorld(JSON.stringify(doc));
    expect(loaded).toMatchObject({
      ok: false,
      errors: expect.arrayContaining([expect.objectContaining({ code, path })]),
    });
  }
});

it('S1-US5-AC7: sob um empurrão idêntico os nove modelos parados cedem em ordem de tamanho', () => {
  let previous = 0;
  for (const model of modelIds) {
    const source = document();
    const radius = robotModels[model].radius;
    const world = {
      ...source,
      robots: [
        { ...source.robots[0], model: undefined, x: -0.05 },
        { ...source.robots[1], model, x: radius },
      ],
    };
    const result = runHeadless({
      world: JSON.stringify(world),
      ticks: 1,
      commands: { a: { v: 0.5, w: 0 } },
    });
    if (!result.ok) throw new Error(JSON.stringify(result.errors));
    const shift = result.state.robots[1]!.pose.x - radius;
    expect(shift).toBeGreaterThan(previous);
    previous = shift;
  }
});

it('S1-US1-AC14: cada categoria contém três perfis físicos distintos, ordenados por peso', () => {
  const expected = [
    ['nimbo', 'light', 0.04, 0.2, 1, 6],
    ['pulga', 'light', 0.042, 0.21, 1.5, 5.6],
    ['zarpa', 'light', 0.044, 0.23, 2, 5],
    ['quimera', 'medium', 0.048, 0.28, 3, 4],
    ['arraia', 'medium', 0.05, 0.3, 3.5, 3.5],
    ['torvelim', 'medium', 0.052, 0.32, 4, 3],
    ['brontes', 'heavy', 0.056, 0.36, 5, 2],
    ['monolito', 'heavy', 0.058, 0.38, 5.5, 1.5],
    ['baluarte', 'heavy', 0.06, 0.4, 6, 1],
  ];
  expect(
    modelIds.map((id) => {
      const { weightClass, radius, massKg, force, traction } = robotModels[id];
      return [id, weightClass, radius, massKg, force, traction];
    }),
  ).toEqual(expected);
  for (const property of ['radius', 'massKg', 'force', 'traction'] as const) {
    const values = modelIds.map((id) => robotModels[id][property]);
    expect(new Set(values).size).toBe(9);
    expect(values).toEqual(
      [...values].sort((a, b) => (property === 'traction' ? b - a : a - b)),
    );
  }
});
