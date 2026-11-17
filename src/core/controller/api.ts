import type { Command, RobotState, SimEvent, World } from '../types';
import { createControllerRandom } from './random';
import type { ControllerBindings } from './runtime';

export interface ControllerFrame {
  readonly robot: RobotState;
  readonly tick: number;
  readonly observedTime: number;
  readonly events: SimEvent[];
  command?: Command;
}

export function createControllerScope(world: World, index: number) {
  const config = world.robots[index]!;
  const { id } = config;
  const draw = createControllerRandom(world.seed, index);
  let current: ControllerFrame | undefined;
  const limit = { acceptedCount: 0, warningEmitted: false };

  function frame(): ControllerFrame {
    if (!current)
      throw new Error('A API do robô só funciona durante setup() ou loop().');
    return current;
  }

  const bindings: ControllerBindings = {
    random() {
      frame();
      return draw();
    },
    readLaser: () => [...frame().robot.laser],
    readBumper: () => frame().robot.bumper,
    readOdometry: () => ({ ...frame().robot.odometry }),
    getInfo() {
      const active = frame();
      return {
        id,
        tick: active.tick - 1,
        time: active.observedTime,
        dt: world.dt,
        radius: config.radius,
        maxLinearSpeed: config.maxLinearSpeed,
        maxAngularSpeed: config.maxAngularSpeed,
        arenaRadius: world.arena?.radius ?? null,
        laser: config.laser ? { ...config.laser } : null,
      };
    },
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
