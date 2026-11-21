import type { Pose, World } from '../types';

export const ARENA_EDGE_INNER_RATIO = 0.975;

export interface EdgeReading {
  front: boolean;
  rear: boolean;
  left: boolean;
  right: boolean;
}

export function readEdge(
  world: World,
  pose: Pose,
  robotRadius: number,
): EdgeReading | null {
  if (world.match.mode !== 'sumo' || !world.arena) return null;
  const threshold = world.arena.radius * ARENA_EDGE_INNER_RATIO;
  const dx = robotRadius * Math.cos(pose.theta);
  const dy = robotRadius * Math.sin(pose.theta);
  function atEdge(offsetX: number, offsetY: number) {
    return Math.hypot(pose.x + offsetX, pose.y + offsetY) >= threshold;
  }
  return {
    front: atEdge(dx, dy),
    rear: atEdge(-dx, -dy),
    left: atEdge(-dy, dx),
    right: atEdge(dy, -dx),
  };
}
