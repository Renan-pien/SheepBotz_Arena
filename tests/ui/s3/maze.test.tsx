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
import { controllerPresets, worldPresets } from '../../../src/ui/arena/catalog';

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
  fireEvent.change(screen.getByLabelText('Modo'), {
    target: { value: 'maze' },
  });
  const source = controllerPresets.navegador.source + '\n// Minha estratégia';
  act(() => {
    session.editSource('explorador', source);
    session.apply('explorador');
  });
  for (const level of ['facil', 'medio', 'dificil']) {
    expect(select('Dificuldade').value).toBe(level);
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

function select(name: string) {
  return screen.getByRole<HTMLSelectElement>('combobox', { name });
}

function choose(name: string, value: string) {
  fireEvent.change(select(name), { target: { value } });
}

function options(name: string) {
  return Array.from(select(name).options, (option) => option.text);
}

it('S3-US3-AC11: duas modalidades e troca direta de dificuldade preservando estratégia e rascunho', () => {
  const session = new ArenaSession(engine);
  render(<App session={session} />);
  expect(options('Modo')).toEqual(['Sumô', 'Labirinto']);
  expect(select('Modo').value).toBe('sumo');
  expect(screen.queryByLabelText('Dificuldade')).toBeNull();
  choose('Modo', 'maze');
  expect(select('Dificuldade').value).toBe('facil');
  expect(options('Dificuldade')).toEqual(['Fácil', 'Médio', 'Difícil']);
  expect(session.getSnapshot().status).toBe('pausada');
  const source = 'function loop() { setSpeed(0.1, 0); }';
  act(() => {
    session.editSource('explorador', source);
    session.apply('explorador');
    session.editSource('explorador', '// ainda em edição');
    session.play();
    session.pulse(500);
  });
  expect(session.getSnapshot().snapshot.tick).toBeGreaterThan(0);
  for (const level of ['dificil', 'medio'] as const) {
    choose('Dificuldade', level);
    const view = session.getSnapshot();
    expect(view.world.name).toBe(worldPresets[level].name);
    expect(view.status).toBe('pausada');
    expect(view.snapshot.tick).toBe(0);
    expect(session.history()).toHaveLength(1);
    expect(view.controllers.explorador).toBe(source);
    expect(view.drafts.explorador?.source).toBe('// ainda em edição');
  }
  choose('Modo', 'sumo');
  expect(session.getSnapshot().world.name).toBe(worldPresets.duelo.name);
  expect(screen.queryByLabelText('Dificuldade')).toBeNull();
  choose('Modo', 'maze');
  expect(select('Dificuldade').value).toBe('facil');
});

it('S3-US3-AC12: mundo livre e labirinto de arquivo mantêm sua identificação', () => {
  const session = new ArenaSession(engine);
  render(<App session={session} />);
  const free = {
    name: 'Minha sala',
    map: { width: 2, height: 2 },
    robots: [{ id: 'meu', x: 0, y: 0 }],
  };
  act(() => session.openWorld(JSON.stringify(free)));
  act(() => session.step());
  expect(options('Modo')).toEqual(['Sumô', 'Labirinto']);
  expect(select('Modo').selectedIndex).toBe(-1);
  expect(screen.getByText('Minha sala')).toBeTruthy();
  expect(screen.queryByLabelText('Dificuldade')).toBeNull();
  const custom = JSON.parse(worldPresets.facil.text);
  custom.name = 'Meu percurso';
  custom.robots[0].id = 'meu';
  act(() => session.openWorld(JSON.stringify(custom)));
  expect(select('Modo').value).toBe('maze');
  expect(select('Dificuldade').selectedIndex).toBe(-1);
  expect(screen.getByText('Meu percurso')).toBeTruthy();
  choose('Dificuldade', 'medio');
  expect(session.getSnapshot().controllers.explorador).toBe(
    controllerPresets.parado.source,
  );
  act(() => session.enterReplay());
  expect(select('Modo').disabled).toBe(true);
  expect(select('Dificuldade').disabled).toBe(true);
  expect(select('Dificuldade').value).toBe('medio');
});
