# Contrato: API Pública do Núcleo

Tudo que outras camadas (CLI, interface, testes) podem usar é exportado por `src/core/index.ts`. Nada fora desta lista é público. Tipos em `../data-model.md`.

## Funções

```ts
// Carrega e valida o texto de um arquivo de mundo (FR-001 a FR-012).
export function loadWorld(text: string): LoadWorldResult;

// Estado do tick 0 de um mundo válido (FR-015, FR-018, FR-034).
export function createInitialState(world: World): SimState;

// Passo puro: executa um tick e devolve um novo estado (FR-017).
// `commands` contém o comando informado neste tick por id; robôs ausentes mantêm o comando do estado.
export function step(
  world: World,
  state: SimState,
  commands: Readonly<Record<string, Command>>,
): SimState;

// Fachada de simulação (FR-038, FR-039).
export function createSimulation(world: World, options?: SimulationOptions): Simulation;

// Execução sem interface com validação de entradas (FR-032 a FR-035).
export function runHeadless(input: HeadlessInput): HeadlessResult;

// Utilitários de ângulo (FR-012, FR-040).
export function normalizeAngle(theta: number): number; // resultado em (−π, π]
export function angleDiff(a: number, b: number): number; // normalizeAngle(a − b)
```

## Fachada

```ts
export interface SimulationOptions {
  readonly commands?: Readonly<Record<string, Command>>; // comandos constantes por id
  readonly history?: boolean;                            // padrão false
}

export interface Simulation {
  readonly world: World;
  getState(): SimState;
  step(): SimState;                 // avança 1 tick
  stepN(n: number): SimState;       // avança n ticks (n inteiro ≥ 0)
  reset(): SimState;                // volta ao tick 0 e reinicia o histórico
  getHistory(): readonly SimState[]; // estados do tick 0 ao atual; lista vazia se history = false
}
```

Se `history` estiver habilitado, após `reset()` a lista de `getHistory()` contém somente o estado
retornado por `reset()`. Se estiver desabilitado, `getHistory()` continua retornando uma lista vazia.

## Pré-condições e erros de uso

| Função | Pré-condição | Se violada |
|---|---|---|
| `createSimulation` | `world` veio de `loadWorld` com `ok: true`; ids de `commands` existem | Comportamento indefinido (use `runHeadless` para entradas não confiáveis) |
| `stepN`, `runHeadless` | número de ticks inteiro ≥ 0 | Lança `RangeError` |
| `runHeadless` | — | Erros de mundo e de comandos voltam em `{ ok: false, errors }`, nunca como exceção |

## Comportamento de `runHeadless`

1. `loadWorld(input.world)`; se inválido, devolve os erros.
2. Percorre as entradas de `input.commands` na ordem de enumeração do objeto. Para cada entrada,
   verifica primeiro se o `id` existe no mundo e em seguida se `v` e `w` são números finitos.
   Acumula `ROBO_INEXISTENTE` e `COMANDO_INVALIDO` conforme o caso, inclusive ambos no mesmo
   caminho `commands.<id>` quando as duas verificações falharem.
3. Cria a simulação com os comandos, executa `ticks` ticks e devolve `{ ok: true, state }`, mais `history` se pedido.
