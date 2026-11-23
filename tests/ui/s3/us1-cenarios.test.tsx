import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { InstancedMesh, Matrix4, PerspectiveCamera, Vector3 } from 'three';
import { afterEach, expect, it } from 'vitest';
import { App } from '../../../src/ui/App';
import { ArenaSession } from '../../../src/ui/arena/session';
import { configureCamera } from '../../../src/ui/scene/camera';
import { buildScene } from '../../../src/ui/scene/graphics';
import room from '../../../examples/worlds/sala-com-obstaculos.json?raw';
import { runDefaultDuel, testEngine } from './support';

afterEach(cleanup);
it('S3-US1-AC11: troca os fundos visíveis na câmera inicial e conserva a luta', () => {
  const session = new ArenaSession(testEngine);
  session.step();
  const before = session.getSnapshot();
  render(<App session={session} />);
  const graphics = buildScene(before.world);
  const original = [...graphics.scene.children];
  for (const [theme, name] of [
    ['dojo', 'Bambus'],
    ['orbital', 'Balizas do hangar'],
  ] as const) {
    fireEvent.change(screen.getByLabelText('Cenário'), {
      target: { value: theme },
    });
    expect(
      screen.getByRole('region', { name: 'Cena 3D' }).dataset.scenery,
    ).toBe(theme);
    graphics.setScenery(theme);
    graphics.scene.updateMatrixWorld(true);
    const details = graphics.scene.getObjectByName(name) as InstancedMesh;
    for (const aspect of [1.5, 0.8]) {
      const camera = new PerspectiveCamera();
      configureCamera(camera, before.world, aspect, '3d');
      const visible = Array.from({ length: details.count }, (_, i) => {
        const instance = new Matrix4();
        details.getMatrixAt(i, instance);
        const p = new Vector3()
          .setFromMatrixPosition(instance)
          .applyMatrix4(details.matrixWorld)
          .project(camera);
        return Math.abs(p.x) < 1 && Math.abs(p.y) < 1 && Math.abs(p.z) < 1;
      });
      expect(visible).toContain(true);
    }
    expect(graphics.scene.children.slice(0, original.length)).toEqual(original);
    expect(session.getSnapshot()).toBe(before);
  }
  graphics.setScenery('classic');
  expect(graphics.scene.children).toEqual(original);
  graphics.dispose();
  const reference = new ArenaSession(testEngine);
  reference.step();
  reference.play();
  runDefaultDuel(reference);
  act(() => {
    session.play();
    runDefaultDuel(session);
  });
  expect(session.getSnapshot().snapshot.resultado).not.toBeNull();
  expect(session.getSnapshot().snapshot).toEqual(
    reference.getSnapshot().snapshot,
  );
});
it('S3-US1-AC12: aplica o cenário escolhido somente no sumô e preserva a escolha no reset', () => {
  const session = new ArenaSession(testEngine);
  render(<App session={session} />);
  fireEvent.change(screen.getByLabelText('Cenário'), {
    target: { value: 'orbital' },
  });
  act(() => session.chooseWorld('facil'));
  expect(screen.queryByLabelText('Cenário')).toBeNull();
  act(() => session.openWorld(room));
  expect(screen.queryByLabelText('Cenário')).toBeNull();
  act(() => session.chooseWorld('duelo'));
  act(() => session.reset());
  expect((screen.getByLabelText('Cenário') as HTMLSelectElement).value).toBe(
    'orbital',
  );
});
