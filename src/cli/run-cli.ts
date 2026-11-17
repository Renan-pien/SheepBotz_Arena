import { parseArgs } from 'node:util';
import { runHeadless, type Command } from '../core';

interface CliIo {
  readFile(path: string): string;
  stdout(text: string): void;
  stderr(text: string): void;
}

interface CliInput {
  readonly file: string;
  readonly ticks: number;
  readonly commands: Readonly<Record<string, Command>>;
  readonly history: boolean;
  readonly pretty: boolean;
}

const usage =
  'Uso: npm run sim -- --world <arquivo.json> --ticks <N> [--command <id>=<v>,<w>]... [--history] [--pretty]\n';

function parseInput(argv: readonly string[]): CliInput | undefined {
  const { values } = parseArgs({
    args: [...argv],
    options: {
      world: { type: 'string' },
      ticks: { type: 'string' },
      command: { type: 'string', multiple: true },
      history: { type: 'boolean', default: false },
      pretty: { type: 'boolean', default: false },
    },
  });
  if (!values.world || !values.ticks || !/^\d+$/.test(values.ticks))
    return undefined;
  const ticks = Number(values.ticks);
  if (!Number.isInteger(ticks)) return undefined;

  const commands: Record<string, Command> = Object.create(null);
  for (const entry of values.command ?? []) {
    const match = /^([^=,]+)=([^=,]+),([^=,]+)$/.exec(entry);
    if (!match?.[2]?.trim() || !match[3]?.trim()) return undefined;
    commands[match[1]!] = { v: Number(match[2]), w: Number(match[3]) };
  }
  return {
    file: values.world,
    ticks,
    commands,
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
  const result = runHeadless({
    world,
    ticks: input.ticks,
    commands: input.commands,
    history: input.history,
  });
  io.stdout(JSON.stringify(result, null, input.pretty ? 2 : undefined) + '\n');
  return result.ok ? 0 : 1;
}
