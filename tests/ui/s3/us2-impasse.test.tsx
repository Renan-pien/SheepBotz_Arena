import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from '../../../src/ui/App';
import { ArenaSession } from '../../../src/ui/arena/session';
import {
  decodeRecording,
  encodeRecording,
} from '../../../src/ui/arena/recording';
import { idleEngine } from './support';
import { runHeadless } from '../../../src/core';
import { worldPresets } from '../../../src/ui/arena/catalog';

afterEach(cleanup);

it('S3-US2-AC14: pausa, velocidade e retrocesso respeitam o prazo fixo da rodada', () => {
  const session = new ArenaSession(idleEngine);
  render(<App session={session} />);
  const selector = screen.getByRole<HTMLSelectElement>('combobox', {
    name: 'Limite sem progresso',
  });
  expect(selector.value).toBe('10');
  expect(Array.from(selector.options, (o) => o.value)).toEqual([
    '5',
    '10',
    '30',
  ]);
  fireEvent.change(selector, { target: { value: '5' } });
  act(() => {
    session.step();
    session.back();
  });
  expect(selector.disabled).toBe(true);
  act(() => session.setStallSeconds(30));
  expect(session.getSnapshot().stallSeconds).toBe(5);
  act(() => {
    session.setSpeed(2);
    session.play();
    session.pulse(100);
    session.pause();
    session.pulse(100000);
  });
  expect(screen.getByText('Tempo até impasse: 4,80 s')).toBeTruthy();
  act(() => session.back());
  expect(screen.getByText('Tempo até impasse: 4,82 s')).toBeTruthy();
  act(() => {
    for (let i = 9; i < 249; i++) session.step();
    session.back();
    session.play();
    session.pulse(200);
  });
  expect(
    screen.getByRole('region', { name: 'Último empate' }).textContent,
  ).toContain('tick 250');
  expect(session.getSnapshot()).toMatchObject({
    status: 'pausada',
    snapshot: { tick: 0, time: 0, events: [] },
    lastDraw: { round: 1 },
  });
  expect(selector.disabled).toBe(false);
  expect(selector.value).toBe('5');
  act(() => {
    session.pulse(10000);
    session.pulse(10000);
  });
  expect(session.history()).toHaveLength(1);
  expect(session.getSnapshot().snapshot.tick).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: 'Ver replay do empate' }));
  expect(session.getSnapshot()).toMatchObject({
    mode: 'replay',
    replayLast: 250,
  });
  act(() => {
    session.seek(249);
    session.step();
  });
  expect(session.getSnapshot()).toMatchObject({
    mode: 'replay',
    status: 'finalizada',
    snapshot: {
      tick: 250,
      resultado: { vencedor: null, motivo: 'falta_de_progresso' },
    },
  });
});

it('S3-US5-AC12: gravação de impasse reabre sem executar scripts; prazo adulterado é rejeitado', () => {
  const load = vi.fn(idleEngine.load);
  const session = new ArenaSession({ load });
  session.setStallSeconds(5);
  for (let i = 0; i < 250; i++) session.step();
  const draw = session.getSnapshot().lastDraw!;
  const text = encodeRecording(draw.recording);
  const data = JSON.parse(text);
  expect(data.version).toBe(2);
  expect(
    decodeRecording(JSON.stringify({ ...data, stallSeconds: 30 })).ok,
  ).toBe(false);
  expect(decodeRecording(JSON.stringify({ ...data, stallSeconds: 7 })).ok).toBe(
    false,
  );
  const decoded = decodeRecording(text);
  expect(decoded.ok && decoded.recording).toEqual(draw.recording);
  load.mockClear();
  session.openRecording(text);
  session.seek(249);
  session.play();
  session.pulse(1000);
  session.pulse(1000);
  expect(session.getSnapshot()).toMatchObject({
    mode: 'replay',
    status: 'finalizada',
    snapshot: { tick: 250 },
    lastDraw: null,
  });
  expect(load).not.toHaveBeenCalled();
});

it('S3-US5-AC12: v1 conserva empate por tempo mesmo após dez segundos imóvel', () => {
  const world = JSON.stringify({
    ...JSON.parse(worldPresets.duelo.text),
    match: { mode: 'sumo', maxTicks: 510 },
  });
  const legacy = runHeadless({ world, ticks: 510, history: true });
  if (!legacy.ok) throw Error('Mundo inválido');
  // Monta o formato legado independentemente do codificador atual.
  const text = JSON.stringify({
    format: 'sheepbotz-arena',
    version: 1,
    world,
    controllers: { vermelho: 'function loop(){}', azul: 'function loop(){}' },
    createdAt: '2026-11-21T00:00:00.000Z',
    events: legacy.state.events,
    states: legacy.history!.map(({ events, ...state }) => ({
      ...state,
      eventCount: events.length,
    })),
  });
  const session = new ArenaSession(idleEngine);
  session.openRecording(text);
  session.seek(509);
  session.step();
  expect(session.getSnapshot().snapshot).toEqual(legacy.state);
  expect(session.getSnapshot().mode).toBe('replay');
});
