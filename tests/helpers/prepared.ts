import { prepareSimulation } from '../../src/core';
import { controllerOptions, normalizedWorld } from './controlled';

export function prepared(
  world: string,
  controllers: Record<string, string>,
  history = false,
) {
  const result = prepareSimulation(normalizedWorld(world), {
    ...controllerOptions(controllers),
    history,
  });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.simulation;
}
