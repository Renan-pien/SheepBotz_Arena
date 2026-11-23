import { createControllerRandom } from '../core/controller/random';

export type MazeLevel = 'facil' | 'medio' | 'dificil';

const pitch = 0.5;
const wallThickness = 0.0625;
const rules = {
  facil: { steps: 7, junctions: 2, depth: 2 },
  medio: { steps: 14, junctions: 4, depth: 3 },
  dificil: { steps: 18, junctions: 6, depth: 7 },
} as const;

interface Point {
  x: number;
  y: number;
}
interface Rectangle extends Point {
  width: number;
  height: number;
}
interface Blueprint {
  map: { width: number; height: number };
  obstacles: Rectangle[];
  match: { exit: Rectangle };
  robots: Point[];
}
interface Edge {
  from: number;
  to: number;
  wall: Rectangle;
  open: boolean;
}

function measure(graph: number[][], sources: number[]) {
  const queue = [...sources];
  const distance = new Int16Array(graph.length).fill(-1);
  const previous = new Int16Array(graph.length).fill(-1);
  for (const cell of sources) distance[cell] = 0;
  for (const cell of queue) {
    for (const next of graph[cell]!) {
      if (distance[next] !== -1) continue;
      previous[next] = cell;
      distance[next] = distance[cell]! + 1;
      queue.push(next);
    }
  }
  return { distance, previous, count: queue.length };
}

// No nível com ciclo, validar a mesma prioridade de direções do Navegador.
function reachesExit(graph: number[][], columns: number) {
  const offsets = [1, columns, -1, -columns];
  let cell = 0;
  let heading = 0;
  for (let i = 0; i < 4 * graph.length; i++) {
    if (cell === graph.length - 1) return true;
    for (const turn of [3, 0, 1, 2]) {
      const nextHeading = (heading + turn) % 4;
      const next = cell + offsets[nextHeading]!;
      if (!graph[cell]!.includes(next)) continue;
      heading = nextHeading;
      cell = next;
      break;
    }
  }
  return false;
}

function matchesLevel(
  edges: Edge[],
  size: number,
  columns: number,
  level: MazeLevel,
) {
  const graph = Array.from({ length: size }, (): number[] => []);
  for (const { from, to, open } of edges) {
    if (open) {
      graph[from]!.push(to);
      graph[to]!.push(from);
    }
  }
  const target = rules[level];
  const search = measure(graph, [0]);
  if (search.count !== size || search.distance[size - 1] !== target.steps)
    return false;
  const route: number[] = [];
  for (let cell = size - 1; cell >= 0; cell = search.previous[cell]!)
    route.push(cell);
  if (
    route.filter((cell) => graph[cell]!.length >= 3).length !== target.junctions
  )
    return false;
  const { distance } = measure(graph, route);
  if (Math.max(...distance) !== target.depth) return false;
  if (
    level === 'medio' &&
    !graph.some((neighbors, i) => distance[i]! > 0 && neighbors.length >= 3)
  )
    return false;
  return level !== 'dificil' || reachesExit(graph, columns);
}

/** Gera um mundo completo a partir do exemplo canônico da dificuldade, fora do tick. */
export function generateMaze(
  level: MazeLevel,
  seed: number,
  reference: string,
): string {
  const world: Blueprint = JSON.parse(reference);
  const transpose = (seed & 1) === 1;
  if (transpose) {
    [world.map.width, world.map.height] = [world.map.height, world.map.width];
    for (const rect of [...world.obstacles, world.match.exit]) {
      [rect.x, rect.y] = [rect.y, rect.x];
      [rect.width, rect.height] = [rect.height, rect.width];
    }
    for (const robot of world.robots) [robot.x, robot.y] = [robot.y, robot.x];
  }
  const { width, height } = world.map;
  const columns = width / pitch;
  const rows = height / pitch;
  const size = columns * rows;
  const edges: Edge[] = [];
  function edge(from: number, to: number, wall: Rectangle) {
    const open = !world.obstacles.some(
      ({ x, y }) => x === wall.x && y === wall.y,
    );
    edges.push({ from, to, wall, open });
  }
  for (let cell = 0; cell < size; cell++) {
    const col = cell % columns;
    const row = Math.floor(cell / columns);
    const x = (col + 0.5) * pitch - width / 2;
    const y = (row + 0.5) * pitch - height / 2;
    if (col + 1 < columns)
      edge(cell, cell + 1, {
        x: x + pitch / 2,
        y,
        width: wallThickness,
        height: pitch,
      });
    if (row + 1 < rows)
      edge(cell, cell + columns, {
        x,
        y: y + pitch / 2,
        width: pitch,
        height: wallThickness,
      });
  }

  const walls = edges.filter((e) => !e.open);
  const passages = edges.filter((e) => e.open);
  const random = createControllerRandom(seed, 0);
  // Uma troca conserva o número de ciclos quando o grafo resultante é conexo.
  const attempts = 320;
  for (let i = 0; i < attempts; i++) {
    const w = Math.floor(random() * walls.length);
    const p = Math.floor(random() * passages.length);
    const wall = walls[w]!;
    const passage = passages[p]!;
    wall.open = true;
    passage.open = false;
    if (matchesLevel(edges, size, columns, level)) {
      walls[w] = passage;
      passages[p] = wall;
    } else {
      wall.open = false;
      passage.open = true;
    }
  }
  const obstacles = edges
    .filter((e) => !e.open)
    .map(({ wall }, i) => ({ id: 'parede-' + (i + 1), ...wall }));
  return JSON.stringify({ ...world, seed, obstacles });
}
