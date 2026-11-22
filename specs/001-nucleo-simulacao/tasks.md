# Tasks: Mundo e Núcleo de Simulação

**Spec:** 001 · **Entrada:** `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`
**Formato:** `- [ ] T### [P?] [US#] Descrição — arquivos — requisitos`
- `[P]`: pode rodar em paralelo (arquivos diferentes, sem dependência pendente).
- `[US#]`: user story da spec. Tasks de setup e acabamento não têm user story e citam o requisito do briefing ou o critério de sucesso.

**Commits:** um por task, no formato do AGENTS.md §7.3. Exemplo:

```
feat(S1-T026): implementa saturação e integração de Euler

Requisitos: S1-FR-019, S1-FR-020
```

Tasks de setup usam `chore` ou `ci` e citam o RB (ex.: `Requisitos: RB-08`).

**Testes de aceitação:** um `it` por critério, com o ID global no início do nome (ex.: `S1-US2-AC4: …`), usando os valores exatos da spec e a tolerância de `tests/helpers/tolerance.ts`.

---

## Fase 1 — Setup

**Objetivo:** projeto rodando, com testes, cobertura, lint, validação de commits e CI.

- [X] T001 Inicializar o projeto: `package.json` com versões exatas e scripts `dev`, `build`, `preview`, `lint`, `typecheck`, `test`, `test:coverage`, `stats`, `sim` e `bench`; `.nvmrc` (24); `.gitignore` (`node_modules`, `dist`, `coverage`, `reports`); `tsconfig.json` estrito com `noUncheckedIndexedAccess`; `vite.config.ts`; `index.html`; `src/ui/main.tsx`; `src/ui/App.tsx` exibindo "SheepBotz Arena — em construção" — `package.json`, `.nvmrc`, `.gitignore`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/ui/*` — RB-10, ADR-008
- [X] T002 [P] Configurar o Vitest: ambiente `node` para `tests/core`, `tests/cli` e `tests/scripts`, e `jsdom` para `tests/ui`; cobertura v8 com reporters `text`, `json-summary` e `html` em `coverage/`; limites de 80% (linhas, instruções, funções e ramos) no projeto e 90% em `src/core/**`; exclusões apenas de `src/ui/main.tsx`, `src/cli/index.ts`, `src/core/types.ts` e arquivos de configuração; reporter JSON em `reports/test-results.json` — `vitest.config.ts` — RB-08
- [X] T003 [P] Teste de fumaça do placeholder da interface — `tests/ui/app.test.tsx` — RB-08
- [X] T004 [P] Configurar ESLint (flat config, typescript-eslint, react-hooks) e Prettier, com as regras de fronteira de `src/core` do research R11 — `eslint.config.js`, `.prettierrc.json` — RB-27, RB-28, S1-FR-037
- [X] T005 [P] Configurar commitlint e husky (`commit-msg`) com o cabeçalho e a regra da linha `Requisitos:` do research R12 — `commitlint.config.mjs`, `.husky/commit-msg` — RB-12
- [X] T006 Criar o script de estatísticas: lê `reports/test-results.json` e `coverage/coverage-summary.json`, reescreve a linha `**N testes · X% de cobertura**` do README (X = cobertura de linhas, arredondada para baixo), gera `docs/cobertura/resumo.md` e copia `coverage-summary.json` para `docs/cobertura/`; teste unitário da função que reescreve a linha — `scripts/update-stats.ts`, `tests/scripts/update-stats.test.ts` — RB-09
- [X] T007 Criar o workflow de CI para `push` e `pull_request`. Em ambos, rodar instalação, lint, verificação de tipos, testes com cobertura, commitlint no intervalo de commits do evento conforme o plan e `npm run stats`. Exigir resumo e JSON de cobertura versionados, conferir `git diff --exit-code README.md docs/cobertura` e publicar o HTML como artefato. Verificar que um commit inválido ou métricas desatualizadas fazem cada evento falhar — `.github/workflows/ci.yml` — RB-08, RB-09, RB-12

**Checkpoint:** `npm run lint`, `npm run typecheck` e `npm test` passam; CI verde.

---

## Fase 2 — Fundação (bloqueia todas as user stories)

- [X] T008 [P] Declarar os tipos públicos conforme `data-model.md` — `src/core/types.ts` — S1-FR-034
- [X] T009 [P] Criar os helpers de teste: `expectClose` (±0.001), `expectAngleClose` (por `angleDiff`), `expectPoseClose`; e o construtor do mundo-base de teste (mapa 4 × 4, modo livre, `dt` 0.1, robôs de raio 0.1, `maxLinearSpeed` 1.0, `maxAngularSpeed` 6.0), que gera o texto JSON com sobrescritas — `tests/helpers/tolerance.ts`, `tests/helpers/world-builder.ts` — S1-FR-040
- [X] T010 Escrever testes de ângulo: `normalizeAngle(7) ≈ 0.716815`, `normalizeAngle(3.5) ≈ −2.783185`, `normalizeAngle(−π) = π`, `normalizeAngle(π) = π`, `normalizeAngle(0) = 0`, `angleDiff(π, −π) = 0` — `tests/core/unit/angle.test.ts` — S1-FR-012, S1-FR-040
- [X] T011 Implementar `normalizeAngle` e `angleDiff` (research R5) — `src/core/math/angle.ts` — S1-FR-012
  Campos do modelo [`Pose.theta`](data-model.md#tipos-básicos).
- [X] T012 [P] Escrever testes de geometria: distância; ponto mais próximo de um retângulo para centro fora, sobre a borda e dentro — `tests/core/unit/geometry.test.ts` — S1-FR-027
- [X] T013 Implementar `distance` (com `Math.sqrt`) e `closestPointOnRect` — `src/core/math/geometry.ts` — S1-FR-027
- [X] T014 [P] Criar o mundo de exemplo idêntico ao Anexo A da spec — `examples/worlds/duelo-padrao.json` — S1-FR-001
- [X] T015 Criar as exportações iniciais (tipos, `normalizeAngle`, `angleDiff`) — `src/core/index.ts` — contracts/core-api.md

**Checkpoint:** fundação pronta; user stories podem começar.

---

## Fase 3 — US1: Descrever e validar um mundo (P1) 🎯 MVP

**Objetivo:** carregar arquivos de mundo e devolver o mundo normalizado ou todos os erros.
**Teste independente:** `loadWorld` com os arquivos da spec, sem executar ticks.

- [X] T016 [US1] Escrever os testes de aceitação S1-US1-AC1 a S1-US1-AC11, incluindo as duas variantes de posição do centro na arena — `tests/core/acceptance/s1/us1-world-validation.test.ts` — S1-FR-001 a S1-FR-012
- [X] T017 [P] [US1] Criar fixtures de mundos inválidos: um por código do Anexo C da spec (de `ARQUIVO_INVALIDO` a `REGRA_DA_MODALIDADE`) e `invalido-tres-erros.json` (`dt` 0.5, `seed` −1, `robots[0].radius` 0) — `tests/fixtures/worlds/*.json` — S1-SC-004
- [X] T018 [P] [US1] Escrever testes unitários por código de erro usando as fixtures (código, caminho e mensagem contendo o caminho) — `tests/core/unit/validate.test.ts` — S1-FR-003 a S1-FR-005, S1-SC-004
- [X] T019 [US1] Implementar códigos, criador de erro e mensagens de `contracts/errors.md` — `src/core/world/errors.ts` — S1-FR-003, S1-FR-004
  Campos do modelo [`ValidationError.code`, `ValidationError.path` e `ValidationError.message`](data-model.md#erros).
- [X] T020 [US1] Implementar a descrição declarativa dos campos do Anexo B (tipo, obrigatório, padrão, intervalo, inteiro, formato, limites de lista) — `src/core/world/schema.ts` — S1-FR-001, S1-FR-006
  Campos do modelo [`World.name`, `World.seed`, `World.dt`, `World.map`, `World.map.width`, `World.map.height`, `World.arena.radius`, `World.match.mode`, `World.match.maxTicks`, `World.obstacles`, `World.robots`, `Obstacle.id`, `Obstacle.x`, `Obstacle.y`, `Obstacle.width`, `Obstacle.height`, `RobotConfig.id`, `RobotConfig.initialPose`, `RobotConfig.radius`, `RobotConfig.maxLinearSpeed`, `RobotConfig.maxAngularSpeed`, `RobotConfig.color`, `LaserConfig.rays`, `LaserConfig.fov` e `LaserConfig.maxRange`](data-model.md#mundo-normalizado).
- [X] T021 [US1] Implementar a validação estrutural: `JSON.parse`, percorredor acumulando erros, campos desconhecidos, padrões, normalização de `theta`, cores padrão e `ID_DUPLICADO` — `src/core/world/validate.ts` — S1-FR-001 a S1-FR-007, S1-FR-012
  Campos do modelo [`World.arena`, `World.match`, `Obstacle.id`, `RobotConfig.id`, `RobotConfig.initialPose`, `RobotConfig.color` e `RobotConfig.laser`](data-model.md#mundo-normalizado) e [`Pose.theta`](data-model.md#tipos-básicos). Arena e laser ausentes são normalizados para `null`.
- [X] T022 [US1] Implementar as verificações geométricas sobre itens válidos conforme `contracts/world.md`. No modo sumô, comparar a distância do centro inicial de cada robô ao raio da arena, com igualdade permitida. A validação das paredes do mapa considera o corpo inteiro — `src/core/world/geometry-checks.ts` — S1-FR-007 a S1-FR-011, S1-FR-013, S1-FR-014
  Campos do modelo [`World.dt`, `World.map.width`, `World.map.height`, `World.arena`, `World.arena.radius`, `World.match.mode`, `World.obstacles`, `World.robots`, `RobotConfig.initialPose`, `RobotConfig.radius` e `RobotConfig.maxLinearSpeed`](data-model.md#mundo-normalizado).
- [X] T023 [US1] Implementar `loadWorld` e exportá-la — `src/core/world/load-world.ts`, `src/core/index.ts` — S1-FR-002
  Campos do modelo [`LoadWorldResult.ok`, `LoadWorldResult.world` e `LoadWorldResult.errors`](data-model.md#erros).

**Checkpoint:** S1-US1 passa por completo.

---

## Fase 4 — US2: Mover um robô de tração diferencial (P1)

**Objetivo:** robôs se movem por comandos constantes, com execução sem interface.
**Teste independente:** `runHeadless` com um robô e comando constante.

- [X] T024 [US2] Escrever os testes de aceitação S1-US2-AC1 a S1-US2-AC8, via `runHeadless` — `tests/core/acceptance/s1/us2-kinematics.test.ts` — S1-FR-018 a S1-FR-020, S1-FR-032
- [X] T025 [P] [US2] Escrever testes unitários de `saturate` e `integratePose` (um passo; θ normalizado) — `tests/core/unit/kinematics.test.ts` — S1-FR-019, S1-FR-020
- [X] T026 [US2] Implementar `saturate` e `integratePose` (fórmulas do FR-019 e FR-020) — `src/core/sim/kinematics.ts` — S1-FR-019, S1-FR-020, S1-FR-022
  Campos do modelo [`Pose.x`, `Pose.y`, `Pose.theta`, `Command.v` e `Command.w`](data-model.md#tipos-básicos) e [`RobotConfig.maxLinearSpeed` e `RobotConfig.maxAngularSpeed`](data-model.md#mundo-normalizado).
- [X] T027 [US2] Implementar `createInitialState` (tick 0, tempo 0, comando (0, 0), bumper falso, odometria igual à pose inicial) — `src/core/sim/state.ts` — S1-FR-015, S1-FR-018, S1-FR-034
  Campos do modelo [`SimState.tick`, `SimState.time`, `SimState.robots`, `RobotState.id`, `RobotState.pose`, `RobotState.command`, `RobotState.bumper` e `RobotState.odometry`](data-model.md#estado-da-simulação).
- [X] T028 [US2] Implementar `step` com as etapas 2, 3, 4 e 8 do FR-017; etapas 1, 5, 6, 7 e 9 como funções nomeadas sem efeito, documentadas, a serem preenchidas nas próximas user stories — `src/core/sim/step.ts` — S1-FR-017, S1-FR-021, S1-FR-023
- [X] T029 [US2] Implementar a fachada `createSimulation` (`getState`, `step`, `stepN` com `RangeError`, `reset`, `getHistory`). No reset com histórico habilitado, substituir a lista anterior por outra contendo apenas o estado do tick 0. Com histórico desabilitado, retornar lista vazia na consulta — `src/core/sim/simulation.ts` — S1-FR-015, S1-FR-038, S1-FR-039
  Campos do modelo [`SimState.tick`](data-model.md#estado-da-simulação) e [`SimulationOptions.history`](data-model.md#transições).
- [X] T030 [P] [US2] Escrever testes unitários de `runHeadless`: `ROBO_INEXISTENTE`, `COMANDO_INVALIDO`, acúmulo de erros, ticks inválidos (`RangeError`) e histórico — `tests/core/unit/run-headless.test.ts` — S1-FR-033, S1-FR-035
- [X] T031 [US2] Implementar `runHeadless` e exportar `createInitialState`, `step`, `createSimulation` e `runHeadless` — `src/core/api/run-headless.ts`, `src/core/index.ts` — S1-FR-032 a S1-FR-035
  Campos do modelo [`HeadlessInput.world`, `HeadlessInput.commands`, `HeadlessInput.ticks`, `HeadlessInput.history`, `HeadlessResult.ok`, `HeadlessResult.state`, `HeadlessResult.history` e `HeadlessResult.errors`](data-model.md#execução-sem-interface).

**Checkpoint:** S1-US1 e S1-US2 passam.

---

## Fase 5 — US3: Simulação determinística e controle do tempo (P1)

**Objetivo:** mesmas entradas, mesmos estados; reinício confiável; execução por terminal.
**Teste independente:** duas execuções comparadas estado a estado.

- [X] T032 [US3] Escrever os testes de aceitação S1-US3-AC1 a S1-US3-AC4. Comparar todos os estados por igualdade exata. Verificar o histórico imediatamente após o reset nos dois modos e comparar os 121 estados da repetição com os da execução original — `tests/core/acceptance/s1/us3-determinism.test.ts` — S1-FR-015, S1-FR-016, S1-FR-036, S1-FR-038
- [X] T033 [US3] Garantir tempo = tick × dt e recriar o estado inicial e o histórico conforme T029. Corrigir divergências detectadas em T032 — `src/core/sim/step.ts`, `src/core/sim/simulation.ts` — S1-FR-016, S1-FR-036, S1-FR-038
- [X] T034 [P] [US3] Escrever testes do comando de terminal: uso correto, `--command` repetido, `--history`, `--pretty`, mundo inválido (saída 1), argumento ausente ou arquivo inexistente (saída 2) — `tests/cli/run-cli.test.ts` — S1-FR-032, S1-FR-033
- [X] T035 [US3] Implementar `runCli(argv, io)` e o ponto de entrada; script `sim` com `tsx` (contracts/cli.md) — `src/cli/run-cli.ts`, `src/cli/index.ts`, `package.json` — S1-FR-032, S1-FR-033, RB-43

**Checkpoint:** MVP completo (US1 a US3): mundo validado, movimento, determinismo e execução por terminal.

---

## Fase 6 — US4: Colidir com paredes e obstáculos e sentir o bumper (P2)

**Objetivo:** robôs não atravessam paredes e obstáculos; bumper indica contato.
**Teste independente:** robô contra parede e contra obstáculo.

- [X] T036 [US4] Escrever os testes de aceitação S1-US4-AC1 a S1-US4-AC5 — `tests/core/acceptance/s1/us4-collisions.test.ts` — S1-FR-027 a S1-FR-030
- [X] T037 [P] [US4] Escrever testes unitários: caso `0 < d < r`; caso `d = 0` para cada lado e desempate esquerdo, direito, inferior, superior; limitação às paredes; contato registrado; orientação inalterada — `tests/core/unit/obstacles.test.ts` — S1-FR-021, S1-FR-027 a S1-FR-029
- [X] T038 [US4] Implementar `resolveObstaclesAndWalls` — `src/core/sim/obstacles.ts` — S1-FR-027 a S1-FR-029
- [X] T039 [US4] Preencher a etapa 6 e o bumper da etapa 7 em `step` — `src/core/sim/step.ts` — S1-FR-017, S1-FR-030

**Checkpoint:** S1-US1 a S1-US4 passam.

---

## Fase 7 — US5: Vários robôs e a regra do empurrão (P2)

**Objetivo:** robôs se empurram conforme a regra do FR-025.
**Teste independente:** dois robôs em contato com comandos constantes.

- [X] T040 [US5] Escrever os testes de aceitação S1-US5-AC1 a S1-US5-AC5 — `tests/core/acceptance/s1/us5-push.test.ts` — S1-FR-024 a S1-FR-026
- [X] T041 [P] [US5] Escrever testes unitários: direção pela posição do início do tick; centros coincidentes (`n = (1, 0)`); candidatos que se cruzam; ordem dos pares com 3 robôs; contato apenas com distância estritamente menor — `tests/core/unit/contacts.test.ts` — S1-FR-024, S1-FR-025
- [X] T042 [US5] Implementar `resolveRobotContacts` — `src/core/sim/contacts.ts` — S1-FR-024 a S1-FR-026
- [X] T043 [US5] Preencher a etapa 5 em `step`, antes da etapa 6, e incluir o contato entre robôs no bumper — `src/core/sim/step.ts` — S1-FR-017, S1-FR-030

**Checkpoint:** S1-US1 a S1-US5 passam.

---

## Fase 8 — US6: Odometria (P3)

**Objetivo:** pose estimada que ignora colisões e empurrões.
**Teste independente:** comparar pose real e odometria em movimento livre, na parede e no empurrão.

- [X] T044 [US6] Escrever os testes de aceitação S1-US6-AC1 a S1-US6-AC3 — `tests/core/acceptance/s1/us6-odometry.test.ts` — S1-FR-031
- [X] T045 [US6] Atualizar a odometria na etapa 7 de `step` com `integratePose` sobre a própria odometria e o comando efetivo — `src/core/sim/step.ts` — S1-FR-031

**Checkpoint:** toda a Spec 001 passa.

---

## Fase 9 — Acabamento

- [X] T046 [P] Criar o benchmark de 3 000 ticks com 2 robôs (fora da suíte de testes) — `scripts/bench.ts`, `package.json` — S1-SC-003
- [X] T047 [P] Criar teste de pureza que varre `src/core` e falha se encontrar `Math.random`, `Date`, `window`, `document` ou imports de `ui`/`cli` (redundância das regras de lint) — `tests/core/unit/purity.test.ts` — S1-FR-037
- [X] T048 Executar o `quickstart.md` do zero e corrigir divergências — vários — todos os FRs
- [X] T049 Atualizar o README (seção "Como rodar"), a seção S1 de `docs/rastreabilidade.md` e executar `npm run stats` — `README.md`, `docs/rastreabilidade.md`, `docs/cobertura/*` — RB-09, RB-12
- [X] T050 Registrar no pull request de fechamento o resultado do benchmark e do quickstart — [PR #2](https://github.com/Renan-pien/SheepBotz_Arena/pull/2) — S1-SC-001 a S1-SC-003

---

## Dependências

- **Fase 1 → Fase 2 → user stories.**
- **US1** não depende de outras user stories.
- **US2** depende de US1 (`loadWorld`).
- **US3** depende de US2.
- **US4** e **US5** dependem de US2; podem ser feitas em qualquer ordem, mas ambas alteram `step.ts` (fazer em sequência).
- **US6** depende de US2.
- **Fase 9** depende de todas.
- Dentro de cada user story: testes de aceitação e unitários **antes** da implementação.

## Oportunidades de paralelismo

- Fase 1: T002, T003, T004 e T005 juntos.
- Fase 2: T008, T009, T012 e T014 juntos.
- US1: T017 e T018 juntos, depois de T016.
- Testes unitários marcados `[P]` em cada fase podem ser escritos junto com os de aceitação.

## Estratégia

1. **MVP:** Fases 1 a 5 (US1, US2, US3). Parar, validar e fazer push.
2. **Incremento:** US4 → US5 → US6, com push e CI verde ao fim de cada uma.
3. **Fechamento:** Fase 9, DoD da spec (AGENTS.md §15.2), tag `spec-001-fechada`.

## Cobertura dos critérios de aceite

| User story | Critérios | Arquivo de teste |
|---|---|---|
| US1 | S1-US1-AC1 a AC11 | `us1-world-validation.test.ts` |
| US2 | S1-US2-AC1 a AC8 | `us2-kinematics.test.ts` |
| US3 | S1-US3-AC1 a AC4 | `us3-determinism.test.ts` |
| US4 | S1-US4-AC1 a AC5 | `us4-collisions.test.ts` |
| US5 | S1-US5-AC1 a AC5 | `us5-push.test.ts` |
| US6 | S1-US6-AC1 a AC3 | `us6-odometry.test.ts` |

Total de 36 critérios com testes de aceitação previstos, além dos testes unitários.

- [X] T051 [US1] Testar e implementar validação de saída e robô em `src/core/world/`, `src/core/types.ts` e `tests/core/acceptance/s1/maze-world.test.ts` — S1-FR-041, S1-US1-AC12.
