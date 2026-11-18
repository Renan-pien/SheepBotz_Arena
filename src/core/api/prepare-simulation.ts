import { prepareInputs } from '../controller/inputs';
import { createControllerRunner } from '../controller/runner';
import {
  assembleSimulation,
  type Simulation,
  type SimulationOptions,
} from '../sim/simulation';
import { step } from '../sim/step';
import type {
  ControllerOptions,
  SimState,
  ValidationError,
  World,
} from '../types';

type PrepareOptions = SimulationOptions & ControllerOptions;

export type PrepareResult =
  | { readonly ok: true; readonly simulation: Simulation }
  | { readonly ok: false; readonly errors: readonly ValidationError[] };

function prepareTick(world: World, options: PrepareOptions) {
  const runner = createControllerRunner(world);
  const inputs = prepareInputs(world, options, runner.bindingsFor);
  if (!inputs.ok) return inputs;
  const { commands, controllers } = inputs;

  function advance(state: SimState): SimState {
    if (controllers.size === 0) return step(world, state, commands);
    const tick = runner.run(state, commands, controllers);
    const robots = tick.disabled.size
      ? state.robots.map((robot) =>
          tick.disabled.has(robot.id)
            ? { ...robot, situacao: 'desativado' as const }
            : robot,
        )
      : state.robots;
    const observed = tick.events.length
      ? { ...state, robots, events: [...state.events, ...tick.events] }
      : state;
    return step(world, observed, tick.commands);
  }

  return { ok: true as const, advance, commands };
}

export function prepareSimulation(
  world: World,
  options: PrepareOptions = {},
): PrepareResult {
  const first = prepareTick(world, options);
  if (!first.ok) return first;
  const inputs: PrepareOptions = options.controllers
    ? {
        commands: first.commands,
        controllers: { ...options.controllers },
        controllerEngine: options.controllerEngine,
      }
    : { commands: first.commands };

  const simulation = assembleSimulation(
    world,
    options.history,
    first.advance,
    () => {
      const next = prepareTick(world, inputs);
      if (!next.ok) {
        throw new Error(
          `Falha ao recarregar a simulação: ${next.errors.map((error) => error.message).join(' ')}`,
        );
      }
      return next.advance;
    },
  );
  return { ok: true, simulation };
}
