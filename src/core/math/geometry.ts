import type { Obstacle, Pose } from '../types';

type Point = Pick<Pose, 'x' | 'y'>;
type Rect = Pick<Obstacle, 'x' | 'y' | 'width' | 'height'>;

export function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function closestPointOnRect(point: Point, rect: Rect): Point {
  return {
    x: Math.max(
      rect.x - rect.width / 2,
      Math.min(point.x, rect.x + rect.width / 2),
    ),
    y: Math.max(
      rect.y - rect.height / 2,
      Math.min(point.y, rect.y + rect.height / 2),
    ),
  };
}
