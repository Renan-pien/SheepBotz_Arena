import { normalizeAngle } from '../math/angle';
import type { Command, Pose, RobotConfig } from '../types';

type SpeedLimits = Pick<RobotConfig, 'maxLinearSpeed' | 'maxAngularSpeed'>;

export function saturate(command: Command, limits: SpeedLimits): Command {
  return {
    v: Math.max(
      -limits.maxLinearSpeed,
      Math.min(limits.maxLinearSpeed, command.v),
    ),
    w: Math.max(
      -limits.maxAngularSpeed,
      Math.min(limits.maxAngularSpeed, command.w),
    ),
  };
}

export function integratePose(pose: Pose, command: Command, dt: number): Pose {
  return {
    x: pose.x + command.v * Math.cos(pose.theta) * dt,
    y: pose.y + command.v * Math.sin(pose.theta) * dt,
    theta: normalizeAngle(pose.theta + command.w * dt),
  };
}
