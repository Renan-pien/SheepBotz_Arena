/// <reference types="vite/client" />
import duelo from '../../../examples/worlds/duelo-padrao.json?raw';
import sala from '../../../examples/worlds/sala-com-obstaculos.json?raw';
import parado from '../../../examples/controllers/parado.js?raw';
import avanca from '../../../examples/controllers/avanca.js?raw';
import girador from '../../../examples/controllers/girador.js?raw';
import cacador from '../../../examples/controllers/cacador.js?raw';
import desviador from '../../../examples/controllers/desviador.js?raw';

export const controllerPresets = {
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
  sala: {
    name: 'Sala com obstáculos',
    text: sala,
    defaults: { explorador: 'desviador' },
  },
} as const;

export type ControllerPreset = keyof typeof controllerPresets;
export type WorldPreset = keyof typeof worldPresets;
