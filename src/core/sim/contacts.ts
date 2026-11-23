import { distance } from '../math/geometry';
import { robotModels } from '../models';
import type { Command, Pose, RobotConfig } from '../types';

interface ContactDrive {
  readonly config: Pick<RobotConfig, 'model'>;
  readonly command: Command;
}

function resistance(drive: ContactDrive, forwardTravel: number) {
  if (!drive.config.model) return 0.3; // Peso de referência, em kg (FR-042).
  const profile = robotModels[drive.config.model];
  if (drive.command.v === 0 && drive.command.w === 0)
    return profile.massKg * profile.traction;
  return profile.massKg * (forwardTravel > 0 ? profile.force : 1);
}

interface ContactResult {
  readonly pose: Pose;
  readonly contacted: boolean;
}

export function resolveRobotContacts(
  initial: readonly Pose[],
  candidates: readonly Pose[],
  radii: readonly number[],
  drives?: readonly ContactDrive[],
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
      const penetration = minimum - projected;
      let correctionA = penetration / 2;
      let correctionB = correctionA;
      if (drives && (drives[i]!.config.model || drives[j]!.config.model)) {
        const travelA =
          (candidates[i]!.x - first.x) * normal.x +
          (candidates[i]!.y - first.y) * normal.y;
        const travelB =
          (second.x - candidates[j]!.x) * normal.x +
          (second.y - candidates[j]!.y) * normal.y;
        const weightA = resistance(drives[i]!, travelA);
        const weightB = resistance(drives[j]!, travelB);
        correctionA = (penetration * weightB) / (weightA + weightB);
        correctionB = (penetration * weightA) / (weightA + weightB);
      }
      result[i] = {
        pose: {
          x: a.x - normal.x * correctionA,
          y: a.y - normal.y * correctionA,
          theta: a.theta,
        },
        contacted: true,
      };
      result[j] = {
        pose: {
          x: b.x + normal.x * correctionB,
          y: b.y + normal.y * correctionB,
          theta: b.theta,
        },
        contacted: true,
      };
    }
  }
  return result;
}
