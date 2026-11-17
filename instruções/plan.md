# Plano de Implementação: Mundo e Núcleo de Simulação

**Spec:** 001 · **Branch:** `001-nucleo-simulacao` · **Data:** 2026-11-11
**Entrada:** `specs/001-nucleo-simulacao/spec.md`
**Anexos deste plano:** `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

---

## Resumo

Criar o projeto (Vite + React + TypeScript, testes, lint, commits, CI) e o **núcleo headless** do simulador: carregamento e validação do arquivo de mundo com o catálogo de erros da spec, estado inicial, passo de simulação puro em 9 etapas (cinemática de Euler, empurrão entre robôs, colisão com obstáculos e paredes, bumper e odometria), fachada de simulação (avançar, reiniciar, histórico) e execução sem interface por biblioteca e por comando de terminal.

A abordagem central é um **passo puro**: `step(world, state, commands) → novoEstado`, sem efeitos colaterais, sobre estados imutáveis. Isso torna o determinismo trivial de testar e prepara o replay da Spec 003.

---

## Contexto técnico

| Item | Valor |
|---|---|
| **Linguagem/versão** | TypeScript (modo estrito, `noUncheckedIndexedAccess`), alvo ES2022 |
| **Ambiente** | Node LTS 24 (arquivo `.nvmrc`), navegadores atuais |
| **Dependências principais** | Vite, React, React DOM (apenas placeholder nesta spec) |
| **Dependências de desenvolvimento** | Vitest, @vitest/coverage-v8, jsdom, @testing-library/react, ESLint, typescript-eslint, eslint-plugin-react-hooks, Prettier, @commitlint/cli, husky, tsx |
| **Armazenamento** | Nenhum. Arquivos de mundo são lidos como texto |
| **Testes** | Vitest: ambiente `node` para `tests/core` e `tests/cli`; `jsdom` para `tests/ui` |
| **Plataforma alvo** | Núcleo: Node e navegador. Interface: navegador desktop |
| **Tipo de projeto** | Aplicação web única com núcleo isolado (`src/core`) |
| **Metas de desempenho** | 3 000 ticks com 2 robôs em menos de 1 s (SC-003) |
| **Restrições** | Núcleo sem DOM, sem `Math.random`, sem `Date`, sem física pronta, sem I/O |
| **Escala** | Até 8 robôs e 100 obstáculos por mundo |

**Versões:** todas as dependências com versão exata (sem `^` ou `~`), na versão estável mais recente no momento do setup, com `package-lock.json` versionado.

---

## Constitution Check

| Princípio | Como este plano cumpre | Status |
|---|---|---|
| I. A especificação é o produto | Fórmulas da spec implementadas literalmente; contratos em `contracts/`; nenhum comportamento fora da spec | ✅ |
| II. Núcleo headless e determinístico | `src/core` sem DOM, relógio ou aleatoriedade; passo puro; tempo = tick × dt; teste de determinismo | ✅ |
| III. Física própria | Geometria, cinemática, empurrão e colisões em módulos próprios; nenhuma biblioteca de física | ✅ |
| IV. A interface apenas mostra e comanda | `src/ui` só tem um placeholder; ESLint proíbe `src/core` de importar `src/ui` ou `src/cli` | ✅ |
| V. Testes como contrato | TDD no núcleo; um teste por critério de aceite com ID global; limites de cobertura 80% (projeto) e 90% (`src/core`) | ✅ |
| VI. Rastreabilidade total | Tasks com US e FRs; commitlint com formato e linha `Requisitos:` | ✅ |
| VII. Simplicidade | Sem laser, controladores ou regras de sumô (Spec 002); sem abstrações antecipadas | ✅ |
| VIII. Interface clara | Mensagens de erro em pt-BR com caminho do campo | ✅ |
| IX. Modalidade como configuração | Núcleo só valida `match.mode`; regras da luta ficam para a Spec 002, em módulo próprio | ✅ |

**Exceções:** nenhuma.

---

## Estrutura do projeto

### Documentação desta feature

```
specs/001-nucleo-simulacao/
├── spec.md
├── plan.md              # este arquivo
├── research.md          # decisões técnicas
├── data-model.md        # entidades e tipos
├── quickstart.md        # como rodar e validar
├── contracts/
│   ├── core-api.md      # API pública do núcleo
│   ├── world.md         # mundo normalizado
│   ├── state.md         # estado da simulação
│   ├── errors.md        # catálogo de erros e mensagens
│   └── cli.md           # comando de terminal headless
└── tasks.md
```

### Código-fonte

```
/
├── .github/workflows/ci.yml
├── .husky/commit-msg
├── .nvmrc
├── commitlint.config.mjs
├── eslint.config.js
├── .prettierrc.json
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── scripts/
│   └── update-stats.ts            # linha do README e resumo de cobertura
├── examples/
│   └── worlds/
│       └── duelo-padrao.json      # Anexo A da spec
├── docs/cobertura/
│   ├── resumo.md                  # gerado por scripts/update-stats.ts
│   └── coverage-summary.json      # gerado
├── src/
│   ├── core/                      # núcleo headless (nunca importa ui ou cli)
│   │   ├── index.ts               # API pública (contracts/core-api.md)
│   │   ├── types.ts               # tipos públicos (data-model.md)
│   │   ├── math/
│   │   │   ├── angle.ts           # normalizeAngle, angleDiff
│   │   │   └── geometry.ts        # distância, ponto mais próximo no retângulo
│   │   ├── world/
│   │   │   ├── errors.ts          # códigos e mensagens
│   │   │   ├── schema.ts          # descrição declarativa dos campos (Anexo B)
│   │   │   ├── validate.ts        # validação estrutural + normalização
│   │   │   ├── geometry-checks.ts # FR-008 a FR-011
│   │   │   └── load-world.ts      # loadWorld(texto)
│   │   ├── sim/
│   │   │   ├── state.ts           # createInitialState
│   │   │   ├── kinematics.ts      # saturação e integração (FR-019, FR-020)
│   │   │   ├── contacts.ts        # empurrão (FR-024 a FR-026)
│   │   │   ├── obstacles.ts       # obstáculos e paredes (FR-027 a FR-029)
│   │   │   ├── step.ts            # passo puro em 9 etapas (FR-017)
│   │   │   └── simulation.ts      # fachada: step, stepN, reset, histórico
│   │   └── api/
│   │       └── run-headless.ts    # runHeadless (FR-032 a FR-035)
│   ├── cli/
│   │   ├── run-cli.ts             # runCli(argv, io): testável
│   │   └── index.ts               # ponto de entrada fino
│   └── ui/
│       ├── main.tsx               # bootstrap (excluído da cobertura)
│       └── App.tsx                # placeholder até a Spec 003
└── tests/
    ├── helpers/
    │   ├── tolerance.ts           # expectClose, expectAngleClose, expectPoseClose
    │   └── world-builder.ts       # mundo-base de teste
    ├── fixtures/worlds/           # mundos inválidos e de teste
    ├── core/
    │   ├── unit/
    │   └── acceptance/s1/         # um arquivo por user story
    ├── cli/
    └── ui/
