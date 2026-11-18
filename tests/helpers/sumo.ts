import { duel } from './duel';
import { robot, worldText } from './world-builder';

export const avanca = 'function loop() { setSpeed(1, 0); }';
export const parado = 'function loop() {}';
export const cacador = `function loop() {
  const readings = readLaser();
  const center = readings[Math.floor(readings.length / 2)];
  if (readings.length > 0 && center < getInfo().laser.maxRange) setSpeed(1, 0);
  else setSpeed(0, 3);
}`;

export function duelWithMatch(mode: 'sumo' | 'free', maxTicks: number) {
  return JSON.stringify({ ...JSON.parse(duel), match: { mode, maxTicks } });
}

export const edgeWorld = worldText({
  arena: { radius: 0.5 },
  match: { mode: 'sumo', maxTicks: 2 },
  dt: 0.0625,
  robots: [
    robot({ id: 'vermelho', x: 0.4375 }),
    robot({ id: 'azul', x: -0.25 }),
  ],
});
