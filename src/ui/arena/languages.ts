import sumo from '../../../examples/controllers/borda.por?raw';
import maze from '../../../examples/controllers/parede.por?raw';
import type { MatchMode, World } from '../../core';

export type Language = 'javascript' | 'portugol';
export type Languages = Readonly<Record<string, Language>>;

export function defaultLanguages(world: World): Languages {
  return Object.fromEntries(
    world.robots.map((robot) => [robot.id, 'javascript']),
  );
}
export function makerExample(mode: MatchMode) {
  return mode === 'sumo'
    ? { name: 'Guarda da borda', source: sumo }
    : { name: 'Desviar da parede', source: maze };
}
