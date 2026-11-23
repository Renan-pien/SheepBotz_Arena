---
description: "Tarefas de implementação dos sensores, controladores e regras de sumô da Spec 002"
---

# Tarefas da Spec 002 · Sensores, controladores e sumô

**Branch** `002-sensores-controlador`. [Spec](spec.md) · [Plano](plan.md) · [Pesquisa](research.md) · [Modelo de dados](data-model.md) · [Contratos](contracts/core-api.md) · [Checklist](checklists/clarificacao.md) · [Quickstart](quickstart.md)

## Ordem e critérios de conclusão

- Seguir as fases do [AGENTS.md §4 e §9.3](../../AGENTS.md). Rodar `$speckit-analyze` e resolver os achados críticos e altos antes da implementação. Os caminhos de código partem da raiz do repositório.
- `Dep.` indica dependência direta. `(RED)` indica que o teste deve estar escrito e sua falha esperada registrada antes do código correspondente. O item de teste é concluído após a confirmação de que passou com a implementação associada. Se um comportamento já existir na S1 ou em um incremento anterior, registrar o teste como regressão com o resultado real.
- Uma tarefa por commit, com `tipo(S2-T###)` e uma linha `Requisitos:` conforme o AGENTS.md §7.3. Registrar o RED localmente antes da implementação e versionar cada conjunto de arquivos em estado verde. Se um commit isolado de teste ficaria vermelho, manter o teste no workspace até a implementação passar e versionar os conjuntos separadamente com suas referências de TDD.
- Após cada tarefa de implementação, rodar os testes afetados, lint, verificação de tipos e a suíte com cobertura conforme a DoD. Preservar os pisos de cobertura da S1 e registrar os resultados reais. Usar `tests/helpers/tolerance.ts` para distâncias e ângulos, e igualdade exata para status, IDs, ticks, códigos e repetição de históricos.
- Cada teste de aceite começa com seu ID global, por exemplo `S2-US1-AC1`. As tarefas `[P]` podem ser executadas juntas dentro da fase após cumprir suas dependências.

## Fase 1 · Setup

**Objetivo** Fixar a linha de base e preparar o runtime proposto no plano.

- [X] T001 Registrar a linha de base da S1 em Node 24 com instalação limpa, lint, tipos, testes e cobertura. Conferir os gatilhos de push e PR — `.nvmrc`, `package.json`, `.github/workflows/ci.yml`, `docs/registro-de-consolidacao.md` — RB-08, RB-12, RB-27. **Dep.** Nenhuma. **Pronto** Suíte de referência e cobertura registradas.
- [X] T002 Conferir o ADR-015 conforme o AGENTS.md §8.4 e fixar `ses@2.3.0` e `acorn@8.15.0` em versões exatas conforme R1. Preservar os comandos atuais e validar instalação pelo lockfile — `package.json`, `package-lock.json` — S2-FR-009, S2-FR-012, S2-FR-024, ADR-015. **Dep.** T001. **Pronto** `npm ci` reproduz o ambiente do motor.

## Fase 2 · Fundação

**Objetivo** Preparar o motor, a validação das entradas e os testes dos comportamentos que a primeira fatia já usa.

### Testes antes do código compartilhado

- [X] T003 [P] Escrever os testes do adaptador em processo isolado. Cobrir sintaxe ECMAScript do plano, carga sem API do robô, captura de `setup` e `loop`, fechamento léxico preservado e vinculação de uma função de teste depois da carga. Conferir as rejeições do FR-009 e o perfil síncrono desde a carga, inclusive ao criar outro compartimento como no reset, incluindo a indisponibilidade de `Promise`, `Array.fromAsync`, relógio, aleatoriedade global e avaliação dinâmica — `tests/runtime/controller-engine.test.ts` — S2-FR-009, S2-FR-012 a S2-FR-015, S2-FR-024, ADR-016. **Dep.** T002. **Pronto** Testes do adaptador verdes com T007.
- [X] T004 [P] Escrever `S2-US4-AC1`, `S2-US4-AC2`, `S2-US4-AC7`, `S2-US4-AC8`, `S2-US4-AC9`, `S2-US4-AC10`, `S2-US4-AC11` e `S2-US4-AC12` antes da preparação pública. Acrescentar caso de forma assíncrona rejeitada com `CONTROLADOR_INVALIDO` em `controllers.<id>` antes do tick 0. Testar também robô sem comando nem script, validação com `ticks = 0`, precedência dos erros do mundo, ordem dos grupos e ausência de carga para entradas inelegíveis pelo ADR-014 — `tests/core/acceptance/s2/us4-preparacao.test.ts`, `tests/core/unit/controller-inputs.test.ts` — S2-FR-009 a S2-FR-012, S2-FR-024, ADR-010, ADR-012, ADR-014, ADR-016. **Dep.** T002. **Pronto** Código, caminho, detalhe original e ausência de tick 0 cobertos com T008 e T016.
- [X] T005 [P] Escrever `S2-US2-AC1`, `S2-US2-AC4`, `S2-US2-AC5`, `S2-US2-AC7`, `S2-US2-AC8`, `S2-US2-AC11` e `S2-US2-AC12` antes do primeiro uso de comandos, logs e reset na US1. Cobrir o limite de log, a ordem dos callbacks e a igualdade exata de estados, eventos e histórico entre avanço em lote e passo a passo com microtarefas do host entre os passos — `tests/core/acceptance/s2/us2-ciclo.test.ts`, `tests/core/unit/controller-cycle.test.ts` — S2-FR-009, S2-FR-013 a S2-FR-016, S2-FR-019, S2-FR-022 a S2-FR-024, ADR-016. **Dep.** T002. **Pronto** Cenários verdes com T015 e T016.
- [X] T006 [P] Manter as regressões físicas de janela fixa usando cópia da geometria do Duelo em modo livre, conforme R5. Conservar poses, comandos, contagens de 501 e 121 estados e a verificação de cruzamento da arena sem contato — `tests/core/acceptance/s1/us3-determinism.test.ts`, `tests/core/acceptance/s1/us4-collisions.test.ts` — S1-FR-036, S1-FR-038, S2-FR-028, S2-FR-032. **Dep.** T002. **Pronto** Regressões da S1 verdes com as mesmas asserções físicas.

