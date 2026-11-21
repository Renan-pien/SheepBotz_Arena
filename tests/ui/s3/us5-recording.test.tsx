import { expect, it } from 'vitest';
import { runHeadless } from '../../../src/core';
import {
  decodeRecording,
  encodeRecording,
  recordingName,
} from '../../../src/ui/arena/recording';
import { ArenaSession } from '../../../src/ui/arena/session';
import { idleEngine, testEngine } from './support';

function duel() {
  const session = new ArenaSession(testEngine);
  session.play();
  session.pulse(800);
  return session;
}

it('S3-US5-AC1: grava tick zero e cada tick de um lote', () => {
  expect(
    duel()
      .recording()
      .states.map(({ tick }) => tick),
  ).toEqual(Array.from({ length: 35 }, (_, index) => index));
});

it('S3-US5-AC8: a gravação é igual à reexecução com mesmas entradas', () => {
  const recording = duel().recording();
  const result = runHeadless({
    world: recording.world,
    controllers: recording.controllers,
    controllerEngine: testEngine,
    ticks: 34,
    history: true,
  });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  expect(result.history).toEqual(recording.states);
  const text = encodeRecording(recording);
  const decoded = decodeRecording(text);
  if (!decoded.ok) throw new Error(decoded.error.message);
  expect(decoded.recording).toEqual(recording);
  expect(decoded.recording.states[0]?.events).toBe(
    decoded.recording.states[20]?.events,
  );
  expect(decoded.recording.states.at(-1)?.events.at(-1)?.robotId).toBeNull();
  expect(
    recordingName('Sala com obstáculos!', '2026-11-18T02:09:50.000Z'),
  ).toBe('sheepbotz-sala-com-obstaculos-2026-11-18-0209.json');
  expect(recordingName('***', '2026-11-18T02:09:50.000Z')).toBe(
    'sheepbotz-mundo-2026-11-18-0209.json',
  );
});

it('S3-US5-AC10 / S3-US2-AC13: preserva o limite da gravação ao avançar e retroceder', () => {
  const session = new ArenaSession(idleEngine);
  session.openWorld(
    JSON.stringify({
      name: 'Livre',
      dt: 0.02,
      map: { width: 2, height: 2 },
      robots: [{ id: 'r1', x: 0, y: 0, radius: 0.05 }],
    }),
  );
  session.setSpeed(4);
  session.play();
  for (let batch = 0; batch < 1563; batch++) session.pulse(320);
  const view = session.getSnapshot();
  expect(view.snapshot.tick).toBeGreaterThan(100_000);
  expect(view.limitReached).toBe(true);
  expect(view.snapshot.status).toBe('em_andamento');
  const states = session.recording().states;
  expect(states).toHaveLength(100_001);
  expect(states.at(-1)?.tick).toBe(100_000);
  session.pause();
  for (let i = 0; i < 600; i++) session.step();
  for (let i = 0; i < 600; i++) session.back();
  expect(session.getSnapshot().snapshot).toEqual(view.snapshot);
  for (let tick = view.snapshot.tick; tick > 99_999; tick--) session.back();
  expect(session.getSnapshot().limitReached).toBe(false);
  expect(session.recording().states.at(-1)).toEqual(states[99_999]);
  for (let tick = 100_000; tick <= view.snapshot.tick; tick++) session.step();
  expect(session.getSnapshot().snapshot).toEqual(view.snapshot);
  expect(session.recording().states).toHaveLength(100_001);
});

it('aceita gravação parcial no tick zero sem executar scripts', () => {
  const recording = new ArenaSession(idleEngine).recording();
  const decoded = decodeRecording(
    encodeRecording({
      ...recording,
      controllers: { ...recording.controllers, vermelho: 'function loop(' },
    }),
  );
  expect(decoded.ok).toBe(true);
  if (decoded.ok) {
    expect(decoded.recording.states[0]?.status).toBe('em_andamento');
    expect(decoded.recording.controllers.vermelho).toBe('function loop(');
  }
});

function replaceAt(data: unknown, path: readonly string[], value: unknown) {
  const entry = path
    .slice(0, -1)
    .reduce(
      (node: unknown, field) => (node as Record<string, unknown>)[field],
      data,
    ) as Record<string, unknown>;
  entry[path.at(-1)!] = value;
}

it.each<[string, unknown]>([
  ['format', 'outro'],
  ['version', 2],
  ['createdAt', 'inválido'],
  ['world', '{'],
  ['world', {}],
  ['controllers', {}],
  ['controllers.vermelho', 1],
  ['states', []],
  ['events', 'não é uma lista'],
  ['events.0.type', 'desconhecido'],
  ['events.0.robotId', 'vermelho'],
  ['events.0.tick', 0],
  ['events.0.message', false],
  ['states.0', null],
  ['states.1.tick', 2],
  ['states.1.time', 0.05],
  ['states.1.eventCount', 1],
  ['states.1.robots', []],
  ['states.1.robots.0.id', 'fantasma'],
  ['states.1.robots.0.pose', null],
  ['states.1.robots.0.pose.theta', 5],
  ['states.1.robots.0.pose.y', '0'],
  ['states.1.robots.0.odometry.x', false],
  ['states.1.robots.0.command.v', 100],
  ['states.1.robots.0.command', null],
  ['states.1.robots.0.bumper', 'false'],
  ['states.1.robots.0.laser', [-1, 0, 0, 0, 0]],
  ['states.1.robots.0.laser', [1]],
  ['states.1.robots.0.situacao', 'parado'],
  ['states.1.resultado', {}],
  ['states.1.status', 'finalizada'],
  ['states.34.resultado', null],
  ['states.34.resultado.motivo', 'incorreto'],
  ['states.34.resultado.vencedor', null],
  ['states.34.resultado.tick', 33],
])('rejeita incoerência em %s com erro estruturado', (field, value) => {
  const document: unknown = JSON.parse(encodeRecording(duel().recording()));
  replaceAt(document, field.split('.'), value);
  const result = decodeRecording(JSON.stringify(document));
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.error.code).toBe('GRAVACAO_INVALIDA');
    expect(result.error.message.length).toBeGreaterThan(10);
  }
});
