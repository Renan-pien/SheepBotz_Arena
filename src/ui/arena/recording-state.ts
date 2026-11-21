import { advanceStall, initialStall, evaluateSumo } from '../../core';
import type {
  StallSeconds,
  MatchResult,
  RobotConfig,
  RobotState,
  SimEvent,
  SimState,
  World,
} from '../../core';

export class RecordingIssue extends Error {
  constructor(
    readonly path: string,
    explanation: string,
  ) {
    super(explanation);
  }
}

export function requireField(
  condition: unknown,
  path: string,
  explanation: string,
): asserts condition {
  if (!condition) throw new RecordingIssue(path, explanation);
}

export function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function pose(value: unknown): boolean {
  return (
    object(value) &&
    finite(value.x) &&
    finite(value.y) &&
    finite(value.theta) &&
    value.theta > -Math.PI &&
    value.theta <= Math.PI
  );
}

function robotMatches(value: unknown, model: RobotConfig): value is RobotState {
  if (
    !object(value) ||
    value.id !== model.id ||
    !pose(value.pose) ||
    !pose(value.odometry)
  )
    return false;
  const { command, laser, bumper, situacao } = value;
  if (
    !object(command) ||
    !finite(command.v) ||
    !finite(command.w) ||
    Math.abs(command.v) > model.maxLinearSpeed ||
    Math.abs(command.w) > model.maxAngularSpeed ||
    typeof bumper !== 'boolean' ||
    (situacao !== 'ativo' && situacao !== 'desativado')
  )
    return false;
  const config = model.laser;
  return (
    Array.isArray(laser) &&
    laser.length === (config?.rays ?? 0) &&
    laser.every(
      (reading: unknown) =>
        finite(reading) && reading >= 0 && reading <= config!.maxRange,
    )
  );
}

export function readEvents(
  value: unknown,
  world: World,
  lastTick: number,
): SimEvent[] {
  requireField(Array.isArray(value), 'events', 'esperada uma lista de eventos');
  const ids = new Set(world.robots.map(({ id }) => id));
  let previous = 0;
  return value.map((event: unknown, index): SimEvent => {
    const path = 'events[' + index + ']';
    requireField(object(event), path, 'esperado um objeto');
    const { type, tick, robotId, message } = event;
    requireField(
      finite(tick) &&
        Number.isInteger(tick) &&
        tick >= Math.max(1, previous) &&
        tick <= lastTick,
      path + '.tick',
      'tick de evento fora de ordem ou fora da gravação',
    );
    previous = tick;
    requireField(
      typeof message === 'string',
      path + '.message',
      'esperado um texto',
    );
    if (type === 'fim_da_luta') {
      requireField(
        robotId === null,
        path + '.robotId',
        'evento de partida deve ter ID nulo',
      );
      return { type, tick, robotId, message };
    }
    requireField(
      type === 'log' ||
        type === 'erro_controlador' ||
        type === 'limite_de_logs',
      path + '.type',
      'tipo de evento desconhecido',
    );
    requireField(
      typeof robotId === 'string' && ids.has(robotId),
      path + '.robotId',
      'robô do evento ausente no mundo',
    );
    return { type, tick, robotId, message };
  });
}

function readResult(
  value: unknown,
  world: World,
  tick: number,
  path: string,
  stallSeconds?: StallSeconds,
): MatchResult {
  requireField(
    object(value) && value.tick === tick,
    path,
    'resultado deve pertencer ao tick final',
  );
  const { motivo, vencedor } = value;
  if (motivo === 'saida_da_arena') {
    requireField(
      typeof vencedor === 'string' &&
        world.robots.some((robot) => robot.id === vencedor),
      path + '.vencedor',
      'vencedor ausente no mundo',
    );
    return { motivo, vencedor, tick };
  }
  requireField(
    ((motivo === 'tempo_esgotado' && tick === world.match.maxTicks) ||
      motivo === 'ambos_sairam' ||
      (stallSeconds !== undefined && motivo === 'falta_de_progresso')) &&
      vencedor === null,
    path,
    'motivo, vencedor ou tick incompatível com empate',
  );
  return { motivo, vencedor, tick };
}

export function readStates(
  values: readonly unknown[],
  world: World,
  events: readonly SimEvent[],
  stallSeconds?: StallSeconds,
  includePair = false,
): SimState[] {
  let stall = stallSeconds && initialStall(world, stallSeconds, includePair);
  let end = 0;
  let prefix: readonly SimEvent[] = [];
  let finishEvents = 0;
  return values.map((value, tick) => {
    const path = 'states[' + tick + ']';
    requireField(
      object(value) && value.tick === tick && value.time === tick * world.dt,
      path,
      'tick ou tempo incompatível com a sequência e o passo do mundo',
    );
    const { robots, eventCount, status, resultado } = value;
    requireField(
      Array.isArray(robots) && robots.length === world.robots.length,
      path + '.robots',
      'esperados os robôs do mundo na mesma ordem',
    );
    const states = world.robots.map((model, index) => {
      const robot: unknown = robots[index];
      requireField(
        robotMatches(robot, model),
        path + '.robots[' + index + ']',
        'estado, posição ou sensores incompatíveis com o robô',
      );
      return robot;
    });
    let finishInTick = false;
    while (events[end]?.tick === tick) {
      if (events[end]!.type === 'fim_da_luta') {
        finishEvents += 1;
        finishInTick = true;
      }
      end += 1;
    }
    requireField(
      eventCount === end,
      path + '.eventCount',
      'prefixo de eventos incompatível com o tick',
    );
    if (prefix.length !== end) prefix = events.slice(0, end);

    if (includePair && value.pairContact !== undefined) {
      requireField(
        value.pairContact === true &&
          tick > 0 &&
          states.every((robot) => robot.bumper),
        path + '.pairContact',
        'contato do par incompatível com o tick ou com os robôs',
      );
    }
    if (stall && tick > 0) {
      stall = advanceStall(
        stall,
        states,
        tick,
        includePair ? world : undefined,
        includePair && value.pairContact === true,
      );
    }
    const snapshot: SimState = {
      tick,
      time: value.time,
      robots: states,
      events: prefix,
      status: 'em_andamento',
      resultado: null,
      ...(stall && { stall }),
    };
    const expected = stall && tick > 0 ? evaluateSumo(world, snapshot) : null;
    if (status === 'finalizada') {
      requireField(
        world.match.mode === 'sumo' &&
          tick > 0 &&
          tick === values.length - 1 &&
          finishEvents === 1 &&
          finishInTick,
        path,
        'luta finalizada fora do último tick ou sem evento final válido',
      );
      const result = readResult(
        resultado,
        world,
        tick,
        path + '.resultado',
        stallSeconds,
      );
      requireField(
        !stall ||
          (expected?.motivo === result.motivo &&
            expected.vencedor === result.vencedor),
        path + '.resultado',
        'resultado incompatível com as poses e o prazo',
      );
      return { ...snapshot, status, resultado: result };
    }
    requireField(
      status === 'em_andamento' &&
        resultado === null &&
        finishEvents === 0 &&
        expected === null,
      path,
      'estado em andamento incompatível com resultado ou eventos',
    );
    requireField(
      world.match.mode === 'free' || tick < world.match.maxTicks,
      path,
      'uma luta em andamento excede o limite de ticks',
    );
    return snapshot;
  });
}
