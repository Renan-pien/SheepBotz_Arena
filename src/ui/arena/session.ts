import {
  loadWorld,
  robotModels,
  type RobotModel,
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
import { teamFor, teams } from './teams';
import {
  mazeLevelFromText,
  nextMazeLevel,
  type MazeLevel,
  controllerPresets,
  worldPresets,
  type ControllerPreset,
  type WorldPreset,
} from './catalog';
import {
  defaultLanguages,
  makerExample,
  type Language,
  type Languages,
} from './languages';
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
  readonly language: Language;
  readonly alternate?: Pick<Draft, 'source' | 'example'>;
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
      return [
        id,
        {
          language: 'javascript',
          example,
          source: controllerPresets[example].source,
        },
      ];
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
  readonly languages: Languages;
  readonly loading: string | null;
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

  #maker?: ControllerEngine;
  #request = 0;
  constructor(
    engine: ControllerEngine = initializeControllerEngine(),
    private readonly getMaker = async (): Promise<ControllerEngine> =>
      (await import('../../runtime/portugol/runtime')).loadMaker(),
  ) {
    this.#engine = engine;
    const worldText = worldPresets.duelo.text;
    const world = loadWorld(worldText);
    if (!world.ok) throw new Error(JSON.stringify(world.errors));
    const drafts = initialDrafts(world.world, worldPresets.duelo.defaults);
    const controllers = sourcesFrom(drafts);
    const prepared = prepareSimulation(world.world, {
      controllers,
      controllerEngine: engine,
      sumoStartDelay: true,
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
      languages: defaultLanguages(world.world),
      loading: null,
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
      {
        languages: defaultLanguages(loaded.world),
        ...(preset && loaded.world.match.mode === 'maze'
          ? { status: 'pausada' as const }
          : {}),
      },
    );
  }

  chooseWorld(preset: WorldPreset) {
    this.openWorld(worldPresets[preset].text, preset);
  }

  selectModels(red: RobotModel, blue: RobotModel): boolean {
    const { world, worldText, controllers, drafts, preset } = this.#view;
    if (this.#replay || world.match.mode !== 'sumo') return false;
    if (red === blue) {
      this.reportError({
        code: 'REGRA_DA_MODALIDADE',
        path: 'robots',
        message: 'Cada equipe precisa escolher um modelo diferente.',
      });
      return false;
    }
    const document = JSON.parse(worldText) as {
      robots: {
        id: string;
        model?: RobotModel;
        radius?: number;
        color?: string;
      }[];
    };
    for (const robot of document.robots) {
      const team = teamFor(world, robot.id);
      robot.model = team === 'red' ? red : blue;
      robot.radius = robotModels[robot.model].radius;
      robot.color = teams[team].color;
    }
    const text = JSON.stringify(document);
    const parsed = loadWorld(text);
    if (!parsed.ok) {
      this.#publish({ errors: parsed.errors });
      return false;
    }
    this.#replace(parsed.world, text, controllers, drafts, preset, {
      status: 'pausada',
    });
    return this.#view.world === parsed.world;
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
      {
        status: 'pausada',
        languages: { [targetId]: this.#view.languages[sourceId]! },
      },
    );
  }

  editSource(id: string, source: string) {
    if (this.#replay) return;
    const draft = this.#view.drafts[id]!;
    this.#publish({
      drafts: { ...this.#view.drafts, [id]: { ...draft, source } },
    });
  }

  chooseLanguage(id: string, language: Language) {
    const { drafts, world } = this.#view;
    const draft = drafts[id]!;
    if (this.#replay || draft.language === language) return;
    const next = draft.alternate ?? {
      example: 'parado',
      source:
        language === 'portugol'
          ? makerExample(world.match.mode).source
          : controllerPresets.parado.source,
    };
    this.#publish({
      drafts: {
        ...drafts,
        [id]: {
          ...next,
          language,
          alternate: { example: draft.example, source: draft.source },
        },
      },
    });
  }

  selectExample(id: string, example: ControllerPreset) {
    if (this.#replay) return;
    const draft = this.#view.drafts[id]!;
    const source =
      draft.language === 'portugol'
        ? makerExample(this.#view.world.match.mode).source
        : controllerPresets[example].source;
    this.#publish({
      drafts: { ...this.#view.drafts, [id]: { ...draft, example, source } },
    });
  }

  restoreExample(id: string) {
    this.selectExample(id, this.#view.drafts[id]!.example);
  }

  apply(id: string) {
    if (this.#replay) return;
    const draft = this.#view.drafts[id]!;
    const commit = () => {
      const { world, worldText, controllers, drafts, preset, languages } =
        this.#view;
      this.#replace(
        world,
        worldText,
        { ...controllers, [id]: draft.source },
        drafts,
        preset,
        {
          languages: { ...languages, [id]: draft.language },
          ...(draft.language === 'portugol' && { status: 'pausada' as const }),
        },
      );
    };
    if (draft.language === 'portugol' && !this.#maker)
      return this.#prepareMaker(
        id,
        () => this.#view.drafts[id] === draft,
        commit,
      );
    commit();
  }

  async #prepareMaker(id: string, valid: () => boolean, apply: () => void) {
    const request = ++this.#request,
      revision = this.#revision;
    const current = () =>
      request === this.#request && revision === this.#revision;
    this.#publish({ loading: id });
    try {
      this.#maker = await this.getMaker();
      if (current() && valid()) apply();
    } catch (error) {
      if (current() && valid())
        this.reportError({
          code: 'CONTROLADOR_INVALIDO',
          path: 'controllers.' + id,
          message: error instanceof Error ? error.message : String(error),
        });
    } finally {
      if (current()) this.#publish({ loading: null });
    }
  }

  #replace(
    world: World,
    worldText: string,
    controllers: Sources,
    drafts: Drafts,
    preset: WorldPreset | '',
    patch: Partial<SessionView> = {},
  ) {
    const languages = patch.languages ?? this.#view.languages;
    // O identificador encaminha a carga ao motor do respectivo robô, mesmo com fontes iguais.
    const prepared = prepareSimulation(world, {
      controllers: Object.fromEntries(world.robots.map(({ id }) => [id, id])),
      controllerEngine: {
        load: (id, api) =>
          (languages[id] === 'portugol' ? this.#maker! : this.#engine).load(
            controllers[id]!,
            api,
          ),
      },
      sumoStartDelay: true,
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
      loading: null,
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
    const multilingual = Object.values(this.#view.languages).includes(
      'portugol',
    );
    return {
      ...(multilingual && { languages: this.#view.languages }),
      version: multilingual
        ? 7
        : this.#view.world.match.mode === 'maze'
          ? 4
          : this.#view.world.match.mode === 'sumo'
            ? 6
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
        return [
          id,
          {
            example,
            source,
            language: recording.languages?.[id] ?? ('javascript' as const),
          },
        ];
      }),
    );
    this.#publish({
      mode: 'replay',
      lastDraw: null,
      stallSeconds: recording.stallSeconds ?? this.#view.stallSeconds,
      world,
      worldText: recording.world,
      controllers: recording.controllers,
      languages: recording.languages ?? defaultLanguages(world),
      loading: null,
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
    const resume = () =>
      this.#replace(world, worldText, controllers, drafts, preset ?? '');
    if (
      !this.#maker &&
      Object.values(this.#view.languages).includes('portugol')
    )
      return this.#prepareMaker('replay', () => this.#replay !== null, resume);
    resume();
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
        snapshot.resultado?.motivo === 'saida_alcancada' ||
        (snapshot.falseStarters && snapshot.status === 'finalizada')
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
