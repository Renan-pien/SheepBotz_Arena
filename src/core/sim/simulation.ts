import type { Command, SimState, World } from '../types';
import { createInitialState } from './state';
import { step } from './step';

export interface SimulationOptions {
  readonly commands?: Readonly<Record<string, Command>>;
  readonly history?: boolean;
}

export interface Simulation {
  readonly world: World;
  getState(): SimState;
  step(): SimState;
  stepN(n: number): SimState;
  reset(): SimState;
  getHistory(): readonly SimState[];
}

export function assertTickCount(n: number): void {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(
      'O número de ticks deve ser um inteiro maior ou igual a zero.',
    );
  }
}

export function createSimulation(
  world: World,
  options: SimulationOptions = {},
): Simulation {
  const commands = options.commands ?? {};
  let current = createInitialState(world);
  let history = options.history ? [current] : undefined;

  function advance(): SimState {
    current = step(world, current, commands);
    history?.push(current);
    return current;
  }

  return {
    world,
    getState: () => current,
    step: advance,
    stepN(n) {
      assertTickCount(n);
      for (let index = 0; index < n; index += 1) advance();
      return current;
    },
    reset() {
      current = createInitialState(world);
      if (history) history = [current];
      return current;
    },
    getHistory: () => history?.slice() ?? [],
  };
}
