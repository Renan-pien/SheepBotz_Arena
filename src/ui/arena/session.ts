import {
  loadWorld,
  prepareSimulation,
  type ControllerEngine,
  type SimState,
  type Simulation,
  type World,
} from '../../core';
import { initializeControllerEngine } from '../../runtime/controller-engine';
import { controllerPresets, worldPresets } from './catalog';

export type Sources = Readonly<Record<string, string>>;
export type SessionStatus = 'pronta' | 'executando' | 'pausada' | 'finalizada';

export interface SessionView {
  readonly world: World;
  readonly worldText: string;
  readonly controllers: Sources;
  readonly snapshot: SimState;
  readonly status: SessionStatus;
}

export class ArenaSession {
  #simulation: Simulation;
  #view: SessionView;
  #listeners = new Set<() => void>();

  constructor(engine: ControllerEngine = initializeControllerEngine()) {
    const worldText = worldPresets.duelo.text;
    const world = loadWorld(worldText);
    if (!world.ok) throw new Error(JSON.stringify(world.errors));
    const controllers = {
      vermelho: controllerPresets.cacador.source,
      azul: controllerPresets.girador.source,
    };
    const prepared = prepareSimulation(world.world, {
      controllers,
      controllerEngine: engine,
    });
    if (!prepared.ok) throw new Error(JSON.stringify(prepared.errors));
    this.#simulation = prepared.simulation;
    this.#view = {
      world: world.world,
      worldText,
      controllers,
      snapshot: this.#simulation.getState(),
      status: 'pronta',
    };
  }

  getSnapshot = (): SessionView => this.#view;

  subscribe = (listener: () => void) => {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };
}
