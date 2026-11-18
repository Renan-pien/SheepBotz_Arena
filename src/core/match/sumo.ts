import { distance } from '../math/geometry';
import type { MatchResult, SimState, World } from '../types';

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
  return null;
}
