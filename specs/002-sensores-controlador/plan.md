# Plano de implementação · Spec 002

**Branch** `002-sensores-controlador` · **Data** 2026-11-17 · [Spec 002](spec.md)

**Anexos** [Pesquisa](research.md) · [Modelo de dados](data-model.md) · [Contratos](contracts/core-api.md) · [Quickstart](quickstart.md)

## Resumo

A S2 acrescenta laser, controladores JavaScript e sumô ao simulador sem interface. O passo
físico da S1 continua sendo a única implementação de cinemática e contatos. A fachada prepara
os comandos com as leituras do início do passo, avalia o resultado com as poses finais e
publica um snapshot por tick executado. A biblioteca e a CLI compartilham o preparo de
controladores e o mesmo contrato de estado.

## Contexto técnico

| Aspecto | Decisão |
|---|---|
| Linguagem e build | TypeScript 6.0.3 estrito, Node 24 para CLI e testes, Vite para o navegador. Versões exatas e lockfile versionado. |
| Dependências | Stack do ADR-008. SES 2.3.0 para os compartimentos e Acorn 8.15.0 para a leitura do script síncrono. Justificativa e alternativas na pesquisa R1. Geometria própria. |
| Armazenamento | Configuração em JSON, fontes JavaScript e snapshots em memória. Mundo já validado pela S1. |
| Testes | Vitest e cobertura v8. TDD para cada critério, regressão S1, testes geométricos, integração Node/navegador e CLI. |
| Plataformas | Biblioteca e CLI síncronas no Node e o mesmo núcleo no navegador. A S3 consome a API da S2. |
| Desempenho | SC-003 no Duelo padrão, com Parado e Girador, 3 000 ticks em menos de 2 s no ambiente de referência. Histórico desabilitado. |
| Limites | 1 a 8 robôs em modo livre e exatamente 2 em sumô. Até 360 raios por robô e 100 obstáculos. Históricos são opcionais. |
| Integração externa | Q-001 registrada como premissa de biblioteca e CLI. A confirmação da forma de chamada do professor permanece aberta. |

### Perguntas resolvidas pela pesquisa

| Tema | Resolução |
|---|---|
| Onde executar JavaScript e quando disponibilizar a API? | Compartimento privado por controlador, com validação e avaliação de nível superior antes do tick 0. Pesquisa R1. |
| Como reutilizar a física e evitar laser duplicado? | Publicar uma leitura por pose e reutilizá-la no início do próximo passo. Pesquisa R2 e R3. |
| Como fixar a sequência por robô? | Gerador congruencial de 32 bits, com vetores de referência. Pesquisa R4. |
| Como publicar resultados e acumular falhas sem quebrar os consumidores? | Contratos aditivos e preparação única com lista de erros. Pesquisa R5. |
| Como medir os 3 000 ticks de maneira reproduzível? | Benchmark fora da suíte, com cenário e janela de medição de SC-003. Pesquisa R6. |

## Constitution Check

| Princípio | Antes da pesquisa | Após o desenho |
|---|---|---|
| I · Especificação como produto | Spec 002 clarificada e checklist revalidado | Contratos, fluxos, 36 requisitos e critérios têm desenho verificável. |
| II · Núcleo determinístico | Núcleo e ordem física da S1 estabelecidos | Motor injetado com ambiente síncrono atenuado. Ordem de passos, PRNG e eventos explícita. Igualdade entre avanço em lote e passo a passo prevista na suíte. |
| III · Física própria | Núcleo físico da S1 disponível | Raycast implementado no projeto e física reutilizada. |
| IV · Interface mostra e comanda | CLI e UI dependem do núcleo | O motor é inicializado no adaptador, a CLI cuida da E/S, a S3 consome estados readonly. |
| V · Testes como contrato | 48 critérios de aceitação e tolerância S1 documentados | IDs por cenário, teste antes do código, piso de 80% de linhas no projeto e meta de 90% no núcleo. |
| VI · Rastreabilidade | Cada FR tem origem direta e Anexo F | Mapa FR → módulo e checklist → artefato abaixo. Alterações públicas registradas pelos ADRs de clarificação e pelo registro do desenho. |
| VII · Simplicidade | Uma aplicação e nenhuma persistência nova | Bibliotecas de execução justificadas em R1. Uma única fachada para biblioteca e CLI. |
| VIII · Interface clara | Erros de validação estruturados na S1 | Catálogo pt-BR com caminho e detalhe original. A S3 usa os campos do contrato. |
| IX · Modalidade configurável | Mundos da S1 já validam modo e arena | Regras em módulo próprio e exemplos passam pelas entradas públicas. |

