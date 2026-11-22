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

Os 49 cenários estão indexados no [mapa de tarefas da S3](../specs/003-visualizacao-operacao/tasks.md#dependências-e-cobertura).

| Origem | FR | Tasks e commits | Testes | Status |
|---|---|---|---|---|
| RB-28 | S3-FR-001 | S3-T003 (`f704519`), S3-T004 (`85df2b1`), S3-T005 (`7c1f98e`), S3-T006 (`90daf33`), S3-T007 (`11c3c5f`), S3-T008 (`ae09f0b`) | [S3-US1-AC1, S3-US1-AC2, S3-US1-AC6](../tests/ui/s3/us1-cena.test.tsx), [S3-US2-AC1, S3-US2-AC5](../tests/ui/s3/us2-operacao.test.tsx) | Validado localmente |
| RB-28 | S3-FR-002 | S3-T003 (`f704519`), S3-T004 (`85df2b1`), S3-T005 (`7c1f98e`), S3-T006 (`90daf33`), S3-T011 (`d7a2d2f`), S3-T012 (`16059ff`) | [S3-US1-AC2](../tests/ui/s3/us1-cena.test.tsx), [S3-US4-AC2](../tests/ui/s3/us4-inspecao.test.tsx) | Validado localmente |
| RB-20, Constituição VIII | S3-FR-003 | S3-T011 (`d7a2d2f`), S3-T012 (`16059ff`) | [S3-US4-AC1, S3-US4-AC5, S3-US4-AC6](../tests/ui/s3/us4-inspecao.test.tsx) | Validado localmente |
| RB-27 | S3-FR-004 | S3-T007 (`11c3c5f`), S3-T008 (`ae09f0b`) | [S3-US2-AC5, S3-US2-AC6, S3-US2-AC7](../tests/ui/s3/us2-operacao.test.tsx) | Validado localmente |
| RB-21, RB-36 | S3-FR-005 | S3-T005 (`7c1f98e`), S3-T006 (`90daf33`) | [S3-US1-AC3, S3-US1-AC5](../tests/ui/s3/us1-cena.test.tsx) | Validado localmente |
| RB-36 | S3-FR-006 | S3-T005 (`7c1f98e`), S3-T006 (`90daf33`) | [S3-US1-AC1, S3-US1-AC7](../tests/ui/s3/us1-cena.test.tsx) | Validado localmente |
| RB-37 | S3-FR-007 | S3-T005 (`7c1f98e`), S3-T006 (`90daf33`) | [S3-US1-AC2](../tests/ui/s3/us1-cena.test.tsx) | Validado localmente |
| RB-37 | S3-FR-008 | S3-T005 (`7c1f98e`), S3-T006 (`90daf33`) | [S3-US1-AC6, S3-US1-AC9](../tests/ui/s3/us1-cena.test.tsx) | Validado localmente |
| RB-25, ADR-003 | S3-FR-009 | S3-T005 (`7c1f98e`), S3-T006 (`90daf33`) | [S3-US1-AC8, S3-US1-AC9](../tests/ui/s3/us1-cena.test.tsx) | Validado localmente |
| RB-36 | S3-FR-010 | S3-T005 (`7c1f98e`), S3-T006 (`90daf33`), S3-T018 (`755c56c`) | [S3-US1-AC4, S3-US1-AC5, S3-US1-AC10](../tests/ui/s3/us1-cena.test.tsx), [Quickstart em Chromium](../specs/003-visualizacao-operacao/quickstart.md#medição-de-referência-da-implementação) | Validado localmente |
| RB-36 | S3-FR-011 | S3-T005 (`7c1f98e`), S3-T006 (`90daf33`) | [S3-US1-AC5, S3-US1-AC10](../tests/ui/s3/us1-cena.test.tsx) | Validado localmente |
| RB-24 | S3-FR-012 | S3-T007 (`11c3c5f`), S3-T008 (`ae09f0b`) | [S3-US2-AC1, S3-US2-AC2, S3-US2-AC3, S3-US2-AC8](../tests/ui/s3/us2-operacao.test.tsx) | Validado localmente |
| RB-24 | S3-FR-013 | S3-T007 (`11c3c5f`), S3-T008 (`ae09f0b`) | [S3-US2-AC1, S3-US2-AC2, S3-US2-AC8](../tests/ui/s3/us2-operacao.test.tsx) | Validado localmente |
| RB-24 | S3-FR-014 | S3-T007 (`11c3c5f`), S3-T008 (`ae09f0b`) | [S3-US2-AC6](../tests/ui/s3/us2-operacao.test.tsx) | Validado localmente |
| RB-24, RB-27 | S3-FR-015 | S3-T007 (`11c3c5f`), S3-T008 (`ae09f0b`) | [S3-US2-AC7](../tests/ui/s3/us2-operacao.test.tsx) | Validado localmente |
| RB-24, RB-40 | S3-FR-016 | S3-T007 (`11c3c5f`), S3-T008 (`ae09f0b`) | [S3-US2-AC4, S3-US2-AC5](../tests/ui/s3/us2-operacao.test.tsx) | Validado localmente |
| RB-17, RB-24 | S3-FR-017 | S3-T007 (`11c3c5f`), S3-T008 (`ae09f0b`), S3-T013 (`b46566a`), S3-T015 (`4872aa3`), S3-T016 (`2be4b5f`), S3-T017 (`7573965`) | [S3-US2-AC9](../tests/ui/s3/us2-operacao.test.tsx), [S3-US5-AC4](../tests/ui/s3/us5-replay.test.tsx), [S3-US6-AC2](../tests/ui/s3/us6-apresentacao.test.tsx) | Validado localmente |
| RB-24 | S3-FR-018 | S3-T007 (`11c3c5f`), S3-T008 (`ae09f0b`) | [S3-US2-AC10](../tests/ui/s3/us2-operacao.test.tsx) | Validado localmente |
| RB-22 | S3-FR-019 | S3-T009 (`a85cb59`), S3-T010 (`111b6ed`) | [S3-US3-AC1, S3-US3-AC2](../tests/ui/s3/us3-controladores.test.tsx) | Validado localmente |
| RB-46 | S3-FR-020 | S3-T009 (`a85cb59`), S3-T010 (`111b6ed`) | [S3-US3-AC3](../tests/ui/s3/us3-controladores.test.tsx) | Validado localmente |
| RB-22, RB-23, ADR-003 | S3-FR-021 | S3-T003 (`f704519`), S3-T004 (`85df2b1`), S3-T009 (`a85cb59`), S3-T010 (`111b6ed`) | [S3-US3-AC1, S3-US3-AC2](../tests/ui/s3/us3-controladores.test.tsx) | Validado localmente |
| RB-24, ADR-003 | S3-FR-022 | S3-T003 (`f704519`), S3-T004 (`85df2b1`) | [S3-US1-AC1](../tests/ui/s3/us1-cena.test.tsx), [S3-US2-AC4](../tests/ui/s3/us2-operacao.test.tsx) | Validado localmente |
| RB-23 | S3-FR-023 | S3-T009 (`a85cb59`), S3-T010 (`111b6ed`) | [S3-US3-AC4, S3-US3-AC5, S3-US3-AC7, S3-US3-AC9](../tests/ui/s3/us3-controladores.test.tsx) | Validado localmente |
| RB-23, ADR-014 | S3-FR-024 | S3-T009 (`a85cb59`), S3-T010 (`111b6ed`) | [S3-US3-AC5, S3-US3-AC6, S3-US3-AC9](../tests/ui/s3/us3-controladores.test.tsx) | Validado localmente |
| RB-23, RB-39 | S3-FR-025 | S3-T009 (`a85cb59`), S3-T010 (`111b6ed`), S3-T011 (`d7a2d2f`), S3-T012 (`16059ff`) | [S3-US3-AC8](../tests/ui/s3/us3-controladores.test.tsx), [S3-US4-AC4](../tests/ui/s3/us4-inspecao.test.tsx) | Validado localmente |
| RB-39 | S3-FR-026 | S3-T011 (`d7a2d2f`), S3-T012 (`16059ff`) | [S3-US4-AC1, S3-US4-AC2, S3-US4-AC3](../tests/ui/s3/us4-inspecao.test.tsx) | Validado localmente |
| RB-39, ADR-013 | S3-FR-027 | S3-T011 (`d7a2d2f`), S3-T012 (`16059ff`) | [S3-US4-AC4](../tests/ui/s3/us4-inspecao.test.tsx) | Validado localmente |
| RB-25 | S3-FR-028 | S3-T011 (`d7a2d2f`), S3-T012 (`16059ff`), S3-T013 (`b46566a`), S3-T015 (`4872aa3`) | [S3-US4-AC5, S3-US4-AC6](../tests/ui/s3/us4-inspecao.test.tsx), [S3-US5-AC2](../tests/ui/s3/us5-replay.test.tsx) | Validado localmente |
| RB-40 | S3-FR-029 | S3-T008 (`ae09f0b`), S3-T013 (`b46566a`), S3-T014 (`c2d3dce`) | [S3-US5-AC1, S3-US5-AC10](../tests/ui/s3/us5-recording.test.tsx) | Validado localmente |
| RB-40 | S3-FR-030 | S3-T013 (`b46566a`), S3-T014 (`c2d3dce`) | [S3-US5-AC5](../tests/ui/s3/us5-replay.test.tsx), [S3-US5-AC8](../tests/ui/s3/us5-recording.test.tsx) | Validado localmente |
| RB-40 | S3-FR-031 | S3-T013 (`b46566a`), S3-T015 (`4872aa3`) | [S3-US5-AC2, S3-US5-AC3, S3-US5-AC4, S3-US5-AC11](../tests/ui/s3/us5-replay.test.tsx) | Validado localmente |
| RB-40 | S3-FR-032 | S3-T013 (`b46566a`), S3-T014 (`c2d3dce`), S3-T015 (`4872aa3`) | [S3-US5-AC5, S3-US5-AC6](../tests/ui/s3/us5-replay.test.tsx) | Validado localmente |
| RB-40 | S3-FR-033 | S3-T013 (`b46566a`), S3-T014 (`c2d3dce`), S3-T015 (`4872aa3`) | [S3-US5-AC7](../tests/ui/s3/us5-replay.test.tsx) | Validado localmente |
| RB-27, RB-40 | S3-FR-034 | S3-T013 (`b46566a`), S3-T014 (`c2d3dce`), S3-T018 (`755c56c`) | [S3-US5-AC8](../tests/ui/s3/us5-recording.test.tsx), [Quickstart em Chromium](../specs/003-visualizacao-operacao/quickstart.md#medição-de-referência-da-implementação) | Validado localmente |
| RB-40 | S3-FR-035 | S3-T013 (`b46566a`), S3-T015 (`4872aa3`) | [S3-US5-AC9](../tests/ui/s3/us5-replay.test.tsx) | Validado localmente |
| RB-17 | S3-FR-036 | S3-T016 (`2be4b5f`), S3-T017 (`7573965`) | [S3-US6-AC1, S3-US6-AC2](../tests/ui/s3/us6-apresentacao.test.tsx) | Validado localmente |
| RB-20, Constituição VIII | S3-FR-037 | S3-T006 (`90daf33`), S3-T016 (`2be4b5f`), S3-T017 (`7573965`) | [S3-US6-AC3](../tests/ui/s3/us6-apresentacao.test.tsx) | Validado localmente |
| RB-20, Constituição VIII | S3-FR-038 | S3-T016 (`2be4b5f`), S3-T017 (`7573965`), S3-T018 (`755c56c`) | [S3-US6-AC3](../tests/ui/s3/us6-apresentacao.test.tsx), [Quickstart em Chromium](../specs/003-visualizacao-operacao/quickstart.md#medição-de-referência-da-implementação) | Validado localmente |
| RB-20 | S3-FR-039 | S3-T016 (`2be4b5f`), S3-T017 (`7573965`), S3-T018 (`755c56c`) | [S3-US6-AC3](../tests/ui/s3/us6-apresentacao.test.tsx), [Quickstart em Chromium](../specs/003-visualizacao-operacao/quickstart.md#medição-de-referência-da-implementação) | Validado localmente |
| RB-24, RB-28, RB-40, ADR-017 | S3-FR-002, S3-FR-012, S3-FR-029 | S3-T021 | [S3-US2-AC11](../tests/ui/s3/us2-operacao.test.tsx), [S3-US2-AC12](../tests/runtime/rewind.test.ts), [S3-US2-AC13](../tests/ui/s3/us5-recording.test.tsx) | Retrocesso ao vivo, retomada e limite de gravação verificados |

## Incremento de impasse — ADR-018

| Origem | Requisito | Tarefa | Testes | Status |
|---|---|---|---|---|
| ADR-018, RB-25 | S2-FR-037 | S2-T043 (`3bbd567`, `96b23d8`) | [S2-US3-AC11 a AC13](../tests/core/acceptance/s2/us3-impasse.test.ts), [CLI](../tests/cli/run-cli.test.ts) | Verificado |
| ADR-018, RB-24 | S3-FR-040 | S3-T022 (`c07d3f3`, `07368f8`) | [S3-US2-AC14](../tests/ui/s3/us2-impasse.test.tsx), [S3-US2-AC15](../tests/runtime/stall-reset.test.ts) | Verificado |
| ADR-018, RB-40 | S3-FR-041 | S3-T022 (`c07d3f3`, `07368f8`) | [S3-US5-AC12](../tests/ui/s3/us2-impasse.test.tsx) | Verificado |

## Regra de Tempo no giro conjunto — ADR-019

| Origem | Requisito | Tarefa e commit | Testes de aceitação | Estado |
|---|---|---|---|---|
| ADR-019, RB-25 | S2-FR-037 | S2-T044 (`3dc6c45`) | [S2-US3-AC14 e AC15 · Caçadores, contato, empurrão e separação](../tests/core/acceptance/s2/us3-impasse.test.ts) | Validado localmente |
| ADR-019, RB-24 | S3-FR-040 | S3-T023 (`add5249`) | [S3-US2-AC16 · seletor, contagem e ação explícita](../tests/ui/s3/us2-impasse.test.tsx), [retrocesso com os controladores reais](../tests/runtime/stall-reset.test.ts) | Validado localmente |
| ADR-019, RB-40 | S3-FR-041 | S3-T023 (`add5249`) | [S3-US5-AC13 · preservação de v2 e replay do giro](../tests/runtime/stall-reset.test.ts), [validação da gravação v3](../tests/ui/s3/us2-impasse.test.tsx) | Validado localmente |

## Sensor de borda — ADR-020

| Origem | Requisito | Tarefa e commit | Testes de aceitação | Estado |
|---|---|---|---|---|
| Q-007, B-003, ADR-020, RB-35 | S2-FR-038 | S2-T045 (`f680f40`) | [S2-US2-AC13 e AC14 · lados, limites, empurrão e reset](../tests/core/acceptance/s2/us2-borda.test.ts), [estratégia personalizada aplicada à sessão](../tests/runtime/edge-strategy.test.ts) | Validado localmente |
| ADR-020, RB-39 | S3-FR-042 | S3-T024 (`7ae5d5d`) | [S3-US4-AC7 · inspeção, retrocesso, reset e replays](../tests/ui/s3/us4-inspecao.test.tsx) | Validado localmente |

## Labirinto · ADR-021

| Origem | Requisito | Tarefa e commits | Testes de aceitação | Estado |
|---|---|---|---|---|
| RB-25, ADR-021 | S1-FR-041 | S1-T051 (`c3c641b`) | [S1-US1-AC12 · mundo e saída](../tests/core/acceptance/s1/maze-world.test.ts) | Validado localmente |
| RB-25, ADR-021 | S2-FR-039 | S2-T046 (`a3db897`, `611f8e0`) | [S2-US5-AC4 e AC5 · topologia e percurso do explorador](../tests/core/acceptance/s2/maze.test.ts) | Validado localmente |
| RB-22, RB-24, ADR-021 | S3-FR-043 | S3-T025 (`5cc60e2`) | [S3-US3-AC10 · chegada, pausa, retrocesso, replay e progressão](../tests/ui/s3/maze.test.tsx) | Validado localmente |

## Seleção de modo e dificuldade · ADR-022

| Origem | Requisitos | Tarefa e commit | Testes de aceitação | Estado |
|---|---|---|---|---|
| RB-22, RB-24, ADR-022 | S3-FR-019, S3-FR-043, S3-FR-044 | S3-T026 (`1bf574f`) | [S3-US3-AC10, AC11 e AC12 · progressão, troca direta, rascunho, arquivos e replay](../tests/ui/s3/maze.test.tsx) | Validado localmente |

## Cursor de inserção dos controladores

| Origem | Requisitos | Tarefa e commit | Verificação | Estado |
|---|---|---|---|---|
| RB-23, RB-20 | S3-FR-023, S3-FR-038 | S3-T027 (`06d5d54`) | [S3-US3-AC13 · cor do cursor nos três editores](../tests/ui/s3/us3-controladores.test.tsx) e [clique, setas e inserção no Chrome](registro-de-consolidacao.md#2026-11-22--cursor-nos-editores-de-estratégia) | Validado localmente |

## Largada de sumô · ADR-023

| Origem | Requisito | Tarefa e commit | Testes | Estado |
|---|---|---|---|---|
| ADR-023, RB-25, RB-27 | S2-FR-040 | S2-T047 (`d6a6941`) | [S2-US3-AC16 a AC18 · fronteira, empate e vitória](../tests/core/acceptance/s2/us3-largada.test.ts) e [comandos constantes na CLI](../tests/cli/run-cli.test.ts) | Validado localmente |
| ADR-023, RB-24, RB-40 | S3-FR-045 | S3-T028 (`a82dbb3`) | [S3-US2-AC17 · pausa, pontos da rodada, reinício, rewind e replay v5](../tests/ui/s3/us2-largada.test.tsx) e [verificação no Chrome](registro-de-consolidacao.md#largada-de-sumô--2026-11-22) | Validado localmente |

## Movimento visível após a queima · ADR-024

| Origem | Requisito | Tarefa e commit | Teste | Estado |
|---|---|---|---|---|
| ADR-024, RB-25, RB-27 | S2-FR-040 | S2-T048 (`d54b503`) | [S2-US3-AC16 a AC19 · primeiro comando, decisão, duração, contatos e bloqueio](../tests/core/acceptance/s2/us3-largada.test.ts) | Validado localmente |
| ADR-024, RB-24, RB-40 | S3-FR-045 | S3-T029 (`ad71d1d`) | [S3-US2-AC17/18 · identificação, pausa, retrocesso, replay v5 e v6](../tests/ui/s3/us2-largada.test.tsx) e [verificação no Chrome](registro-de-consolidacao.md#demonstração-da-queima--2026-11-22) | Validado localmente |
