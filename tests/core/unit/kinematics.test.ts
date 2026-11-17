import { expect, it } from 'vitest';
import { integratePose, saturate } from '../../../src/core/sim/kinematics';
import { expectPoseClose } from '../../helpers/tolerance';

it('satura as velocidades linear e angular em ambos os sentidos', () => {
  const limits = { maxLinearSpeed: 1, maxAngularSpeed: 6 };
  expect(saturate({ v: 3, w: -10 }, limits)).toEqual({ v: 1, w: -6 });
  expect(saturate({ v: -3, w: 10 }, limits)).toEqual({ v: -1, w: 6 });
  expect(saturate({ v: 0.25, w: 2 }, limits)).toEqual({ v: 0.25, w: 2 });
});

it('integra com θ do início do tick e normaliza a nova orientação', () => {
  expectPoseClose(
    integratePose({ x: 1, y: 2, theta: Math.PI }, { v: 0.5, w: 1 }, 0.1),
    { x: 0.95, y: 2, theta: -Math.PI + 0.1 },
  );
});
