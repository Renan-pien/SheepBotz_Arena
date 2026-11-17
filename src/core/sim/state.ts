import type { SimState, World } from '../types';

export function createInitialState(world: World): SimState {
  return {
    tick: 0,
    time: 0,
    robots: world.robots.map(({ id, initialPose }) => ({
      id,
      pose: initialPose,
      command: { v: 0, w: 0 },
      bumper: false,
      odometry: initialPose,
    })),
  };
}
