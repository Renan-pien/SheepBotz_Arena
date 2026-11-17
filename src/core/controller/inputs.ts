import type {
  Command,
  ControllerOptions,
  ValidationError,
  World,
} from '../types';
import { errors } from '../world/errors';
import type { ControllerBindings, LoadedController } from './runtime';

type InputOptions = ControllerOptions & {
  readonly commands?: Readonly<Record<string, Command>>;
};

type PreparedInputs =
  | {
      readonly ok: true;
      readonly commands: Readonly<Record<string, Command>>;
      readonly controllers: ReadonlyMap<string, LoadedController>;
    }
  | { readonly ok: false; readonly errors: readonly ValidationError[] };

export function prepareInputs(
  world: World,
  options: InputOptions,
  bindingsFor: (id: string) => ControllerBindings,
): PreparedInputs {
  const commands = options.commands ?? {};
  const sources = options.controllers;
  const issues: ValidationError[] = [];
  const ids = new Set(world.robots.map(({ id }) => id));

  for (const [id, command] of Object.entries(commands)) {
    const path = `commands.${id}`;
    if (!ids.has(id)) issues.push(errors.unknownRobot(path, id));
    if (!Number.isFinite(command?.v) || !Number.isFinite(command?.w)) {
      issues.push(errors.invalidCommand(path));
    }
  }

  const controllers = new Map<string, LoadedController>();
  if (sources) {
    const engine = options.controllerEngine;
    if (!engine) throw new TypeError('Informe o motor dos controladores.');
    for (const id of Object.keys(sources)) {
      if (!ids.has(id))
        issues.push(errors.unknownRobot(`controllers.${id}`, id));
      if (Object.hasOwn(commands, id)) issues.push(errors.conflictingInput(id));
    }
    for (const { id } of world.robots) {
      if (!Object.hasOwn(sources, id) || Object.hasOwn(commands, id)) continue;
      const result = engine.load(sources[id]!, bindingsFor(id));
      if (result.ok) controllers.set(id, result.value);
      else issues.push(errors.invalidController(id, result.message));
    }
  }

  return issues.length
    ? { ok: false, errors: issues }
    : {
        ok: true,
        commands: Object.fromEntries(
          Object.entries(commands).map(([id, command]) => [id, { ...command }]),
        ),
        controllers,
      };
}
