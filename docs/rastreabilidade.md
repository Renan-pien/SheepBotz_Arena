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

Os 48 cenários estão indexados por tarefa e arquivo na
[matriz de critérios de aceite da Spec 002](../specs/002-sensores-controlador/tasks.md#critérios-de-aceite).

| Origem | FR | Tasks e commits | Testes | Status |
|---|---|---|---|---|
| RB-32 | S2-FR-001 | S2-T009 (`e5b2404`), S2-T011 (`276c590`), S2-T013 (`2c8a350`), S2-T014 (`9b1bf14`) | [S2-US1-AC8](../tests/core/acceptance/s2/us1-laser-inicial.test.ts), [Configuração da varredura](../tests/core/unit/laser.test.ts) | Validado localmente |
| RB-32 | S2-FR-002 | S2-T009 (`e5b2404`), S2-T011 (`276c590`), S2-T013 (`2c8a350`) | [S2-US1-AC1 e S2-US1-AC2](../tests/core/acceptance/s2/us1-laser-inicial.test.ts), [Leque completo e raio único](../tests/core/unit/laser.test.ts) | Validado localmente |
| RB-32 | S2-FR-003 | S2-T009 (`e5b2404`), S2-T011 (`276c590`), S2-T013 (`2c8a350`) | [S2-US1-AC5 e S2-US1-AC7](../tests/core/acceptance/s2/us1-laser-inicial.test.ts) | Validado localmente |
| RB-32, ADR-003 | S2-FR-004 | S2-T009 (`e5b2404`), S2-T011 (`276c590`), S2-T012 (`1eb8320`), S2-T013 (`2c8a350`) | [S2-US1-AC1 a S2-US1-AC3, S2-US1-AC5, S2-US1-AC7 e S2-US1-AC8](../tests/core/acceptance/s2/us1-laser-inicial.test.ts), [Interseções](../tests/core/unit/raycast.test.ts) | Validado localmente |
| RB-32 | S2-FR-005 | S2-T009 (`e5b2404`), S2-T011 (`276c590`), S2-T012 (`1eb8320`), S2-T013 (`2c8a350`) | [S2-US1-AC4 e S2-US1-AC6](../tests/core/acceptance/s2/us1-laser-inicial.test.ts) | Validado localmente |
| RB-32 | S2-FR-006 | S2-T011 (`276c590`), S2-T012 (`1eb8320`), S2-T013 (`2c8a350`) | [Origem dentro de retângulo e círculo](../tests/core/unit/raycast.test.ts) | Validado localmente |
| RB-27, ADR-009 | S2-FR-007 | S2-T010 (`2dce3c9`), S2-T014 (`9b1bf14`), S2-T015 (`a1aa733`), S2-T016 (`e258330`), S2-T036 (`d0389e5`) | [S2-US1-AC10](../tests/core/acceptance/s2/us1-laser-tick.test.ts), [Paridade em passos e lote](../tests/runtime/fixtures/controller-browser/main.ts) | Validado localmente |
| RB-45, ADR-009 | S2-FR-008 | S2-T010 (`2dce3c9`), S2-T014 (`9b1bf14`), S2-T016 (`e258330`), S2-T021 (`c109b73`), S2-T024 (`1b966a9`) | [S2-US1-AC9 a S2-US1-AC11](../tests/core/acceptance/s2/us1-laser-tick.test.ts), [S2-US3-AC5](../tests/core/acceptance/s2/us3-resultado.test.ts) | Validado localmente |
| RB-35, ADR-016 | S2-FR-009 | S2-T003 (`ffc0cd9`), S2-T004 (`a8f4c0e`), S2-T007 (`e0d65a4`), S2-T008 (`ef556ed`), S2-T016 (`e258330`) | [Perfil e formas de script](../tests/runtime/controller-engine.test.ts), [S2-US4-AC2](../tests/core/acceptance/s2/us4-preparacao.test.ts) | Validado localmente |
| RB-35 | S2-FR-010 | S2-T004 (`a8f4c0e`), S2-T008 (`ef556ed`), S2-T016 (`e258330`) | [Robô sem comando ou script](../tests/core/acceptance/s2/us4-preparacao.test.ts) | Validado localmente |
| RB-43, ADR-014 | S2-FR-011 | S2-T004 (`a8f4c0e`), S2-T008 (`ef556ed`), S2-T016 (`e258330`), S2-T034 (`4b1d29d`), S2-T035 (`94d62b6`) | [S2-US4-AC7, S2-US4-AC11 e S2-US4-AC12](../tests/core/acceptance/s2/us4-preparacao.test.ts), [Erros JSON da CLI](../tests/cli/run-cli.test.ts) | Validado localmente |
| RB-35, RB-43, ADR-010, ADR-012, ADR-014, ADR-016 | S2-FR-012 | S2-T003 (`ffc0cd9`), S2-T004 (`a8f4c0e`), S2-T007 (`e0d65a4`), S2-T008 (`ef556ed`), S2-T016 (`e258330`), S2-T034 (`4b1d29d`), S2-T035 (`94d62b6`) | [S2-US4-AC1, S2-US4-AC2, S2-US4-AC8 a S2-US4-AC10 e S2-US4-AC12](../tests/core/acceptance/s2/us4-preparacao.test.ts), [Falhas de carga na resposta](../tests/cli/run-cli.test.ts) | Validado localmente |
| RB-35 | S2-FR-013 | S2-T005 (`6e99a4f`), S2-T010 (`2dce3c9`), S2-T015 (`a1aa733`), S2-T016 (`e258330`) | [S2-US2-AC7](../tests/core/acceptance/s2/us2-ciclo.test.ts), [S2-US1-AC10](../tests/core/acceptance/s2/us1-laser-tick.test.ts) | Validado localmente |
| RB-35 | S2-FR-014 | S2-T005 (`6e99a4f`), S2-T015 (`a1aa733`), S2-T016 (`e258330`) | [S2-US2-AC1 e S2-US2-AC7](../tests/core/acceptance/s2/us2-ciclo.test.ts) | Validado localmente |
| RB-35, ADR-010 | S2-FR-015 | S2-T005 (`6e99a4f`), S2-T010 (`2dce3c9`), S2-T016 (`e258330`), S2-T018 (`c393df8`), S2-T020 (`7158c3f`), S2-T029 (`0b65e1a`) | [S2-US2-AC8 e S2-US2-AC12](../tests/core/acceptance/s2/us2-ciclo.test.ts), [Reset do PRNG](../tests/core/acceptance/s2/us2-aleatoriedade.test.ts) | Validado localmente |
| RB-32, RB-35, ADR-009 | S2-FR-016 | S2-T010 (`2dce3c9`), S2-T015 (`a1aa733`), S2-T016 (`e258330`) | [S2-US1-AC9, S2-US1-AC10 e cópia](../tests/core/acceptance/s2/us1-laser-tick.test.ts) | Validado localmente |
| RB-34 | S2-FR-017 | S2-T017 (`8367ebe`), S2-T019 (`183209d`) | [S2-US2-AC6](../tests/core/acceptance/s2/us2-api.test.ts) | Validado localmente |
| RB-33 | S2-FR-018 | S2-T017 (`8367ebe`), S2-T019 (`183209d`) | [S2-US2-AC6 e cópia da odometria](../tests/core/acceptance/s2/us2-api.test.ts) | Validado localmente |
| RB-35 | S2-FR-019 | S2-T005 (`6e99a4f`), S2-T015 (`a1aa733`), S2-T017 (`8367ebe`), S2-T019 (`183209d`), S2-T026 (`37f92db`), S2-T028 (`4e94758`) | [S2-US2-AC4](../tests/core/acceptance/s2/us2-ciclo.test.ts), [S2-US2-AC2](../tests/core/acceptance/s2/us2-api.test.ts), [S2-US4-AC4](../tests/core/acceptance/s2/us4-falha-em-tick.test.ts) | Validado localmente |
| RB-35 | S2-FR-020 | S2-T017 (`8367ebe`), S2-T019 (`183209d`) | [S2-US2-AC3 e S2-US2-AC9](../tests/core/acceptance/s2/us2-api.test.ts) | Validado localmente |
| RB-27 | S2-FR-021 | S2-T018 (`c393df8`), S2-T020 (`7158c3f`) | [S2-US2-AC10 e independência por robô](../tests/core/acceptance/s2/us2-aleatoriedade.test.ts), [Vetores de referência](../tests/core/unit/controller-random.test.ts) | Validado localmente |
| RB-35 | S2-FR-022 | S2-T005 (`6e99a4f`), S2-T015 (`a1aa733`) | [S2-US2-AC11](../tests/core/acceptance/s2/us2-ciclo.test.ts), [Limite e aviso único](../tests/core/unit/controller-cycle.test.ts) | Validado localmente |
| RB-27 | S2-FR-023 | S2-T005 (`6e99a4f`), S2-T015 (`a1aa733`) | [S2-US2-AC11](../tests/core/acceptance/s2/us2-ciclo.test.ts) | Validado localmente |
| RB-27, RB-35, ADR-010, ADR-016 | S2-FR-024 | S2-T003 (`ffc0cd9`), S2-T004 (`a8f4c0e`), S2-T005 (`6e99a4f`), S2-T007 (`e0d65a4`), S2-T015 (`a1aa733`), S2-T036 (`d0389e5`) | [Perfil síncrono](../tests/runtime/controller-engine.test.ts), [S2-US4-AC9](../tests/core/acceptance/s2/us4-preparacao.test.ts), [Lote e passos entre microtarefas](../tests/core/acceptance/s2/us2-ciclo.test.ts), [Fixture Chromium](../tests/runtime/fixtures/controller-browser/main.ts) | Validado localmente |
| RB-35 | S2-FR-025 | S2-T026 (`37f92db`), S2-T027 (`ecb4fa2`), S2-T028 (`4e94758`), S2-T029 (`0b65e1a`) | [S2-US4-AC3 e S2-US4-AC5](../tests/core/acceptance/s2/us4-falha-em-tick.test.ts), [S2-US4-AC6](../tests/core/acceptance/s2/us4-desativado-sumo.test.ts) | Validado localmente |
| RB-35 | S2-FR-026 | S2-T026 (`37f92db`), S2-T027 (`ecb4fa2`), S2-T028 (`4e94758`), S2-T029 (`0b65e1a`) | [S2-US4-AC3 a S2-US4-AC5](../tests/core/acceptance/s2/us4-falha-em-tick.test.ts), [S2-US4-AC6](../tests/core/acceptance/s2/us4-desativado-sumo.test.ts) | Validado localmente |
| RB-25, RB-31, ADR-003 | S2-FR-027 | S2-T027 (`ecb4fa2`), S2-T029 (`0b65e1a`) | [S2-US4-AC6](../tests/core/acceptance/s2/us4-desativado-sumo.test.ts) | Validado localmente |
| RB-25, ADR-003 | S2-FR-028 | S2-T021 (`c109b73`), S2-T022 (`0b11364`), S2-T023 (`79411f4`) | [S2-US3-AC1 e S2-US3-AC3](../tests/core/acceptance/s2/us3-resultado.test.ts), [S2-US3-AC7](../tests/core/acceptance/s2/us3-historico.test.ts) | Validado localmente |
| ADR-003 | S2-FR-029 | S2-T021 (`c109b73`), S2-T023 (`79411f4`) | [S2-US3-AC9](../tests/core/acceptance/s2/us3-resultado.test.ts) | Validado localmente |
| ADR-003 | S2-FR-030 | S2-T021 (`c109b73`), S2-T023 (`79411f4`), S2-T024 (`1b966a9`), S2-T037 (`1a0c298`), S2-T038 (`50efdc2`) | [S2-US3-AC1 a S2-US3-AC4 e S2-US3-AC10](../tests/core/acceptance/s2/us3-resultado.test.ts), [S2-SC-003](../tests/scripts/bench-s2.test.ts) | Validado localmente |
| RB-25, ADR-013 | S2-FR-031 | S2-T021 (`c109b73`), S2-T024 (`1b966a9`), S2-T034 (`4b1d29d`), S2-T035 (`94d62b6`) | [S2-US3-AC1 a S2-US3-AC5](../tests/core/acceptance/s2/us3-resultado.test.ts), [Evento global sem ID de robô](../tests/cli/run-cli.test.ts) | Validado localmente |
| RB-43, ADR-011 | S2-FR-032 | S2-T022 (`0b11364`), S2-T025 (`f9a6e10`), S2-T034 (`4b1d29d`), S2-T035 (`94d62b6`) | [S2-US3-AC6 e S2-US3-AC8](../tests/core/acceptance/s2/us3-historico.test.ts), [Histórico truncado](../tests/cli/run-cli.test.ts) | Validado localmente |
| RB-25, ADR-003 | S2-FR-033 | S2-T022 (`0b11364`), S2-T023 (`79411f4`), S2-T025 (`f9a6e10`), S2-T031 (`a86ee37`), S2-T037 (`1a0c298`), S2-T038 (`50efdc2`) | [S2-US3-AC7](../tests/core/acceptance/s2/us3-historico.test.ts), [S2-US5-AC3](../tests/core/acceptance/s2/us5-controladores.test.ts), [Janela livre de 3 000 ticks](../tests/scripts/bench-s2.test.ts) | Validado localmente |
| RB-43, RB-45 | S2-FR-034 | S2-T010 (`2dce3c9`), S2-T014 (`9b1bf14`), S2-T021 (`c109b73`), S2-T024 (`1b966a9`), S2-T026 (`37f92db`), S2-T029 (`0b65e1a`), S2-T034 (`4b1d29d`), S2-T035 (`94d62b6`) | [S2-US1-AC10 e S2-US1-AC11](../tests/core/acceptance/s2/us1-laser-tick.test.ts), [S2-US3-AC5](../tests/core/acceptance/s2/us3-resultado.test.ts), [S2-US4-AC3 a S2-US4-AC5](../tests/core/acceptance/s2/us4-falha-em-tick.test.ts), [Serialização do estado](../tests/cli/run-cli.test.ts) | Validado localmente |
| RB-25 | S2-FR-035 | S2-T030 (`5515d40`), S2-T032 (`569c428`) | [S2-US5-AC1](../tests/core/acceptance/s2/us5-mundos.test.ts) | Validado localmente |
| RB-25 | S2-FR-036 | S2-T031 (`a86ee37`), S2-T033 (`acb941c`) | [S2-US5-AC2, S2-US5-AC3 e comportamento dos cinco scripts](../tests/core/acceptance/s2/us5-controladores.test.ts) | Validado localmente |

## Spec 003 — Visualização 3D e operação

| RB | FR | Tasks | Testes | Status |
|---|---|---|---|---|
| — | — | — | — | Aguardando tasks |
