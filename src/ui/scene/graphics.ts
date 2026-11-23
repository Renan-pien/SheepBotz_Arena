import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  RingGeometry,
  Scene,
  SphereGeometry,
} from 'three';
import { ARENA_EDGE_INNER_RATIO, type World } from '../../core';
import type { SceneFrame } from './projection';
import { buildScenery, releaseScenery, type Scenery } from './scenery';

const groundLevel = -0.012;
const gridStep = 0.1;

function buildMap(world: World, scene: Scene) {
  const { width, height } = world.map;
  const ground = new Mesh(
    new BoxGeometry(width, 0.015, height),
    new MeshLambertMaterial({ color: '#263950' }),
  );
  ground.position.y = groundLevel - 0.008;
  scene.add(ground);
  const lines: number[] = [];
  for (
    let index = -Math.floor(width / (2 * gridStep));
    index <= Math.floor(width / (2 * gridStep));
    index++
  ) {
    const x = index * gridStep;
    lines.push(x, groundLevel, -height / 2, x, groundLevel, height / 2);
  }
  for (
    let index = -Math.floor(height / (2 * gridStep));
    index <= Math.floor(height / (2 * gridStep));
    index++
  ) {
    const z = index * gridStep;
    lines.push(-width / 2, groundLevel, z, width / 2, groundLevel, z);
  }
  scene.add(
    new LineSegments(
      new BufferGeometry().setAttribute(
        'position',
        new Float32BufferAttribute(lines, 3),
      ),
      new LineBasicMaterial({ color: '#46617b' }),
    ),
  );
  const border = new MeshLambertMaterial({ color: '#8195aa' });
  for (const sign of [-1, 1]) {
    const xWall = new Mesh(new BoxGeometry(0.02, 0.045, height), border);
    xWall.position.set((sign * width) / 2, 0.0225, 0);
    const zWall = new Mesh(new BoxGeometry(width, 0.045, 0.02), border);
    zWall.position.set(0, 0.0225, (sign * height) / 2);
    scene.add(xWall, zWall);
  }
  if (world.arena) {
    const { radius } = world.arena;
    const disk = new Mesh(
      new CylinderGeometry(radius, radius, 0.008, 72),
      new MeshLambertMaterial({ color: '#101922' }),
    );
    disk.position.y = -0.005;
    const ring = new Mesh(
      new RingGeometry(radius * ARENA_EDGE_INNER_RATIO, radius * 1.025, 72),
      new MeshBasicMaterial({ color: '#f0f6fc' }),
    );
    ring.rotation.x = -Math.PI / 2;
    scene.add(disk, ring);
  }
  const exit = world.match.exit;
  if (exit) {
    const finish = new Group();
    finish.name = 'Saída';
    finish.position.set(exit.x, -0.002, -exit.y);
    const tiles = 4;
    const tile = new BoxGeometry(
      exit.width / tiles,
      0.004,
      exit.height / tiles,
    );
    const light = new MeshBasicMaterial({ color: '#ffffff' });
    const dark = new MeshBasicMaterial({ color: '#10243a' });
    for (let row = 0; row < tiles; row++) {
      for (let col = 0; col < tiles; col++) {
        const mesh = new Mesh(tile, (row + col) % 2 === 0 ? light : dark);
        mesh.position.set(
          ((col + 0.5) / tiles - 0.5) * exit.width,
          0,
          ((row + 0.5) / tiles - 0.5) * exit.height,
        );
        finish.add(mesh);
      }
    }
    scene.add(finish);
  }
  const crateMaterial = new MeshLambertMaterial({ color: '#bd9961' });
  for (const obstacle of world.obstacles) {
    const boxHeight = Math.min(obstacle.width, obstacle.height, 0.25);
    const box = new Mesh(
      new BoxGeometry(obstacle.width, boxHeight, obstacle.height),
      crateMaterial,
    );
    box.position.set(obstacle.x, boxHeight / 2, -obstacle.y);
    scene.add(box);
  }
  if (world.obstacles.length === 0) crateMaterial.dispose();
  return ground.material;
}

