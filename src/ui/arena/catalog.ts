/// <reference types="vite/client" />
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
    text: facil,
    defaults: { explorador: 'navegador' },
  },
  medio: {
    name: 'Labirinto 2 · Médio',
    text: medio,
    defaults: { explorador: 'navegador' },
  },
  dificil: {
    name: 'Labirinto 3 · Difícil',
    text: dificil,
    defaults: { explorador: 'navegador' },
  },
} as const;

export type ControllerPreset = keyof typeof controllerPresets;
export type WorldPreset = keyof typeof worldPresets;

export function nextMazeLevel(preset: WorldPreset | '') {
  if (preset === 'facil') return 'medio';
  if (preset === 'medio') return 'dificil';
  return undefined;
}
