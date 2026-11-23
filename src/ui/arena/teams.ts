import { robotModels, type RobotConfig, type World } from '../../core';

export type Team = 'red' | 'blue';
export const teams = {
  red: { name: 'Vermelha', color: '#E53935' },
  blue: { name: 'Azul', color: '#1E88E5' },
} as const;

export function teamFor(world: World, id: string): Team {
  const red =
    world.robots.find((robot) => robot.id === 'vermelho') ??
    world.robots.find((robot) => robot.id !== 'azul')!;
  return id === red.id ? 'red' : 'blue';
}
export function robotLabel(world: World, robot: RobotConfig) {
  if (!robot.model) return robot.id;
  const team =
    world.match.mode === 'sumo'
      ? teams[teamFor(world, robot.id)].name
      : robot.id;
  return team + ' · ' + robotModels[robot.model].name;
}