### Implementação da fundação

- [X] T007 Implementar a interface síncrona do motor e o adaptador SES/Acorn. Inicializar SES no adaptador em duas etapas com remoção de `Array.fromAsync`. Configurar cada compartimento com os bloqueios do perfil síncrono antes da avaliação. Analisar o script, criar um compartimento por robô e capturar e validar os callbacks na carga. Vincular as funções do robô após a avaliação e preservar o detalhe original das falhas — `src/core/controller/runtime.ts`, `src/runtime/controller-engine.ts` — S2-FR-009, S2-FR-012 a S2-FR-015, S2-FR-024, ADR-016. **Dep.** T003 (RED), T004 (RED), T005 (RED). **Pronto** Testes isolados de carga, análise, perfil de execução e memória do script passam. Campos [`Instância de controlador.texto original`, `Instância de controlador.compartimento`, `Instância de controlador.setup`, `Instância de controlador.loop`](data-model.md#estado-privado-por-simulação).
- [X] T008 Implementar a validação estrutural de comandos e controladores e o agrupamento das falhas de carga com o motor injetado. Preservar a ordem e as mensagens do contrato, os caminhos da S1 e os caminhos `controllers.<id>` da S2 — `src/core/controller/inputs.ts`, `src/core/world/errors.ts`, `src/core/types.ts` — S2-FR-010 a S2-FR-012, S1-FR-035, ADR-014. **Dep.** T004 (RED), T006, T007. **Pronto** Testes do agrupamento e da elegibilidade passam no núcleo, e a integração pública fica para T016. Campos [`Entrada de controlador.ID do robô`, `Entrada de controlador.texto JS`, `Comando constante.v`, `Comando constante.w`, `World.robots`](data-model.md#configuração-e-entrada).

**Checkpoint** Motor e validação unitária testados, regressões S1 preservadas e testes de integração antecipados registrados para a US1.

## Fase 3 · US1 — Enxergar com o laser (P1, MVP)

**Objetivo** Publicar as leituras da pose de cada estado e expor aos controladores o laser observado no início do passo.

**Teste independente** Consultar os raios no tick 0, após movimento e após reset usando `runHeadless` ou `prepareSimulation`. O script do cenário 10 observa 2.000 m em `setup()` e `loop()` e o tick 1 publica 1.900 m.

### Testes

- [X] T009 [P] [US1] Escrever `S2-US1-AC1` a `S2-US1-AC8` para paredes, rotação em mapa de 4 × 2 m com vetor distinto, obstáculo, alcance, círculo e configuração do Duelo padrão no tick 0. Verificar a chave `resultado` presente com `null` no estado inicial. Acrescentar os campos da S2 à expectativa estrita do teste da S1, mantendo as asserções dos campos existentes — `tests/core/acceptance/s2/us1-laser-inicial.test.ts`, `tests/core/unit/run-headless.test.ts` — S2-FR-001 a S2-FR-006, S2-FR-008, S2-FR-034. **Dep.** T008. **Pronto** Oito cenários públicos e a regressão de estado verdes com T014.
- [X] T010 [P] [US1] Escrever `S2-US1-AC9` a `S2-US1-AC11` para lista vazia, leitura no início e publicação após movimento e reset. Cobrir também a cópia mutável de `readLaser()` e a preservação dos snapshots anteriores — `tests/core/acceptance/s2/us1-laser-tick.test.ts` — S2-FR-007, S2-FR-008, S2-FR-015, S2-FR-016, S2-FR-034. **Dep.** T008. **Pronto** Três cenários verdes com T016.
- [X] T011 [P] [US1] Escrever testes geométricos para intervalos AABB, tangência, paralelismo, origem sobre ou dentro do alvo, coincidência dos raios extremos com `fov = 2π` e exclusão da arena e do emissor. Escrever testes unitários de `laser.ts` com os vetores do Anexo A, incluindo a rotação em mapa de 4 × 2 m, diretamente sobre as poses e a configuração. Confirmar os campos de laser e seus limites pelo contrato de mundo existente — `tests/core/unit/raycast.test.ts`, `tests/core/unit/laser.test.ts`, `tests/core/unit/validate.test.ts` — S2-FR-001 a S2-FR-006. **Dep.** T008. **Pronto** Interseções verdes com T012 e vetores da varredura verdes com T013.

### Implementação

- [X] T012 [US1] Implementar as primitivas de raio contra retângulo e círculo conforme R2, usando intervalos fechados, projeção, primeiro contato e distância não negativa — `src/core/math/ray.ts` — S2-FR-004 a S2-FR-006. **Dep.** T009 (RED), T011 (RED). **Pronto** Os testes de interseção de `raycast.test.ts` passam.
- [X] T013 [US1] Implementar a varredura de laser a partir do centro e das poses reais. Usar a configuração normalizada, ordenar os raios, limitar a distância ao alcance e montar lista vazia sem sensor — `src/core/sensors/laser.ts` — S2-FR-001 a S2-FR-006, S2-FR-008. **Dep.** T012, T011 (RED), T010 (RED). **Pronto** Os vetores do Anexo A passam em `laser.test.ts` usando a função pura. Os testes públicos do tick 0 pertencem a T014. Campos [`LaserConfig.rays`, `LaserConfig.fov`, `LaserConfig.maxRange`, `RobotConfig.laser`, `World.map`, `World.obstacles`, `World.robots`](data-model.md#configuração-e-entrada) e [`RobotState.pose`, `RobotState.laser`](data-model.md#estado-publicado).
- [X] T014 [US1] Acrescentar os campos públicos da S2 ao snapshot e usar a mesma transformação física entre `step` e a fachada. Publicar laser no tick 0 e com as poses resolvidas de cada tick, sem alteração da física S1 — `src/core/types.ts`, `src/core/sim/state.ts`, `src/core/sim/step.ts` — S2-FR-007, S2-FR-008, S2-FR-034, ADR-009. **Dep.** T009 (RED), T013. **Pronto** Os casos públicos S2-US1-AC1 a S2-US1-AC8 e as regressões dos campos da S1 passam. O tick 0 contém a chave `resultado` com `null`. Campos [`SimState.tick`, `SimState.time`, `SimState.robots`, `SimState.status`, `SimState.resultado`, `SimState.events`, `RobotState.id`, `RobotState.pose`, `RobotState.command`, `RobotState.bumper`, `RobotState.odometry`, `RobotState.laser`, `RobotState.situacao`](data-model.md#estado-publicado) e [`World.dt`](data-model.md#configuração-e-entrada).
- [X] T015 [US1] Implementar o ciclo de chamadas síncronas no início de cada passo e os fluxos bem-sucedidos de `readLaser`, `setSpeed` e `log`. Guardar o último comando, revogar o quadro ao sair do callback e manter o limite de log por robô. Usar o snapshot observado e gravar eventos com o tick que será publicado — `src/core/controller/runner.ts`, `src/core/controller/api.ts` — S2-FR-007, S2-FR-013, S2-FR-014, S2-FR-016, S2-FR-019, S2-FR-022 a S2-FR-024, ADR-016. **Dep.** T003, T005 (RED), T010 (RED), T014. **Pronto** Unidade verifica comandos, cópia do laser, escopo da API e o único aviso de limite. Campos [`Quadro de chamada.snapshot observado`, `Quadro de chamada.tick do evento`, `Quadro de chamada.comando candidato`, `ControllerLogLimit.acceptedCount`, `ControllerLogLimit.warningEmitted`](data-model.md#estado-privado-por-simulação) e [`SimEvent.type`, `SimEvent.tick`, `SimEvent.robotId`, `SimEvent.message`](data-model.md#estado-publicado).
- [X] T016 [US1] Integrar a preparação síncrona ao `runHeadless`, à fachada e às exportações públicas. Reusar os controladores já carregados no tick 0, montar comandos de cada passo e recarregar as fontes no reset antes da troca de sessão. Preservar a API de comandos constantes, a validação de ticks e a consulta de histórico — `src/core/api/prepare-simulation.ts`, `src/core/api/run-headless.ts`, `src/core/sim/simulation.ts`, `src/core/index.ts`, `src/core/types.ts` — S2-FR-007 a S2-FR-015, S2-FR-032, S2-FR-034, ADR-009 a ADR-012, ADR-014. **Dep.** T004 (RED), T005 (RED), T015. **Pronto** US1 inteira e os testes de preparação e ciclo já escritos passam pelas portas públicas. Campos [`Sessão.mundo normalizado`, `Sessão.entradas copiadas`, `Sessão.estado atual`, `Sessão.histórico opcional`, `Instância de controlador.ID`, `Instância de controlador.índice`](data-model.md#estado-privado-por-simulação) e [`Histórico`](data-model.md#estado-publicado).

## Fase 4 · US2 — Escrever um controlador (P1)

**Objetivo** Completar os sensores e dados da API, a persistência dos comandos e a aleatoriedade determinística.

**Teste independente** Executar scripts de velocidade, parada por laser e reação ao bumper. Repetir o mundo e as entradas para obter os mesmos estados, eventos e sequências, e conferir o reset.

### Testes

- [X] T017 [P] [US2] Escrever `S2-US2-AC2`, `S2-US2-AC3`, `S2-US2-AC6` e `S2-US2-AC9` para persistência do comando, parada por tick, bumper, odometria e os campos de `getInfo()`. Assertar cópias dos objetos retornados — `tests/core/acceptance/s2/us2-api.test.ts` — S2-FR-017 a S2-FR-020, ADR-009. **Dep.** T016. **Pronto** Cenários verdes com T019.
- [X] T018 [P] [US2] Escrever `S2-US2-AC10` e os testes dos vetores R4, sementes extremas, independência do consumo entre robôs, reset e repetição de estados e eventos — `tests/core/acceptance/s2/us2-aleatoriedade.test.ts`, `tests/core/unit/controller-random.test.ts` — S2-FR-015, S2-FR-021, S2-SC-002. **Dep.** T016. **Pronto** Vetores e cenários verdes com T020.

### Implementação

- [X] T019 [US2] Implementar `readBumper`, `readOdometry` e `getInfo` para o snapshot observado. Devolver cópias dos objetos e manter o comando anterior enquanto nenhuma nova velocidade for definida — `src/core/controller/api.ts`, `src/core/controller/runner.ts` — S2-FR-017 a S2-FR-020. **Dep.** T017 (RED), T016. **Pronto** T017 e os cenários de comandos e ciclo da T005 passam. Campos [`RobotState.bumper`, `RobotState.odometry`, `RobotState.command`, `SimState.tick`, `SimState.time`](data-model.md#estado-publicado) e [`World.dt`, `World.arena`, `RobotConfig.laser`](data-model.md#configuração-e-entrada).
- [X] T020 [US2] Implementar o PRNG de 32 bits de R4 e conectar `random()` à sequência da instância. Reinicializar pela semente do mundo e índice do robô no reset — `src/core/controller/random.ts`, `src/core/controller/api.ts`, `src/core/controller/runner.ts` — S2-FR-015, S2-FR-021, S2-SC-002. **Dep.** T018 (RED), T019. **Pronto** Os 12 critérios da US2 passam, incluindo os sete antecipados na T005. Campos [`World.seed`, `World.robots`](data-model.md#configuração-e-entrada) e [`ControllerRandom.state`, `Instância de controlador.índice`](data-model.md#estado-privado-por-simulação).

## Fase 5 · US3 — Lutar sumô (P1)

**Objetivo** Avaliar a luta após o movimento, publicar o resultado uma vez e limitar o histórico ao último tick executado.

**Teste independente** Executar o Duelo com scripts do Anexo D fornecidos em memória. Conferir vitória no tick 34, empates, borda exata, prioridade da saída e 101 snapshots quando o limite é 100 e se pedem 110 ticks.

### Testes

- [X] T021 [P] [US3] Escrever `S2-US3-AC1` a `S2-US3-AC5`, `S2-US3-AC9` e `S2-US3-AC10` para vitória, ambos fora, tempo esgotado, laser da pose final, igualdade com o raio e prioridade da saída — `tests/core/acceptance/s2/us3-resultado.test.ts`, `tests/core/unit/sumo.test.ts` — S2-FR-008, S2-FR-028 a S2-FR-031, S2-FR-034. **Dep.** T020. **Pronto** Poses e motivos passam com T023 e T024.
- [X] T022 [P] [US3] Escrever `S2-US3-AC6` a `S2-US3-AC8` para histórico sem repetição, chamadas após o fim e janela completa em modo livre com a chave `resultado` presente e nula. Cobrir `step` e `stepN` após o fim e `getHistory` após o reset — `tests/core/acceptance/s2/us3-historico.test.ts` — S2-FR-032, S2-FR-033, S1-FR-038, ADR-011. **Dep.** T020. **Pronto** Três cenários e a regressão de reset passam com T025.

### Implementação

- [X] T023 [US3] Implementar a avaliação de sumô a partir dos centros das poses resolvidas. Aplicar a prioridade de uma saída, duas saídas e limite de ticks e preservar o estado em andamento no modo livre — `src/core/match/sumo.ts` — S2-FR-028 a S2-FR-031, S2-FR-033. **Dep.** T021 (RED), T022 (RED). **Pronto** Classificação de borda e prioridade passam nos testes unitários. Campos [`World.arena`, `World.arena.radius`, `World.match`, `World.match.mode`, `World.match.maxTicks`, `World.robots`](data-model.md#configuração-e-entrada) e [`MatchResult.vencedor`, `MatchResult.motivo`, `MatchResult.tick`](data-model.md#estado-publicado).
- [X] T024 [US3] Integrar o avaliador à publicação do passo físico. Publicar resultado e laser da pose final e acrescentar `fim_da_luta` depois dos eventos do tick, com `robotId: null` em qualquer desfecho — `src/core/sim/step.ts`, `src/core/sim/state.ts` — S2-FR-008, S2-FR-030, S2-FR-031, S2-FR-034, ADR-013. **Dep.** T023, T006. **Pronto** A saída sem interface segue o contrato de estado, inclusive quando só há comandos constantes. Campos [`SimState.status`, `SimState.resultado`, `SimState.events`, `RobotState.laser`, `SimEvent.type`, `SimEvent.tick`, `SimEvent.robotId`, `SimEvent.message`](data-model.md#estado-publicado).
- [X] T025 [US3] Impedir avanço após a finalização, interromper lotes no último tick executado e preservar o histórico e o snapshot final em consultas e novos avanços — `src/core/sim/step.ts`, `src/core/sim/simulation.ts`, `src/core/api/run-headless.ts` — S2-FR-032, S2-FR-033, ADR-011. **Dep.** T024, T022 (RED). **Pronto** Os dez critérios da US3 passam e o histórico livre mantém a janela pedida. Campos [`Histórico`, `SimState.tick`, `SimState.status`](data-model.md#estado-publicado).

## Fase 6 · US4 — Erros no controlador não derrubam a simulação (P2)

**Objetivo** Completar o tratamento de falha durante o tick e revalidar o contrato de preparação definido pela Q-015.

**Teste independente** Solicitar mundo com entradas inválidas e verificar a lista anterior ao tick 0. Executar uma luta com falha de `setup()` e demonstrar comando zerado, desativação no tick 1 e derrota por empurrão no tick 34.

### Testes

- [X] T026 [P] [US4] Escrever `S2-US4-AC3`, `S2-US4-AC4` e `S2-US4-AC5` para exceção em `loop()`, velocidade inválida e falha de `setup()`. Cobrir o descarte do comando pendente, inclusive se a exceção de `setSpeed` for capturada, e a preservação dos logs emitidos — `tests/core/acceptance/s2/us4-falha-em-tick.test.ts` — S2-FR-019, S2-FR-025, S2-FR-026, S2-SC-004. **Dep.** T025. **Pronto** Três critérios verdes com T028 e T029.
- [X] T027 [P] [US4] Escrever `S2-US4-AC6` com os dois controladores do cenário, desativação antes do movimento e empurrão até a posição e tick especificados — `tests/core/acceptance/s2/us4-desativado-sumo.test.ts` — S2-FR-025 a S2-FR-027, S2-FR-031. **Dep.** T025. **Pronto** Cenário verde com T029.

### Implementação

- [X] T028 [US4] Registrar a primeira falha da chamada, descartar velocidades pendentes, impedir `loop()` se `setup()` falhar e emitir um `erro_controlador` com o ID, tick e detalhe. Continuar as chamadas dos outros robôs — `src/core/controller/api.ts`, `src/core/controller/runner.ts` — S2-FR-019, S2-FR-025, S2-FR-026. **Dep.** T026 (RED), T027 (RED). **Pronto** Eventos e prioridade da primeira falha verificados. Campos [`Quadro de chamada.primeira falha`, `Quadro de chamada.comando candidato`](data-model.md#estado-privado-por-simulação) e [`SimEvent.type`, `SimEvent.tick`, `SimEvent.robotId`, `SimEvent.message`](data-model.md#estado-publicado).
- [X] T029 [US4] Persistir a desativação na sessão e publicar a situação no estado. Aplicar comando zero desde o próprio tick e deixar o corpo sujeito à física e ao sumô, incluindo reset para estado ativo — `src/core/sim/simulation.ts`, `src/core/sim/state.ts`, `src/core/controller/runner.ts` — S2-FR-015, S2-FR-025 a S2-FR-027, S2-FR-034. **Dep.** T028, T016. **Pronto** Os 12 critérios da US4 passam, incluindo os oito antecipados na T004. Campos [`RobotState.situacao`, `RobotState.command`, `RobotState.pose`, `SimState.events`](data-model.md#estado-publicado).

## Fase 7 · US5 — Mundos e controladores de exemplo (P2)

**Objetivo** Entregar os arquivos de exemplo pelos mesmos contratos públicos.

**Teste independente** Validar os dois mundos e carregar os cinco scripts entregues. Executar Sala com obstáculos e Desviador por 2 000 ticks em `free` e verificar `em_andamento`, resultado nulo e ausência de `erro_controlador`.

### Testes

- [X] T030 [P] [US5] Escrever `S2-US5-AC1`, validando os mundos de exemplo entregues pelo mesmo `loadWorld` e conferindo Sala com obstáculos contra o Anexo C — `tests/core/acceptance/s2/us5-mundos.test.ts` — S2-FR-001, S2-FR-033, S2-FR-035. **Dep.** T029. **Pronto** Dois mundos válidos com T032.
- [X] T031 [P] [US5] Escrever `S2-US5-AC2` e `S2-US5-AC3`, carregando os cinco arquivos do Anexo D pela fachada e executando Sala com obstáculos com Desviador até o tick 2 000. Verificar os comandos esperados dos exemplos, incluindo as duas decisões de Caçador e Desviador — `tests/core/acceptance/s2/us5-controladores.test.ts` — S2-FR-009, S2-FR-012, S2-FR-033, S2-FR-036. **Dep.** T029. **Pronto** Scripts carregados e execução livre concluída com T033.

### Implementação

- [X] T032 [US5] Adicionar o JSON de Sala com obstáculos conforme o Anexo C e reaproveitar o Duelo padrão da S1 no catálogo de exemplos. Usar o contrato de mundo v1 — `examples/worlds/sala-com-obstaculos.json` — S2-FR-001, S2-FR-033, S2-FR-035. **Dep.** T030 (RED), T031 (RED). **Pronto** Ambos os mundos passam pelo validador existente. Campos [`World.name`, `World.seed`, `World.dt`, `World.map`, `World.arena`, `World.match`, `World.obstacles`, `World.robots`, `RobotConfig.laser`](data-model.md#configuração-e-entrada).
- [X] T033 [US5] Adicionar Parado, Avança, Girador, Caçador e Desviador conforme o Anexo D e carregar os arquivos pela fachada nos cenários US5 — `examples/controllers/parado.js`, `examples/controllers/avanca.js`, `examples/controllers/girador.js`, `examples/controllers/cacador.js`, `examples/controllers/desviador.js` — S2-FR-009, S2-FR-012, S2-FR-036. **Dep.** T031 (RED), T032. **Pronto** Os três critérios da US5 passam. Campos [`Entrada de controlador.ID do robô`, `Entrada de controlador.texto JS`](data-model.md#configuração-e-entrada).

## Fase 8 · Acabamento e validação

- [X] T034 [P] Escrever os testes de contrato CLI v2. Cobrir `--controller` repetido, ID/chave vazios, leitura UTF-8, conflito, arquivo ilegível, JSON, códigos 0/1/2, histórico truncado e evento da partida. Manter a regressão dos argumentos da S1 — `tests/cli/run-cli.test.ts` — S2-FR-011, S2-FR-012, S2-FR-031, S2-FR-032, S2-FR-034, RB-43. **Dep.** T033. **Pronto** Casos novos passam com T035.
- [X] T035 Implementar a flag `--controller <id>=<arquivo.js>`, a leitura de fontes e a inicialização do motor no adaptador. Preservar stdout JSON, stderr de uso e a configuração para execuções com comandos constantes — `src/cli/run-cli.ts`, `src/cli/index.ts` — S2-FR-011, S2-FR-012, S2-FR-031, S2-FR-032, S2-FR-034, RB-43. **Dep.** T034 (RED). **Pronto** Contratos CLI v1 e v2 verdes.
- [X] T036 [P] Preparar e executar a fixture de integração Vite em Chromium com o mesmo motor, cargas e valores esperados do Node. Conferir o perfil síncrono e a igualdade exata dos estados e histórico em lote e em passos com microtarefas do host entre eles. Conferir também a ausência de E/S e dependências do adaptador no núcleo através do teste de pureza — `tests/runtime/fixtures/controller-browser/index.html`, `tests/runtime/fixtures/controller-browser/main.ts`, `tests/core/unit/purity.test.ts` — S2-FR-007, S2-FR-012, S2-FR-021, S2-FR-024, S2-SC-002, RB-27, ADR-016. **Dep.** T033. **Pronto** Build e vetor observado conferidos em Node e Chromium.
- [X] T037 [P] Escrever verificação do cenário de benchmark sem limiar temporal na suíte. Conferir Duelo, Parado e Girador, histórico desabilitado, 3 000 ticks efetivos e tempo esgotado. Fixar a contagem efetiva do benchmark S1 em modo livre com o mesmo mundo e comandos — `tests/scripts/bench-s2.test.ts` — S2-FR-030, S2-FR-032, S2-FR-033, S2-SC-003. **Dep.** T033. **Pronto** Validação determinística do cenário verde com T038.
- [X] T038 Implementar `bench:s2` fora do Vitest e adaptar o benchmark S1 conforme o plano. Carregar as entradas e o motor antes do cronômetro, medir a chamada completa ao núcleo e relatar os ticks efetivos, CPU, SO, versão do Node e tempo. Sinalizar falha se a luta divergir do resultado previsto ou atingir o limiar de 2 s — `scripts/bench.ts`, `scripts/bench-s2.ts`, `package.json` — S2-FR-030, S2-FR-032, S2-FR-033, S2-SC-003. **Dep.** T037 (RED). **Pronto** Ambos os comandos conferem 3 000 ticks e SC-003 pode ser medido no ambiente de referência.
- [X] T039 Executar o quickstart do zero, os 48 critérios, a comparação integral de execuções idênticas e a suíte com cobertura. Medir o benchmark SC-003 no ambiente de referência e registrar a evidência real do limite de 2 s — `specs/002-sensores-controlador/quickstart.md`, `docs/registro-de-consolidacao.md` — S2-FR-001 a S2-FR-036, S2-SC-001 a S2-SC-004, RB-08. **Dep.** T035, T036, T038. **Pronto** Quickstart passa, cobertura atende à DoD e o tempo medido está documentado.
- [X] T040 Validar SC-005 conforme a [exceção de aceite aprovada](spec.md#6-critérios-de-sucesso). Reexecutar a demonstração do Caçador Reativo e registrar o resultado e o escopo do tempo medido — `specs/002-sensores-controlador/spec.md`, `docs/registro-de-consolidacao.md` — S2-FR-009, S2-FR-019, S2-FR-024, S2-FR-036, S2-SC-005. **Dep.** T035. **Pronto** Aprovação e evidência da demonstração registradas.
- [X] T041 Atualizar instruções do README, gerar estatísticas com `npm run stats` e preencher o trecho S2 da matriz `RB → FR → T → teste → commit/status`. Conferir a geração de métricas e relatórios nos eventos da CI — `README.md`, `docs/cobertura/resumo.md`, `docs/cobertura/coverage-summary.json`, `docs/rastreabilidade.md`, `.github/workflows/ci.yml` — S2-FR-001 a S2-FR-036, RB-08, RB-09, RB-12. **Dep.** T039, T040. **Pronto** 36 requisitos com evidência e métricas geradas da suíte.
- [X] T042 Consolidar a revisão SDD, o resultado da CI, benchmark, quickstart, checklist e evidências para a descrição do PR de fechamento. Registrar a passagem ao ensaio de regeneração previsto no AGENTS.md — `docs/registro-de-consolidacao.md`, `specs/002-sensores-controlador/checklists/clarificacao.md` — S2-SC-001 a S2-SC-005, RB-08, RB-12. **Dep.** T041. **Pronto** Evidências de aceite reunidas para o fechamento.

## Dependências e execução

```text
Setup T001–T002 → Fundação T003–T008 → US1 T009–T016 → US2 T017–T020
→ US3 T021–T025 → US4 T026–T029 → US5 T030–T033 → Acabamento T034–T042
```

- A fundação prepara os testes da US2 que já usam o ciclo e os testes da US4 que já usam a carga. A US1 integra esse ciclo para demonstrar a leitura antes e depois do movimento. US2 completa a API, US3 usa a mesma fachada para o sumô, US4 cobre as falhas durante a luta e US5 entrega os arquivos de exemplo.
- Em cada história, executar os testes da história e as regressões anteriores no checkpoint. Resolver falhas antes de avançar e manter a ordem das fases.

### Exemplos de execução paralela

| Fase | Tarefas em arquivos separados que podem começar juntas |
|---|---|
| Fundação | T003, T004, T005 e T006 após T002. |
| US1 | T009, T010 e T011 após T008. |
| US2 | T017 e T018 após T016. |
| US3 | T021 e T022 após T020. |
| US4 | T026 e T027 após T025. |
| US5 | T030 e T031 após T029. |
| Acabamento | T034, T036 e T037 após T033. |

## Estrutura de rastreabilidade

### Critérios de aceite

| Cenários globais | Tarefa de teste | Arquivo de teste |
|---|---|---|
| S2-US1-AC1 a S2-US1-AC8 | T009 | `tests/core/acceptance/s2/us1-laser-inicial.test.ts` |
| S2-US1-AC9 a S2-US1-AC11 | T010 | `tests/core/acceptance/s2/us1-laser-tick.test.ts` |
| S2-US2-AC1, S2-US2-AC4, S2-US2-AC5, S2-US2-AC7, S2-US2-AC8, S2-US2-AC11, S2-US2-AC12 | T005 | `tests/core/acceptance/s2/us2-ciclo.test.ts` |
| S2-US2-AC2, S2-US2-AC3, S2-US2-AC6, S2-US2-AC9 | T017 | `tests/core/acceptance/s2/us2-api.test.ts` |
| S2-US2-AC10 | T018 | `tests/core/acceptance/s2/us2-aleatoriedade.test.ts` |
| S2-US3-AC1 a S2-US3-AC5, S2-US3-AC9, S2-US3-AC10 | T021 | `tests/core/acceptance/s2/us3-resultado.test.ts` |
| S2-US3-AC6 a S2-US3-AC8 | T022 | `tests/core/acceptance/s2/us3-historico.test.ts` |
| S2-US4-AC1, S2-US4-AC2, S2-US4-AC7 a S2-US4-AC12 | T004 | `tests/core/acceptance/s2/us4-preparacao.test.ts` |
| S2-US4-AC3 a S2-US4-AC5 | T026 | `tests/core/acceptance/s2/us4-falha-em-tick.test.ts` |
| S2-US4-AC6 | T027 | `tests/core/acceptance/s2/us4-desativado-sumo.test.ts` |
| S2-US5-AC1 | T030 | `tests/core/acceptance/s2/us5-mundos.test.ts` |
| S2-US5-AC2 e S2-US5-AC3 | T031 | `tests/core/acceptance/s2/us5-controladores.test.ts` |

### Requisitos funcionais

| Requisitos | Tarefas de teste | Tarefas de implementação |
|---|---|---|
| S2-FR-001 a S2-FR-003 | T009, T011 | T013 |
| S2-FR-004 a S2-FR-006 | T009, T011 | T012, T013 |
| S2-FR-007, S2-FR-008 | T010, T021, T036 | T014, T015, T016, T024 |
| S2-FR-009, S2-FR-010 | T003, T004, T005, T031 | T007, T008, T016, T033 |
| S2-FR-011, S2-FR-012 | T003, T004, T031, T034 | T007, T008, T016, T035 |
| S2-FR-013 a S2-FR-015 | T003, T005, T010, T018 | T007, T015, T016, T020, T029 |
| S2-FR-016 | T005, T010 | T015 |
| S2-FR-017 a S2-FR-020 | T005, T017, T026 | T015, T019, T028 |
| S2-FR-021 | T018, T036 | T020 |
| S2-FR-022 a S2-FR-024 | T003, T004, T005, T036 | T007, T015 |
| S2-FR-025 a S2-FR-027 | T026, T027 | T028, T029 |
| S2-FR-028 a S2-FR-031 | T021, T027, T034, T037 | T023, T024, T029, T035 |
| S2-FR-032, S2-FR-033 | T022, T030, T031, T034, T037 | T016, T023, T025, T032, T035 |
| S2-FR-034 | T010, T021, T026, T027, T034 | T014, T016, T024, T029, T035 |
| S2-FR-035 | T030 | T032 |
| S2-FR-036 | T031 | T033 |

### Contratos e decisões da clarificação

| Contrato ou decisão | Testes previstos |
|---|---|
| [Mundo](contracts/world.md) | T009, T011, T021 e T030 |
| [API do controlador](contracts/controller-api.md) | T003, T005, T010, T017, T018, T026 e T031 |
| [API do núcleo](contracts/core-api.md) | T004, T010, T021 e T022 |
| [Estado](contracts/state.md) | T009, T010, T021, T022, T026 e T034 |
| [Erros](contracts/errors.md) | T004, T026 e T034 |
| [CLI](contracts/cli.md) | T034 |
| Q-010 e ADR-009 · Leituras observadas e publicadas | T010 e T021 |
| Q-011 e ADR-010 · Carga antes do tick 0 | T003, T004 e T005 |
| Q-012 e ADR-011 · Histórico até o último tick executado | T022 |
| Q-013 e ADR-012 · Um erro por falha de carga | T004 |
| Q-014 e ADR-013 · Evento da partida sem robô associado | T021 e T034 |
| Q-015 e ADR-014 · Erros estruturais e de carga na mesma resposta | T004 e T034 |
| ADR-016 · Fronteira síncrona e equivalência entre formas de avanço | T003, T004, T005 e T036 |

## Estratégia de entrega

1. Validar o **MVP na US1** com o quickstart de laser e os critérios da fase, após setup e fundação.
2. Completar US2 e US3 para uma luta de ponta a ponta. Executar US4 e US5 na ordem com seus checkpoints.
3. Fechar as validações da CLI, navegador, desempenho e cobertura na fase final. O ensaio de regeneração, o merge e a tag seguem o fechamento separado do AGENTS.md §15 e §18.

## Incremento de sumô
- [X] T043 [US3] Testar S2-US3-AC11 a AC13, implementar estado de progresso, regra de empate, opções de biblioteca e CLI — src/core/{match,sim,api}, src/cli/run-cli.ts, testes de sumô e CLI — S2-FR-037. Pronto com casos físicos e benchmark legado verificados.

- [X] T044 [US3] Testar S2-US3-AC14/15 e implementar o giro após contato, limites inclusivos e encerramento determinístico — `src/core/match/sumo.ts`, `src/core/sim/step.ts`, `src/core/types.ts`, `src/core/index.ts`, testes de impasse — S2-FR-037, ADR-019. Campos [StallState.pair, StallState.sinceTick, StallState.pairContact](data-model.md). Pronto com o duelo e as fronteiras verificados.

- [X] T045 [US2] Testar S2-US2-AC13/14 e implementar o sensor no núcleo e na API comum — `src/core/sensors/edge.ts`, `src/core/index.ts`, `src/core/controller/api.ts`, `eslint.config.js`, `tests/core/acceptance/s2/us2-borda.test.ts`, `tests/runtime/edge-strategy.test.ts` — S2-FR-038. Campos [EdgeReading.front, EdgeReading.rear, EdgeReading.left, EdgeReading.right](data-model.md#leitura-derivada-de-borda). Pronto com quatro direções, empurrão, limites, cópia e controlador personalizado validados.

- [X] T046 [US5] Medir a geometria, percorrer os três mundos com o Navegador e testar a chegada após contatos. Entregar mundos, controlador e regra em `examples/`, `src/core/match/`, `tests/core/acceptance/s2/maze.test.ts` — S2-FR-039, S2-US5-AC4 e AC5.

- [X] T047 [US3] Testar primeiro a fronteira temporal, comandos e igualdade de ticks. Implementar fiscalização e resultado na API, runner, simulação e regra de sumô, incluindo a opção --sumo-start-delay da CLI — S2-FR-040, S2-US3-AC16 a AC18.

- [X] T048 [US3] Testar a fronteira temporal e a decisão imutável, guardar o primeiro comando e integrar 0.50 s de movimento com colisões em `src/core/{controller,sim,match,api}` e na CLI — S2-FR-040, S2-US3-AC16 a AC19.

- [X] T049 [US2] Testar pacote, funções públicas, isolamento, persistência e limites antes da IDE; implementar adaptador em src/runtime/portugol e dependências locais — S2-FR-041, S2-US2-AC15/16.

- [ ] T050 [US5] Testar variedade por semente, geometria por dificuldade e chegada do Navegador antes de implementar o gerador em `src/worlds/maze.ts` e `tests/core/acceptance/s2/maze.test.ts` — S2-FR-039, S2-US5-AC4/5/6.
