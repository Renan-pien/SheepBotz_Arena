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
    const terminal = session.getSnapshot().snapshot;
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
    expect(screen.getByText('Largada em 4,98 s')).toBeTruthy();
    act(() => session.step());
    expect(session.getSnapshot().snapshot).toEqual(terminal);
    const file = encodeRecording(session.recording());
    load.mockClear();
    act(() => {
      session.openRecording(file);
      session.seek(1);
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
  session.step();
  const file = encodeRecording(session.recording());
  const tamper = (change: (state: ReturnType<typeof JSON.parse>) => void) => {
    const data = JSON.parse(file);
    change(data.states[1]);
    expect(decodeRecording(JSON.stringify(data)).ok).toBe(false);
  };
  tamper((state) => (state.resultado.pontos.azul = 1));
  tamper((state) => state.falseStarters.reverse());
  tamper((state) => (state.falseStarters = ['azul', 'azul']));
  tamper((state) => delete state.falseStarters);
  tamper((state) => (state.robots[0].pose.x += 0.01));
  const legacy = new ArenaSession(idleEngine);
  const document = JSON.parse(encodeRecording(legacy.recording()));
  document.version = 3;
  legacy.openRecording(JSON.stringify(document));
  expect(legacy.getSnapshot().mode).toBe('replay');
  expect(legacy.getSnapshot().snapshot.sumoStartDelay).toBeUndefined();
});
