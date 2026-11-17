import { expect, it } from 'vitest';
import { runHeadless, type Command } from '../../../../src/core';
import { expectPoseClose } from '../../../helpers/tolerance';
import { robot, worldText } from '../../../helpers/world-builder';

const stop = { v: 0, w: 0 };

function run(
  robots: ReturnType<typeof robot>[],
  commands: Record<string, Command>,
) {
  const result = runHeadless({
    world: worldText({ robots }),
    ticks: 10,
    commands,
  });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.state.robots;
}

function duel(ax: number, bx: number, a: Command, b: Command) {
  return run(
    [robot({ id: 'A', x: ax }), robot({ id: 'B', x: bx, theta: Math.PI })],
    { A: a, B: b },
  );
}

it('S1-US5-AC1: empurra o robô parado à metade da velocidade', () => {
  const [a, b] = duel(-0.1, 0.1, { v: 0.5, w: 0 }, stop);
  expectPoseClose(a!.pose, { x: 0.15, y: 0, theta: 0 });
  expectPoseClose(b!.pose, { x: 0.35, y: 0, theta: Math.PI });
  expect([a?.bumper, b?.bumper]).toEqual([true, true]);
});

it('S1-US5-AC2: comandos iguais e opostos mantêm ambos no lugar', () => {
  const command = { v: 0.5, w: 0 };
  const [a, b] = duel(-0.1, 0.1, command, command);
  expectPoseClose(a!.pose, { x: -0.1, y: 0, theta: 0 });
  expectPoseClose(b!.pose, { x: 0.1, y: 0, theta: Math.PI });
  expect([a?.bumper, b?.bumper]).toEqual([true, true]);
});

it('S1-US5-AC3: o par avança no sentido do comando mais forte', () => {
  const [a, b] = duel(-0.1, 0.1, { v: 0.6, w: 0 }, { v: 0.2, w: 0 });
  expectPoseClose(a!.pose, { x: 0.1, y: 0, theta: 0 });
  expectPoseClose(b!.pose, { x: 0.3, y: 0, theta: Math.PI });
});

it('S1-US5-AC4: separa candidatos que se cruzam após aproximação', () => {
  const [a, b] = duel(-0.5, 0.5, { v: 1, w: 0 }, stop);
  expectPoseClose(a!.pose, { x: 0.4, y: 0, theta: 0 });
  expectPoseClose(b!.pose, { x: 0.6, y: 0, theta: Math.PI });
});

it('S1-US5-AC5: trajetórias sem aproximação coincidem com rodadas individuais', () => {
  const A = { v: -0.5, w: 0 };
  const B = { v: -0.25, w: 0 };
  const pair = duel(-1, 1, A, B);
  expect(pair).toEqual([
    ...run([robot({ id: 'A', x: -1 })], { A }),
    ...run([robot({ id: 'B', x: 1, theta: Math.PI })], { B }),
  ]);
  expect(pair.map(({ bumper }) => bumper)).toEqual([false, false]);
});
