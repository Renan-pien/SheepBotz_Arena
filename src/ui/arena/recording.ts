import {
  isStallSeconds,
  loadWorld,
  type SimState,
  type StallSeconds,
  type World,
} from '../../core';
import type { Language, Languages } from './languages';
import {
  object,
  readEvents,
  readStates,
  RecordingIssue,
  requireField,
} from './recording-state';

export const lastRecordedTick = 100_000;
const format = 'sheepbotz-arena';

export interface Recording {
  readonly version: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  readonly languages?: Languages;
  readonly stallSeconds?: StallSeconds;
  readonly world: string;
  readonly controllers: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly states: readonly SimState[];
}

type DecodeResult =
  | { ok: true; recording: Recording; world: World }
  | {
      ok: false;
      error: { code: 'GRAVACAO_INVALIDA'; path: string; message: string };
    };

export function encodeRecording(recording: Recording): string {
  return JSON.stringify({
    format,
    version: recording.version,
    stallSeconds: recording.stallSeconds,
    world: recording.world,
    controllers: recording.controllers,
    languages: recording.languages,
    createdAt: recording.createdAt,
    events: recording.states.at(-1)!.events,
    states: recording.states.map(
      ({
        tick,
        time,
        robots,
        status,
        resultado,
        events,
        stall,
        falseStarters,
        falseStartTick,
      }) => ({
        ...(falseStarters && { falseStarters, falseStartTick }),
        ...(stall?.pairContact && { pairContact: true }),
        tick,
        time,
        robots,
        status,
        resultado,
        eventCount: events.length,
      }),
    ),
  });
}

function sources(
  value: unknown,
  world: World,
  field = 'controllers',
): Readonly<Record<string, string>> {
  requireField(
    object(value) && Object.keys(value).length === world.robots.length,
    field,
    'esperado um controlador de texto por robô',
  );
  return Object.fromEntries(
    world.robots.map(({ id }) => {
      const source = value[id];
      requireField(
        Object.hasOwn(value, id) && typeof source === 'string',
        field + '.' + id,
        'texto do controlador ausente ou inválido',
      );
      return [id, source];
    }),
  );
}

export function decodeRecording(text: string): DecodeResult {
  try {
    const data: unknown = JSON.parse(text);
    requireField(object(data), '', 'esperado um objeto de gravação');
    requireField(data.format === format, 'format', 'formato desconhecido');
    requireField(
      data.version === 1 ||
        data.version === 2 ||
        data.version === 3 ||
        data.version === 4 ||
        data.version === 5 ||
        data.version === 6 ||
        data.version === 7,
      'version',
      'versão não suportada',
    );
    const { world: worldText, controllers, createdAt, states, events } = data;
    requireField(
      typeof worldText === 'string',
      'world',
      'texto de mundo ausente',
    );
    const parsed = loadWorld(worldText);
    if (!parsed.ok)
      throw new RecordingIssue(
        'world',
        parsed.errors.map((error) => error.message).join(' '),
      );
    requireField(
      typeof createdAt === 'string',
      'createdAt',
      'data de criação ausente',
    );
    const date = new Date(createdAt);
    requireField(
      Number.isFinite(date.valueOf()) && date.toISOString() === createdAt,
      'createdAt',
      'esperada data UTC no formato ISO 8601',
    );
    requireField(
      Array.isArray(states) &&
        states.length >= 1 &&
        states.length <= lastRecordedTick + 1,
      'states',
      'esperada uma lista de 1 a 100 001 estados',
    );
    const mode = parsed.world.match.mode;
    const stateVersion =
      data.version === 7
        ? mode === 'sumo'
          ? 6
          : mode === 'maze'
            ? 4
            : 1
        : data.version;
    let languages: Languages | undefined;
    if (data.version === 7) {
      const values = sources(data.languages, parsed.world, 'languages');
      languages = Object.fromEntries(
        Object.entries(values).map(([id, value]) => {
          requireField(
            value === 'javascript' || value === 'portugol',
            'languages.' + id,
            'linguagem inválida',
          );
          return [id, value as Language];
        }),
      );
    }
    requireField(
      (stateVersion === 4) === (parsed.world.match.mode === 'maze'),
      'version',
      'versão incompatível com a modalidade',
    );
    const stallSeconds = data.stallSeconds;
    requireField(
      stateVersion === 1 || stateVersion === 4
        ? stallSeconds === undefined
        : isStallSeconds(stallSeconds) && parsed.world.match.mode === 'sumo',
      'stallSeconds',
      'limite incompatível com a versão ou modalidade',
    );
    const boundSources = sources(controllers, parsed.world);
    const list = readEvents(events, parsed.world, states.length - 1);
    const limit = isStallSeconds(stallSeconds) ? stallSeconds : undefined;
    const snapshots = readStates(
      states,
      parsed.world,
      list,
      limit,
      stateVersion,
    );
    return {
      ok: true,
      world: parsed.world,
      recording: {
        version: data.version,
        ...(languages && { languages }),
        ...(limit && { stallSeconds: limit }),
        world: worldText,
        controllers: boundSources,
        createdAt,
        states: snapshots,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'GRAVACAO_INVALIDA',
        path: error instanceof RecordingIssue ? error.path : '',
        message:
          error instanceof RecordingIssue
            ? 'Gravação inválida. ' + error.message + '.'
            : 'Gravação inválida. O arquivo precisa conter JSON válido.',
      },
    };
  }
}

export function recordingName(name: string, createdAt: string): string {
  const slug =
    name
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'mundo';
  const date = createdAt.slice(0, 10);
  const time = createdAt.slice(11, 16).replace(':', '');
  return 'sheepbotz-' + slug + '-' + date + '-' + time + '.json';
}
