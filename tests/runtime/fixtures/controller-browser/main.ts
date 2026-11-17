import { loadWorld, prepareSimulation } from '../../../../src/core';
import { initializeControllerEngine } from '../../../../src/runtime/controller-engine';

const loaded = loadWorld(
  JSON.stringify({
    dt: 0.0625,
    seed: 1,
    map: { width: 4, height: 4 },
    robots: [
      {
        id: 'r1',
        x: 0,
        y: 0,
        radius: 0.1,
        laser: { rays: 1, fov: Math.PI / 3, maxRange: 3 },
      },
    ],
  }),
);
if (!loaded.ok) throw new Error(JSON.stringify(loaded.errors));
const world = loaded.world;
const controllerEngine = initializeControllerEngine();
const controllers = {
  r1: `
    if (typeof Promise !== 'undefined' || typeof Array.fromAsync !== 'undefined') {
      throw Error('O ambiente precisa respeitar o perfil síncrono.');
    }
    function loop() { log(random(), readLaser()[0]); setSpeed(1, 0); }
  `,
};
function start() {
  const result = prepareSimulation(world, {
    controllers,
    controllerEngine,
    history: true,
  });
  if (!result.ok) throw Error(JSON.stringify(result.errors));
  return result.simulation;
}
const batch = start();
const steps = start();
batch.stepN(4);
for (let tick = 0; tick < 4; tick++) {
  steps.step();
  await Promise.resolve();
}
const history = JSON.stringify(batch.getHistory());
if (history !== JSON.stringify(steps.getHistory()))
  throw Error('Históricos diferentes.');
const state = batch.getState();
if (
  state.robots[0]?.pose.x !== 0.25 ||
  state.robots[0]?.laser[0] !== 1.75 ||
  state.events[0]?.message !== `${1015568748 / 4294967296} 2`
) {
  throw Error('O estado publicado divergiu dos vetores.');
}
document.documentElement.dataset.status = 'ok';
document.documentElement.dataset.history = history;
