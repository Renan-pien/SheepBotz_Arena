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
import { TickClock, type PlaybackSpeed } from './clock';

export type Sources = Readonly<Record<string, string>>;
export type SessionStatus = 'pronta' | 'executando' | 'pausada' | 'finalizada';

export interface SessionView {
  readonly world: World;
  readonly worldText: string;
  readonly controllers: Sources;
  readonly snapshot: SimState;
  readonly status: SessionStatus;
  readonly speed: PlaybackSpeed;
  readonly behind: boolean;
}

export class ArenaSession {
  #simulation: Simulation;
  #view: SessionView;
  #listeners = new Set<() => void>();
  #clock = new TickClock();
  #history: SimState[];

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
      speed: 1,
      behind: false,
    };
    this.#history = [this.#view.snapshot];
  }

  getSnapshot = (): SessionView => this.#view;

  subscribe = (listener: () => void) => {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };

  history(): readonly SimState[] {
    return this.#history.slice();
  }

  #publish(patch: Partial<SessionView>) {
    this.#view = { ...this.#view, ...patch };
    this.#listeners.forEach((listener) => listener());
  }

  play() {
    if (
      this.#view.status === 'finalizada' ||
      this.#view.status === 'executando'
    )
      return;
    this.#clock.clear();
    this.#publish({ status: 'executando', behind: false });
  }

  pause() {
    if (this.#view.status !== 'executando') return;
    this.#clock.clear();
    this.#publish({ status: 'pausada', behind: false });
  }

  setSpeed(speed: PlaybackSpeed) {
    this.#publish({ speed });
  }

  step() {
    if (
      this.#view.status === 'executando' ||
      this.#view.status === 'finalizada'
    )
      return;
    this.#advance(1, 'pausada', false);
  }

  reset() {
    const snapshot = this.#simulation.reset();
    this.#clock.clear();
    this.#history = [snapshot];
    this.#publish({ status: 'pronta', snapshot, behind: false });
  }

  pulse(elapsedMs: number) {
    if (this.#view.status !== 'executando') return;
    const { ticks, behind } = this.#clock.consume(
      elapsedMs,
      this.#view.world.dt,
      this.#view.speed,
    );
    if (ticks || behind !== this.#view.behind)
      this.#advance(ticks, 'executando', behind);
  }

  #advance(ticks: number, status: SessionStatus, behind: boolean) {
    let snapshot = this.#view.snapshot;
    for (
      let index = 0;
      index < ticks && snapshot.status !== 'finalizada';
      index += 1
    ) {
      snapshot = this.#simulation.step();
      this.#history.push(snapshot);
    }
    this.#publish({
      snapshot,
      status: snapshot.status === 'finalizada' ? 'finalizada' : status,
      behind: snapshot.status !== 'finalizada' && behind,
    });
  }
}
