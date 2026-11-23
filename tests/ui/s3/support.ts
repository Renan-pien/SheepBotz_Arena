import type { ArenaSession } from '../../../src/ui/arena/session';
import type { ControllerEngine } from '../../../src/core';
import { controllerPresets } from '../../../src/ui/arena/catalog';

export const testEngine: ControllerEngine = {
  load(source, api) {
    const loop = () => {
      if (
        (api.getInfo!() as { startReleased?: boolean }).startReleased === false
      )
        return;
      if (source === controllerPresets.cacador.source) {
        const ranges = api.readLaser!() as number[];
        const detects = (ranges[Math.floor(ranges.length / 2)] ?? 0.8) < 0.8;
        api.setSpeed!(detects ? 1 : 0, detects ? 0 : 3);
      } else if (source === controllerPresets.girador.source) {
        api.setSpeed!(0, 3);
      }
    };
    return { ok: true, value: { loop } };
  },
};

export const idleEngine: ControllerEngine = {
  load: () => ({ ok: true, value: { loop() {} } }),
};

export function runDefaultDuel(session: ArenaSession) {
  for (let second = 0; second < 5; second++) session.pulse(1000);
  session.pulse(800);
}
