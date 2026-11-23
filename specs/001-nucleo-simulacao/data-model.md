# Modelo de Dados: Spec 001

Tipos públicos do núcleo, definidos em `src/core/types.ts`. Todos os objetos de estado são tratados como **imutáveis** (`readonly`).

---

## Tipos básicos

```ts
export interface Pose {
  readonly x: number;     // metros
  readonly y: number;     // metros
  readonly theta: number; // radianos, sempre normalizado em (−π, π]
}

export interface Command {
  readonly v: number; // m/s
  readonly w: number; // rad/s
}
```

---

## Mundo normalizado

Resultado de `loadWorld` quando válido: todos os padrões aplicados, `theta` normalizado e cores definidas. É a única forma de mundo aceita por `createSimulation`.

```ts
export type MatchMode = 'free' | 'sumo' | 'maze';

export interface World {
  readonly name: string;
  readonly seed: number;            // inteiro 0..4294967295
  readonly dt: number;              // segundos
  readonly map: { readonly width: number; readonly height: number };
  readonly arena: { readonly radius: number } | null;
  readonly match: { readonly mode: MatchMode; readonly maxTicks: number; readonly exit?: Pick<Obstacle, "x" | "y" | "width" | "height"> };
  readonly obstacles: readonly Obstacle[];
  readonly robots: readonly RobotConfig[];
}

export interface Obstacle {
  readonly id: string;
  readonly x: number;      // centro
  readonly y: number;      // centro
  readonly width: number;
  readonly height: number;
}

export interface RobotConfig {
  readonly id: string;
  readonly initialPose: Pose;     // theta já normalizado
  readonly radius: number;
  readonly maxLinearSpeed: number;
  readonly maxAngularSpeed: number;
  readonly color: string;         // #RRGGBB
  readonly laser: LaserConfig | null;
}

export interface LaserConfig {
  readonly rays: number;     // inteiro 1..360
  readonly fov: number;      // radianos
  readonly maxRange: number; // metros
}
```

**Invariantes garantidos pela validação**

- IDs únicos por tipo, obstáculos e corpos dos robôs dentro do mapa e poses iniciais sem sobreposição.
- Para cada robô, `RobotConfig.maxLinearSpeed × World.dt ≤ RobotConfig.radius`.
- No modo `sumo`, `World.robots` tem exatamente 2 itens e `World.arena` está presente. A distância
  do centro em `RobotConfig.initialPose` à origem é menor ou igual a `World.arena.radius`.
  O corpo do robô pode ultrapassar a borda da arena (FR-011).

---

## Estado da simulação

```ts
export interface RobotState {
  readonly id: string;
  readonly pose: Pose;          // pose real
  readonly command: Command;    // comando efetivo (saturado) aplicado no último tick; (0, 0) no tick 0
  readonly bumper: boolean;     // contato no último tick; false no tick 0
  readonly odometry: Pose;      // pose estimada (ignora colisões)
}

export interface SimState {
  readonly tick: number;        // 0 no estado inicial
  readonly time: number;        // tick × dt
  readonly robots: readonly RobotState[]; // mesma ordem de world.robots
}
```

A Spec 002 acrescenta campos a `RobotState` (leituras do laser, situação) e a `SimState` (status, resultado, eventos).

### Transições

```
createInitialState(world) ──► estado tick 0
estado tick k ──step(world, estado, comandos)──► estado tick k+1
qualquer estado ──reset()──► estado tick 0 (idêntico ao inicial)
```

Na fachada, `SimulationOptions.history` controla a retenção dos estados. Com histórico habilitado,
`reset()` substitui a lista anterior por uma lista contendo apenas o novo `SimState` do tick 0.
Com histórico desabilitado, a consulta retorna uma lista vazia. [Contrato da API](contracts/core-api.md#fachada)

---

## Erros

```ts
export type ErrorCode =
  | 'ARQUIVO_INVALIDO' | 'CAMPO_OBRIGATORIO' | 'CAMPO_DESCONHECIDO'
  | 'TIPO_INVALIDO' | 'FORMATO_INVALIDO' | 'VALOR_FORA_DO_INTERVALO'
  | 'ID_DUPLICADO' | 'FORA_DO_MAPA' | 'POSICAO_INICIAL_INVALIDA'
  | 'DESLOCAMENTO_EXCESSIVO' | 'REGRA_DA_MODALIDADE'
  | 'ROBO_INEXISTENTE' | 'COMANDO_INVALIDO';

export interface ValidationError {
  readonly code: ErrorCode;
  readonly path: string;    // '' para o documento inteiro
  readonly message: string; // pt-BR, cita o caminho
}

export type LoadWorldResult =
  | { readonly ok: true; readonly world: World }
  | { readonly ok: false; readonly errors: readonly ValidationError[] };
```

---

## Execução sem interface

```ts
export interface HeadlessInput {
  readonly world: string;                                 // texto do arquivo de mundo
  readonly commands?: Readonly<Record<string, Command>>;  // comando constante por id
  readonly ticks: number;                                 // inteiro ≥ 0
  readonly history?: boolean;                             // padrão false
}

export type HeadlessResult =
  | { readonly ok: true; readonly state: SimState; readonly history?: readonly SimState[] }
  | { readonly ok: false; readonly errors: readonly ValidationError[] };
```

---

## Relações

```
World 1 ── * RobotConfig ── 0..1 LaserConfig
World 1 ── * Obstacle
SimState 1 ── * RobotState   (RobotState.id = RobotConfig.id, mesma ordem)
```

## Saída de labirinto

`World.match.exit` contém centro `(x,y)` e dimensões `(width,height)` em metros conforme o [contrato de mundo](contracts/world.md).

### Perfil físico

RobotConfig admite o ID de modelo opcional. O catálogo de S1-FR-042 fixa raio, peso e índices de força e tração. RobotState conserva somente os dados que mudam a cada tick.

O perfil passa a informar a classe leve, média ou pesada. O campo model do mundo continua sendo a única chave para resolver o perfil físico.
