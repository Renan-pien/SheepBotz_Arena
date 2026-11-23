// ADR-026. O ID no arquivo de mundo fixa estes valores inclusive para replays.
export const robotModels = {
  nimbo: {
    name: 'Nimbo',
    weightClass: 'light',
    radius: 0.04,
    massKg: 0.2,
    force: 1,
    traction: 6,
  },
  pulga: {
    name: 'Pulga',
    weightClass: 'light',
    radius: 0.042,
    massKg: 0.21,
    force: 1.5,
    traction: 5.6,
  },
  zarpa: {
    name: 'Zarpa',
    weightClass: 'light',
    radius: 0.044,
    massKg: 0.23,
    force: 2,
    traction: 5,
  },
  quimera: {
    name: 'Quimera',
    weightClass: 'medium',
    radius: 0.048,
    massKg: 0.28,
    force: 3,
    traction: 4,
  },
  arraia: {
    name: 'Arraia',
    weightClass: 'medium',
    radius: 0.05,
    massKg: 0.3,
    force: 3.5,
    traction: 3.5,
  },
  torvelim: {
    name: 'Torvelim',
    weightClass: 'medium',
    radius: 0.052,
    massKg: 0.32,
    force: 4,
    traction: 3,
  },
  brontes: {
    name: 'Brontes',
    weightClass: 'heavy',
    radius: 0.056,
    massKg: 0.36,
    force: 5,
    traction: 2,
  },
  monolito: {
    name: 'Monólito',
    weightClass: 'heavy',
    radius: 0.058,
    massKg: 0.38,
    force: 5.5,
    traction: 1.5,
  },
  baluarte: {
    name: 'Baluarte',
    weightClass: 'heavy',
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
