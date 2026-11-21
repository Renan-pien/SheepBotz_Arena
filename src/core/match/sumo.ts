import { distance } from '../math/geometry';
import type {
  MatchResult,
  RobotState,
  SimState,
  StallState,
  StallSeconds,
  World,
} from '../types';

const progressToleranceM = 0.001;

export function isStallSeconds(value: unknown): value is StallSeconds {
  return value === 5 || value === 10 || value === 30;
}

export function initialStall(
  world: World,
  limitSeconds: StallSeconds,
): StallState {
  return {
    limitSeconds,
    sinceTick: 0,
    centers: world.robots.map(({ initialPose: { x, y } }) => ({ x, y })),
  };
}

export function advanceStall(
  previous: StallState,
  robots: readonly RobotState[],
  tick: number,
): StallState {
  const moved = robots.some(({ pose }, index) => {
    const anchor = previous.centers[index]!;
    // Compensa o arredondamento da subtração na fronteira exata de 1 mm.
    const rounding =
      Number.EPSILON * Math.max(1, Math.abs(anchor.x), Math.abs(anchor.y));
    return distance(pose, anchor) > progressToleranceM + rounding;
  });
  if (!moved) return previous;
  return {
    limitSeconds: previous.limitSeconds,
    sinceTick: tick,
    centers: robots.map(({ pose: { x, y } }) => ({ x, y })),
  };
}

export function evaluateSumo(
  world: World,
  state: SimState,
): MatchResult | null {
  if (world.match.mode !== 'sumo' || !world.arena) return null;
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
  if (tick === world.match.maxTicks)
    return { vencedor: null, motivo: 'tempo_esgotado', tick };
  if (
    state.stall &&
    (tick - state.stall.sinceTick) * world.dt >= state.stall.limitSeconds
  )
    return { vencedor: null, motivo: 'falta_de_progresso', tick };
  return null;
}
