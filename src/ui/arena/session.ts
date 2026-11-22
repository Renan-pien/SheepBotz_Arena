import {
  loadWorld,
  prepareSimulation,
  type ControllerEngine,
  type MatchResult,
  type StallSeconds,
  isStallSeconds,
  type SimState,
  type Simulation,
  type World,
} from '../../core';
import { initializeControllerEngine } from '../../runtime/controller-engine';
import {
  mazeLevelFromText,
  nextMazeLevel,
  type MazeLevel,
  controllerPresets,
  worldPresets,
  type ControllerPreset,
  type WorldPreset,
} from './catalog';
import { TickClock, type PlaybackSpeed } from './clock';
import { decodeRecording, lastRecordedTick, type Recording } from './recording';

export type Sources = Readonly<Record<string, string>>;
export type SessionStatus = 'pronta' | 'executando' | 'pausada' | 'finalizada';

export interface SessionError {
  readonly code: string;
  readonly path: string;
  readonly message: string;
}

export interface Draft {
  readonly source: string;
  readonly example: ControllerPreset;
}

type Drafts = Readonly<Record<string, Draft>>;

// Guarda passos recentes após o limite do arquivo, inclusive em mundos livres.
const recentTickCount = 512;

function initialDrafts(
  world: World,
  defaults: Readonly<Record<string, ControllerPreset>>,
): Drafts {
  return Object.fromEntries(
    world.robots.map(({ id }) => {
      const example = Object.hasOwn(defaults, id) ? defaults[id]! : 'parado';
      return [id, { example, source: controllerPresets[example].source }];
    }),
  );
}

function sourcesFrom(drafts: Drafts): Sources {
  return Object.fromEntries(
    Object.entries(drafts).map(([id, draft]) => [id, draft.source]),
  );
}

interface DrawRecord {
  readonly round: number;
  readonly result: MatchResult;
  readonly time: number;
  readonly recording: Recording;
}

export interface SessionView {
  readonly lastDraw: DrawRecord | null;
  readonly stallSeconds: StallSeconds;
  readonly roundStarted: boolean;
  readonly world: World;
  readonly worldText: string;
  readonly controllers: Sources;
  readonly snapshot: SimState;
  readonly status: SessionStatus;
  readonly speed: PlaybackSpeed;
  readonly behind: boolean;
  readonly limitReached: boolean;
  readonly mode: 'live' | 'replay';
  readonly replayLast: number | null;
  readonly preset: WorldPreset | '';
  readonly drafts: Drafts;
  readonly errors: readonly SessionError[];
}

export class ArenaSession {
  #simulation: Simulation;
  #engine: ControllerEngine;
  #revision = 0;
  #view: SessionView;
  #listeners = new Set<() => void>();
  #clock = new TickClock();
  #history: SimState[];
  #recent: SimState[] = [];
  #replay: Recording | null = null;
  #createdAt = new Date().toISOString();

