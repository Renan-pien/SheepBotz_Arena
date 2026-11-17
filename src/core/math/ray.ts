import type { Obstacle, Pose } from '../types';

type Point = Pick<Pose, 'x' | 'y'>;
type Rect = Pick<Obstacle, 'x' | 'y' | 'width' | 'height'>;
interface Interval {
  readonly enter: number;
  readonly exit: number;
}

function alongAxis(
  origin: number,
  direction: number,
  min: number,
  max: number,
) {
  if (direction === 0) {
    return origin < min || origin > max
      ? undefined
      : { enter: -Infinity, exit: Infinity };
  }
  const first = (min - origin) / direction;
  const second = (max - origin) / direction;
  return { enter: Math.min(first, second), exit: Math.max(first, second) };
}

export function rayBox(
  origin: Point,
  direction: Point,
  rect: Rect,
): Interval | undefined {
  const x = alongAxis(
    origin.x,
    direction.x,
    rect.x - rect.width / 2,
    rect.x + rect.width / 2,
  );
  const y = alongAxis(
    origin.y,
    direction.y,
    rect.y - rect.height / 2,
    rect.y + rect.height / 2,
  );
  if (!x || !y) return undefined;
  const enter = Math.max(x.enter, y.enter);
  const exit = Math.min(x.exit, y.exit);
  return exit < 0 || enter > exit ? undefined : { enter, exit };
}

export function rayCircle(
  origin: Point,
  direction: Point,
  center: Point,
  radius: number,
): number | undefined {
  const x = center.x - origin.x;
  const y = center.y - origin.y;
  if (x * x + y * y <= radius * radius) return 0;
  const projection = x * direction.x + y * direction.y;
  const perpendicular = x * direction.y - y * direction.x;
  const discriminant = radius * radius - perpendicular * perpendicular;
  if (projection < 0 || discriminant < 0) return undefined;
  return Math.max(0, projection - Math.sqrt(discriminant));
}
