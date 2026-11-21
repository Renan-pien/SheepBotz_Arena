import type { ControllerEngine } from './controller/runtime';

export interface Pose {
  readonly x: number; // metros
  readonly y: number; // metros
  readonly theta: number; // radianos, sempre normalizado em (−π, π]
}

export interface Command {
  readonly v: number; // m/s
  readonly w: number; // rad/s
}

export type MatchMode = 'free' | 'sumo';

export interface World {
  readonly name: string;
  readonly seed: number; // inteiro 0..4294967295
  readonly dt: number; // segundos
  readonly map: { readonly width: number; readonly height: number };
  readonly arena: { readonly radius: number } | null;
  readonly match: { readonly mode: MatchMode; readonly maxTicks: number };
  readonly obstacles: readonly Obstacle[];
  readonly robots: readonly RobotConfig[];
}

export interface Obstacle {
  readonly id: string;
  readonly x: number; // centro
  readonly y: number; // centro
  readonly width: number;
  readonly height: number;
}

export interface RobotConfig {
  readonly id: string;
  readonly initialPose: Pose; // theta já normalizado
  readonly radius: number;
  readonly maxLinearSpeed: number;
  readonly maxAngularSpeed: number;
  readonly color: string; // #RRGGBB
  readonly laser: LaserConfig | null;
}

export interface LaserConfig {
  readonly rays: number; // inteiro 1..360
  readonly fov: number; // radianos
  readonly maxRange: number; // metros
}

export interface RobotState {
  readonly id: string;
  readonly pose: Pose; // pose real
  readonly command: Command; // comando efetivo (saturado) aplicado no último tick; (0, 0) no tick 0
  readonly bumper: boolean; // contato no último tick; false no tick 0
  readonly odometry: Pose; // pose estimada (ignora colisões)
  readonly laser: readonly number[];
  readonly situacao: 'ativo' | 'desativado';
}

export type StallSeconds = 5 | 10 | 30;

export interface StallState {
  readonly pair?: {
    readonly center: Pick<Pose, 'x' | 'y'>;
    readonly sinceTick: number;
  };
  readonly pairContact?: true;
  readonly limitSeconds: StallSeconds;
  readonly sinceTick: number;
  readonly centers: readonly Pick<Pose, 'x' | 'y'>[];
}

export interface MatchResult {
  readonly vencedor: string | null;
  readonly motivo:
    'saida_da_arena' | 'ambos_sairam' | 'tempo_esgotado' | 'falta_de_progresso';
  readonly tick: number;
}

export interface SimEvent {
  readonly type: 'log' | 'erro_controlador' | 'limite_de_logs' | 'fim_da_luta';
  readonly tick: number;
  readonly robotId: string | null;
  readonly message: string;
}

export interface SimState {
  readonly stall?: StallState;
  readonly tick: number; // 0 no estado inicial
  readonly time: number; // tick × dt
  readonly robots: readonly RobotState[]; // mesma ordem de world.robots
  readonly status: 'em_andamento' | 'finalizada';
  readonly resultado: MatchResult | null;
  readonly events: readonly SimEvent[];
}

export type ErrorCode =
  | 'ARQUIVO_INVALIDO'
  | 'CAMPO_OBRIGATORIO'
  | 'CAMPO_DESCONHECIDO'
  | 'TIPO_INVALIDO'
  | 'FORMATO_INVALIDO'
  | 'VALOR_FORA_DO_INTERVALO'
  | 'ID_DUPLICADO'
  | 'FORA_DO_MAPA'
  | 'POSICAO_INICIAL_INVALIDA'
  | 'DESLOCAMENTO_EXCESSIVO'
  | 'REGRA_DA_MODALIDADE'
  | 'ROBO_INEXISTENTE'
  | 'COMANDO_INVALIDO'
  | 'ENTRADA_CONFLITANTE'
  | 'CONTROLADOR_INVALIDO';

export interface ValidationError {
  readonly code: ErrorCode;
  readonly path: string; // '' para o documento inteiro
  readonly message: string; // pt-BR, cita o caminho
}

export type LoadWorldResult =
  | { readonly ok: true; readonly world: World }
  | { readonly ok: false; readonly errors: readonly ValidationError[] };

export type ControllerOptions =
  | { readonly controllers?: undefined; readonly controllerEngine?: undefined }
  | {
      readonly controllers: Readonly<Record<string, string>>;
      readonly controllerEngine: ControllerEngine;
    };

export type HeadlessInput = ControllerOptions & {
  readonly stallSeconds?: StallSeconds;
  readonly world: string; // texto do arquivo de mundo
  readonly commands?: Readonly<Record<string, Command>>; // comando constante por id
  readonly ticks: number; // inteiro ≥ 0
  readonly history?: boolean; // padrão false
};

export type HeadlessResult =
  | {
      readonly ok: true;
      readonly state: SimState;
      readonly history?: readonly SimState[];
    }
  | { readonly ok: false; readonly errors: readonly ValidationError[] };
