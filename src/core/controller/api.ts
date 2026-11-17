import type { Command, RobotState, SimEvent } from '../types';
import type { ControllerBindings } from './runtime';

export interface ControllerFrame {
  readonly robot: RobotState;
  readonly tick: number;
  readonly events: SimEvent[];
  command?: Command;
}

export function createControllerScope(id: string) {
  let current: ControllerFrame | undefined;
  const limit = { acceptedCount: 0, warningEmitted: false };

  function frame(): ControllerFrame {
    if (!current)
      throw new Error('A API do robô só funciona durante setup() ou loop().');
    return current;
  }

  const bindings: ControllerBindings = {
    readLaser: () => [...frame().robot.laser],
    setSpeed(v, w) {
      const active = frame();
      if (
        typeof v !== 'number' ||
        typeof w !== 'number' ||
        !Number.isFinite(v) ||
        !Number.isFinite(w)
      ) {
        throw new TypeError('setSpeed exige dois números finitos.');
      }
      active.command = { v, w };
    },
    log(...values) {
      const active = frame();
      if (limit.acceptedCount === 1000) {
        if (!limit.warningEmitted) {
          limit.warningEmitted = true;
          active.events.push({
            type: 'limite_de_logs',
            robotId: id,
            tick: active.tick,
            message: `Limite de 1 000 logs atingido para '${id}'.`,
          });
        }
        return;
      }
      limit.acceptedCount++;
      try {
        active.events.push({
          type: 'log',
          robotId: id,
          tick: active.tick,
          message: values.map(String).join(' '),
        });
      } catch (error) {
        limit.acceptedCount--;
        throw error;
      }
    },
  };
  return {
    bindings,
    invoke(active: ControllerFrame, callback: () => void) {
      current = active;
      try {
        callback();
      } finally {
        current = undefined;
      }
    },
  };
}
