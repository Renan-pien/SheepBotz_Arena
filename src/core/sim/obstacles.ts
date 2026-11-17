import { closestPointOnRect, distance } from '../math/geometry';
import type { Obstacle, Pose, World } from '../types';

function resolveObstacle(
  pose: Pose,
  radius: number,
  obstacle: Obstacle,
): Pose | undefined {
  const nearest = closestPointOnRect(pose, obstacle);
  const separation = distance(pose, nearest);
  if (separation >= radius) return undefined;
  if (separation > 0) {
    return {
      x: nearest.x + ((pose.x - nearest.x) / separation) * radius,
      y: nearest.y + ((pose.y - nearest.y) / separation) * radius,
      theta: pose.theta,
    };
  }

  const left = obstacle.x - obstacle.width / 2;
  const right = obstacle.x + obstacle.width / 2;
  const bottom = obstacle.y - obstacle.height / 2;
  const top = obstacle.y + obstacle.height / 2;
  // FR-027 mantém o primeiro lado em caso de empate.
  const sides = [
    { distance: pose.x - left, x: left - radius, y: pose.y },
    { distance: right - pose.x, x: right + radius, y: pose.y },
    { distance: pose.y - bottom, x: pose.x, y: bottom - radius },
    { distance: top - pose.y, x: pose.x, y: top + radius },
  ];
  const side = sides.reduce((best, candidate) =>
    candidate.distance < best.distance ? candidate : best,
  );
  return { x: side.x, y: side.y, theta: pose.theta };
}

export function resolveObstaclesAndWalls(
  candidate: Pose,
  radius: number,
  obstacles: readonly Obstacle[],
  map: World['map'],
): { pose: Pose; contacted: boolean } {
  let pose = candidate;
  let contacted = false;
  for (const obstacle of obstacles) {
    const resolved = resolveObstacle(pose, radius, obstacle);
    if (resolved) {
      pose = resolved;
      contacted = true;
    }
  }
  const maxX = map.width / 2 - radius;
  const maxY = map.height / 2 - radius;
  const x = Math.max(-maxX, Math.min(maxX, pose.x));
  const y = Math.max(-maxY, Math.min(maxY, pose.y));
  return {
    pose: { x, y, theta: pose.theta },
    contacted: contacted || x !== pose.x || y !== pose.y,
  };
}