export function buildScene(world: World) {
  const scene = new Scene();
  const robotLayer = new Group();
  const rayLayer = new Group();
  const ground = buildMap(world, scene);
  let scenery: Group | undefined;
  const sun = new DirectionalLight('#f1f3ff', 2.2);
  sun.position.set(-2, 5, 4);
  scene.add(new AmbientLight('#d1e5ff', 1.7), sun, robotLayer, rayLayer);

  const free = new LineBasicMaterial({
    color: '#b5d9e3',
    transparent: true,
    opacity: 0.45,
  });
  const hit = new LineBasicMaterial({ color: '#ffc500' });
  const point = new MeshBasicMaterial({ color: '#ffc500' });
  const markers = new SphereGeometry(0.006, 8, 6);
  const robots = world.robots.map(({ radius, color, laser }) => {
    const body = new Mesh(
      new CylinderGeometry(radius, radius, radius, 24),
      new MeshLambertMaterial({ color }),
    );
    const nose = new Mesh(
      new BoxGeometry(radius * 0.8, 0.006, radius * 0.2),
      new MeshBasicMaterial({ color: '#f2f7fc' }),
    );
    nose.position.set(radius * 0.48, radius * 0.51, 0);
    const group = new Group();
    group.add(body, nose);
    robotLayer.add(group);
    const outline = new Mesh(
      new RingGeometry(radius * 1.08, radius * 1.23, 32),
      new MeshBasicMaterial({ color: '#ff8c84' }),
    );
    outline.rotation.x = -Math.PI / 2;
    robotLayer.add(outline);
    const rays = Array.from({ length: laser?.rays ?? 0 }, () => {
      const position = new Float32BufferAttribute(new Float32Array(6), 3);
      const line = new Line(
        new BufferGeometry().setAttribute('position', position),
        free,
      );
      line.frustumCulled = false;
      const end = new Mesh(markers, point);
      rayLayer.add(line, end);
      return { line, position, end };
    });
    return { group, body, outline, rays };
  });

  return {
    scene,
    setScenery(theme: Scenery) {
      if (scenery) releaseScenery(scenery);
      scenery = undefined;
      ground.color.set('#263950');
      scene.background = null;
      if (theme === 'classic' || world.match.mode !== 'sumo' || !world.arena)
        return;
      scenery = buildScenery(theme, world.arena.radius);
      ground.color.set(theme === 'dojo' ? '#78603c' : '#243446');
      scene.background = new Color(theme === 'dojo' ? '#253e35' : '#081329');
      scene.add(scenery);
    },
    update(frame: SceneFrame, raysVisible: boolean) {
      rayLayer.visible = raysVisible;
      for (const [i, robot] of frame.entries()) {
        const objects = robots[i]!;
        objects.group.position.set(...robot.center);
        objects.group.rotation.y = robot.theta;
        objects.body.material.color.set(robot.color);
        objects.outline.position.set(robot.center[0], 0.001, robot.center[2]);
        objects.outline.visible = robot.outside;
        for (const [j, ray] of robot.rays.entries()) {
          const item = objects.rays[j]!;
          item.position.setXYZ(0, ...ray.start);
          item.position.setXYZ(1, ...ray.end);
          item.position.needsUpdate = true;
          item.line.material = ray.hit ? hit : free;
          item.end.visible = ray.hit;
          item.end.position.set(...ray.end);
        }
      }
    },
    dispose() {
      if (scenery) releaseScenery(scenery);
      const resources = new Set<{ dispose(): void }>([
        free,
        hit,
        point,
        markers,
      ]);
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof Line) {
          resources.add(object.geometry);
          resources.add(object.material);
        }
      });
      for (const resource of resources) resource.dispose();
    },
  };
}
