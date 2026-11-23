import type {
  Command,
  Pose,
  RobotConfig,
  RobotState,
  SimState,
  World,
} from '../types';
import { evaluateMaze } from '../match/maze';
import {
  advanceStall,
  evaluateSumo,
  FALSE_START_MOTION_SECONDS,
  SUMO_START_SECONDS,
} from '../match/sumo';
import { resolveRobotContacts } from './contacts';
import { integratePose, saturate } from './kinematics';
import { resolveObstaclesAndWalls } from './obstacles';
import { completeMatch, withLaser } from './state';

interface TickRobot {
  readonly config: RobotConfig;
  readonly previous: RobotState;
  readonly command: Command;
  readonly pose: Pose;
  readonly contacted: boolean;
}

function resolveContacts(robots: readonly TickRobot[]): readonly TickRobot[] {
  const contacts = resolveRobotContacts(
    robots.map(({ previous }) => previous.pose),
    robots.map(({ pose }) => pose),
    robots.map(({ config }) => config.radius),
    robots,
  );
  return robots.map((robot, index) => ({ ...robot, ...contacts[index]! }));
}

function resolveEnvironment(
  robots: readonly TickRobot[],
  world: World,
): readonly TickRobot[] {
  return robots.map((robot) => {
    const resolved = resolveObstaclesAndWalls(
      robot.pose,
      robot.config.radius,
      world.obstacles,
      world.map,
    );
    return {
      ...robot,
      pose: resolved.pose,
      contacted: robot.contacted || resolved.contacted,
    };
  });
}

function updateMeasurements(robot: TickRobot, dt: number): RobotState {
  return {
    ...robot.previous,
    pose: robot.pose,
    command: robot.command,
    bumper: robot.contacted,
    odometry: integratePose(robot.previous.odometry, robot.command, dt),
  };
}

export function step(
  world: World,
  state: SimState,
  commands: Readonly<Record<string, Command>>,
  attempts?: ReadonlyMap<string, Command>,
): SimState {
  if (state.status === 'finalizada') return state;
  // Durante a demonstração, os motores mantêm o comando efetivo do primeiro passo.
  if (state.falseStartTick !== undefined) return move(world, state, {});
  if (state.sumoStartDelay && state.time < SUMO_START_SECONDS) {
    const tick = state.tick + 1;
    const motion = new Map<string, Command>();
    for (const { id } of world.robots) {
      const command =
        attempts?.get(id) ??
        (Object.hasOwn(commands, id) ? commands[id] : undefined);
      if (command && (command.v !== 0 || command.w !== 0))
        motion.set(id, command);
    }
    if (!motion.size) return { ...state, tick, time: tick * world.dt };
    return move(
      world,
      { ...state, falseStartTick: tick, falseStarters: [...motion.keys()] },
      Object.fromEntries(motion),
    );
  }
  return move(world, state, commands);
}

function move(
  world: World,
  state: SimState,
  commands: Readonly<Record<string, Command>>,
): SimState {
  const tick = state.tick + 1;
  const dt =
    state.falseStartTick === undefined
      ? world.dt
      : Math.min(
          world.dt,
          FALSE_START_MOTION_SECONDS - (tick - state.falseStartTick) * world.dt,
        );
  const candidates = world.robots.map((config, index) => {
    const previous = state.robots[index]!;
    const requested = Object.hasOwn(commands, config.id)
      ? commands[config.id]!
      : previous.command;
    const command =
      previous.situacao === 'desativado' && state.falseStartTick === undefined
        ? { v: 0, w: 0 }
        : saturate(requested, config);
    return {
      config,
      previous,
      command,
      pose: integratePose(previous.pose, command, dt),
      contacted: false,
    };
  });
  const contacts = resolveContacts(candidates);
  const robots = resolveEnvironment(contacts, world).map((robot) =>
    updateMeasurements(robot, dt),
  );
  const next: SimState = {
    ...state,
    ...(state.stall &&
      state.falseStartTick === undefined && {
        stall: advanceStall(
          state.stall,
          robots,
          tick,
          world,
          contacts[0]!.contacted,
        ),
      }),
    tick,
    time: tick * world.dt,
    robots: withLaser(world, robots),
  };
  const result =
    world.match.mode === 'maze'
      ? evaluateMaze(world, next)
      : evaluateSumo(world, next);
  return result ? completeMatch(next, result) : next;
}
