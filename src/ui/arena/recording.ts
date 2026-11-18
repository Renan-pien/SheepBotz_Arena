import { loadWorld, type SimState, type World } from '../../core';
import {
  object,
  readEvents,
  readStates,
  RecordingIssue,
  requireField,
} from './recording-state';

export const lastRecordedTick = 100_000;
const format = 'sheepbotz-arena';
const version = 1;

export interface Recording {
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
    version,
    world: recording.world,
    controllers: recording.controllers,
    createdAt: recording.createdAt,
    events: recording.states.at(-1)!.events,
    states: recording.states.map(({ events, ...state }) => ({
      ...state,
      eventCount: events.length,
    })),
  });
}

function sources(
  value: unknown,
  world: World,
): Readonly<Record<string, string>> {
  requireField(
    object(value) && Object.keys(value).length === world.robots.length,
    'controllers',
    'esperado um controlador de texto por robô',
  );
  return Object.fromEntries(
    world.robots.map(({ id }) => {
      const source = value[id];
      requireField(
        Object.hasOwn(value, id) && typeof source === 'string',
        'controllers.' + id,
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
    requireField(data.version === version, 'version', 'versão não suportada');
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
    const boundSources = sources(controllers, parsed.world);
    const list = readEvents(events, parsed.world, states.length - 1);
    const snapshots = readStates(states, parsed.world, list);
    return {
      ok: true,
      world: parsed.world,
      recording: {
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
