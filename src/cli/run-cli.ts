import { parseArgs } from 'node:util';
import {
  isStallSeconds,
  runHeadless,
  type StallSeconds,
  type Command,
} from '../core';
import { initializeControllerEngine } from '../runtime/controller-engine';

interface CliIo {
  readFile(path: string): string;
  stdout(text: string): void;
  stderr(text: string): void;
}

interface CliInput {
  readonly stallSeconds?: StallSeconds;
  readonly file: string;
  readonly ticks: number;
  readonly commands: Readonly<Record<string, Command>>;
  readonly controllerFiles: Readonly<Record<string, string>>;
  readonly history: boolean;
  readonly pretty: boolean;
}

const usage =
  'Uso: npm run sim -- --world <arquivo.json> --ticks <N> [--command <id>=<v>,<w>]... [--controller <id>=<arquivo.js>]... [--stall-seconds <5|10|30>] [--history] [--pretty]\n';

function parseInput(argv: readonly string[]): CliInput | undefined {
  const { values } = parseArgs({
    args: [...argv],
    options: {
      world: { type: 'string' },
      ticks: { type: 'string' },
      'stall-seconds': { type: 'string' },
      command: { type: 'string', multiple: true },
      controller: { type: 'string', multiple: true },
      history: { type: 'boolean', default: false },
      pretty: { type: 'boolean', default: false },
    },
  });
  if (!values.world || !values.ticks || !/^\d+$/.test(values.ticks))
    return undefined;
  const ticks = Number(values.ticks);
  if (!Number.isInteger(ticks)) return undefined;

  const limit = values['stall-seconds'];
  const stallSeconds = limit === undefined ? undefined : Number(limit);
  if (stallSeconds !== undefined && !isStallSeconds(stallSeconds))
    return undefined;
  const commands: Record<string, Command> = Object.create(null);
  for (const entry of values.command ?? []) {
    const match = /^([^=,]+)=([^=,]+),([^=,]+)$/.exec(entry);
    if (!match?.[2]?.trim() || !match[3]?.trim()) return undefined;
    commands[match[1]!] = { v: Number(match[2]), w: Number(match[3]) };
  }
  const controllerFiles: Record<string, string> = Object.create(null);
  for (const entry of values.controller ?? []) {
    const separator = entry.indexOf('=');
    if (separator < 0) return undefined;
    const id = entry.slice(0, separator);
    const file = entry.slice(separator + 1);
    if (!id.trim() || !file.trim()) return undefined;
    controllerFiles[id] = file;
  }
  return {
    stallSeconds,
    file: values.world,
    ticks,
    commands,
    controllerFiles,
    history: values.history,
    pretty: values.pretty,
  };
}

export function runCli(argv: readonly string[], io: CliIo): number {
  let input: CliInput | undefined;
  try {
    input = parseInput(argv);
  } catch {
    io.stderr(usage);
    return 2;
  }
  if (!input) {
    io.stderr(usage);
    return 2;
  }
  let world: string;
  try {
    world = io.readFile(input.file);
  } catch {
    io.stderr(`Não foi possível ler o arquivo de mundo '${input.file}'.\n`);
    return 2;
  }
  const controllerFiles = Object.entries(input.controllerFiles);
  const controllers: Record<string, string> = Object.create(null);
  for (const [id, path] of controllerFiles) {
    try {
      controllers[id] = io.readFile(path);
    } catch {
      io.stderr(`Não foi possível ler o arquivo de controlador '${path}'.\n`);
      return 2;
    }
  }
  const options = {
    world,
    ticks: input.ticks,
    commands: input.commands,
    history: input.history,
    stallSeconds: input.stallSeconds,
  };
  const result = runHeadless(
    controllerFiles.length
      ? {
          ...options,
          controllers,
          controllerEngine: initializeControllerEngine(),
        }
      : options,
  );
  io.stdout(JSON.stringify(result, null, input.pretty ? 2 : undefined) + '\n');
  return result.ok ? 0 : 1;
}
