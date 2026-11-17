import { expect, it } from 'vitest';
import { runHeadless, type Command } from '../../../../src/core';
import { expectPoseClose } from '../../../helpers/tolerance';
import { worldText } from '../../../helpers/world-builder';

function move(ticks: number, command?: Command) {
  const result = runHeadless({
    world: worldText(),
    ticks,
    commands: command && { r1: command },
  });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.state.robots[0]!;
}

it('S1-US2-AC1: avança 1 m em linha reta com dez ticks', () => {
  expectPoseClose(move(10, { v: 1, w: 0 }).pose, { x: 1, y: 0, theta: 0 });
});

it('S1-US2-AC2: integra o primeiro tick da curva com a orientação inicial', () => {
  expectPoseClose(move(1, { v: 0.5, w: 1 }).pose, {
    x: 0.05,
    y: 0,
    theta: 0.1,
  });
});

it('S1-US2-AC3: muda a direção do movimento no segundo tick da curva', () => {
  expectPoseClose(move(2, { v: 0.5, w: 1 }).pose, {
    x: 0.09975,
    y: 0.004992,
    theta: 0.2,
  });
});

it('S1-US2-AC4: reproduz a pose especificada após dez ticks em curva', () => {
  expectPoseClose(move(10, { v: 0.5, w: 1 }).pose, {
    x: 0.431877,
    y: 0.20862,
    theta: 1,
  });
});

it('S1-US2-AC5: gira 90 graus no mesmo ponto', () => {
  expectPoseClose(move(10, { v: 0, w: Math.PI / 2 }).pose, {
    x: 0,
    y: 0,
    theta: 1.570796,
  });
});

it('S1-US2-AC6: avança em marcha a ré', () => {
  expectPoseClose(move(10, { v: -0.5, w: 0 }).pose, {
    x: -0.5,
    y: 0,
    theta: 0,
  });
});

it('S1-US2-AC7: limita as velocidades antes de integrar o movimento', () => {
  const robot = move(1, { v: 3, w: -10 });
  expect(robot.command).toEqual({ v: 1, w: -6 });
  expectPoseClose(robot.pose, { x: 0.1, y: 0, theta: -0.6 });
});

it('S1-US2-AC8: permanece parado sem comando', () => {
  const robot = move(10);
  expect(robot.command).toEqual({ v: 0, w: 0 });
  expectPoseClose(robot.pose, { x: 0, y: 0, theta: 0 });
});