**Resultado do portão documental** Aprovado no desenho, sem exceção constitucional. Os
14 itens do checklist estão justificados na avaliação, com 13 conformes e a Q-001 como
premissa. As verificações executáveis da S2 ficam programadas no quickstart.

## Estrutura do projeto

### Documentação desta feature

```text
specs/002-sensores-controlador/
├── spec.md
├── checklists/clarificacao.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── cli.md
    ├── controller-api.md
    ├── core-api.md
    ├── errors.md
    ├── state.md
    └── world.md
```

### Código e testes previstos

```text
src/
├── cli/{index,run-cli}.ts
├── core/
│   ├── index.ts
│   ├── types.ts
│   ├── api/{prepare-simulation,run-headless}.ts
│   ├── controller/{runtime,inputs,runner,api,random}.ts
│   ├── math/ray.ts
│   ├── match/sumo.ts
│   ├── sensors/laser.ts
│   └── sim/{step,state,simulation}.ts
└── runtime/controller-engine.ts
examples/
├── worlds/{duelo-padrao,sala-com-obstaculos}.json
└── controllers/{parado,avanca,girador,cacador,desviador}.js
scripts/{bench,bench-s2}.ts
tests/
├── cli/run-cli.test.ts
├── core/acceptance/s2/
├── core/unit/
├── fixtures/
└── runtime/
```

**Decisão de estrutura.** Um pacote TypeScript. `src/core/controller/runtime.ts` declara
a interface do motor síncrono. `src/runtime/controller-engine.ts` a implementa e é usado
pelo bootstrap da CLI e pelo futuro bootstrap web. `src/core` ignora SES, Acorn,
Node e DOM. A UI e a CLI dependem da API pública. A comunicação com o motor passa
pela interface injetada e por dados explícitos da sessão.

### Interfaces internas verificadas pela suíte

Os testes unitários importam estas interfaces diretamente dos módulos indicados.
As regras das operações estão nas seções de arquitetura e nos contratos.

```ts
// src/core/math/ray.ts
type Point = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };
export function rayBox(
  origin: Point,
  direction: Point,
  rect: Rect,
): { enter: number; exit: number } | undefined;
export function rayCircle(
  origin: Point,
  direction: Point,
  center: Point,
  radius: number,
): number | undefined;

// src/core/sensors/laser.ts e src/core/match/sumo.ts
export function readLasers(
  world: World,
  poses: readonly Pose[],
): readonly (readonly number[])[];
export function evaluateSumo(world: World, state: SimState): MatchResult | null;
```

Em `rayBox`, o retângulo é dado por centro e dimensões. Retorne o intervalo
paramétrico, inclusive com entrada negativa se a origem está dentro, e descarte
intervalos inteiramente atrás da origem. `rayCircle` recebe direção unitária e
retorna a primeira distância não negativa ou `undefined` quando não há interseção.
`readLasers` ordena o retorno por robô e por raio. `evaluateSumo` usa o tick e as
poses de `state` e devolve `null` enquanto não houver resultado.

```ts
// src/core/controller/runtime.ts
export type ControllerBindings = Readonly<
  Record<string, (...args: unknown[]) => unknown>
>;
export type LoadedController = { setup?: () => void; loop: () => void };
export type ControllerLoadResult =
  | { ok: true; value: LoadedController }
  | { ok: false; message: string };
export interface ControllerEngine {
  load(source: string, bindings: ControllerBindings): ControllerLoadResult;
}

// src/runtime/controller-engine.ts
export function initializeControllerEngine(): ControllerEngine;
```

`initializeControllerEngine` reutiliza a mesma instância. `load` avalia cada
fonte uma vez e injeta `bindings` somente após a avaliação de nível superior.
Em caso de falha, devolve o detalhe para o catálogo de erros.

```ts
// src/core/controller/inputs.ts
type InputOptions = ControllerOptions & {
  commands?: Readonly<Record<string, Command>>;
};
export function prepareInputs(
  world: World,
  options: InputOptions,
  bindingsFor: (id: string) => ControllerBindings,
):
  | {
      ok: true;
      commands: Readonly<Record<string, Command>>;
      controllers: ReadonlyMap<string, LoadedController>;
    }
  | { ok: false; errors: readonly ValidationError[] };

// src/core/controller/runner.ts
export function createControllerRunner(world: World): {
  bindingsFor(id: string): ControllerBindings;
  run(
    state: SimState,
    commands: Readonly<Record<string, Command>>,
    scripts: ReadonlyMap<string, LoadedController>,
  ): {
    commands: Readonly<Record<string, Command>>;
    events: readonly SimEvent[];
    disabled: ReadonlySet<string>;
  };
};
```

