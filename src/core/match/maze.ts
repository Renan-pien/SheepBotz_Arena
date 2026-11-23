import type { MatchResult, SimState, World } from '../types';
import { containsPoint } from '../math/geometry';

export function evaluateMaze(
  world: World,
  state: SimState,
): MatchResult | null {
  const exit = world.match.exit;
  const robot = state.robots[0]!;
  if (world.match.mode !== 'maze' || !exit || !containsPoint(exit, robot.pose))
    return null;
  return { motivo: 'saida_alcancada', vencedor: robot.id, tick: state.tick };
}
