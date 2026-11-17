import { expect } from 'vitest';
import { angleDiff } from '../../src/core/math/angle';
import type { Pose } from '../../src/core/types';

export const TOLERANCE = 0.001;

export function expectClose(actual: number, expected: number): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(TOLERANCE);
}

export function expectAngleClose(actual: number, expected: number): void {
  expectClose(angleDiff(actual, expected), 0);
}

export function expectPoseClose(actual: Pose, expected: Pose): void {
  expectClose(actual.x, expected.x);
  expectClose(actual.y, expected.y);
  expectAngleClose(actual.theta, expected.theta);
}
