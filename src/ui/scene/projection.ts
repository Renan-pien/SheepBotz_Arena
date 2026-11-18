import type { LaserConfig, SimState, World } from '../../core';

export type ScenePoint = [number, number, number];

export function rayAngle(laser: LaserConfig, index: number): number {
  return laser.rays === 1
    ? 0
    : -laser.fov / 2 + (index * laser.fov) / (laser.rays - 1);
}

export function projectFrame(world: World, state: SimState) {
  return state.robots.map((robot, index) => {
    const config = world.robots[index]!;
    const { x, y, theta } = robot.pose;
    const height = config.radius / 2;
    const center: ScenePoint = [x, height, -y];
    const front: ScenePoint = [Math.cos(theta), 0, -Math.sin(theta)];
    const disabled = robot.situacao === 'desativado';
    const rays = config.laser
      ? robot.laser.map((distance, ray) => {
          const laser = config.laser!;
          const angle = theta + rayAngle(laser, ray);
          return {
            start: center,
            end: [
              x + distance * Math.cos(angle),
              height,
              -(y + distance * Math.sin(angle)),
            ] as ScenePoint,
            hit: distance < laser.maxRange,
          };
        })
      : [];
    const outcome = state.resultado;
    const outside =
      outcome?.motivo === 'ambos_sairam' ||
      (outcome?.motivo === 'saida_da_arena' && outcome.vencedor !== robot.id);
    return {
      id: robot.id,
      center,
      front,
      theta,
      color: disabled ? '#8795a4' : config.color,
      disabled,
      outside,
      rays,
    };
  });
}

export type SceneFrame = ReturnType<typeof projectFrame>;
