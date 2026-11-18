import type { ControllerEngine } from '../../../src/core';

export const testEngine: ControllerEngine = {
  load: () => ({ ok: true, value: { loop() {} } }),
};