`ControllerOptions` segue a configuração de controladores da
[fachada](contracts/core-api.md). `prepareInputs` agrega erros de comandos e
controladores conforme o contrato, chama `bindingsFor` apenas para robôs
elegíveis e devolve os controladores na ordem do mundo. `createControllerRunner`
fornece os vínculos da API de cada robô. `run` executa as chamadas de um único
passo sobre o estado observado e devolve os comandos candidatos, os eventos e
os IDs recém-desativados. A fachada recria o runner no reset.

## Arquitetura

### Preparação e reset

1. `runHeadless` valida a contagem solicitada e carrega o mundo com o validador da S1.
2. `prepareSimulation` valida entradas e carrega controladores elegíveis na ordem do
   [contrato de erros](contracts/errors.md). Mensagens de carga preservam o detalhe original.
   Qualquer erro interrompe o início, após acumular todas as falhas previstas pelo ADR-014.
3. O adaptador analisa cada fonte em modo script ECMAScript 2025 e rejeita as construções
   assíncronas e importações do FR-009 antes da avaliação. Avalia o nível superior uma vez
   por carga em um compartimento próprio. Captura `setup` e `loop`, preserva suas variáveis
   e valida os callbacks antes de publicar o tick 0. O perfil abaixo vale desde a carga.
4. Somente depois da avaliação, vincular no compartimento as sete funções da API. Cada função
   recebe dados por cópia ou primitivo e opera com o quadro da chamada corrente. Revogar o
   quadro em `finally`. `createInitialState` publica as poses iniciais e o primeiro laser.
5. `reset()` percorre o mesmo carregamento com as fontes aceitas, ressemeia o PRNG,
   zera logs e eventos e prepara as leituras iniciais. A troca de estado e instâncias é
   atômica. O próximo passo chama `setup()`.

### Perfil de execução síncrona

- No bootstrap que usa scripts, substituir a chamada única a `lockdown()` pelas suas duas
  etapas públicas. Chamar `repairIntrinsics()`, remover `Array.fromAsync` do intrínseco
  compartilhado e só então chamar `hardenIntrinsics()`. Conferir a remoção antes de
  disponibilizar o motor. Essa atenuação afeta o mesmo intrínseco no host inicializado.
- Antes de avaliar cada fonte, tornar indisponíveis os globais `Promise`, `queueMicrotask`,
  `setTimeout`, `setInterval`, `WeakRef`, `FinalizationRegistry`, `AsyncIterator`,
  `AsyncDisposableStack` e `WebAssembly` no compartimento. Bloquear `eval`, `Function` e
  `Compartment` para impedir avaliação dinâmica e criação de novos compartimentos pelo
  script. Os bloqueios são propriedades do ambiente do controlador, inclusive no reset.
  Preservar a supressão de `SharedArrayBuffer` e `Atomics` já feita por SES, assim como
  o bloqueio de hora corrente e de `Math.random`. Expor apenas as sete funções da API durante
  as chamadas autorizadas e não passar objetos do host com capacidades de agendamento.
