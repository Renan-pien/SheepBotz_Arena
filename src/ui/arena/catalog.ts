/// <reference types="vite/client" />
import { loadWorld, type World } from '../../core';
import { generateMaze, type MazeLevel } from '../../worlds/maze';
export type { MazeLevel } from '../../worlds/maze';
import duelo from '../../../examples/worlds/duelo-padrao.json?raw';
import facil from '../../../examples/worlds/labirinto-facil.json?raw';
import medio from '../../../examples/worlds/labirinto-medio.json?raw';
import dificil from '../../../examples/worlds/labirinto-dificil.json?raw';
import navegador from '../../../examples/controllers/navegador.js?raw';
import parado from '../../../examples/controllers/parado.js?raw';
import avanca from '../../../examples/controllers/avanca.js?raw';
import girador from '../../../examples/controllers/girador.js?raw';
import cacador from '../../../examples/controllers/cacador.js?raw';
import desviador from '../../../examples/controllers/desviador.js?raw';

export const controllerPresets = {
  navegador: { name: 'Navegador', source: navegador },
  parado: { name: 'Parado', source: parado },
  avanca: { name: 'Avança', source: avanca },
  girador: { name: 'Girador', source: girador },
  cacador: { name: 'Caçador', source: cacador },
  desviador: { name: 'Desviador', source: desviador },
};

export const worldPresets = {
  duelo: {
    name: 'Duelo padrão',
    text: duelo,
    defaults: { vermelho: 'cacador', azul: 'girador' },
  },
  facil: {
    name: 'Labirinto 1 · Fácil',
    difficulty: 'Fácil',
    text: facil,
    defaults: { explorador: 'navegador' },
  },
  medio: {
    name: 'Labirinto 2 · Médio',
    difficulty: 'Médio',
    text: medio,
    defaults: { explorador: 'navegador' },
  },
  dificil: {
    name: 'Labirinto 3 · Difícil',
    difficulty: 'Difícil',
    text: dificil,
    defaults: { explorador: 'navegador' },
  },
} as const;

export type ControllerPreset = keyof typeof controllerPresets;
export type WorldPreset = keyof typeof worldPresets;

export const mazeLevels = ['facil', 'medio', 'dificil'] as const;
export function drawMaze(level: MazeLevel, seed: number) {
  return generateMaze(level, seed, worldPresets[level].text);
}

export function mazeLevelForWorld(world: World) {
  const level = mazeLevels.find((id) => worldPresets[id].name === world.name);
  if (!level || world.match.mode !== 'maze') return undefined;
  const normalized = JSON.stringify(world);
  function matches(text: string) {
    const loaded = loadWorld(text);
    return loaded.ok && JSON.stringify(loaded.world) === normalized;
  }
  return matches(worldPresets[level].text) ||
    matches(drawMaze(level, world.seed))
    ? level
    : undefined;
}

export function nextMazeLevel(preset: WorldPreset | '') {
  if (preset === 'facil') return 'medio';
  if (preset === 'medio') return 'dificil';
  return undefined;
}
