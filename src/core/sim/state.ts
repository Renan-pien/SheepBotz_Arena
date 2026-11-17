import { readLasers } from '../sensors/laser';
import type { RobotState, SimState, World } from '../types';

export function withLaser(
  world: World,
  robots: readonly RobotState[],
): readonly RobotState[] {
  const readings = readLasers(
    world,
    robots.map(({ pose }) => pose),
  );
  return robots.map((robot, index) => ({ ...robot, laser: readings[index]! }));
}

export function createInitialState(world: World): SimState {
  return {
    tick: 0,
    time: 0,
    status: 'em_andamento',
    resultado: null,
    events: [],
    robots: withLaser(
      world,
      world.robots.map(({ id, initialPose }) => ({
        id,
        pose: initialPose,
        command: { v: 0, w: 0 },
        bumper: false,
        odometry: initialPose,
        laser: [],
        situacao: 'ativo',
      })),
    ),
  };
}
