import { expect, it } from 'vitest';
import { runHeadless, type Command } from '../../../../src/core';
import { expectPoseClose } from '../../../helpers/tolerance';
import { robot, worldText } from '../../../helpers/world-builder';

function run(world: string, commands: Record<string, Command>) {
  const result = runHeadless({ world, ticks: 10, commands });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.state.robots;
}

it('S1-US6-AC1: odometria e pose real coincidem no movimento livre', () => {
  const [r] = run(worldText(), { r1: { v: 0.5, w: 1 } });
  expectPoseClose(r!.pose, { x: 0.431877, y: 0.20862, theta: 1 });
  expect(r!.odometry).toEqual(r!.pose);
});

it('S1-US6-AC2: odometria integra os comandos apesar da parede', () => {
  const [r] = run(
    worldText({ map: { width: 2, height: 2 }, robots: [robot({ x: 0.8 })] }),
    { r1: { v: 1, w: 0 } },
  );
  expectPoseClose(r!.pose, { x: 0.9, y: 0, theta: 0 });
  expectPoseClose(r!.odometry, { x: 1.8, y: 0, theta: 0 });
});

it('S1-US6-AC3: odometria não soma o deslocamento provocado por outro robô', () => {
  const [a, b] = run(
    worldText({
      robots: [
        robot({ id: 'A', x: -0.1 }),
        robot({ id: 'B', x: 0.1, theta: Math.PI }),
      ],
    }),
    { A: { v: 0.5, w: 0 } },
  );
  expectPoseClose(a!.odometry, { x: 0.4, y: 0, theta: 0 });
  expectPoseClose(b!.odometry, { x: 0.1, y: 0, theta: Math.PI });
  expectPoseClose(b!.pose, { x: 0.35, y: 0, theta: Math.PI });
});
