// ADR-026. O ID no arquivo de mundo fixa estes valores inclusive para replays.
export const robotModels = {
  nimbo: { name: 'Nimbo', radius: 0.04, massKg: 0.2, force: 1, traction: 6 },
  zarpa: { name: 'Zarpa', radius: 0.044, massKg: 0.23, force: 2, traction: 5 },
  quimera: {
    name: 'Quimera',
    radius: 0.048,
    massKg: 0.28,
    force: 3,
    traction: 4,
  },
  torvelim: {
    name: 'Torvelim',
    radius: 0.052,
    massKg: 0.32,
    force: 4,
    traction: 3,
  },
  brontes: {
    name: 'Brontes',
    radius: 0.056,
    massKg: 0.36,
    force: 5,
    traction: 2,
  },
  baluarte: {
    name: 'Baluarte',
    radius: 0.06,
    massKg: 0.4,
    force: 6,
    traction: 1,
  },
} as const;

export type RobotModel = keyof typeof robotModels;
export const modelIds = Object.freeze(Object.keys(robotModels) as RobotModel[]);
Object.values(robotModels).forEach(Object.freeze);
Object.freeze(robotModels);
