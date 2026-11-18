import { assertTickCount } from '../sim/simulation';
import type { HeadlessInput, HeadlessResult } from '../types';
import { loadWorld } from '../world/load-world';
import { prepareSimulation } from './prepare-simulation';

export function runHeadless(input: HeadlessInput): HeadlessResult {
  assertTickCount(input.ticks);
  const loaded = loadWorld(input.world);
  if (!loaded.ok) return loaded;

  const prepared = prepareSimulation(loaded.world, input);
  if (!prepared.ok) return prepared;
  const simulation = prepared.simulation;
  const state = simulation.stepN(input.ticks);
  return input.history
    ? { ok: true, state, history: simulation.getHistory() }
    : { ok: true, state };
}
