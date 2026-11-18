import { expect, it } from 'vitest';
import { runHeadless } from '../../../../src/core';
import { duel } from '../../../helpers/duel';
import { expectClose } from '../../../helpers/tolerance';
import { robot, worldText } from '../../../helpers/world-builder';

const laser = { rays: 3, fov: Math.PI / 3, maxRange: 3 };
const caixa = { id: 'caixa', x: 1, y: 0, width: 0.2, height: 0.4 };
function check(text: string, expected: number[][]) {
  const result = runHeadless({ world: text, ticks: 0 });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  expect(result.state).toMatchObject({
    tick: 0,
    status: 'em_andamento',
    resultado: null,
    events: [],
  });
  expect(result.state.robots).toHaveLength(expected.length);
  expected.forEach((readings, i) => {
    const actual = result.state.robots[i]!.laser;
    expect(actual).toHaveLength(readings.length);
    readings.forEach((distance, ray) => expectClose(actual[ray]!, distance));
  });
}

it('S2-US1-AC1: mede até as três direções de parede', () => {
  check(worldText({ robots: [robot({ laser })] }), [[2.309401, 2, 2.309401]]);
});
it('S2-US1-AC2: gira o leque em mapa assimétrico', () => {
  check(
    worldText({
      map: { width: 4, height: 2 },
      robots: [robot({ theta: Math.PI / 2, laser })],
    }),
    [[1.154701, 1, 1.154701]],
  );
});
it('S2-US1-AC3: mede o retângulo apenas no raio central', () => {
  check(worldText({ obstacles: [caixa], robots: [robot({ laser })] }), [
    [2.309401, 0.9, 2.309401],
  ]);
});
it('S2-US1-AC4: devolve maxRange fora do alcance', () => {
  check(
    worldText({ robots: [robot({ laser: { ...laser, maxRange: 1.5 } })] }),
    [[1.5, 1.5, 1.5]],
  );
});
it('S2-US1-AC5: detecta a superfície do outro robô', () => {
  check(
    worldText({
      robots: [
        robot({ laser: { ...laser, rays: 1, maxRange: 1 } }),
        robot({ id: 'r2', x: 0.5 }),
      ],
    }),
    [[0.4], []],
  );
});
it('S2-US1-AC6: o outro robô pode estar fora do alcance', () => {
  check(
    worldText({
      robots: [
        robot({ laser: { ...laser, rays: 1, maxRange: 1 } }),
        robot({ id: 'r2', x: 1.5 }),
      ],
    }),
    [[1], []],
  );
});
it('S2-US1-AC7: mede o círculo deslocado no raio central', () => {
  check(
    worldText({
      robots: [
        robot({ laser: { rays: 5, fov: Math.PI / 2, maxRange: 1 } }),
        robot({ id: 'r2', x: 0.5, y: 0.05 }),
      ],
    }),
    [[1, 1, 0.413397, 1, 1], []],
  );
});
it('S2-US1-AC8: o duelo exibe o oponente e não a arena', () => {
  check(duel, [
    [0.8, 0.8, 0.35, 0.8, 0.8],
    [0.8, 0.8, 0.35, 0.8, 0.8],
  ]);
});
