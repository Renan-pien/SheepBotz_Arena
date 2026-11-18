import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PerspectiveCamera, Vector3, MOUSE } from 'three';
import { afterEach, expect, it } from 'vitest';
import { createInitialState, loadWorld } from '../../../src/core';
import { App } from '../../../src/ui/App';
import { worldPresets } from '../../../src/ui/arena/catalog';
import { ArenaSession } from '../../../src/ui/arena/session';
import { configureCamera, orbitSettings } from '../../../src/ui/scene/camera';
import { buildScene } from '../../../src/ui/scene/graphics';
import { projectFrame } from '../../../src/ui/scene/projection';
import { testEngine } from './support';

afterEach(cleanup);

function duel() {
  return new ArenaSession(testEngine).getSnapshot();
}

it('S3-US1-AC1: projeta a arena, as cores e as poses iniciais', () => {
  const { world, snapshot } = duel();
  const frame = projectFrame(world, snapshot);
  expect(world.arena?.radius).toBe(0.385);
  expect(frame.map((robot) => robot.center[0])).toEqual([-0.2, 0.2]);
  expect(frame.map((robot) => robot.color)).toEqual(
    world.robots.map((robot) => robot.color),
  );
  expect(frame[0]?.front[0]).toBeCloseTo(1);
  expect(frame[1]?.front[0]).toBeCloseTo(-1);
});

it('S3-US1-AC2: usa as distâncias publicadas para raios livres e atingidos', () => {
  const { world, snapshot } = duel();
  for (const robot of projectFrame(world, snapshot)) {
    expect(robot.rays).toHaveLength(5);
    expect(robot.rays.map((ray) => ray.hit)).toEqual([
      false,
      false,
      true,
      false,
      false,
    ]);
    for (const [i, ray] of robot.rays.entries()) {
      const distance = new Vector3(...ray.start).distanceTo(
        new Vector3(...ray.end),
      );
      expect(distance).toBeCloseTo(i === 2 ? 0.35 : 0.8, 8);
    }
  }
});

it('S3-US1-AC3: mapeia +y lógico e theta positivo para -Z', () => {
  const { world, snapshot } = duel();
  const robots = snapshot.robots.map((robot) => ({
    ...robot,
    pose: { x: 0.2, y: 0.1, theta: Math.PI / 2 },
  }));
  const robot = projectFrame(world, { ...snapshot, robots })[0]!;
  expect(robot.center).toEqual([0.2, 0.025, -0.1]);
  expect(robot.front[0]).toBeCloseTo(0, 8);
  expect(robot.front[2]).toBeCloseTo(-1, 8);
});

it('S3-US1-AC4: segue a configuração orbital documentada', () => {
  expect(orbitSettings).toMatchObject({
    minDistance: 0.3,
    maxDistance: 20,
    mouseButtons: { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN },
  });
});

it('S3-US1-AC5: vista superior conserva a orientação dos eixos', () => {
  const { world } = duel();
  const camera = new PerspectiveCamera();
  configureCamera(camera, world, 1.5, 'top');
  expect(new Vector3(0.2, 0, 0).project(camera).x).toBeGreaterThan(0);
  expect(new Vector3(0, 0, -0.2).project(camera).y).toBeGreaterThan(0);
  configureCamera(camera, world, 1.5, '3d');
  expect(camera.position.z).toBeGreaterThan(0);
  expect(camera.position.y).toBeGreaterThan(0);
});

it('S3-US1-AC6: trocar visibilidade de raios conserva o snapshot', () => {
  const session = new ArenaSession(testEngine);
  const initial = session.getSnapshot().snapshot;
  render(<App session={session} />);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar raios' }));
  expect(screen.getByRole('region', { name: 'Cena 3D' }).dataset.rays).toBe(
    'false',
  );
  expect(session.getSnapshot().snapshot).toBe(initial);
});

it('S3-US1-AC7: Sala tem paredes, três obstáculos, nove raios e nenhuma arena', () => {
  const result = loadWorld(worldPresets.sala.text);
  if (!result.ok) throw new Error('Sala inválida');
  const { world } = result;
  const [explorer] = projectFrame(world, createInitialState(world));
  expect(world.map.width).toBeGreaterThan(0);
  expect(world.obstacles).toHaveLength(3);
  expect(world.arena).toBeNull();
  expect(explorer?.id).toBe('explorador');
  expect(explorer?.rays).toHaveLength(9);
});

it('S3-US1-AC8: marca o robô desativado com estado e aparência distintos', () => {
  const { world, snapshot } = duel();
  const robots = snapshot.robots.map((robot) => ({
    ...robot,
    situacao: 'desativado' as const,
  }));
  const [first] = projectFrame(world, { ...snapshot, robots });
  expect(first?.disabled).toBe(true);
  expect(first?.color).not.toBe(world.robots[0]?.color);
});

it('S3-US1-AC9: rótulos têm opção e a saída decorre do resultado do núcleo', () => {
  const session = new ArenaSession(testEngine);
  const { world, snapshot } = session.getSnapshot();
  render(<App session={session} />);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Mostrar rótulos' }));
  expect(screen.getByRole('region', { name: 'Cena 3D' }).dataset.labels).toBe(
    'false',
  );
  expect(
    projectFrame(world, {
      ...snapshot,
      status: 'finalizada',
      resultado: { vencedor: 'vermelho', motivo: 'saida_da_arena', tick: 34 },
    }).map((robot) => robot.outside),
  ).toEqual([false, true]);
});

it('S3-US1-AC10: centralizar restaura a posição da vista escolhida', () => {
  const { world } = duel();
  const camera = new PerspectiveCamera();
  configureCamera(camera, world, 1.5, 'top');
  const initial = camera.position.clone();
  camera.position.set(1, 1, 1);
  configureCamera(camera, world, 1.5, 'top');
  expect(camera.position).toEqual(initial);
  const large = { ...world, arena: null, map: { width: 100, height: 100 } };
  configureCamera(camera, large, 0.8, '3d');
  for (const x of [-50, 50]) {
    for (const z of [-50, 50]) {
      const point = new Vector3(x, 0, z).project(camera);
      expect(Math.max(Math.abs(point.x), Math.abs(point.y))).toBeLessThan(1);
    }
  }
});

it('cria recursos da cena e atualiza os raios sem alterar o snapshot', () => {
  const { world, snapshot } = duel();
  const contents = buildScene(world);
  const frame = projectFrame(world, snapshot);
  contents.update(frame, true);
  const before = contents.scene.children.length;
  contents.update(frame, false);
  expect(contents.scene.children.length).toBe(before);
  expect(snapshot.tick).toBe(0);
  contents.dispose();
  const sala = loadWorld(worldPresets.sala.text);
  if (!sala.ok) throw new Error('Sala inválida');
  const stage = buildScene(sala.world);
  stage.update(projectFrame(sala.world, createInitialState(sala.world)), true);
  stage.dispose();
});
