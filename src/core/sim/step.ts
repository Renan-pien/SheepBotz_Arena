import type {
  Command,
  Pose,
  RobotConfig,
  RobotState,
  SimState,
  World,
} from '../types';
import { integratePose, saturate } from './kinematics';

interface TickRobot {
  readonly config: RobotConfig;
  readonly previous: RobotState;
  readonly command: Command;
  readonly pose: Pose;
}

// Bumper e odometria já estão no estado anterior. Laser entra na Spec 002.
function readSensors(state: SimState): SimState {
  return state;
}

// A etapa de contato entre robôs será integrada na US5.
function resolveContacts(robots: readonly TickRobot[]): readonly TickRobot[] {
  return robots;
}

// A etapa de obstáculos e paredes será integrada na US4.
function resolveEnvironment(
  robots: readonly TickRobot[],
): readonly TickRobot[] {
  return robots;
}

function updateMeasurements(robot: TickRobot): RobotState {
  return { ...robot.previous, pose: robot.pose, command: robot.command };
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
    };
  });
  const robots = resolveEnvironment(resolveContacts(candidates)).map(
    updateMeasurements,
  );
  const tick = state.tick + 1;
  return evaluateMatch({ tick, time: tick * world.dt, robots });
}
