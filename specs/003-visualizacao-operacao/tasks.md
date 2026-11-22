# Tasks · Visualização 3D e operação

**Spec** 003 · [Especificação](spec.md) · [Plano](plan.md) · [Modelo](data-model.md)

O teste de uma fase deve falhar pela implementação ausente antes do código.
Marcar as tarefas de teste quando a fase ficar verde. Cada tarefa concluída
registra os testes e a cobertura no registro e tem seu próprio commit.

## Fase 1 · Setup

- [X] T001 Confirmar Node 24, a base da tag `spec-002-fechada`, os 233 testes de regressão, a cobertura inicial e o Duelo da S2 — `docs/registro-de-consolidacao.md` — RB-08, RB-12, S3-FR-001. **Dep.** Análise e portão de implementação liberados. **Pronto** Base reproduzida.
- [X] T002 Fixar Three.js, tipos e CodeMirror conforme R1. Checar lint, instalação e compilação do pacote — `package.json`, `package-lock.json` — ADR-008, S3-FR-005, S3-FR-023. **Dep.** T001. **Pronto** Imports resolvem em Node e Vite.

## Fase 2 · Fundação

- [X] T003 Escrever os testes da sessão inicial com o Duelo no tick 0, textos aplicados, fonte do snapshot e instância estável. Atualizar teste de montagem da tela em conjunto com a mudança de título — `tests/ui/s3/session.test.tsx`, `tests/ui/app.test.tsx` — S3-FR-001, S3-FR-002, S3-FR-021, S3-FR-022. **Dep.** T002. **Pronto** Testes verdes com T004.
- [X] T004 Implementar catálogo de textos, sessão observável e tela inicial. Preparar candidato pela API pública e publicar tick 0 com fontes e estado do núcleo — `src/ui/arena/catalog.ts`, `src/ui/arena/session.ts`, `src/ui/App.tsx` — S3-FR-001, S3-FR-002, S3-FR-019, S3-FR-021, S3-FR-022. **Dep.** T003 (RED). **Pronto** Duelo pronto e base S1/S2 verde. Campos [Sessão viva.worldText, Sessão viva.world, Sessão viva.simulation, Sessão viva.controllers, SessionView.snapshot, SessionView.world](data-model.md#modelo-de-dados--spec-003).

## Fase 3 · US1 — Ver a luta em 3D (P1)

- [X] T005 [US1] Escrever S3-US1-AC1 a S3-US1-AC10 para mundo e snapshot, comprimentos, orientação, câmera, visibilidade e alerta — `tests/ui/s3/us1-cena.test.tsx` — S3-FR-001, S3-FR-002, S3-FR-005 a S3-FR-011. **Dep.** T004. **Pronto** Os dez critérios passam com T006; gestos reais entram em T018.
- [X] T006 [US1] Implementar projeção 3D, montagem e atualização de objetos, enquadramento, órbita, zoom e pan, controles de câmera, rótulos e raios — `src/ui/scene/projection.ts`, `src/ui/scene/camera.ts`, `src/ui/scene/graphics.ts`, `src/ui/scene/ArenaView.tsx`, `src/ui/App.tsx`, `src/ui/arena.css` — S3-FR-001, S3-FR-002, S3-FR-005 a S3-FR-011, S3-FR-037. **Dep.** T005 (RED). **Pronto** Vetor do Duelo e configurações verificáveis. Campos [SessionView.snapshot, SessionView.world, Preferências.raios, Preferências.rótulos, Preferências.vista](data-model.md#modelo-de-dados--spec-003).

## Fase 4 · US2 — Controlar o tempo (P1)

- [X] T007 [US2] Escrever S3-US2-AC1 a S3-US2-AC10 com relógio injetado ou controlado, estado do fim, teclado e pausa por visibilidade — `tests/ui/s3/us2-operacao.test.tsx` — S3-FR-001 a S3-FR-004, S3-FR-012 a S3-FR-018. **Dep.** T006. **Pronto** Os dez critérios passam com T008.
- [X] T008 [US2] Implementar avanço fixo, limite de trabalho, botões, atalho, status, velocidades, reset e captura incremental dos estados vivos — `src/ui/arena/clock.ts`, `src/ui/arena/session.ts`, `src/ui/App.tsx` — S3-FR-001 a S3-FR-004, S3-FR-012 a S3-FR-018, S3-FR-029. **Dep.** T007 (RED). **Pronto** Duelo e reset reproduzem tick 34. Campos [SessionView.modo, SessionView.status, SessionView.velocidade, SessionView.avisos, Preferências.velocidade, Relógio.tempo, Relógio.fração, Gravação.states](data-model.md#modelo-de-dados--spec-003).

## Fase 5 · US3 — Carregar mundos e controladores (P1)

- [X] T009 [US3] Escrever S3-US3-AC1 a S3-US3-AC9 para mundos válidos e inválidos, rascunhos por robô e operações de código — `tests/ui/s3/us3-controladores.test.tsx` — S3-FR-019 a S3-FR-025. **Dep.** T008. **Pronto** Os nove critérios passam com T010.
- [X] T010 [US3] Implementar carregamentos transacionais, seletor de mundo, cartões CodeMirror e ações de restaurar, abrir, salvar e aplicar. Apresentar falha, invalidação de resposta assíncrona antiga e controlador desativado — `src/ui/arena/session.ts`, `src/ui/arena/files.ts`, `src/ui/panels/Controllers.tsx`, `src/ui/panels/CodeEditor.tsx`, `src/ui/App.tsx` — S3-FR-019 a S3-FR-025, S3-FR-037. **Dep.** T009 (RED). **Pronto** Erros preservam sessão e fontes. Campos [Sessão viva.controllers, Sessão viva.drafts, Rascunho.texto, Rascunho.exemplo, SessionView.erros](data-model.md#modelo-de-dados--spec-003).

## Fase 6 · US4 — Inspecionar sensores e resultado (P2)

- [X] T011 [US4] Escrever S3-US4-AC1 a S3-US4-AC6 para estado observado, campos numéricos, filtros, global e desfechos — `tests/ui/s3/us4-inspecao.test.tsx` — S3-FR-002, S3-FR-003, S3-FR-026 a S3-FR-028. **Dep.** T010. **Pronto** Os seis critérios passam com T012.
- [X] T012 [US4] Implementar cartões de inspeção, gráfico, eventos, filtros e aviso de resultado. Ler campos públicos da S2 e aplicar formatação pt-BR — `src/ui/panels/Inspection.tsx`, `src/ui/panels/Events.tsx`, `src/ui/App.tsx`, `src/ui/arena.css` — S3-FR-002, S3-FR-003, S3-FR-026 a S3-FR-028. **Dep.** T011 (RED). **Pronto** Tick 0, vitória e empates conferidos. Campos [SessionView.snapshot, Preferências.filtros](data-model.md#modelo-de-dados--spec-003).

## Fase 7 · US5 — Gravar e rever (P2)

- [X] T013 [US5] Escrever S3-US5-AC1 a S3-US5-AC11 para snapshots, ida e volta em JSON, bloqueios, fidelidade, arquivos inválidos e retorno ao vivo — `tests/ui/s3/us5-replay.test.tsx` — S3-FR-029 a S3-FR-035. **Dep.** T012. **Pronto** Os onze critérios passam com T014 e T015.
- [X] T014 [US5] Implementar gravação v1, data, nome, prefixos, validação de estado e erros de campo. Aplicar limite inclusivo, sem reexecutar scripts no importador — `src/ui/arena/recording.ts`, `src/ui/arena/recording-state.ts`, `src/ui/arena/session.ts` — S3-FR-029, S3-FR-030, S3-FR-032, S3-FR-033, S3-FR-034. **Dep.** T013 (RED). **Pronto** Codec e limite validados. Campos [Gravação.format, Gravação.version, Gravação.world, Gravação.controllers, Gravação.createdAt, Gravação.states, Gravação.events, Gravação.eventCount](data-model.md#modelo-de-dados--spec-003).
- [X] T015 [US5] Integrar navegação e playback de replay, abertura e exportação, bloqueios e transição segura ao vivo — `src/ui/arena/session.ts`, `src/ui/App.tsx`, `src/ui/arena.css` — S3-FR-031 a S3-FR-035. **Dep.** T014. **Pronto** Ida e volta preserva os estados e as falhas conservam o cursor. Campos [Sessão de replay.mundo, Sessão de replay.gravação, Sessão de replay.cursor, SessionView.modo](data-model.md#transições).

## Fase 8 · US6 — Modo apresentação (P3)

- [X] T016 [US6] Escrever S3-US6-AC1 a S3-US6-AC3 para placar, retorno e requisitos verificáveis de layout e foco — `tests/ui/s3/us6-apresentacao.test.tsx` — S3-FR-017, S3-FR-036 a S3-FR-039. **Dep.** T015. **Pronto** Os três critérios passam com T017.
- [X] T017 [US6] Integrar apresentação, rótulos, foco, contraste e quebra em 1024 px, preservando a sessão e a câmera — `src/ui/App.tsx`, `src/ui/arena.css` — S3-FR-017, S3-FR-036 a S3-FR-039. **Dep.** T016 (RED). **Pronto** Retorno pelo teclado e acesso à cena validados. Campos [Preferências.painel, Preferências.apresentação](data-model.md#modelo-de-dados--spec-003).

## Fase 9 · Acabamento

- [X] T018 Executar quickstart desde instalação limpa, regressões S1/S2 e navegador com WebGL. Medir FPS e latência com ambiente identificado e conferir replay e controles reais — `specs/003-visualizacao-operacao/quickstart.md`, `docs/registro-de-consolidacao.md` — S3-SC-001, S3-SC-002, S3-SC-004, S3-SC-005, RB-08, S3-FR-001, S3-FR-010, S3-FR-031. **Dep.** T017. **Pronto** Evidência registrada com condições das medições.
- [X] T019 Atualizar README, rodar `npm run stats`, versionar métricas e conferir workflow em push e PR, rastrear os 39 requisitos — `README.md`, `docs/cobertura/resumo.md`, `docs/cobertura/coverage-summary.json`, `docs/rastreabilidade.md` — RB-08, RB-09, RB-12, S3-FR-001. **Dep.** T018. **Pronto** Métricas reproduzíveis e matriz preenchida.
- [X] T020 Registrar a demonstração aprovada de SC-003 e SC-006. Cronometrar a troca por um exemplo e a conclusão do Duelo. Conferir vencedor e motivo no placar, sem consultar o código — `docs/registro-de-consolidacao.md`, `specs/003-visualizacao-operacao/spec.md` — S3-SC-003, S3-SC-006, RB-17, S3-FR-021, S3-FR-028. **Dep.** T018. **Pronto** Exceção, duração, vencedor e motivo registrados.

## Incremento · Retrocesso ao vivo

- [X] T021 [US2] Verificar e implementar o retrocesso ao vivo, a continuação determinística e a gravação até o cursor — `src/ui/App.tsx`, `src/ui/arena/session.ts`, testes S3-US2-AC11 a AC13 e matriz de rastreabilidade — S3-FR-002, S3-FR-012, S3-FR-029. **Dep.** T015. **Pronto** Passos repetidos, desfecho, memória, sorteios, logs e limite da gravação conferidos em comparação com a execução contínua.

## Dependências e cobertura

Fluxo por fase T001 → T002 → T003 (RED) → T004 → pares de US1 a US6 → T018
→ T019. T020 pode ocorrer depois de T018 sem modificar arquivos da aplicação.
Dentro do teste de uma história, projeção pura, cenários de UI e dados de
teste ocupam módulos distintos quando precisarem de trabalho independente.
A sessão e o App são compartilhados e seguem a sequência da tabela.

| História | Cenários | Teste | Implementação |
|---|---:|---|---|
| US1 · Cena | S3-US1-AC1 a S3-US1-AC10 | T005 | T006 |
| US2 · Tempo | S3-US2-AC1 a S3-US2-AC13 | T007, T021 | T008, T021 |
| US3 · Cargas | S3-US3-AC1 a S3-US3-AC9 | T009 | T010 |
| US4 · Observação | S3-US4-AC1 a S3-US4-AC6 | T011 | T012 |
| US5 · Replay | S3-US5-AC1 a S3-US5-AC11 | T013 | T014, T015 |
| US6 · Apresentação | S3-US6-AC1 a S3-US6-AC3 | T016 | T017 |

## Estratégia

A entrega mínima reúne cena, controles de tempo, mundos e scripts no
navegador. A seguir entram inspeção e replay. A apresentação vem por
último. A publicação, a regeneração e a tag pertencem ao fechamento.

## Incremento de operação do sumô
- [X] T022 [US2, US5] Testar S3-US2-AC14/15 e S3-US5-AC12, integrar seleção, reset pausado, registro do empate e leitura v1/v2 — src/ui/{arena,panels,App.tsx}, testes de sessão, UI e replay, métricas e matriz — S3-FR-040, S3-FR-041. Depende de S2-T043. Pronto com suíte, build, lint e cobertura aprovados.

- [X] T023 [US2, US5] Exibir Regra de Tempo e a contagem efetiva, preservar o reset pausado e implementar leitura e exportação conforme [Recording.version](data-model.md) — App, sessão, codec, testes S3-US2-AC16 e S3-US5-AC13, matriz e métricas — S3-FR-040, S3-FR-041, ADR-019. Depende de S2-T044. Pronto com retrocesso, v1/v2/v3, build, lint e cobertura verificados.

- [X] T024 [US4] Mostrar a leitura física da borda nos cartões e compartilhar o limiar com a cena — `src/ui/panels/Inspection.tsx`, `src/ui/scene/graphics.ts`, `tests/ui/s3/us4-inspecao.test.tsx`, README e rastreabilidade — S3-FR-042. Depende de S2-T045. Pronto com S3-US4-AC7 (ao vivo, retrocesso, reset, modo livre e replays antigos), suíte completa, lint e build.

- [X] T025 [US3] Integrar seleção, chegada visível, replay e troca explícita com estratégia preservada em `src/ui/` e `tests/ui/s3/maze.test.tsx`. Validar regressões e rastreabilidade — S3-FR-043, S3-US3-AC10.

- [X] T026 [US3] Separar Modo e Dificuldade e compartilhar a troca pausada com Próximo nível. Validar o catálogo, a estratégia e o rascunho, a exibição de arquivos e os seletores em replay — `src/ui/App.tsx`, `src/ui/arena/catalog.ts`, `src/ui/arena/session.ts`, `tests/ui/s3/maze.test.tsx` — S3-FR-019, S3-FR-043, S3-FR-044, S3-US3-AC11 e AC12.

- [X] T027 [US3] Exibir o cursor nativo com contraste no conteúdo editável de todos os controladores. Testar o estilo em `tests/ui/s3/us3-controladores.test.tsx` e verificar clique, setas e digitação no navegador nos três editores — `src/ui/arena.css` — S3-FR-023, S3-FR-038, S3-US3-AC13.

- [X] T028 [US2] Integrar largada, exemplos, contagem, resultado e gravação v5 em src/ui e examples/controllers. Verificar pausas, rewind, replays anteriores, regressões e atualizar os artefatos — S3-FR-045, S3-US2-AC17.

- [X] T029 [US2] Exibir “Queimou” junto a cada infrator, preservar operação e replays v1–v6 e verificar pontos, pausa e navegação em `src/ui` e `tests/ui/s3` — S3-FR-045, S3-US2-AC17 e AC18.

- [X] T030 [US3] Integrar Draft.language, Draft.source, SessionView.languages e Recording.languages (data-model.md) a sessão, arquivos, replay e tutorial do editor com testes de navegação e aplicação — S3-FR-046, S3-US3-AC14/15. Depende de S2-T049.
