import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { loadWorld, runHeadless } from '../../../../src/core';
import { initializeControllerEngine } from '../../../../src/runtime/controller-engine';

const levels = [
  ['facil', 7, 2, 2, 0],
  ['medio', 14, 4, 3, 0],
  ['dificil', 18, 6, 7, 1],
] as const;

function readLevel(name: string) {
  return readFileSync('examples/worlds/labirinto-' + name + '.json', 'utf8');
}

it.each(levels)(
  'S2-US5-AC4: topologia do nível %s',
  (name, length, branches, depth, cycles) => {
    const parsed = loadWorld(readLevel(name));
    if (!parsed.ok) throw Error(JSON.stringify(parsed.errors));
    const { map, obstacles, robots, match } = parsed.world;
    const pitch = 0.5;
    const cols = map.width / pitch;
    const rows = map.height / pitch;
    const cells = Array.from({ length: cols * rows }, (_, i) => ({
      x: ((i % cols) + 0.5) * pitch - map.width / 2,
      y: (Math.floor(i / cols) + 0.5) * pitch - map.height / 2,
    }));
    expect(robots[0]!.initialPose).toMatchObject(cells[0]!);
    expect(match.exit).toMatchObject(cells.at(-1)!);
    const graph = cells.map((a) =>
      cells.flatMap((b, j) => {
        if (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) !== pitch) return [];
        const blocked = obstacles.some(
          (wall) =>
            Math.abs((a.x + b.x) / 2 - wall.x) <= wall.width / 2 &&
            Math.abs((a.y + b.y) / 2 - wall.y) <= wall.height / 2,
        );
        return blocked ? [] : [j];
      }),
    );
    const queue = [0];
    const previous = new Map([[0, -1]]);
    for (const a of queue)
      for (const b of graph[a]!) {
        if (previous.has(b)) continue;
        queue.push(b);
        previous.set(b, a);
      }
    expect(queue).toHaveLength(cells.length);
    const route: number[] = [];
    for (let cell = cells.length - 1; cell >= 0; cell = previous.get(cell)!)
      route.push(cell);
    expect(route.length - 1).toBe(length);
    expect(route.filter((i) => graph[i]!.length >= 3)).toHaveLength(branches);
    expect(
      graph.reduce((count, neighbors) => count + neighbors.length, 0) / 2 -
        cells.length +
        1,
    ).toBe(cycles);
    const frontier = [...route];
    const distances = new Map(route.map((i) => [i, 0]));
    for (const a of frontier)
      for (const b of graph[a]!) {
        if (distances.has(b)) continue;
        distances.set(b, distances.get(a)! + 1);
        frontier.push(b);
      }
    expect(Math.max(...distances.values())).toBe(depth);
    if (name === 'medio')
      expect(
        graph.some(
          (neighbors, i) => !route.includes(i) && neighbors.length >= 3,
        ),
      ).toBe(true);
  },
);

it.each(levels)('S2-US5-AC5: Navegador completa %s pelos sensores', (name) => {
  const controller = readFileSync('examples/controllers/navegador.js', 'utf8');
  const result = runHeadless({
    world: readLevel(name),
    controllers: { explorador: controller },
    controllerEngine: initializeControllerEngine(),
    ticks: 6000,
  });
  if (!result.ok) throw Error(JSON.stringify(result.errors));
  expect(result.state.resultado).toEqual({
    motivo: 'saida_alcancada',
    vencedor: 'explorador',
    tick: result.state.tick,
  });
  expect(result.state.events.map((e) => e.type)).toEqual(['fim_do_nivel']);
});

it('S2-US5-AC5: a odometria pode cruzar a saída atrás de uma parede', () => {
  const result = runHeadless({
    world: JSON.stringify({
      map: { width: 2, height: 2 },
      match: {
        mode: 'maze',
        maxTicks: 1,
        exit: { x: 0.2, y: 0, width: 0.3, height: 0.3 },
      },
      obstacles: [{ id: 'parede', x: 0, y: 0, width: 0.06, height: 2 }],
      robots: [{ id: 'r', x: -0.2, y: 0 }],
    }),
    commands: { r: { v: 1, w: 0 } },
    ticks: 20,
  });
  if (!result.ok) throw Error(JSON.stringify(result.errors));
  expect(result.state.resultado).toBeNull();
  expect(result.state.robots[0]!.odometry.x).toBeCloseTo(0.2, 6);
  expect(result.state.robots[0]!.pose.x).toBeLessThan(0);
});
