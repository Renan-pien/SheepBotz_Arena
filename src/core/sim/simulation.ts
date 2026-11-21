import type { Command, SimState, StallSeconds, World } from '../types';
import { createInitialState } from './state';
import { step } from './step';

export interface SimulationOptions {
  readonly stallSeconds?: StallSeconds;
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
  const commands = Object.fromEntries(
    Object.entries(options.commands ?? {}).map(([id, command]) => [
      id,
      { ...command },
    ]),
  );
  return assembleSimulation(world, options, (state) =>
    step(world, state, commands),
  );
}

type AdvanceTick = (state: SimState) => SimState;

export function assembleSimulation(
  world: World,
  options: SimulationOptions,
  firstTick: AdvanceTick,
  reload: () => AdvanceTick = () => firstTick,
): Simulation {
  let advanceTick = firstTick;
  const { history: recordHistory, stallSeconds } = options;
  let current = createInitialState(world, stallSeconds);
  let history = recordHistory ? [current] : undefined;

  function advance(): SimState {
    if (current.status === 'finalizada') return current;
    current = advanceTick(current);
    history?.push(current);
    return current;
  }

  return {
    world,
    getState: () => current,
    step: advance,
    stepN(n) {
      assertTickCount(n);
      for (
        let index = 0;
        index < n && current.status !== 'finalizada';
        index += 1
      )
        advance();
      return current;
    },
    reset() {
      const next = reload();
      const initial = createInitialState(world, stallSeconds);
      advanceTick = next;
      current = initial;
      if (history) history = [current];
      return current;
    },
    getHistory: () => history?.slice() ?? [],
  };
}
