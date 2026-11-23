import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { ControllerEngine } from '../../../src/core';
import { App } from '../../../src/ui/App';
import { ArenaSession } from '../../../src/ui/arena/session';
import {
  decodeRecording,
  encodeRecording,
} from '../../../src/ui/arena/recording';
import { idleEngine } from './support';
import { projectFrame } from '../../../src/ui/scene/projection';

afterEach(cleanup);

it.each([false, true])(
  'S3-US2-AC17: conta tempo simulado e restaura o mesmo desfecho ao rever a queima, dupla=%s',
  (double) => {
    const load = vi.fn<ControllerEngine['load']>((_, api) => ({
      ok: true,
      value: {
        loop() {
          const { id, tick } = api.getInfo!() as { id: string; tick: number };
          if (tick === 1 && (double || id === 'azul')) api.setSpeed!(0, 1);
        },
      },
    }));
    const session = new ArenaSession({ load });
    render(<App session={session} />);
    expect(screen.getByText('Largada em 5,00 s')).toBeTruthy();
    act(() => {
      session.play();
      session.pulse(20);
      session.pause();
      session.pulse(10000);
    });
    expect(screen.getByText('Largada em 4,98 s')).toBeTruthy();
    act(() => session.step());
    const first = session.getSnapshot().snapshot;
    expect(first.resultado).toBeNull();
    expect(first.falseStartTick).toBe(2);
    expect(
      projectFrame(session.getSnapshot().world, first)
        .filter((r) => r.falseStart)
        .map((r) => r.id),
    ).toEqual(double ? ['vermelho', 'azul'] : ['azul']);
    const partial = session.recording();
    expect(decodeRecording(encodeRecording(partial))).toMatchObject({
      ok: true,
      recording: partial,
    });
    act(() => {
      session.back();
    });
    expect(screen.getByText('Largada em 4,98 s')).toBeTruthy();
    act(() => {
      session.step();
      session.play();
      session.pulse(200);
      session.pause();
    });
    const midway = session.getSnapshot().snapshot;
    expect(midway.tick).toBe(12);
    act(() => session.pulse(20000));
    expect(session.getSnapshot().snapshot).toBe(midway);
    act(() => {
      session.play();
      session.pulse(1000);
    });
    const terminal = session.getSnapshot().snapshot;
    expect(terminal.tick).toBe(26);
    const message = double
      ? /empate sem pontos/
      : /azul.+vitória de vermelho \(\+1 ponto\)/;
    expect(
      screen.getByRole('region', { name: 'Resultado' }).textContent,
    ).toMatch(message);
    expect(session.getSnapshot().status).toBe('pausada');
    act(() => {
      session.pulse(10000);
      session.step();
      session.back();
    });
    expect(session.getSnapshot().snapshot.tick).toBe(25);
    expect(session.getSnapshot().snapshot.resultado).toBeNull();
    act(() => session.step());
    expect(session.getSnapshot().snapshot).toEqual(terminal);
    const file = encodeRecording(session.recording());
    load.mockClear();
    act(() => {
      session.openRecording(file);
      session.seek(12);
    });
    expect(session.getSnapshot().snapshot).toEqual(midway);
    act(() => {
      session.seek(25);
      session.step();
    });
    expect(session.getSnapshot().mode).toBe('replay');
    expect(session.getSnapshot().snapshot).toEqual(terminal);
    expect(load).not.toHaveBeenCalled();
    act(() => {
      session.exitReplay();
      session.reset();
    });
    expect(screen.getByText('Largada em 5,00 s')).toBeTruthy();
    act(() => session.chooseWorld('facil'));
    expect(screen.queryByText(/Largada em/)).toBeNull();
  },
);

it('S3-US2-AC17: gravação rejeita alteração de pontos, infratores ou movimento durante a largada', () => {
  const session = new ArenaSession({
    load: (_, api) => ({
      ok: true,
      value: {
        loop() {
          api.setSpeed!(0, 1);
        },
      },
    }),
  });
  for (let tick = 0; tick < 25; tick++) session.step();
  const file = encodeRecording(session.recording());
  const tamper = (change: (state: ReturnType<typeof JSON.parse>) => void) => {
    const data = JSON.parse(file);
    change(data.states[25]);
    expect(decodeRecording(JSON.stringify(data)).ok).toBe(false);
  };
  tamper((state) => (state.resultado.pontos.azul = 1));
  tamper((state) => state.falseStarters.reverse());
  tamper((state) => (state.falseStarters = ['azul', 'azul']));
  tamper((state) => delete state.falseStarters);
  tamper((state) => (state.robots[0].pose.x += 0.01));
  tamper((state) => (state.falseStartTick = 2));
  tamper((state) => (state.robots[0].command.w = 2));
  const legacy = new ArenaSession(idleEngine);
  const document = JSON.parse(encodeRecording(legacy.recording()));
  document.version = 3;
  legacy.openRecording(JSON.stringify(document));
  expect(legacy.getSnapshot().mode).toBe('replay');
  expect(legacy.getSnapshot().snapshot.sumoStartDelay).toBeUndefined();
});

it('S3-US2-AC18: arquivo v5 com queima no tick 1 conserva o fim imediato ao abrir e salvar', () => {
  const session = new ArenaSession(idleEngine);
  session.step();
  const file = JSON.parse(encodeRecording(session.recording()));
  file.version = 5;
  file.events = [
    {
      type: 'fim_da_luta',
      tick: 1,
      robotId: null,
      message: "Queima de largada de 'azul'. Vitória de 'vermelho' (+1 ponto).",
    },
  ];
  Object.assign(file.states[1], {
    falseStarters: ['azul'],
    status: 'finalizada',
    eventCount: 1,
    resultado: {
      motivo: 'queima_da_largada',
      tick: 1,
      vencedor: 'vermelho',
      pontos: { vermelho: 1, azul: 0 },
    },
  });
  session.openRecording(JSON.stringify(file));
  expect(session.getSnapshot().mode).toBe('replay');
  session.step();
  expect(session.getSnapshot().snapshot.resultado).toEqual(
    file.states[1].resultado,
  );
  expect(session.getSnapshot().snapshot.falseStartTick).toBeUndefined();
  expect(JSON.parse(encodeRecording(session.recording()))).toEqual(file);
});

it('S3-US2-AC18: a gravação conserva uma infração no último tick de espera até depois da liberação', () => {
  const engine: ControllerEngine = {
    load: (_, api) => ({
      ok: true,
      value: {
        loop() {
          const info = api.getInfo!() as { id: string; tick: number };
          if (info.id === 'azul' && info.tick === 249) api.setSpeed!(-0.5, 0);
        },
      },
    }),
  };
  const session = new ArenaSession(engine);
  const world = JSON.parse(session.getSnapshot().worldText);
  world.match.maxTicks = 1;
  session.openWorld(JSON.stringify(world));
  for (let tick = 0; tick < 274; tick++) session.step();
  const recording = session.recording();
  const decoded = decodeRecording(encodeRecording(recording));
  if (!decoded.ok) throw Error(decoded.error.message);
  expect(decoded.recording.states).toEqual(recording.states);
  expect(recording.states[249]!.falseStartTick).toBeUndefined();
  expect(recording.states[250]!.falseStartTick).toBe(250);
  expect(recording.states[273]!.resultado).toBeNull();
  expect(recording.states[274]!.resultado).toMatchObject({
    tick: 274,
    vencedor: 'vermelho',
  });
});
