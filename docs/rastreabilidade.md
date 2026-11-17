# Matriz de Rastreabilidade — SheepBotz Arena

> Cadeia obrigatória (AGENTS.md §7.2): `RB-##` → `FR-###` → `T###` → teste → commit.
> Atualizada no fechamento de cada spec. Nenhum FR pode ficar sem task e sem teste.

## Spec 001 — Mundo e núcleo de simulação

| Origem | FR | Tasks e commits | Testes | Status |
|---|---|---|---|---|
| RB-30 | S1-FR-001 | S1-T014 (`1835328`), S1-T016 (`86a3f7a`), S1-T020 (`2b8a8f5`), S1-T021 (`74dc996`) | [S1-US1-AC1](../tests/core/acceptance/s1/us1-world-validation.test.ts) | Validado localmente |
| RB-46 | S1-FR-002 | S1-T016 (`86a3f7a`), S1-T021 (`74dc996`), S1-T023 (`c959445`) | [S1-US1-AC2 e AC3](../tests/core/acceptance/s1/us1-world-validation.test.ts) | Validado localmente |
| RB-46 | S1-FR-003 | S1-T016 (`86a3f7a`), S1-T018 (`86a87cd`), S1-T019 (`54d9c59`), S1-T021 (`74dc996`) | [Validação unitária do mundo](../tests/core/unit/validate.test.ts) | Validado localmente |
| RB-46 | S1-FR-004 | S1-T016 (`86a3f7a`), S1-T018 (`86a87cd`), S1-T019 (`54d9c59`), S1-T021 (`74dc996`) | [Validação unitária do mundo](../tests/core/unit/validate.test.ts) | Validado localmente |
| RB-46 | S1-FR-005 | S1-T016 (`86a3f7a`), S1-T018 (`86a87cd`), S1-T021 (`74dc996`) | [S1-US1-AC8](../tests/core/acceptance/s1/us1-world-validation.test.ts) | Validado localmente |
| RB-30 | S1-FR-006 | S1-T016 (`86a3f7a`), S1-T020 (`2b8a8f5`), S1-T021 (`74dc996`) | [Valores padrão](../tests/core/unit/validate.test.ts) | Validado localmente |
| RB-46 | S1-FR-007 | S1-T016 (`86a3f7a`), S1-T021 (`74dc996`), S1-T022 (`3a9be1b`) | [Erros independentes](../tests/core/unit/validate.test.ts) | Validado localmente |
| RB-30 | S1-FR-008 | S1-T016 (`86a3f7a`), S1-T022 (`3a9be1b`) | [Limites de mapa e raio da arena](../tests/core/unit/validate.test.ts) | Validado localmente |
| RB-30, RB-31 | S1-FR-009 | S1-T016 (`86a3f7a`), S1-T022 (`3a9be1b`) | [Poses iniciais e sobreposição](../tests/core/unit/validate.test.ts) | Validado localmente |
| ADR-007, RB-31 | S1-FR-010 | S1-T016 (`86a3f7a`), S1-T022 (`3a9be1b`) | [S1-US1-AC10](../tests/core/acceptance/s1/us1-world-validation.test.ts) | Validado localmente |
| RB-25, ADR-003 | S1-FR-011 | S1-T016 (`86a3f7a`), S1-T022 (`3a9be1b`) | [S1-US1-AC11](../tests/core/acceptance/s1/us1-world-validation.test.ts) | Validado localmente |
| RB-31 | S1-FR-012 | S1-T010 (`68c6749`), S1-T011 (`8d051da`), S1-T016 (`86a3f7a`), S1-T021 (`74dc996`) | [Normalização e diferença angular](../tests/core/unit/angle.test.ts) | Validado localmente |
| RB-30 | S1-FR-013 | S1-T022 (`3a9be1b`) | [S1-US4-AC1](../tests/core/acceptance/s1/us4-collisions.test.ts) | Validado localmente |
| ADR-003 | S1-FR-014 | S1-T022 (`3a9be1b`) | [Travessia da borda da arena](../tests/core/acceptance/s1/us4-collisions.test.ts) | Validado localmente |
| RB-27 | S1-FR-015 | S1-T027 (`97cec88`), S1-T029 (`cc5ea28`), S1-T032 (`fc1ec3a`) | [S1-US3-AC2 e avanço de um tick](../tests/core/acceptance/s1/us3-determinism.test.ts) | Validado localmente |
| RB-27 | S1-FR-016 | S1-T032 (`fc1ec3a`), S1-T033 (`676724c`) | [S1-US3-AC3](../tests/core/acceptance/s1/us3-determinism.test.ts) | Validado localmente |
| RB-27 | S1-FR-017 | S1-T028 (`487241a`), S1-T039 (`ffc32de`), S1-T043 (`49165bd`) | [S1-US4-AC5](../tests/core/acceptance/s1/us4-collisions.test.ts) e [S1-US6-AC2](../tests/core/acceptance/s1/us6-odometry.test.ts) | Validado localmente |
| RB-31, ADR-007 | S1-FR-018 | S1-T024 (`8994722`), S1-T027 (`97cec88`) | [Estado inicial no histórico](../tests/core/unit/run-headless.test.ts) | Validado localmente |
| RB-31 | S1-FR-019 | S1-T024 (`8994722`), S1-T025 (`b8a66d6`), S1-T026 (`5ca11d9`) | [S1-US2-AC7](../tests/core/acceptance/s1/us2-kinematics.test.ts) | Validado localmente |
| RB-31 | S1-FR-020 | S1-T024 (`8994722`), S1-T025 (`b8a66d6`), S1-T026 (`5ca11d9`) | [S1-US2-AC1 a AC6](../tests/core/acceptance/s1/us2-kinematics.test.ts) | Validado localmente |
| RB-31, ADR-007 | S1-FR-021 | S1-T028 (`487241a`), S1-T037 (`8b832f0`) | [Orientação após colisão](../tests/core/unit/obstacles.test.ts) e [Orientação após empurrão](../tests/core/unit/contacts.test.ts) | Validado localmente |
| RB-31, ADR-007 | S1-FR-022 | S1-T026 (`5ca11d9`) | [Separação por soma dos raios](../tests/core/unit/contacts.test.ts) | Validado localmente |
| RB-27, ADR-007 | S1-FR-023 | S1-T028 (`487241a`) | [Ordem dos pares](../tests/core/unit/contacts.test.ts) e [Ordem dos robôs na carga](../tests/core/unit/validate.test.ts) | Validado localmente |
| RB-38, ADR-003 | S1-FR-024 | S1-T040 (`6667421`), S1-T041 (`68d3b06`), S1-T042 (`7607bbd`) | [Ordem dos pares e passada única](../tests/core/unit/contacts.test.ts) | Validado localmente |
| ADR-003 | S1-FR-025 | S1-T040 (`6667421`), S1-T041 (`68d3b06`), S1-T042 (`7607bbd`) | [Limiar, projeção e separação](../tests/core/unit/contacts.test.ts) | Validado localmente |
| ADR-003 | S1-FR-026 | S1-T040 (`6667421`), S1-T042 (`7607bbd`) | [S1-US5-AC1 a AC4](../tests/core/acceptance/s1/us5-push.test.ts) | Validado localmente |
| RB-31 | S1-FR-027 | S1-T012 (`2985cf7`), S1-T013 (`1bc7cd3`), S1-T036 (`7b37184`), S1-T037 (`8b832f0`), S1-T038 (`4647949`) | [Projeções e desempate](../tests/core/unit/obstacles.test.ts) | Validado localmente |
| RB-31 | S1-FR-028 | S1-T036 (`7b37184`), S1-T037 (`8b832f0`), S1-T038 (`4647949`) | [Limitação pelas paredes](../tests/core/unit/obstacles.test.ts) | Validado localmente |
| RB-31, ADR-007 | S1-FR-029 | S1-T036 (`7b37184`), S1-T037 (`8b832f0`), S1-T038 (`4647949`) | [S1-US4-AC1 a AC5](../tests/core/acceptance/s1/us4-collisions.test.ts) e [Paredes após obstáculos](../tests/core/unit/obstacles.test.ts) | Validado localmente |
| RB-34 | S1-FR-030 | S1-T036 (`7b37184`), S1-T039 (`ffc32de`), S1-T043 (`49165bd`) | [S1-US4-AC1 a AC5](../tests/core/acceptance/s1/us4-collisions.test.ts) e [S1-US5-AC1 e AC2](../tests/core/acceptance/s1/us5-push.test.ts) | Validado localmente |
| RB-33 | S1-FR-031 | S1-T044 (`77f6b9e`), S1-T045 (`bdd5eef`) | [S1-US6-AC1 a AC3](../tests/core/acceptance/s1/us6-odometry.test.ts) | Validado localmente |
| RB-27, RB-43 | S1-FR-032 | S1-T024 (`8994722`), S1-T031 (`601c7a6`), S1-T034 (`2790076`), S1-T035 (`1e7525e`) | [CLI headless](../tests/cli/run-cli.test.ts) e [S1-US2-AC1](../tests/core/acceptance/s1/us2-kinematics.test.ts) | Validado localmente |
| RB-43, RB-44 | S1-FR-033 | S1-T030 (`58535ee`), S1-T031 (`601c7a6`), S1-T034 (`2790076`), S1-T035 (`1e7525e`) | [Resultado e histórico](../tests/core/unit/run-headless.test.ts) | Validado localmente |
| RB-44 | S1-FR-034 | S1-T008 (`be4f63d`), S1-T027 (`97cec88`), S1-T031 (`601c7a6`) | [Estrutura do estado](../tests/core/unit/run-headless.test.ts) | Validado localmente |
| RB-43, ADR-007 | S1-FR-035 | S1-T030 (`58535ee`), S1-T031 (`601c7a6`) | [Erros de comandos](../tests/core/unit/run-headless.test.ts) | Validado localmente |
| RB-27 | S1-FR-036 | S1-T032 (`fc1ec3a`), S1-T033 (`676724c`) | [S1-US3-AC1 e AC4](../tests/core/acceptance/s1/us3-determinism.test.ts) | Validado localmente |
| RB-27 | S1-FR-037 | S1-T004 (`5f24fd0`), S1-T047 (`ea9da06`) | [Isolamento do núcleo](../tests/core/unit/purity.test.ts) | Validado localmente |
| RB-24 | S1-FR-038 | S1-T029 (`cc5ea28`), S1-T032 (`fc1ec3a`), S1-T033 (`676724c`) | [S1-US3-AC4](../tests/core/acceptance/s1/us3-determinism.test.ts) | Validado localmente |
| RB-24 | S1-FR-039 | S1-T029 (`cc5ea28`) | [Avanço isolado e consulta do estado](../tests/core/acceptance/s1/us3-determinism.test.ts) | Validado localmente |
| RB-44, Q-002 | S1-FR-040 | S1-T009 (`db0dff3`), S1-T010 (`68c6749`) | [Tolerância numérica da trajetória](../tests/core/acceptance/s1/us2-kinematics.test.ts) e [Diferença angular](../tests/core/unit/angle.test.ts) | Validado localmente |

## Spec 002 — Sensores, controlador e regras do sumô

| RB | FR | Tasks | Testes | Status |
|---|---|---|---|---|
| — | — | — | — | Aguardando tasks |

## Spec 003 — Visualização 3D e operação

| RB | FR | Tasks | Testes | Status |
|---|---|---|---|---|
| — | — | — | — | Aguardando tasks |
