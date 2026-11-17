import { distance } from '../math/geometry';
import type { Pose } from '../types';

interface ContactResult {
  readonly pose: Pose;
  readonly contacted: boolean;
}

export function resolveRobotContacts(
  initial: readonly Pose[],
  candidates: readonly Pose[],
  radii: readonly number[],
): readonly ContactResult[] {
  const result = candidates.map((pose) => ({ pose, contacted: false }));
  for (let i = 0; i < result.length; i += 1) {
    for (let j = i + 1; j < result.length; j += 1) {
      const a = result[i]!.pose;
      const b = result[j]!.pose;
      const minimum = radii[i]! + radii[j]!;
      if (distance(a, b) >= minimum) continue;

      const first = initial[i]!;
      const second = initial[j]!;
      const length = distance(first, second);
      const normal =
        length === 0
          ? { x: 1, y: 0 }
          : {
              x: (second.x - first.x) / length,
              y: (second.y - first.y) / length,
            };
      const projected = (b.x - a.x) * normal.x + (b.y - a.y) * normal.y;
      const correction = (minimum - projected) / 2;
      result[i] = {
        pose: {
          x: a.x - normal.x * correction,
          y: a.y - normal.y * correction,
          theta: a.theta,
        },
        contacted: true,
      };
      result[j] = {
        pose: {
          x: b.x + normal.x * correction,
          y: b.y + normal.y * correction,
          theta: b.theta,
        },
        contacted: true,
      };
    }
  }
  return result;
}
