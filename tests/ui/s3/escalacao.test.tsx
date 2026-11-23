import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Mesh } from 'three';
import { modelIds, robotModels } from '../../../src/core';
import { App } from '../../../src/ui/App';
import { ArenaSession } from '../../../src/ui/arena/session';
import { encodeRecording } from '../../../src/ui/arena/recording';
import { robotLabel } from '../../../src/ui/arena/teams';
import { buildScene } from '../../../src/ui/scene/graphics';
import { projectFrame } from '../../../src/ui/scene/projection';
import { testEngine } from './support';

afterEach(cleanup);
it('S3-US3-AC16: a seleção reserva cada modelo para uma equipe e libera a escolha substituída', () => {
  const session = new ArenaSession(testEngine);
  session.step();
  session.editSource('vermelho', '// rascunho vermelho');
  session.editSource('azul', '// rascunho azul');
  const before = session.getSnapshot();
  render(<App session={session} />);
  const trigger = screen.getByRole('button', { name: 'Selecionar robôs' });
  fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Seleção de robôs' });
  const get = (name: string | RegExp) =>
    within(dialog).getByRole<HTMLButtonElement>('button', { name });
  expect(
    within(dialog)
      .getAllByRole('button')
      .filter((b) => b.className.includes('roster-card')),
  ).toHaveLength(9);
  for (const name of ['Peso leve', 'Peso médio', 'Peso pesado']) {
    expect(
      within(within(dialog).getByRole('group', { name })).getAllByRole(
        'button',
      ),
    ).toHaveLength(3);
  }
  expect(get('Confirmar duelo').disabled).toBe(true);
  fireEvent.click(get('Nimbo'));
  expect(get('Nimbo · Equipe Vermelha').disabled).toBe(true);
  fireEvent.click(get('Brontes'));
  fireEvent.click(get(/Equipe Vermelha Nimbo/));
  expect(get('Brontes · Equipe Azul').disabled).toBe(true);
  fireEvent.click(get('Quimera'));
  expect(get('Nimbo').disabled).toBe(false);
  fireEvent.keyDown(dialog, { key: 'Escape' });
  expect(session.getSnapshot()).toBe(before);
  fireEvent.click(trigger);
  fireEvent.click(get('Zarpa'));
  fireEvent.click(get('Baluarte'));
  fireEvent.click(get('Confirmar duelo'));
  const view = session.getSnapshot();
  expect(view.world.robots.map((robot) => robot.model)).toEqual([
    'zarpa',
    'baluarte',
  ]);
  expect(view.drafts).toBe(before.drafts);
  expect(view.controllers).toBe(before.controllers);
  expect(view.languages).toBe(before.languages);
  expect(view.status).toBe('pausada');
  expect(view.snapshot.tick).toBe(0);
});

it('S3-US3-AC17: os nove perfis têm carrocerias distintas e viajam com o mundo gravado', () => {
  const session = new ArenaSession(testEngine);
  const legacy = encodeRecording(session.recording());
  const shapes = new Set<string>();
  for (const [i, id] of modelIds.entries()) {
    const opponent = modelIds[(i + 1) % modelIds.length]!;
    expect(session.selectModels(id, opponent)).toBe(true);
    session.step();
    const end = session.getSnapshot().snapshot;
    const record = encodeRecording(session.recording());
    session.reset();
    session.openRecording(record);
    session.seek(1);
    const view = session.getSnapshot();
    expect(view.mode).toBe('replay');
    expect(view.world.robots[0]!.model).toBe(id);
    expect(robotLabel(view.world, view.world.robots[0]!)).toBe(
      'Vermelha · ' + robotModels[id].name,
    );
    expect(view.snapshot).toEqual(end);
    expect(session.selectModels('nimbo', 'baluarte')).toBe(false);
    const graphics = buildScene(view.world);
    graphics.update(projectFrame(view.world, view.snapshot), true);
    const body = graphics.scene.getObjectByName(id)!;
    expect(body.scale.x).toBeCloseTo(robotModels[id].radius, 6);
    shapes.add(
      JSON.stringify(
        body.children.map((piece) => [
          (piece as Mesh).geometry.type,
          piece.position.toArray(),
          piece.scale.toArray(),
        ]),
      ),
    );
    graphics.dispose();
    session.exitReplay();
  }
  expect(shapes.size).toBe(9);
  session.openRecording(legacy);
  expect(
    session.getSnapshot().world.robots.every((r) => r.model === undefined),
  ).toBe(true);
});
it('S3-US3-AC17: valida a escalação de um arquivo e conserva a rodada em caso de erro', () => {
  const session = new ArenaSession(testEngine);
  const original = JSON.parse(session.getSnapshot().worldText);
  original.robots.reverse();
  original.robots[0].x = 0.05;
  original.robots[1].x = -0.05;
  session.openWorld(JSON.stringify(original));
  const before = session.getSnapshot();
  expect(session.selectModels('nimbo', 'nimbo')).toBe(false);
  expect(session.selectModels('brontes', 'baluarte')).toBe(false);
  expect(session.getSnapshot().world).toBe(before.world);
  expect(session.getSnapshot().snapshot).toBe(before.snapshot);
  expect(session.getSnapshot().errors[0]?.code).toBe(
    'POSICAO_INICIAL_INVALIDA',
  );
  expect(session.selectModels('nimbo', 'zarpa')).toBe(true);
  expect(
    session.getSnapshot().world.robots.map((r) => [r.id, r.model]),
  ).toEqual([
    ['azul', 'zarpa'],
    ['vermelho', 'nimbo'],
  ]);
});
