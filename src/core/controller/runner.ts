import type { Command, SimEvent, SimState, World } from '../types';
import { createControllerScope, type ControllerFrame } from './api';
import type { LoadedController } from './runtime';

export function createControllerRunner(world: World) {
  const scopes = new Map<string, ReturnType<typeof createControllerScope>>();

  function scope(id: string) {
    let controller = scopes.get(id);
    if (!controller) {
      const index = world.robots.findIndex((robot) => robot.id === id);
      controller = createControllerScope(world, index);
      scopes.set(id, controller);
    }
    return controller;
  }

  return {
    bindingsFor: (id: string) => scope(id).bindings,
    run(
      state: SimState,
      commands: Readonly<Record<string, Command>>,
      scripts: ReadonlyMap<string, LoadedController>,
    ) {
      const events: SimEvent[] = [];
      const disabled = new Set<string>();
      const requested = Object.entries(commands);
      for (const [index, { id }] of world.robots.entries()) {
        const script = scripts.get(id);
        if (!script) continue;
        const robot = state.robots[index]!;
        if (robot.situacao === 'desativado') continue;
        const frame: ControllerFrame = {
          robot,
          tick: state.tick + 1,
          observedTime: state.time,
          events,
        };
        const controller = scope(id);
        if (state.tick === 0 && script.setup)
          controller.invoke(frame, script.setup);
        if (frame.failure === undefined) controller.invoke(frame, script.loop);
        if (frame.failure !== undefined) {
          disabled.add(id);
          requested.push([id, { v: 0, w: 0 }]);
          events.push({
            type: 'erro_controlador',
            tick: frame.tick,
            robotId: id,
            message: frame.failure,
          });
        } else if (frame.command) {
          requested.push([id, frame.command]);
        }
      }
      return { commands: Object.fromEntries(requested), events, disabled };
    },
  };
}
