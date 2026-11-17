import type {
  Command,
  Pose,
  RobotConfig,
  RobotState,
  SimState,
  World,
} from '../types';
import { integratePose, saturate } from './kinematics';
import { resolveObstaclesAndWalls } from './obstacles';

interface TickRobot {
  readonly config: RobotConfig;
  readonly previous: RobotState;
  readonly command: Command;
  readonly pose: Pose;
  readonly contacted: boolean;
}

// Bumper e odometria já estão no estado anterior. Laser entra na Spec 002.
function readSensors(state: SimState): SimState {
  return state;
}

// A etapa de contato entre robôs será integrada na US5.
function resolveContacts(robots: readonly TickRobot[]): readonly TickRobot[] {
  return robots;
}

function resolveEnvironment(
  robots: readonly TickRobot[],
  world: World,
): readonly TickRobot[] {
  return robots.map((robot) => ({
    ...robot,
    ...resolveObstaclesAndWalls(
      robot.pose,
      robot.config.radius,
      world.obstacles,
      world.map,
    ),
  }));
}

function updateMeasurements(robot: TickRobot): RobotState {
  return {
    ...robot.previous,
    pose: robot.pose,
    command: robot.command,
    bumper: robot.contacted,
  };
}

// O resultado do sumô será avaliado na Spec 002.
function evaluateMatch(state: SimState): SimState {
  return state;
}

export function step(
  world: World,
  state: SimState,
  commands: Readonly<Record<string, Command>>,
): SimState {
  const observed = readSensors(state);
  const candidates = world.robots.map((config, index) => {
    const previous = observed.robots[index]!;
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
    updateMeasurements,
  );
  const tick = state.tick + 1;
  return evaluateMatch({ tick, time: tick * world.dt, robots });
}
