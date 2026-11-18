import { normalizeAngle } from '../math/angle';
import { rayBox, rayCircle } from '../math/ray';
import type { Pose, World } from '../types';

function directionAt(angle: number) {
  const direction = normalizeAngle(angle);
  if (direction === 0) return { x: 1, y: 0 };
  if (direction === Math.PI) return { x: -1, y: 0 };
  if (direction === Math.PI / 2) return { x: 0, y: 1 };
  if (direction === -Math.PI / 2) return { x: 0, y: -1 };
  return { x: Math.cos(direction), y: Math.sin(direction) };
}

export function readLasers(
  world: World,
  poses: readonly Pose[],
): readonly (readonly number[])[] {
  const map = { ...world.map, x: 0, y: 0 };
  return world.robots.map((robot, index) => {
    const config = robot.laser;
    if (!config) return [];
    const pose = poses[index]!;
    const hits: number[] = [];
    for (let ray = 0; ray < config.rays; ray++) {
      if (ray > 0 && ray === config.rays - 1 && config.fov === 2 * Math.PI) {
        hits.push(hits[0]!);
        continue;
      }
      const offset =
        config.rays === 1
          ? 0
          : -config.fov / 2 + (ray * config.fov) / (config.rays - 1);
      const direction = directionAt(pose.theta + offset);
      const wall = rayBox(pose, direction, map);
      let nearest = config.maxRange;
      if (wall) {
        const onWall =
          Math.abs(pose.x) === map.width / 2 ||
          Math.abs(pose.y) === map.height / 2;
        nearest = Math.min(nearest, onWall ? 0 : wall.exit);
      }
      for (const obstacle of world.obstacles) {
        const hit = rayBox(pose, direction, obstacle);
        if (hit) nearest = Math.min(nearest, Math.max(0, hit.enter));
      }
      for (const [other, target] of world.robots.entries()) {
        if (other === index) continue;
        const hit = rayCircle(pose, direction, poses[other]!, target.radius);
        if (hit !== undefined) nearest = Math.min(nearest, hit);
      }
      hits.push(nearest);
    }
    return hits;
  });
}