```

**Decisão de estrutura:** projeto único com fronteiras garantidas por lint (ver `research.md`, R1 e R11).

---

## Arquitetura

### Camadas e dependências

```
src/ui  ──►  src/core  ◄──  src/cli
                ▲
             tests/*
```

`src/core` não importa nada de fora dele, exceto a biblioteca padrão de JavaScript (sem módulos `node:*`). `src/cli` é o único lugar que lê arquivos e escreve no terminal.

### O passo da simulação (FR-017)

`step(world, state, commands)` é uma função pura que devolve um novo estado. Etapas e módulos:

| Etapa (FR-017) | O que acontece nesta spec | Módulo |
|---|---|---|
| 1. Sensores | Nada a calcular (laser na Spec 002). Bumper e odometria já estão no estado | `step.ts` (gancho vazio) |
| 2. Comandos | Para cada robô, na ordem do mundo: comando do mapa `commands` se existir; senão, mantém o último comando do estado | `step.ts` |
| 3. Saturação | `saturate(command, robotConfig)` | `kinematics.ts` |
| 4. Movimento | `integratePose(pose, command, dt)` para todos, a partir das poses do início do tick | `kinematics.ts` |
| 5. Contato entre robôs | `resolveRobotContacts(posesIniciais, candidatas, raios)` | `contacts.ts` |
| 6. Obstáculos e paredes | `resolveObstaclesAndWalls(candidata, raio, obstáculos, mapa)` por robô | `obstacles.ts` |
| 7. Bumper e odometria | bumper = houve contato nas etapas 5 ou 6; odometria = `integratePose(odometria, comando, dt)` | `step.ts`, `kinematics.ts` |
| 8. Tempo | `tick + 1`; `time = tick × dt` | `step.ts` |
| 9. Regras da modalidade | Nada nesta spec (gancho vazio para a Spec 002) | `step.ts` |

**Comandos nesta spec:** a fachada recebe comandos constantes por `id` (`Record<string, Command>`). Como o comando persiste no estado, o comando constante é aplicado a cada tick. A Spec 002 substitui essa fonte pelos controladores, sem mudar `step`.

### Fachada de simulação

`createSimulation(world, options)` guarda o mundo, o estado atual e, opcionalmente, o histórico. Oferece `getState()`, `step()`, `stepN(n)` e `reset()`. `reset()` reconstrói o estado com `createInitialState(world)`, garantindo o mesmo estado inicial (FR-038).

### Validação do mundo

Duas fases, ambas acumulando erros numa lista:

1. **Estrutural** (`validate.ts`): percorre o documento com a descrição declarativa de `schema.ts`, verificando campos obrigatórios, desconhecidos, tipos, inteiros, formatos e intervalos; aplica padrões; normaliza `theta`; atribui cores padrão; detecta `ID_DUPLICADO`.
2. **Geométrica** (`geometry-checks.ts`): roda apenas sobre itens cujos campos envolvidos passaram na fase 1 (FR-007), verificando FR-008 a FR-011.

O resultado é `{ ok: true, world }` com o mundo normalizado ou `{ ok: false, errors }`.

---

## Mapeamento requisito → módulo

| Requisitos | Módulo |
|---|---|
| FR-001 a FR-007 | `world/schema.ts`, `world/validate.ts`, `world/errors.ts`, `world/load-world.ts` |
| FR-008 a FR-011 | `world/geometry-checks.ts`, `math/geometry.ts` |
| FR-012 | `math/angle.ts`, `world/validate.ts` |
| FR-013, FR-014 | `world/geometry-checks.ts`, `sim/obstacles.ts` |
| FR-015, FR-016, FR-018, FR-034 | `sim/state.ts`, `sim/step.ts` |
| FR-017, FR-021, FR-023 | `sim/step.ts` |
| FR-019, FR-020, FR-022 | `sim/kinematics.ts` |
| FR-024 a FR-026 | `sim/contacts.ts` |
| FR-027 a FR-029 | `sim/obstacles.ts`, `math/geometry.ts` |
| FR-030 | `sim/step.ts` |
| FR-031 | `sim/kinematics.ts`, `sim/step.ts` |
| FR-032, FR-033, FR-035 | `api/run-headless.ts`, `cli/run-cli.ts` |
| FR-036, FR-037 | Todo `src/core` + regras de lint + teste de determinismo |
| FR-038, FR-039 | `sim/simulation.ts` |
| FR-040 | `tests/helpers/tolerance.ts` |

---

## Qualidade e automação

- **Cobertura:** Vitest com provedor v8, métricas de linhas, instruções, funções e ramos. Limites: 80% global; 90% em `src/core/**`. Excluídos apenas: `src/ui/main.tsx`, `src/cli/index.ts`, arquivos de tipos e configuração.
- **Linha do README:** `scripts/update-stats.ts` lê `reports/test-results.json` (reporter JSON do Vitest) e `coverage/coverage-summary.json`, e reescreve a linha `**N testes · X% de cobertura**` (X = cobertura de linhas, arredondada para baixo) e `docs/cobertura/resumo.md`. Comando: `npm run stats`.
- **CI (`ci.yml`)** em todo push e pull request: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test:coverage`. Em pull requests, também: commitlint sobre os commits do PR e `npm run stats` seguido de `git diff --exit-code README.md docs/cobertura` (falha se o README estiver desatualizado). O relatório HTML de cobertura é publicado como artefato do CI.
- **Commits:** husky executa o commitlint no `commit-msg`.

---

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Divergência numérica entre implementações | Fórmulas literais da spec; `Math.sqrt(dx*dx + dy*dy)` em vez de `Math.hypot` (R4); testes com os números da spec |
| Tangências exatas decidindo resultados | Exemplos da spec evitam tangência; comparações estritas exatamente como na spec |
| Validação com erros em cascata | Fase geométrica só sobre campos válidos (FR-007) |
| Cobertura caindo com a interface | `src/ui` mínimo nesta spec, com teste de fumaça |
| README desatualizado | Gerado por script e conferido no CI |

---

## Complexidade

Nenhuma violação da constitution a justificar.