  constructor(engine: ControllerEngine = initializeControllerEngine()) {
    this.#engine = engine;
    const worldText = worldPresets.duelo.text;
    const world = loadWorld(worldText);
    if (!world.ok) throw new Error(JSON.stringify(world.errors));
    const drafts = initialDrafts(world.world, worldPresets.duelo.defaults);
    const controllers = sourcesFrom(drafts);
    const prepared = prepareSimulation(world.world, {
      controllers,
      controllerEngine: engine,
      stallSeconds: 10,
    });
    if (!prepared.ok) throw new Error(JSON.stringify(prepared.errors));
    this.#simulation = prepared.simulation;
    this.#view = {
      stallSeconds: 10,
      roundStarted: false,
      lastDraw: null,
      world: world.world,
      worldText,
      controllers,
      snapshot: this.#simulation.getState(),
      status: 'pronta',
      speed: 1,
      behind: false,
      limitReached: false,
      mode: 'live',
      replayLast: null,
      preset: 'duelo',
      drafts,
      errors: [],
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

  revision = () => this.#revision;

  reportError(error: SessionError) {
    this.#publish({ errors: [error] });
  }

  openWorld(worldText: string, preset: WorldPreset | '' = '') {
    if (this.#replay) return;
    const loaded = loadWorld(worldText);
    if (!loaded.ok) {
      this.#publish({ errors: loaded.errors });
      return;
    }
    const defaults = preset ? worldPresets[preset].defaults : {};
    const drafts = initialDrafts(loaded.world, defaults);
    this.#replace(
      loaded.world,
      worldText,
      sourcesFrom(drafts),
      drafts,
      preset,
      preset && loaded.world.match.mode === 'maze' ? { status: 'pausada' } : {},
    );
  }

  chooseWorld(preset: WorldPreset) {
    this.openWorld(worldPresets[preset].text, preset);
  }

  nextLevel() {
    const { preset, snapshot } = this.#view;
    const next = nextMazeLevel(preset);
    if (next && snapshot.resultado?.motivo === 'saida_alcancada')
      this.chooseDifficulty(next);
  }

  chooseDifficulty(level: MazeLevel) {
    const { world, preset, controllers, drafts } = this.#view;
    if (this.#replay || world.match.mode !== 'maze' || preset === level) return;
    const text = worldPresets[level].text;
    const parsed = loadWorld(text);
    if (!parsed.ok) {
      this.#publish({ errors: parsed.errors });
      return;
    }
    const sourceId = world.robots[0]!.id;
    const targetId = parsed.world.robots[0]!.id;
    this.#replace(
      parsed.world,
      text,
      { [targetId]: controllers[sourceId]! },
      { [targetId]: drafts[sourceId]! },
      level,
      { status: 'pausada' },
    );
  }

  editSource(id: string, source: string) {
    if (this.#replay) return;
    const draft = this.#view.drafts[id]!;
    this.#publish({
      drafts: { ...this.#view.drafts, [id]: { ...draft, source } },
    });
  }

  selectExample(id: string, example: ControllerPreset) {
    if (this.#replay) return;
    const source = controllerPresets[example].source;
    this.#publish({
      drafts: { ...this.#view.drafts, [id]: { example, source } },
    });
  }

  restoreExample(id: string) {
    this.selectExample(id, this.#view.drafts[id]!.example);
  }

  apply(id: string) {
    if (this.#replay) return;
    const { world, worldText, controllers, drafts, preset } = this.#view;
    this.#replace(
      world,
      worldText,
      { ...controllers, [id]: drafts[id]!.source },
      drafts,
      preset,
    );
  }

  #replace(
    world: World,
    worldText: string,
    controllers: Sources,
    drafts: Drafts,
    preset: WorldPreset | '',
    patch: Partial<SessionView> = {},
  ) {
    const prepared = prepareSimulation(world, {
      controllers,
      controllerEngine: this.#engine,
      stallSeconds: patch.stallSeconds ?? this.#view.stallSeconds,
    });
    if (!prepared.ok) {
      this.#publish({ errors: prepared.errors });
      return;
    }
    this.#simulation = prepared.simulation;
    this.#startNewRun(this.#simulation.getState(), {
      world,
      worldText,
      controllers,
      drafts,
      preset,
      ...patch,
    });
  }

  #startNewRun(snapshot: SimState, patch: Partial<SessionView> = {}) {
    this.#revision += 1;
    this.#clock.clear();
    this.#history = [snapshot];
    this.#recent = [];
    this.#replay = null;
    this.#createdAt = new Date().toISOString();
    this.#publish({
      mode: 'live',
      roundStarted: false,
      lastDraw: null,
      replayLast: null,
      status: 'pronta',
      snapshot,
      behind: false,
      limitReached: false,
      errors: [],
      ...patch,
    });
  }

  recording(): Recording {
    return this.#replay ?? this.#liveRecording(this.#view.snapshot.tick);
  }

  #liveRecording(tick: number): Recording {
    return {
      version:
        this.#view.world.match.mode === 'maze'
          ? 4
          : this.#view.world.match.mode === 'sumo'
            ? 3
            : 1,
      ...(this.#view.world.match.mode === 'sumo' && {
        stallSeconds: this.#view.stallSeconds,
      }),
      world: this.#view.worldText,
      controllers: this.#view.controllers,
      createdAt: this.#createdAt,
      states: this.#history.slice(0, tick + 1),
    };
  }

  history(): readonly SimState[] {
    if (this.#replay) return this.#replay.states.slice();
    return this.#history.slice(0, this.#view.snapshot.tick + 1);
  }

  enterReplay() {
    this.#showReplay(this.#view.world, this.recording());
  }

  replayLastDraw() {
    const draw = this.#view.lastDraw;
    if (draw && !this.#replay)
      this.#showReplay(this.#view.world, draw.recording);
  }

  openRecording(text: string) {
    const result = decodeRecording(text);
    if (!result.ok) {
      this.reportError(result.error);
      return;
    }
    this.#showReplay(result.world, result.recording);
  }

  #showReplay(world: World, recording: Recording) {
    this.#replay = recording;
    this.#history = [];
    this.#recent = [];
    this.#revision += 1;
    this.#clock.clear();
    const drafts = Object.fromEntries(
      Object.entries(recording.controllers).map(([id, source]) => {
        const names = Object.keys(controllerPresets) as ControllerPreset[];
        const example =
          names.find((key) => controllerPresets[key].source === source) ??
          'parado';
        return [id, { example, source }];
      }),
    );
    this.#publish({
      mode: 'replay',
      lastDraw: null,
      stallSeconds: recording.stallSeconds ?? this.#view.stallSeconds,
      world,
      worldText: recording.world,
      controllers: recording.controllers,
      drafts,
      preset: '',
      snapshot: recording.states[0]!,
      replayLast: recording.states.length - 1,
      status: 'pausada',
      behind: false,
      limitReached: false,
      errors: [],
    });
  }

  exitReplay() {
    if (!this.#replay) return;
    const { world, worldText, controllers, drafts } = this.#view;
    const preset = mazeLevelFromText(worldText);
    this.#replace(world, worldText, controllers, drafts, preset ?? '');
  }

  seek(tick: number) {
    if (!this.#replay || !Number.isFinite(tick)) return;
    const index = Math.max(
      0,
      Math.min(this.#replay.states.length - 1, Math.trunc(tick)),
    );
    this.#clock.clear();
    this.#publish({
      snapshot: this.#replay.states[index]!,
      status: 'pausada',
      behind: false,
    });
  }

  back() {
    const { status, snapshot } = this.#view;
    if (status === 'executando' || snapshot.tick === 0) return;
    const target = snapshot.tick - 1;
    if (this.#replay) {
      this.seek(target);
      return;
    }
    this.#clock.clear();
    this.#publish({
      snapshot: this.#liveStateAt(target),
      status: 'pausada',
      behind: false,
      limitReached: target >= lastRecordedTick,
    });
  }

  #publish(patch: Partial<SessionView>) {
    this.#view = { ...this.#view, ...patch };
    this.#listeners.forEach((listener) => listener());
  }

  play() {
    if (
      this.#view.snapshot.status === 'finalizada' ||
      this.#view.status === 'finalizada' ||
      this.#view.status === 'executando' ||
      this.#view.replayLast === this.#view.snapshot.tick
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

  setStallSeconds(seconds: number) {
    const view = this.#view;
    if (
      !isStallSeconds(seconds) ||
      this.#replay ||
      view.world.match.mode !== 'sumo' ||
      view.roundStarted ||
      view.status === 'executando' ||
      seconds === view.stallSeconds
    )
      return;
    this.#replace(
      view.world,
      view.worldText,
      view.controllers,
      view.drafts,
      view.preset,
      { stallSeconds: seconds, lastDraw: view.lastDraw, status: view.status },
    );
  }

  setSpeed(speed: PlaybackSpeed) {
    this.#publish({ speed });
  }

  step() {
    if (
      this.#view.status === 'executando' ||
      this.#view.snapshot.status === 'finalizada' ||
      this.#view.status === 'finalizada' ||
      this.#view.replayLast === this.#view.snapshot.tick
    )
      return;
    this.#advance(1, 'pausada', false);
  }

  reset() {
    if (this.#replay) {
      this.seek(0);
      return;
    }
    const snapshot = this.#simulation.reset();
    this.#startNewRun(snapshot);
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
    if (this.#replay) {
      const last = this.#view.replayLast!;
      const index = Math.min(last, this.#view.snapshot.tick + ticks);
      this.#publish({
        snapshot: this.#replay.states[index]!,
        status: index === last ? 'finalizada' : status,
        behind: index !== last && behind,
      });
      return;
    }
    let snapshot = this.#view.snapshot;
    for (
      let index = 0;
      index < ticks && snapshot.status !== 'finalizada';
      index += 1
    ) {
      snapshot = this.#liveStateAt(snapshot.tick + 1);
    }
    if (snapshot.resultado?.motivo === 'falta_de_progresso') {
      const draw: DrawRecord = {
        round: (this.#view.lastDraw?.round ?? 0) + 1,
        result: snapshot.resultado,
        time: snapshot.time,
        recording: this.#liveRecording(snapshot.tick),
      };
      this.#startNewRun(this.#simulation.reset(), {
        status: 'pausada',
        lastDraw: draw,
      });
      return;
    }
    this.#publish({
      roundStarted: this.#view.roundStarted || snapshot.tick > 0,
      snapshot,
      status:
        snapshot.resultado?.motivo === 'saida_alcancada'
          ? 'pausada'
          : snapshot.status === 'finalizada'
            ? 'finalizada'
            : status,
      behind: snapshot.status !== 'finalizada' && behind,
      limitReached: snapshot.tick >= lastRecordedTick,
    });
  }

  #liveStateAt(tick: number): SimState {
    const cached = this.#history[tick] ?? this.#recent[tick % recentTickCount];
    if (cached?.tick === tick) return cached;

    // O cursor pode estar atrás das closures e do PRNG preservados no motor.
    // Só recalculamos o passado se o tick já saiu da janela e da gravação.
    let state = this.#simulation.getState();
    if (tick < state.tick) state = this.#simulation.reset();
    const skip = tick - recentTickCount - state.tick;
    if (skip > 0) state = this.#simulation.stepN(skip);
    while (state.tick < tick && state.status !== 'finalizada') {
      state = this.#simulation.step();
      if (state.tick <= lastRecordedTick) this.#history[state.tick] = state;
      else this.#recent[state.tick % recentTickCount] = state;
    }
    return state;
  }
}
