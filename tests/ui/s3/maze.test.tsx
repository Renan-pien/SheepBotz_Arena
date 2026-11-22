import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { runInNewContext } from 'node:vm';
import type { ControllerEngine } from '../../../src/core';
import { afterEach, expect, it } from 'vitest';
import { App } from '../../../src/ui/App';
import { ArenaSession } from '../../../src/ui/arena/session';
import {
  encodeRecording,
  decodeRecording,
} from '../../../src/ui/arena/recording';
import { buildScene } from '../../../src/ui/scene/graphics';
import { controllerPresets } from '../../../src/ui/arena/catalog';

// O jsdom compartilha intrínsecos do host. A suíte headless usa o motor SES de produção.
const engine: ControllerEngine = {
  load(source, bindings) {
    const loop = runInNewContext(source + '\n;loop', { ...bindings });
    return { ok: true, value: { loop } };
  },
};

afterEach(cleanup);

it('S3-US3-AC10: chegada pausada, retrocesso, replay e progressão por clique', () => {
  const session = new ArenaSession(engine);
  render(<App session={session} />);
  fireEvent.change(screen.getByLabelText('Mundo'), {
    target: { value: 'facil' },
  });
  const source = controllerPresets.navegador.source + '\n// Minha estratégia';
  act(() => {
    session.editSource('explorador', source);
    session.apply('explorador');
  });
  for (const level of ['facil', 'medio', 'dificil']) {
    expect(session.getSnapshot().preset).toBe(level);
    expect(session.getSnapshot().controllers.explorador).toBe(source);
    const graphics = buildScene(session.getSnapshot().world);
    expect(graphics.scene.getObjectByName('Saída')).toBeDefined();
    graphics.dispose();
    act(() => {
      session.play();
      for (
        let i = 0;
        i < 2000 && session.getSnapshot().status === 'executando';
        i++
      )
        session.pulse(250);
    });
    const end = session.getSnapshot().snapshot;
    expect(end.resultado?.motivo).toBe('saida_alcancada');
    expect(session.getSnapshot().status).toBe('pausada');
    act(() => {
      session.pulse(1000);
      session.play();
      session.step();
    });
    expect(session.getSnapshot().snapshot).toBe(end);
    act(() => session.back());
    expect(session.getSnapshot().snapshot.resultado).toBeNull();
    expect(screen.queryByRole('button', { name: 'Próximo nível' })).toBeNull();
    act(() => session.step());
    expect(session.getSnapshot().snapshot).toBe(end);
    const file = encodeRecording(session.recording());
    const replay = new ArenaSession(engine);
    replay.openRecording(file);
    expect(replay.getSnapshot().mode).toBe('replay');
    replay.seek(end.tick);
    replay.nextLevel();
    expect(replay.getSnapshot().snapshot).toEqual(end);
    replay.exitReplay();
    expect(replay.getSnapshot().preset).toBe(level);
    expect(replay.getSnapshot().snapshot.tick).toBe(0);
    if (level === 'dificil') {
      expect(screen.getByText(/Labirinto concluído/)).toBeTruthy();
      expect(
        screen.queryByRole('button', { name: 'Próximo nível' }),
      ).toBeNull();
      const bad = JSON.parse(file);
      bad.states.at(-1).robots[0].pose = bad.states[0].robots[0].pose;
      expect(decodeRecording(JSON.stringify(bad)).ok).toBe(false);
    } else {
      fireEvent.click(screen.getByRole('button', { name: 'Próximo nível' }));
      expect(session.getSnapshot().status).toBe('pausada');
      expect(session.getSnapshot().snapshot.tick).toBe(0);
    }
  }
});
