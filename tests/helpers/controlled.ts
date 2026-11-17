import { loadWorld, runHeadless, type Command } from '../../src/core';
import { initializeControllerEngine } from '../../src/runtime/controller-engine';

export { duel } from './duel';

export function normalizedWorld(text: string) {
  const result = loadWorld(text);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.world;
}

export function controllerOptions(controllers: Record<string, string>) {
  return { controllers, controllerEngine: initializeControllerEngine() };
}

export function runControlled(
  world: string,
  controllers: Record<string, string>,
  ticks: number,
  options: { history?: boolean; commands?: Record<string, Command> } = {},
) {
  const result = runHeadless({
    world,
    ticks,
    ...options,
    ...controllerOptions(controllers),
  });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result;
}
