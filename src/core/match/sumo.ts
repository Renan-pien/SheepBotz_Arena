import { distance } from '../math/geometry';
import type {
  MatchResult,
  Pose,
  RobotState,
  SimState,
  StallState,
  StallSeconds,
  World,
} from '../types';

export const SUMO_START_SECONDS = 5;
export const FALSE_START_MOTION_SECONDS = 0.5;

function ticksForSeconds(seconds: number, dt: number): number {
  const tick = Math.floor(seconds / dt);
  return tick * dt >= seconds ? tick : tick + 1;
}

export function releaseTick(dt: number): number {
  return ticksForSeconds(SUMO_START_SECONDS, dt);
}

function falseStartResult(
  world: World,
  tick: number,
  offenders?: readonly string[],
): MatchResult | null {
  if (!offenders?.length) return null;
  const winner =
    world.robots.find(({ id }) => !offenders.includes(id))?.id ?? null;
  return {
    tick,
    vencedor: winner,
    motivo: winner === null ? 'queima_dupla' : 'queima_da_largada',
    pontos: Object.fromEntries(
      world.robots.map(({ id }) => [id, Number(id === winner)]),
    ),
  };
}

type Point = Pick<Pose, 'x' | 'y'>;
const progressToleranceM = 0.001;
const pairGapToleranceM = 0.002;

function roundingMargin(point: Point) {
  return Number.EPSILON * Math.max(1, Math.abs(point.x), Math.abs(point.y));
}

function movedFrom(point: Point, anchor: Point) {
  return distance(point, anchor) > progressToleranceM + roundingMargin(anchor);
}

function trackPair(
  previous: StallState['pair'],
  first: Point,
  second: Point,
  touchingDistance: number,
  collided: boolean,
  tick: number,
): StallState['pair'] {
  // A folga mantém um contato já iniciado. Sozinha, não inicia o intervalo.
  const allowedGap = previous || collided ? pairGapToleranceM : 0;
  const rounding = Math.max(roundingMargin(first), roundingMargin(second));
  if (distance(first, second) > touchingDistance + allowedGap + rounding)
    return undefined;

  const center = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
  if (previous && !movedFrom(center, previous.center)) return previous;
  return { center, sinceTick: tick };
}

export function stallStartTick(stall: StallState): number {
  return stall.pair
    ? Math.min(stall.sinceTick, stall.pair.sinceTick)
    : stall.sinceTick;
}

export function isStallSeconds(value: unknown): value is StallSeconds {
  return value === 5 || value === 10 || value === 30;
}

export function initialStall(
  world: World,
  limitSeconds: StallSeconds,
  includePair = true,
): StallState {
  const [first, second] = world.robots;
  const pair =
    includePair && world.match.mode === 'sumo'
      ? trackPair(
          undefined,
          first!.initialPose,
          second!.initialPose,
          first!.radius + second!.radius,
          false,
          0,
        )
      : undefined;
  return {
    ...(pair && { pair }),
    limitSeconds,
    sinceTick: 0,
    centers: world.robots.map(({ initialPose: { x, y } }) => ({ x, y })),
  };
}

export function advanceStall(
  previous: StallState,
  robots: readonly RobotState[],
  tick: number,
  world?: World,
  pairContact = false,
): StallState {
  const moved = robots.some(({ pose }, index) =>
    movedFrom(pose, previous.centers[index]!),
  );
  const pair =
    world?.match.mode === 'sumo'
      ? trackPair(
          previous.pair,
          robots[0]!.pose,
          robots[1]!.pose,
          world.robots[0]!.radius + world.robots[1]!.radius,
          pairContact,
          tick,
        )
      : undefined;
  if (
    !moved &&
    pair === previous.pair &&
    pairContact === Boolean(previous.pairContact)
  )
    return previous;
  return {
    limitSeconds: previous.limitSeconds,
    sinceTick: moved ? tick : previous.sinceTick,
    centers: moved
      ? robots.map(({ pose: { x, y } }) => ({ x, y }))
      : previous.centers,
    ...(pair && { pair }),
    ...(pairContact && { pairContact: true }),
  };
}

export function evaluateSumo(
  world: World,
  state: SimState,
): MatchResult | null {
  if (world.match.mode !== 'sumo' || !world.arena) return null;
  if (state.falseStartTick !== undefined) {
    const elapsedTicks = state.tick - state.falseStartTick + 1;
    return elapsedTicks >= ticksForSeconds(FALSE_START_MOTION_SECONDS, world.dt)
      ? falseStartResult(world, state.tick, state.falseStarters)
      : null;
  }
  const start = state.sumoStartDelay ? releaseTick(world.dt) : 0;
  if (state.sumoStartDelay && state.tick <= start)
    return falseStartResult(world, state.tick, state.falseStarters);
  const [first, second] = state.robots;
  const center = { x: 0, y: 0 };
  const firstOut = distance(center, first!.pose) > world.arena.radius;
  const secondOut = distance(center, second!.pose) > world.arena.radius;
  const { tick } = state;
  if (firstOut !== secondOut) {
    return {
      vencedor: firstOut ? second!.id : first!.id,
      motivo: 'saida_da_arena',
      tick,
    };
  }
  if (firstOut) return { vencedor: null, motivo: 'ambos_sairam', tick };
  if (tick === start + world.match.maxTicks)
    return { vencedor: null, motivo: 'tempo_esgotado', tick };
  if (
    state.stall &&
    (tick - Math.max(start, stallStartTick(state.stall))) * world.dt >=
      state.stall.limitSeconds
  )
    return { vencedor: null, motivo: 'falta_de_progresso', tick };
  return null;
}