- A verificação de disponibilidade deve abranger os globais e `Array.fromAsync`.
  Rodar o mesmo mundo, scripts e semente em lote e em passos separados por pontos de
  processamento da fila do host, sem temporizador real. Comparar estados, eventos e
  histórico exatamente em Node e na fixture do navegador. [Pesquisa R1](research.md#r1--runtime-javascript-e-fronteira-síncrona)

### Um passo de `k` para `k + 1`

1. Se o estado está `finalizada`, devolver o próprio snapshot. Um lote de avanço para
   ao alcançar o fim. No modo livre, prosseguir até a quantidade pedida.
2. Ler sensores e odometria do snapshot `k`. Para cada robô ativo na ordem do mundo,
   chamar `setup()` no primeiro passo e `loop()` em cada passo. Ambas leem a mesma pose
   `k`. A API publica eventos com tick `k + 1`.
3. Manter o último `setSpeed` válido pendente no passo. Sem novo comando, usar o comando
   efetivo anterior ou o comando constante, conforme a entrada. Marcar argumento inválido
   mesmo quando capturado pelo script. Se houver falha, descartar o comando pendente e aplicar
   `(0, 0)`, preservando os eventos já emitidos. Uma falha de `setup()` suprime `loop()`.
4. Aplicar a física da S1 com comandos explícitos. Extrair a transformação física se
   necessário para compartilhar a geometria entre a fachada e o `step` público. Saturar os
   comandos, integrar, resolver contatos, paredes e obstáculos, atualizar bumper e odometria
   e calcular o tempo por multiplicação.
5. Avaliar a modalidade com centros das poses resolvidas. Em `sumo`, primeiro verificar
   saída simples, depois simultânea, depois o limite de ticks. Acrescentar `fim_da_luta`
   depois dos eventos dos robôs, com `robotId: null`. O estado final inclui a leitura
   calculada a partir dessas posições.
6. Congelar a evolução lógica daquele snapshot. Acrescentar uma entrada ao histórico
   opcional apenas quando o tick avançou. Novos eventos preservam a lista dos snapshots
   anteriores. Em `free`, publicar `em_andamento` e resultado nulo.

### Geometria e precisão

- Ângulo relativo `-fov/2 + k * fov/(N - 1)` para `N > 1` e zero para `N = 1`.
  Somar a orientação real do robô. Normalizar a direção, representar direções cardinais
  exatas sem resíduo trigonométrico e copiar o valor do primeiro raio para o último se
  `fov = 2π`. Todos partem do centro.
- Nos retângulos, intersectar os intervalos fechados por eixo. Um eixo paralelo só
  contribui com intervalo ilimitado se a origem pertence à faixa. Contato tangente,
  alinhamento com um lado e canto contam. Para paredes, usar a fronteira de saída quando
  a origem está dentro do mapa. Para obstáculo, usar a entrada, limitada a zero se já
  houver contato ou sobreposição.
- Para um círculo, usar a projeção do vetor origem → centro sobre a direção unitária e a
  distância perpendicular. Origem sobre ou dentro dá zero. Para origem externa, ignorar
  projeção negativa ou distância perpendicular maior que o raio. O menor parâmetro
  positivo ou nulo do círculo é a projeção menos a raiz do discriminante geométrico.
- O mínimo inclui paredes, obstáculos e os outros robôs, inclusive desativados. Ignorar
  o emissor e a arena. Inicializar o mínimo em `maxRange`. Não usar a tolerância de aceite
  nas decisões geométricas ou na comparação estrita de saída da arena.

## Mapeamento requisito → módulo

| Requisitos S2 | Como serão atendidos |
|---|---|
| FR-001 a FR-003 | Configuração já normalizada por `core/world`. `sensors/laser.ts` distribui ângulos e origens. |
| FR-004 a FR-006 | `math/ray.ts` intersecta paredes, obstáculos e círculos, com alcance e sobreposição tratados por `sensors/laser.ts`. |
| FR-007 e FR-008 | `sim/state.ts` e `sim/simulation.ts` publicam laser das poses de cada estado. A API recebe cópia da leitura inicial. |
| FR-009 e FR-010 | `runtime/controller-engine.ts` carrega as funções. A fachada associa entradas e usa comando zero por padrão. |
| FR-011 e FR-012 | `api/prepare-simulation.ts` e `controller/inputs.ts` agregam erros e carregam fontes elegíveis. |
| FR-013 a FR-015 | `controller/runner.ts` chama callbacks na ordem do mundo. `sim/simulation.ts` controla o ciclo de vida e o reset. |
| FR-016 a FR-020 | `controller/api.ts` usa o quadro observado, retorna cópias e prepara os comandos. A cinemática S1 satura e aplica. |
| FR-021 | `controller/random.ts` implementa R4 e ressemeia no reset. |
| FR-022 a FR-024 | `controller/api.ts` atribui tick e ID e limita logs. `controller/runner.ts` revoga o quadro e o adaptador restringe capacidades. |
| FR-025 a FR-027 | `controller/runner.ts` zera e desativa. O passo puro S1 continua processando todos os corpos. |
| FR-028 a FR-031 | `match/sumo.ts` decide pela pose final. `sim/state.ts` publica resultado e evento da partida. |
| FR-032 e FR-033 | `sim/simulation.ts` encerra avanços em luta finalizada, guarda apenas ticks executados e mantém modo livre em andamento. |
| FR-034 | `core/types.ts` e `sim/state.ts` definem snapshots consumidos por biblioteca, CLI e S3. |
| FR-035 e FR-036 | `examples/worlds` e `examples/controllers` fornecem as entradas dos Anexos C e D, validadas pela API pública. |

## Qualidade e automação

| Itens | Evidência documental e validação prevista |
|---|---|
| CHK001 a CHK005 | Contratos de [controlador](contracts/controller-api.md), [estado](contracts/state.md) e [histórico](contracts/core-api.md). Cenários de leitura inicial e final, reset, erros simultâneos e resultado. |
| CHK006 a CHK009 | [Catálogo](contracts/errors.md) com ADR-014, testes de fronteira e prioridade do sumô, robô desativado empurrado e exemplo livre em `free`. |
| CHK010 e CHK011 | [Pesquisa R4/R6](research.md), [quickstart](quickstart.md) e repetição integral de estados e eventos. |
| CHK012 a CHK014 | Mapa FR → módulo, Anexo F da spec, [consumo pela S3](contracts/state.md#consumo-pela-s3) e premissa externa no contexto técnico. |

- Nomear os testes `S2-US<n>-AC<m>` conforme a história e a posição do critério na spec, cobrindo
  os 48 critérios. Tolerância padrão S1 para distâncias e ângulos. Estados e eventos de
  execuções repetidas são comparados por igualdade.
- Cobrir funções de geometria, PRNG, erros, escopo da API e limite de logs com testes unitários.
  Executar os testes de integração do motor em processo isolado para evitar que `lockdown()`
  altere a execução do Vitest compartilhado. Exercitar SES sobre um build Vite no navegador.
- Manter lint, tipos, testes e cobertura na CI de push e PR. Rodar o build e a verificação
  em navegador no quickstart. Preservar relatórios e README gerados pelos scripts da S1.
  Ampliações de expectativas da S1 devem manter as asserções antigas e acrescentar os novos
  campos quando necessário.
- As regressões S1-US3-AC1 e S1-US3-AC4 pedem janelas fixas usando o Duelo padrão. As
  fixtures dessas regressões e do teste físico de cruzamento da arena passam a usar
  `match.mode = "free"`, mantendo arena, poses, comandos, contagens e asserções. Os novos
  testes de sumô cobrem o encerramento e a truncagem do histórico.
- O `bench` existente usa a geometria e os comandos de referência da S1 em modo livre,
  com 3 000 ticks efetivos. O benchmark da S2 usa as condições de SC-003 e o modo sumô.
- Os scripts expõem os construtores de entrada abaixo. Importe esses módulos
  sem iniciar a medição. A entrada S1
  troca apenas `match.mode` para `free` no JSON do Duelo e usa os comandos constantes
  `vermelho: { v: 1, w: 0 }` e `azul: { v: 0.4, w: 0.1 }`. A entrada S2 preserva
  o texto do mundo, usa `history: false`, Parado em `vermelho`, Girador em `azul`
  e o motor recebido. Ambas solicitam 3 000 ticks.

  ```ts
  // scripts/bench.ts
  export function createS1BenchmarkInput(world: string): HeadlessInput;

  // scripts/bench-s2.ts
  export function createS2BenchmarkInput(
    world: string,
    sources: { parado: string; girador: string },
    controllerEngine: ControllerEngine,
  ): HeadlessInput;
  ```

- Validar SC-001, SC-002 e SC-004 pela suíte. Medir SC-003 via `bench:s2` e registrar
  ambiente e tempo. Validar SC-005 com a atividade de escrever uma estratégia a partir de
  Caçador consultando o Anexo B. O quickstart cobre a entrega sem interface.

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Efeito da inicialização SES e da remoção de `Array.fromAsync` nos intrínsecos do host | Bootstrap explícito uma vez no ponto de entrada que usa scripts. Regressão CLI, execução isolada nos testes e smoke do Vite antes de integrar à S3. |
| Código lento, laço infinito ou alocação excessiva | Manter o recorte de controladores confiáveis da spec. Testar scripts de referência terminantes e evitar limites dependentes de relógio. |
| Historizar muitos ticks e copiar eventos | Histórico opcional, compartilhamento de listas sem alterações e uma concatenação por publicação quando houver eventos. |
| Diferenças de ponto flutuante ou geometria em bordas | Testes de tangência, raio central, direções cardinais, igualdade estrita da arena e comparação com o núcleo da S1. |
| Forma da suíte externa ainda desconhecida | Manter as duas portas da S1 e contratos versionados. Atualizar a premissa quando Q-001 for respondida. |

## Complexidade

Nenhuma exceção. O plano separa o adaptador de JavaScript para manter o núcleo determinístico
e reutiliza as interfaces, geometria e automação da S1. A decomposição em tasks pertence à
etapa seguinte.

## Impasse (ADR-018)

O estado opcional stall guarda prazo, tick de referência e centros. Inicializar junto com o mundo e atualizar somente a partir das poses corrigidas do passo. A política fica em core/match. Avaliar o prazo após as condições ordinárias. O chamador headless decide o que fazer com o resultado terminal.
