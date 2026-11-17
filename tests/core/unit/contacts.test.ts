import { expect, it } from 'vitest';
import { resolveRobotContacts } from '../../../src/core/sim/contacts';
import { expectPoseClose } from '../../helpers/tolerance';

function pose(x: number, y = 0, theta = 0) {
  return { x, y, theta };
}

it('separa na direção dos centros no início do tick', () => {
  const [a, b] = resolveRobotContacts(
    [pose(-1), pose(1)],
    [pose(0.2, 0.1, 0.1), pose(0.5, 0.2, -0.1)],
    [0.5, 0.5],
  );
  expectPoseClose(a!.pose, pose(-0.15, 0.1, 0.1));
  expectPoseClose(b!.pose, pose(0.85, 0.2, -0.1));
  expect([a?.contacted, b?.contacted]).toEqual([true, true]);
});

it('usa +x se os centros iniciais coincidirem', () => {
  expect(
    resolveRobotContacts([pose(0), pose(0)], [pose(0), pose(0)], [0.5, 0.5]),
  ).toEqual([
    { pose: pose(-0.5), contacted: true },
    { pose: pose(0.5), contacted: true },
  ]);
});

it('usa a projeção com sinal quando os candidatos se cruzam', () => {
  expect(
    resolveRobotContacts(
      [pose(-1), pose(1)],
      [pose(0.25), pose(-0.25)],
      [0.5, 0.5],
    ),
  ).toEqual([
    { pose: pose(-0.5), contacted: true },
    { pose: pose(0.5), contacted: true },
  ]);
});

it('resolve os pares em ordem usando a posição já corrigida e uma única passada', () => {
  const result = resolveRobotContacts(
    [pose(-1), pose(0), pose(1)],
    [pose(0), pose(0.25), pose(0.5)],
    [0.5, 0.5, 0.5],
  );
  expect(result.map(({ pose }) => pose.x)).toEqual([-0.4375, 0.09375, 1.09375]);
  expect(result.map(({ contacted }) => contacted)).toEqual([true, true, true]);
});

it('ignora candidatos exatamente à distância da soma dos raios', () => {
  expect(
    resolveRobotContacts([pose(0), pose(1)], [pose(0), pose(1)], [0.5, 0.5]),
  ).toEqual([
    { pose: pose(0), contacted: false },
    { pose: pose(1), contacted: false },
  ]);
});
