import { assertTickCount, createSimulation } from '../sim/simulation';
import type { HeadlessInput, HeadlessResult, ValidationError } from '../types';
import { errors } from '../world/errors';
import { loadWorld } from '../world/load-world';

export function runHeadless(input: HeadlessInput): HeadlessResult {
  assertTickCount(input.ticks);
  const loaded = loadWorld(input.world);
  if (!loaded.ok) return loaded;

  const robotIds = new Set(loaded.world.robots.map(({ id }) => id));
  const issues: ValidationError[] = [];
  for (const [id, command] of Object.entries(input.commands ?? {})) {
    const path = `commands.${id}`;
    if (!robotIds.has(id)) issues.push(errors.unknownRobot(path, id));
    if (!Number.isFinite(command?.v) || !Number.isFinite(command?.w)) {
      issues.push(errors.invalidCommand(path));
    }
  }
  if (issues.length) return { ok: false, errors: issues };

  const simulation = createSimulation(loaded.world, input);
  const state = simulation.stepN(input.ticks);
  return input.history
    ? { ok: true, state, history: simulation.getHistory() }
    : { ok: true, state };
}
