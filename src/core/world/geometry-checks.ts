import { closestPointOnRect, containsPoint, distance } from '../math/geometry';
import type { Obstacle, ValidationError } from '../types';
import { errors } from './errors';
import type { PartialWorld } from './validate';

type Rectangle = Pick<Obstacle, 'x' | 'y' | 'width' | 'height'>;
type PositionedObstacle = Rectangle & Pick<Partial<Obstacle>, 'id'>;

function hasRectangle(
  obstacle: Partial<Obstacle> | undefined,
): obstacle is PositionedObstacle {
  return (
    obstacle?.x !== undefined &&
    obstacle.y !== undefined &&
    obstacle.width !== undefined &&
    obstacle.height !== undefined
  );
}

const origin = { x: 0, y: 0 };

export function checkWorldGeometry(
  world: PartialWorld,
  arenaSupplied: boolean,
  issues: ValidationError[],
): void {
  const width = world.map?.width;
  const height = world.map?.height;
  const maxX = width === undefined ? undefined : width / 2;
  const maxY = height === undefined ? undefined : height / 2;
  const arena = world.arena?.radius;
  const sumo = world.match?.mode === 'sumo';

  if (maxX !== undefined && maxY !== undefined && arena !== undefined) {
    const maximum = Math.min(maxX, maxY);
    if (arena > maximum) issues.push(errors.arenaOutsideMap(maximum));
  }
  if (sumo) {
    if (world.robots && world.robots.length !== 2)
      issues.push(errors.sumoCount(world.robots.length));
    if (!arenaSupplied) issues.push(errors.sumoArenaRequired());
  }

  const rectangles: PositionedObstacle[] = [];
  world.obstacles?.forEach((obstacle, index) => {
    if (!hasRectangle(obstacle)) return;
    rectangles.push(obstacle);
    if (
      maxX !== undefined &&
      maxY !== undefined &&
      (Math.abs(obstacle.x) + obstacle.width / 2 > maxX ||
        Math.abs(obstacle.y) + obstacle.height / 2 > maxY)
    ) {
      issues.push(errors.outsideMap(`obstacles[${index}]`, 'obstáculo'));
    }
  });

  const exit = world.match?.exit;
  const maze = world.match?.mode === 'maze';
  if (maze && world.robots && world.robots.length !== 1)
    issues.push(
      errors.matchRule('robots', 'O labirinto exige exatamente um robô.'),
    );
  if (maze && !exit) issues.push(errors.required('match.exit'));
  if (exit && !maze)
    issues.push(
      errors.matchRule('match.exit', 'A saída pertence ao modo labirinto.'),
    );
  if (hasRectangle(exit)) {
    if (
      maxX !== undefined &&
      maxY !== undefined &&
      (Math.abs(exit.x) + exit.width / 2 > maxX ||
        Math.abs(exit.y) + exit.height / 2 > maxY)
    )
      issues.push(
        errors.matchRule('match.exit', 'A saída deve caber no mapa.'),
      );
    if (
      rectangles.some(
        (wall) =>
          Math.abs(exit.x - wall.x) < (exit.width + wall.width) / 2 &&
          Math.abs(exit.y - wall.y) < (exit.height + wall.height) / 2,
      )
    )
      issues.push(
        errors.matchRule(
          'match.exit',
          'A saída deve estar livre de obstáculos.',
        ),
      );
  }

  const previous: { x: number; y: number; radius: number; id: string }[] = [];
  world.robots?.forEach((robot, index) => {
    if (!robot) return;
    const { x, y, radius, maxLinearSpeed, id } = robot;
    const path = `robots[${index}]`;
    if (
      radius !== undefined &&
      maxLinearSpeed !== undefined &&
      world.dt !== undefined
    ) {
      const displacement = maxLinearSpeed * world.dt;
      if (displacement > radius)
        issues.push(
          errors.excessiveStep(`${path}.maxLinearSpeed`, displacement, radius),
        );
    }
    if (x === undefined || y === undefined) return;
    const center = { x, y };
    if (hasRectangle(exit) && containsPoint(exit, center))
      issues.push(errors.matchRule(path, 'O robô deve começar fora da saída.'));
    if (sumo && arena !== undefined && distance(origin, center) > arena) {
      issues.push(errors.sumoOutsideArena(path));
    }
    if (radius === undefined) return;
    if (
      maxX !== undefined &&
      maxY !== undefined &&
      (Math.abs(x) > maxX - radius || Math.abs(y) > maxY - radius)
    ) {
      issues.push(errors.outsideMap(path, 'robô'));
    }
    for (const obstacle of rectangles) {
      if (
        obstacle.id !== undefined &&
        distance(center, closestPointOnRect(center, obstacle)) < radius
      ) {
        issues.push(errors.overlap(path, 'obstáculo', obstacle.id));
      }
    }
    for (const other of previous) {
      if (distance(center, other) < radius + other.radius)
        issues.push(errors.overlap(path, 'robô', other.id));
    }
    if (id !== undefined) previous.push({ x, y, radius, id });
  });
}
