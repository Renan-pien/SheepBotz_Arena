import type {
  Command,
  Pose,
  RobotConfig,
  RobotState,
  SimState,
  World,
} from '../types';
import { evaluateSumo } from '../match/sumo';
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
): SimState {
  const candidates = world.robots.map((config, index) => {
    const previous = state.robots[index]!;
    const requested = Object.hasOwn(commands, config.id)
      ? commands[config.id]!
      : previous.command;
    const command = saturate(requested, config);
    return {
      config,
      previous,
      command,
      pose: integratePose(previous.pose, command, world.dt),
      contacted: false,
    };
  });
  const robots = resolveEnvironment(resolveContacts(candidates), world).map(
    (robot) => updateMeasurements(robot, world.dt),
  );
  const tick = state.tick + 1;
  const next: SimState = {
    ...state,
    tick,
    time: tick * world.dt,
    robots: withLaser(world, robots),
  };
  const result = evaluateSumo(world, next);
  return result ? completeMatch(next, result) : next;
}
