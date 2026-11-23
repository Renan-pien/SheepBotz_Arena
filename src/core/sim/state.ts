import { initialStall, isStallSeconds } from '../match/sumo';
import { readLasers } from '../sensors/laser';
import type {
  MatchResult,
  RobotState,
  SimState,
  StallSeconds,
  World,
} from '../types';

export function completeMatch(
  state: SimState,
  resultado: MatchResult,
): SimState {
  const message = {
    queima_da_largada: `Queima de largada de '${state.falseStarters?.[0]}'. Vitória de '${resultado.vencedor}' (+1 ponto).`,
    queima_dupla: 'Queima de largada dos dois robôs. Empate sem pontos.',
    saida_alcancada: 'Nível concluído. O robô alcançou a saída.',
    saida_da_arena: `Fim da luta: vitória de '${resultado.vencedor}' por saída da arena.`,
    ambos_sairam: 'Fim da luta: empate. Os dois robôs saíram da arena.',
    falta_de_progresso: 'Fim da luta: empate por falta de progresso.',
    tempo_esgotado: 'Fim da luta: empate por tempo esgotado.',
  }[resultado.motivo];
  return {
    ...state,
    status: 'finalizada',
    resultado,
    events: [
      ...state.events,
      {
        type:
          resultado.motivo === 'saida_alcancada'
            ? 'fim_do_nivel'
            : 'fim_da_luta',
        tick: resultado.tick,
        robotId: null,
        message,
      },
    ],
  };
}

export function withLaser(
  world: World,
  robots: readonly RobotState[],
): readonly RobotState[] {
  const readings = readLasers(
    world,
    robots.map(({ pose }) => pose),
  );
  return robots.map((robot, index) => ({ ...robot, laser: readings[index]! }));
}

export function createInitialState(
  world: World,
  stallSeconds?: StallSeconds,
  sumoStartDelay = false,
): SimState {
  if (stallSeconds !== undefined && !isStallSeconds(stallSeconds))
    throw new RangeError(
      'O limite sem progresso deve ser 5, 10 ou 30 segundos.',
    );
  return {
    ...(world.match.mode === 'sumo' &&
      sumoStartDelay && { sumoStartDelay: true as const }),
    ...(world.match.mode === 'sumo' &&
      stallSeconds !== undefined && {
        stall: initialStall(world, stallSeconds),
      }),
    tick: 0,
    time: 0,
    status: 'em_andamento',
    resultado: null,
    events: [],
    robots: withLaser(
      world,
      world.robots.map(({ id, initialPose }) => ({
        id,
        pose: initialPose,
        command: { v: 0, w: 0 },
        bumper: false,
        odometry: initialPose,
        laser: [],
        situacao: 'ativo',
      })),
    ),
  };
}
