# Registro da consolidação inicial

## 2026-11-17 · Constituição e arquitetura

1. **Inventário.** A raiz continha a instalação do Spec Kit para Codex, uma constituição em
   branco e o material de referência. O dossiê incluía a constituição v1.0.0 ratificada em
   2026-11-11, os ADRs aceitos, o briefing, as três specs e os artefatos de planejamento da S1.
2. **Conferência dos insumos.** Os cinco arquivos avulsos (`plan.md`, `research.md`,
   `data-model.md`, `quickstart.md` e `tasks.md`) foram comparados byte a byte com os equivalentes
   da S1 no dossiê. Cada par era idêntico. O enunciado e o briefing fundamentaram as restrições.
   Os ADRs e as specs fundamentaram as escolhas de arquitetura e os contratos.
3. **Resolução do template.** O comando
   `.specify/scripts/bash/resolve-template.sh constitution-template --json` resolveu o template
   ativo no Spec Kit. A configuração de hooks `.specify/extensions.yml` estava ausente na
   verificação anterior e posterior à atualização.
4. **Constituição.** A revisão editorial elevou a versão de 1.0.0 para **1.0.1**, preservou os
   nove princípios, a ratificação original, a stack do ADR-008, a modalidade do ADR-003 e os
   portões de qualidade. As diretrizes foram reunidas numa seção e detalhadas no
   [guia de arquitetura](arquitetura.md). As datas de ratificação e revisão representam etapas
   distintas. O relatório de sincronização fica no topo da [constituição](../.specify/memory/constitution.md).
5. **Organização da base permanente.** `AGENTS.md`, os oito documentos de referência e os treze
   arquivos de `specs/` foram copiados para seus caminhos canônicos com o conteúdo original. Foi
   usada uma única cópia dos artefatos da S1. O [README](../README.md) indica o estágio documental,
   centraliza a navegação e mantém o valor inicial de testes e cobertura até a geração pela S1-T006.
   O [roteiro para z.ai](roteiro.md) e o ADR-004 foram preservados como registros do pacote recebido.
   As skills desta instalação estão em `.agents/skills/`.
6. **Validação.** Foram conferidos a versão, as datas, os nove princípios e a ausência de campos
   de template pendentes. Os 22 arquivos importados conferem byte a byte com os originais. Em uma
   cópia temporária sem a pasta de referência, foram verificados 56 links relativos em 26
   documentos, a resolução do template e os pré-requisitos documentais da S1. O comando
   `check-prerequisites.sh --json --require-spec --require-tasks --include-tasks` usou
   `SPECIFY_FEATURE_DIRECTORY=specs/001-nucleo-simulacao` e `SPECIFY_FEATURE_NO_PERSIST=1`.

## Estado dos artefatos

| Etapa | Artefatos permanentes | Estado |
|---|---|---|
| Briefing e decisões | [Enunciado](enunciado.md), [requisitos](requisitos-briefing.md), [ADRs](decisoes.md) e [perguntas](perguntas.md) | Base importada com decisões e perguntas originais |
| Governança e arquitetura | [Constituição](../.specify/memory/constitution.md), [arquitetura](arquitetura.md) e [AGENTS.md](../AGENTS.md) | Constituição consolidada e diretrizes documentadas |
| S1 · Mundo e núcleo | [Spec](../specs/001-nucleo-simulacao/spec.md), [checklist](../specs/001-nucleo-simulacao/checklists/requirements.md), [plan](../specs/001-nucleo-simulacao/plan.md), [contratos](../specs/001-nucleo-simulacao/contracts/), [tasks](../specs/001-nucleo-simulacao/tasks.md) e anexos | Checklist concluído e os quatro pontos da revisão cruzada resolvidos nos artefatos. Tasks por executar |
| S2 · Sensores e controlador | [Spec](../specs/002-sensores-controlador/spec.md) | O plan deve fixar o algoritmo pseudoaleatório e os contratos da etapa |
| S3 · Visualização e operação | [Spec](../specs/003-visualizacao-operacao/spec.md) | O plan deve definir o mapeamento de coordenadas na cena e o contrato da gravação |

A validação desta etapa foi documental. Os testes da aplicação, a cobertura, a execução do
quickstart e os ensaios de regeneração pertencem às etapas de implementação e fechamento.

## Pontos para a revisão dos artefatos

- **Cobertura da S1.** O piso constitucional é de 80% de linhas no projeto e a meta geral do
  núcleo é de 90%. O plan e S1-T002 especificam limites mais estritos para a S1. Q-005 continua
  aberta quanto ao formato aceito pelo professor. A proposta na pergunta põe o HTML completo no
  repositório, enquanto a pesquisa R10 e o plan tratam o HTML como artefato de CI e versionam
  o resumo e o JSON.
- **Leituras de laser da S2.** A Q-010 foi resolvida no ADR-009. O controlador observa o início do
  passo e cada estado publicado guarda as leituras das próprias poses. A Spec 002 registra a regra
  e os casos de aceite.
- **Origem dos requisitos.** A revisão da S1 completou as referências exigidas pelo Princípio VI.
  A revisão da S2 ainda deve tratar casos como S2-FR-006.
  A [matriz](rastreabilidade.md) ainda é um esqueleto do dossiê, inclusive para a S1, que já tem
  tasks disponíveis e será preenchida no fechamento conforme o fluxo do projeto.
- **Perguntas externas.** Q-001, Q-003, Q-004 e Q-005 continuam abertas. As outras perguntas
  mantêm os padrões adotados nas specs e o histórico de aprovação já registrado nos ADRs.

## 2026-11-17 · Especificação oficial e estrutura inicial

1. Conferi o dossiê de `instruções`, o briefing, os ADRs, a constituição, o guia de arquitetura
   e o pacote da S1. O ADR-005 estabelece três specs. O plan, os contratos e as tasks já
   disponíveis detalham a S1.
2. Resolvi o template ativo com `.specify/scripts/bash/resolve-template.sh spec-template --json`.
   A ausência de `.specify/extensions.yml` dispensou hooks antes e depois da revisão.
3. Estruturei o [spec.md oficial da S1](../specs/001-nucleo-simulacao/spec.md) no caminho existente.
   Preservei os IDs, os exemplos numéricos e os anexos de mundo e erros. Identifiquei os 35
   cenários, completei as origens dos 40 requisitos e mapeei as verificações já previstas.
   Explicitei o escopo das etapas do tick e alinhei os textos de validação e de erros aos contratos.
4. Preenchi o [checklist de qualidade](../specs/001-nucleo-simulacao/checklists/requirements.md)
   e defini `specs/001-nucleo-simulacao` como feature ativa local em `.specify/feature.json`.
   Mantive as Specs 002 e 003 e os artefatos de planejamento da S1 tal como foram recebidos.
5. Criei a estrutura prevista no plan para núcleo, CLI, interface, testes, exemplos, scripts,
   cobertura e automação. Os arquivos vazios `.gitkeep` permitem manter as pastas no Git até
   que as tarefas adicionem seus conteúdos.
6. Conferi os IDs, origens, links, exemplos e diretórios. O comando
   `check-prerequisites.sh --json --require-spec --require-tasks --include-tasks` resolveu a S1
   pelo ponteiro local e encontrou o planejamento e as tasks.

## 2026-11-17 · Correções da revisão cruzada da S1

1. **Validação da arena.** FR-011, o modelo, o contrato do mundo e S1-T022 passaram a explicitar a
   comparação entre a distância do centro inicial e o raio da arena. S1-US1-AC11 e S1-T016 cobrem
   o centro sobre a borda, com parte do corpo para fora, e o centro além da borda.
2. **Histórico após o reset.** FR-038, S1-US3-AC4, o modelo e o contrato da API registram que o
   histórico habilitado recomeça com apenas o estado do tick 0 e que a consulta sem histórico
   retorna uma lista vazia. O plan, a decisão R7 e as tarefas S1-T029, S1-T032 e S1-T033 refletem
   essa regra.
3. **Referências por campo.** As tarefas de implementação passaram a citar os campos do modelo
   nas seções que os definem. As referências abrangem o mundo normalizado, os tipos de pose e
   comando, os estados, os erros e os resultados de carregamento e execução.
4. **CI.** O plan e S1-T007 passaram a exigir verificações de commits e das métricas do README
   e da cobertura nos dois eventos, `push` e `pull_request`. O plan define o intervalo de commits
   por evento. A task inclui verificar a falha dos dois eventos com commits inválidos ou métricas
   desatualizadas.
5. **Nova validação.** Conferi as duas variantes numéricas da arena, as regras de histórico nos
   dois modos e as checagens de CI previstas. A comparação documental confirmou 56 campos
   referenciados nas tarefas de implementação, 40 requisitos citados nas 50 tarefas e 36
   critérios de aceite mapeados. As âncoras, os pré-requisitos do Spec Kit e `git diff --check`
   também passaram. A execução do workflow e dos testes da aplicação pertence às tarefas de
   implementação da S1.

## 2026-11-17 · Implementação sequencial da S1

A implementação seguiu a ordem de T001 a T049 na branch `001-nucleo-simulacao`.
Cada checkpoint executou a suíte e a cobertura assim que o Vitest esteve disponível.
Durante o TDD, as falhas e a cobertura intermediária foram medidas com os testes da fase
ainda dependentes da próxima implementação. Os itens foram marcados após passar pelo
checkpoint integrado.

| Tarefa | Testes passando | Linhas / instruções / funções / ramos (%) | Resultado no checkpoint |
|---|---:|---|---|
| T001 | — | — | Build e TypeScript passaram. O Vitest entra na T002. |
| T002 | 0 | 0 / 0 / 0 / 100 | aguarda o primeiro teste (T003) |
| T003 | 1 | 100 / 100 / 100 / 100 | ok |
| T004 | 1 | 100 / 100 / 100 / 100 | ok |
| T005 | 1 | 100 / 100 / 100 / 100 | ok |
| T006 | 3 | 95.23 / 95.23 / 100 / 87.5 | ok |
| T007 | 3 | 95.23 / 95.23 / 100 / 87.5 | ok |
| T008 | 3 | 95.23 / 95.23 / 100 / 87.5 | ok |
| T009 | 3 | 95.23 / 95.23 / 100 / 87.5 | ok |
| T010 | 3 | 95.23 / 95.23 / 100 / 87.5 | TDD em andamento em angle.test.ts |
| T011 | 11 | 96.42 / 96.42 / 100 / 91.66 | ok |
| T012 | 11 | 96.42 / 96.42 / 100 / 91.66 | TDD em andamento em geometry.test.ts |
| T013 | 16 | 96.87 / 96.87 / 100 / 91.66 | ok |
| T014 | 16 | 96.87 / 96.87 / 100 / 91.66 | ok |
| T015 | 16 | 96.87 / 96.87 / 100 / 91.66 | ok |
| T016 | 16 | 96.87 / 96.87 / 100 / 91.66 | TDD em andamento em us1-world-validation.test.ts |
| T017 | 16 | 96.87 / 96.87 / 100 / 91.66 | TDD em andamento em us1-world-validation.test.ts |
| T018 | 16 | 96.87 / 96.87 / 100 / 91.66 | TDD em andamento em validate.test.ts, us1-world-validation.test.ts |
| T019 | 16 | 60.78 / 60.78 / 37.03 / 91.66 | TDD em andamento em validate.test.ts, us1-world-validation.test.ts |
| T020 | 16 | 54.38 / 54.38 / 37.03 / 91.66 | TDD em andamento em validate.test.ts, us1-world-validation.test.ts |
| T021 | 16 | 26.49 / 25.83 / 27.02 / 13.58 | TDD em andamento em validate.test.ts, us1-world-validation.test.ts |
| T022 | 16 | 19.25 / 18.12 / 24.39 / 7.53 | TDD em andamento em validate.test.ts, us1-world-validation.test.ts |
| T023 | 62 | 99.41 / 98.35 / 100 / 96.66 | ok |
| T024 | 62 | 99.41 / 98.35 / 100 / 96.66 | TDD em andamento em us2-kinematics.test.ts |
| T025 | 62 | 99.41 / 98.35 / 100 / 96.66 | TDD em andamento em kinematics.test.ts, us2-kinematics.test.ts |
| T026 | 64 | 99.41 / 98.36 / 100 / 96.66 | TDD em andamento em us2-kinematics.test.ts |
| T027 | 64 | 98.27 / 97.31 / 95.65 / 96.66 | TDD em andamento em us2-kinematics.test.ts |
| T028 | 64 | 90.95 / 90.5 / 83.01 / 95.39 | TDD em andamento em us2-kinematics.test.ts |
| T029 | 64 | 83.41 / 82.27 / 73.33 / 87.87 | TDD em andamento em us2-kinematics.test.ts |
| T030 | 64 | 83.41 / 82.27 / 73.33 / 87.87 | TDD em andamento em run-headless.test.ts, us2-kinematics.test.ts |
| T031 | 81 | 97.73 / 96.66 / 96.87 / 95.53 | ok |
| T032 | 86 | 99.54 / 98.75 / 100 / 97.2 | ok |
| T033 | 86 | 99.54 / 98.75 / 100 / 97.2 | ok |
| T034 | 86 | 99.54 / 98.75 / 100 / 97.2 | TDD em andamento em run-cli.test.ts |
| T035 | 100 | 99.59 / 98.88 / 100 / 97.47 | ok |
| T036 | 102 | 99.59 / 98.88 / 100 / 97.47 | TDD em andamento em us4-collisions.test.ts |
| T037 | 102 | 99.59 / 98.88 / 100 / 97.47 | TDD em andamento em obstacles.test.ts, us4-collisions.test.ts |
| T038 | 111 | 99.63 / 98.97 / 100 / 97.6 | TDD em andamento em us4-collisions.test.ts |
| T039 | 114 | 99.63 / 98.98 / 100 / 97.6 | ok |
| T040 | 115 | 99.63 / 98.98 / 100 / 97.6 | TDD em andamento em us5-push.test.ts |
| T041 | 115 | 99.63 / 98.98 / 100 / 97.6 | TDD em andamento em contacts.test.ts, us5-push.test.ts |
| T042 | 120 | 99.65 / 99.04 / 100 / 97.65 | TDD em andamento em us5-push.test.ts |
| T043 | 124 | 99.65 / 99.06 / 100 / 97.67 | ok |
| T044 | 124 | 99.65 / 99.06 / 100 / 97.67 | TDD em andamento em us6-odometry.test.ts |
| T045 | 127 | 99.66 / 99.06 / 100 / 97.67 | ok |
| T046 | 127 | 96.71 / 95.79 / 100 / 95.02 | ok |
| T047 | 128 | 96.72 / 95.79 / 100 / 95.02 | ok |
| T048 | 129 | 96.72 / 95.79 / 100 / 95.02 | ok |
| T049 | 129 | 96.72 / 95.79 / 100 / 95.02 | ok |

### Evidências para o PR da Spec 001

- **SC-001 e SC-002.** 129 testes passaram. Os 36 critérios têm testes identificados. A
  comparação exata dos históricos e os dois modos de reset passaram.
- **Cobertura de linhas.** 96.72% no projeto e 100.00% no núcleo.
  O Vitest também confirmou os limites de instruções, funções e ramos. [Relatório](cobertura/resumo.md)
- **SC-003.** 3.000 ticks com dois robôs em 5.47 ms na execução limpa com
  Node 24.22.3, Linux x64 e Intel Core i5-1334U. A meta é menos de 1 segundo.
- **Quickstart.** Instalação limpa, lint, tipos, suíte com cobertura, geração das métricas,
  build, simulação por terminal, respostas de erro e servidor Vite verificados.
  [Quickstart](../specs/001-nucleo-simulacao/quickstart.md)
- **CI.** Os scripts de validação foram executados localmente com dados de push e pull
  request. Ambos rejeitaram um commit inválido e métricas desatualizadas.
- **Publicação.** A descrição do [PR #2](https://github.com/Renan-pien/SheepBotz_Arena/pull/2)
  foi conferida no GitHub e contém os resultados do quickstart e do benchmark. A conferência
  confirmou que o PR compara `001-nucleo-simulacao` com `main`. T050 concluída.

## 2026-11-17 · Clarificação da S2

A [Spec 002](../specs/002-sensores-controlador/spec.md#clarifications) registra cinco
respostas confirmadas, da Q-010 à Q-014. Os [ADRs](decisoes.md) documentam a leitura do laser,
o carregamento dos controladores, o limite do histórico, a devolução conjunta das falhas de
carregamento e a associação do evento de fim da luta. Os cenários de aceitação cobrem cada
decisão. A próxima etapa do AGENTS.md §4 é o checklist da spec, seguido do planejamento.

## 2026-11-17 · Checklist da S2

A revisão documental conferiu os 36 requisitos funcionais e os 44 cenários de aceite da
Spec 002. As cinco decisões da clarificação estão refletidas nos requisitos e nos cenários.
O checklist registra sete verificações conformes, seis pendências documentais e uma dependência
externa. A Q-015 registra a lacuna no contrato de erros para entradas incompatíveis. O
procedimento de benchmark e a premissa da Q-001 foram encaminhados ao plano.
[Checklist da Spec 002](../specs/002-sensores-controlador/checklists/clarificacao.md)

### Revalidação após aprovação da Q-015

- O ADR-014 registra o contrato de erros e a lista conjunta de falhas. A Spec 002 inclui
  os cenários para ID ausente, comando concorrente e combinação com falha de carregamento.
- A Spec 002 cobre os limites do sumô, o deslocamento por empurrão do robô desativado, a janela
  de execução em modo livre, o benchmark de 3 000 ticks e a origem dos 36 requisitos.
- O núcleo da S1 confirmou os centros a 0,5000 m e 0,5625 m nos ticks 1 e 2 do cenário de
  borda, o empurrão para 0,390 m no tick 34 e as posições fixas dos centros na referência de
  3 000 ticks. A medição de desempenho da S2 fica para a implementação.
- A revalidação reuniu 48 cenários e 14 verificações, com 13 conformes e a Q-001 registrada
  como premissa. A próxima etapa é `$speckit-plan`.
  [Avaliação do checklist](../specs/002-sensores-controlador/checklists/clarificacao.md#avaliação-documental)

## 2026-11-17 · Planejamento da S2

O plano, a pesquisa, o modelo de dados, os contratos e o quickstart registram o desenho de
laser, controladores e sumô. O Constitution Check foi conferido com o mapa dos 36 requisitos
e a avaliação dos 14 itens do checklist. Q-001 permanece como premissa externa.
O ensaio isolado avaliou o runtime em Node 24.22.3 e em Chrome com Vite. A suíte de
regressão da S1 passou com 129 testes em Node 24.22.3.
O ADR-015 registra a proposta técnica e seus consumidores. A etapa seguinte é gerar as tasks.
[Plano da Spec 002](../specs/002-sensores-controlador/plan.md)

## 2026-11-17 · Tarefas da S2

Foram organizadas 42 tarefas em oito fases, com dependências, arquivos, critérios de conclusão
e rastreabilidade. A fundação antecipa testes dos 7 cenários da US2 e dos 8 cenários da US4 que
exercitam o código compartilhado pela primeira fatia. A validação documental confirmou o formato,
a cobertura dos 36 requisitos e dos 48 cenários, as referências ao modelo e a ausência de
dependências para tarefas posteriores. A próxima etapa é `$speckit-analyze`.
[Tarefas da Spec 002](../specs/002-sensores-controlador/tasks.md)

### Correções da análise da S2

As correções seguiram a ordem da spec, plano e contratos, modelo e tasks.

| Achados | Alteração |
|---|---|
| C01 e C02 | ADR-016, requisitos FR-009, FR-012 e FR-024 e perfil síncrono no plano. Presença de `Promise` e `Array.fromAsync` verificada como indisponível em ensaios isolados em Node 24.22.3 e Chrome com Vite. Os ensaios deram a mesma sequência em lote e passo a passo. |
| A01 e R01 | `SimState.resultado` explícito em cada snapshot, com `null` durante a execução. Modelo e tasks usam `ControllerLogLimit.acceptedCount`, `ControllerLogLimit.warningEmitted` e `ControllerRandom.state`. |
| V01 e O01 | S2-US1-AC2 e Anexo A agora usam mapa de 4 × 2 m com vetor rotacionado distinto. T011 prepara os vetores unitários de `laser.ts`, T013 os verifica e T014 valida os cenários públicos do tick 0. |

A alteração manteve 36 requisitos funcionais, 48 cenários e 42 tarefas. U01, sobre a ordem
de conversão dos logs excedentes, continua como achado médio da revisão.
[ADR-016](decisoes.md#adr-016--fronteira-síncrona-dos-controladores-da-spec-002)

## Execução da Spec 002

Confirmação do usuário registrada para executar com o checklist de clarificação no estado atual. Cobertura na ordem instruções, ramos, funções e linhas.

| Tarefa | Testes | Projeto (%) | Núcleo (%) | Evidência |
|---|---|---|---|---|
| T001 | 129 passaram / 0 falharam | 95.79 / 95.02 / 100 / 96.72 | 99.27 / 97.87 / 100.00 / 100.00 | Node 24.22.3. npm ci, lint, tipos e cobertura passaram. Gatilhos de push e pull_request conferidos. |
| T002 | 129 passaram / 0 falharam | 95.79 / 95.02 / 100 / 96.72 | 99.27 / 97.87 / 100.00 / 100.00 | SES 2.3.0 e Acorn 8.15.0 conforme ADR-015 e plano autorizado. Lockfile reproduzido por npm ci. |
| T006 | 129 passaram / 0 falharam | 95.79 / 95.02 / 100 / 96.72 | 99.27 / 97.87 / 100.00 / 100.00 | Janela fixa e travessia de arena preservadas em modo livre. T003 a T005 em RED por interfaces ainda ausentes, com a base verde medida separadamente. |
| T007 | 138 passaram / 0 falharam | 95.49 / 93.46 / 100 / 96.24 | 98.91 / 97.41 / 100.00 / 99.60 | Validação sintática e perfil SES passaram nos testes isolados, incluindo carga e preservação da mensagem. |
| T003 | 138 passaram / 0 falharam | 95.49 / 93.46 / 100 / 96.24 | 98.91 / 97.41 / 100.00 / 99.60 | RED inicial por motor ausente, com 129 testes da base e 96.72% de linhas. Nove testes do motor verdes após T007. |
| T008 | 140 passaram / 0 falharam | 95.37 / 93.3 / 98.86 / 96.25 | 98.39 / 96.77 / 98.67 / 99.29 | Testes unitários passaram para ordem, mensagens, acúmulo e elegibilidade. Testes públicos da T004 aguardam T016. |
| T012 | 144 passaram / 0 falharam | 95.61 / 93.75 / 98.9 / 96.43 | 98.49 / 97.05 / 98.72 / 99.33 | Interseções de retângulo e círculo passaram, inclusive tangência e paralelismo. |
| T013 | 152 passaram / 0 falharam | 95.78 / 93.69 / 98.93 / 96.7 | 98.39 / 96.62 / 98.77 / 99.40 | Vetores do Anexo A passaram em laser.test.ts, inclusive a rotação no mapa assimétrico. |
| T011 | 152 passaram / 0 falharam | 95.78 / 93.69 / 98.93 / 96.7 | 98.39 / 96.62 / 98.77 / 99.40 | RED da geometria confirmado antes do código. Interseções, varredura pura e limites de mundo passam. |
| T014 | 160 passaram / 0 falharam | 95.79 / 93.69 / 98.95 / 96.71 | 98.40 / 96.62 / 98.80 / 99.40 | Os oito cenários públicos do tick 0 e as comparações da S1 passaram. |
| T009 | 160 passaram / 0 falharam | 95.79 / 93.69 / 98.95 / 96.71 | 98.40 / 96.62 / 98.80 / 99.40 | RED anterior de 9 asserções. Os 8 ACs e a regressão do estado passaram após T014. |
| T015 | 161 passaram / 0 falharam | 94.28 / 91.54 / 97.16 / 95.34 | 96.23 / 93.75 / 96.77 / 97.36 | Ciclo unitário passou com 1 000 logs, aviso único, descarte sem conversão e API revogada. |
| T016 | 184 passaram / 0 falharam | 95.42 / 93.35 / 99.12 / 96.35 | 97.53 / 95.92 / 99.01 / 98.50 | US1 e testes públicos antecipados passam. Reset carrega nova sessão antes de publicar tick 0. |
| T004 | 184 passaram / 0 falharam | 95.42 / 93.35 / 99.12 / 96.35 | 97.53 / 95.92 / 99.01 / 98.50 | RED da preparação por interfaces ausentes. Unidade ficou verde em T008 e os casos públicos passaram em T016. |
| T005 | 184 passaram / 0 falharam | 95.42 / 93.35 / 99.12 / 96.35 | 97.53 / 95.92 / 99.01 / 98.50 | RED anterior, ciclo unitário verde em T015 e comparações públicas de comandos, reset e paridade verdes em T016. |
| T010 | 184 passaram / 0 falharam | 95.42 / 93.35 / 99.12 / 96.35 | 97.53 / 95.92 / 99.01 / 98.50 | RED com quatro falhas esperadas antes da integração. Cenários de leitura, cópia e reset passam em T016. |
| T019 | 189 passaram / 0 falharam | 95.67 / 93.69 / 99.15 / 96.4 | 97.80 / 96.31 / 99.05 / 98.53 | Testes da API e determinismo correspondentes passaram, com cobertura medida. |
| T017 | 189 passaram / 0 falharam | 95.67 / 93.69 / 99.15 / 96.4 | 97.80 / 96.31 / 99.05 / 98.53 | RED confirmado antes do código, com a base em 184 testes. Cenários verdes com T019. |
| T020 | 195 passaram / 0 falharam | 95.72 / 93.69 / 99.17 / 96.45 | 97.83 / 96.31 / 99.07 / 98.55 | Testes da API e determinismo correspondentes passaram, com cobertura medida. |
| T018 | 195 passaram / 0 falharam | 95.72 / 93.69 / 99.17 / 96.45 | 97.83 / 96.31 / 99.07 / 98.55 | RED confirmado antes do código, com a base em 184 testes. Cenários verdes com T020. |
| T023 | 197 passaram / 0 falharam | 95.83 / 93.63 / 99.18 / 96.53 | 97.89 / 96.13 / 99.08 / 98.59 | Testes correspondentes do sumô e regressões validados. |
| T024 | 204 passaram / 0 falharam | 95.85 / 93.93 / 99.18 / 96.55 | 97.91 / 96.47 / 99.08 / 98.60 | Testes correspondentes do sumô e regressões validados. |
| T021 | 204 passaram / 0 falharam | 95.85 / 93.93 / 99.18 / 96.55 | 97.91 / 96.47 / 99.08 / 98.60 | RED anterior ao código, com base de 195 testes registrada. Testes do contrato agora verdes. |
| T025 | 207 passaram / 0 falharam | 95.88 / 94.02 / 99.18 / 96.58 | 97.93 / 96.54 / 99.08 / 98.61 | Testes correspondentes do sumô e regressões validados. |
| T022 | 207 passaram / 0 falharam | 95.88 / 94.02 / 99.18 / 96.58 | 97.93 / 96.54 / 99.08 / 98.61 | RED anterior ao código, com base de 195 testes registrada. Testes do contrato agora verdes. |
| T028 | 210 passaram / 0 falharam | 96.29 / 94.6 / 99.18 / 97.02 | 98.37 / 97.20 / 99.08 / 99.10 | Falhas por robô e regressões validadas sem interrupção do simulador. |
| T029 | 215 passaram / 0 falharam | 96.31 / 94.71 / 99.18 / 97.03 | 98.39 / 97.27 / 99.09 / 99.10 | Falhas por robô e regressões validadas sem interrupção do simulador. |
| T026 | 215 passaram / 0 falharam | 96.31 / 94.71 / 99.18 / 97.03 | 98.39 / 97.27 / 99.09 / 99.10 | RED antes do código. Falha, comando descartado, mensagem e ordem dos robôs validados. |
| T027 | 215 passaram / 0 falharam | 96.31 / 94.71 / 99.18 / 97.03 | 98.39 / 97.27 / 99.09 / 99.10 | RED anterior. Desativação no tick 1, comando zero, empurrão e derrota no tick 34 verificados. |
| T032 | 216 passaram / 0 falharam | 96.31 / 94.71 / 99.18 / 97.03 | 98.39 / 97.27 / 99.09 / 99.10 | Arquivos de exemplo e execução pelos contratos públicos validados. |
| T030 | 216 passaram / 0 falharam | 96.31 / 94.71 / 99.18 / 97.03 | 98.39 / 97.27 / 99.09 / 99.10 | RED anterior pela ausência dos arquivos, com base de 215 testes medida. Exemplos validados após T032. |
| T033 | 223 passaram / 0 falharam | 96.48 / 94.96 / 99.18 / 97.03 | 98.59 / 97.58 / 99.09 / 99.10 | Arquivos de exemplo e execução pelos contratos públicos validados. |
| T031 | 223 passaram / 0 falharam | 96.48 / 94.96 / 99.18 / 97.03 | 98.59 / 97.58 / 99.09 / 99.10 | RED anterior pela ausência dos arquivos, com base de 215 testes medida. Exemplos validados após T033. |
| T035 | 231 passaram / 0 falharam | 96.58 / 95.08 / 99.18 / 97.12 | 98.59 / 97.58 / 99.09 / 99.10 | CLI v1/v2 testada com saída JSON, erros 0/1/2 e leituras UTF-8. |
| T034 | 231 passaram / 0 falharam | 96.58 / 95.08 / 99.18 / 97.12 | 98.59 / 97.58 / 99.09 / 99.10 | RED antes de implementar a flag, com 223 testes na base. Contrato CLI verde após T035. |
| T036 | 231 passaram / 0 falharam | 96.58 / 95.08 / 99.18 / 97.12 | 98.59 / 97.58 / 99.09 / 99.10 | Fixture real compilada pelo Vite e verificada em Chrome. Todo histórico coincide com Node 24. |
| T038 | 233 passaram / 0 falharam | 93.61 / 90.88 / 99.2 / 93.98 | 98.59 / 97.58 / 99.09 / 99.10 | Benchmark executado em Intel Core i5-1334U, Linux x64 e Node 24.22.3. S1 completou 3 000 ticks em 33,26 ms. S2 completou 3 000 ticks em 43,27 ms com tempo esgotado. |
| T037 | 233 passaram / 0 falharam | 93.61 / 90.88 / 99.2 / 93.98 | 98.59 / 97.58 / 99.09 / 99.10 | RED confirmado pela ausência do benchmark S2, com 231 testes na base. S1 e S2 passaram com 3 000 ticks efetivos e S2 sem histórico, após T038. |
| T039 | 233 passaram / 0 falharam | 93.61 / 90.88 / 99.2 / 93.98 | 98.59 / 97.58 / 99.09 / 99.10 | Instalação limpa, lint, tipos, build e quickstart aprovados. Foram confirmados 48/48 cenários e 35 estados completos idênticos nas duas lutas. Chrome 145.0.7632.116 e Node coincidiram nos cinco estados da fixture. Intel Core i5-1334U, Linux x64, Node 24.22.3: S1 em 29,24 ms e S2 em 41,47 ms, ambas com 3 000 ticks. A auditoria do npm relatou 12 ocorrências altas na árvore completa e zero nas dependências de produção. O quickstart direciona o bundle da fixture para o dist da raiz, ignorado pelo lint. A prévia e a suíte com cobertura passaram novamente. |
| T040 (demonstração) | 233 passaram / 0 falharam | 93.61 / 90.88 / 99.2 / 93.98 | 98.59 / 97.58 / 99.09 / 99.10 | O Codex criou o [Caçador reativo](../examples/controllers/cacador-reativo.js) a partir do Caçador, com o Anexo B como referência da API. Antes da edição, a verificação da CLI retornou 2 pela ausência do arquivo. Depois, vermelho venceu Parado por saída da arena no tick 42, com 43 estados e sem falha de controlador. A gravação da estratégia já preparada e a execução verificadas levaram 1,09 s. Evidência inicial submetida à aprovação como exceção de aceite. |
| T040 | 233 passaram / 0 falharam | 93.61 / 90.88 / 99.2 / 93.98 | 98.59 / 97.58 / 99.09 / 99.10 | Exceção de aceite do SC-005 aprovada pelo usuário. A reexecução confirmou a vitória de vermelho por saída da arena no tick 42, com 43 estados e sem falha de controlador. |
| T041 | 233 passaram / 0 falharam | 93.61 / 90.88 / 99.2 / 93.98 | 98.59 / 97.58 / 99.09 / 99.10 | README atualizado e métricas geradas com npm run stats. Origens, tarefas, commits e testes aprovados conferidos para os 36 FRs. As etapas do workflow de commitlint e métricas passaram em simulação local de push, primeiro push e pull_request. O HTML de cobertura foi gerado no caminho do artefato. |
| T042 | 233 passaram / 0 falharam | 93.61 / 90.88 / 99.2 / 93.98 | 98.59 / 97.58 / 99.09 / 99.10 | Build, quickstart, 48 cenários, demonstração aceita, benchmark e passos locais da CI reconferidos. Revisão SDD, checklist e evidências para o PR consolidados no registro. Ensaio de regeneração encaminhado para a etapa de fechamento. |

### Exceção de aceite do SC-005

Em 2026-11-17, o usuário aprovou usar a demonstração do Caçador Reativo feita
pelo Codex como evidência de aceite da Spec 002. A aprovação substitui, nesta
entrega, a sessão cronometrada de autoria e execução por um membro da equipe.
A medição de 1,09 s cobre a gravação do arquivo já elaborado e sua primeira
execução verificada. O tempo de elaboração da estratégia ficou fora da medição.

A T040 reexecutou a demonstração em Node 24.22.3. No Duelo padrão, Caçador
Reativo em vermelho venceu Parado por saída da arena no tick 42, com 43
estados no histórico e nenhum erro de controlador.
[Critério e exceção](../specs/002-sensores-controlador/spec.md#6-critérios-de-sucesso)

### Evidências para o PR da Spec 002

A implementação da Spec 002 na branch `002-sensores-controlador` reúne laser
por robô, controladores JavaScript síncronos, resultado de sumô e histórico
do tick 0 ao último tick executado. As 42 tarefas foram validadas e os 36
requisitos têm origem, tarefa, teste e commit na
[matriz de rastreabilidade](rastreabilidade.md#spec-002--sensores-controlador-e-regras-do-sumô).

- **Revisão SDD.** Os seis achados críticos e altos da análise foram tratados
  na spec, no plano, nos contratos, no modelo e nas tasks. A revisão confirmou
  a evidência de testes para os pontos corrigidos. U01, sobre a ordem da
  conversão de logs excedentes, segue como observação documental de severidade
  média. O teste unitário da T015 confirma o descarte antes da conversão.
  [Correções](#correções-da-análise-da-s2) ·
  [Teste de limite de logs](../tests/core/unit/controller-cycle.test.ts)
- **Checklist de clarificação.** Os 14 marcadores estão no estado autorizado
  pelo usuário. A avaliação documental registra 13 itens conformes e a
  Q-001 como premissa para a integração com a suíte externa.
  [Checklist](../specs/002-sensores-controlador/checklists/clarificacao.md#avaliação-documental)
- **S2-SC-001, S2-SC-002 e S2-SC-004.** Passaram 233 testes, com
  48 de 48 cenários de aceite. As duas execuções do Duelo no quickstart
  produziram os mesmos 35 estados, com eventos idênticos. A fixture Vite
  confirmou os mesmos cinco estados no Chromium e no Node. A suíte validou
  os erros agrupados de carga e a desativação durante chamadas do controlador.
- **S2-SC-003.** Em Intel Core i5-1334U, Linux x64 e Node 24.22.3, o Duelo
  com Parado e Girador finalizou por `tempo_esgotado` no tick 3 000 em
  41,92 ms, abaixo dos 2 s. O benchmark de regressão da S1 completou 3 000
  ticks em 32,18 ms.
- **S2-SC-005.** Aceito por exceção aprovada. A demonstração do Caçador Reativo
  confirmou vitória por saída da arena no tick 42. O escopo da medição e a
  autorização constam no [registro da exceção](#exceção-de-aceite-do-sc-005).
- **Quickstart.** Passaram instalação limpa, lint, tipos, testes com cobertura,
  build, laser no tick 0, Duelo com histórico, erros de entrada e Sala com
  obstáculos em modo livre.
  [Quickstart](../specs/002-sensores-controlador/quickstart.md)
- **CI local.** A cobertura de linhas ficou em 93,98% no projeto e 99,10% no
  núcleo. As etapas do workflow de commits e métricas passaram para push,
  primeiro push da branch e pull request. Os relatórios versionados foram
  reproduzidos e o HTML foi gerado no caminho do artefato. A execução no GitHub
  Actions fica para a publicação da branch e a abertura do PR.
  [Workflow](../.github/workflows/ci.yml) · [Cobertura](cobertura/resumo.md)

As evidências estão prontas para a descrição do PR de fechamento. O fluxo
do AGENTS.md §15 e §18 segue para o ensaio de regeneração em sessão nova,
com registro próprio, e depois para o fechamento com CI remota aprovada,
merge na `main` e tag `spec-002-fechada`.
[Procedimento de regeneração](../AGENTS.md#18-ensaio-de-regeneração)

### Fechamento da Spec 002

O [PR #4](https://github.com/Renan-pien/SheepBotz_Arena/pull/4) integrou a
implementação da Spec 002 à `main` em `d02c684`. A CI passou no
[push da branch](https://github.com/Renan-pien/SheepBotz_Arena/actions/runs/44210761763),
no [pull request](https://github.com/Renan-pien/SheepBotz_Arena/actions/runs/44210871738)
e no [push da main](https://github.com/Renan-pien/SheepBotz_Arena/actions/runs/44211137698).

O ensaio reconstruiu as Specs 001 e 002 em uma sessão nova. A primeira execução
passou em 189 de 233 testes, com todos os cenários de aceite aprovados. As falhas
levaram a esclarecimentos de interfaces, diagnósticos e entradas de benchmark.
A reexecução passou em 233 de 233 testes, com 94,38% de cobertura de linhas no
projeto e 99,30% no núcleo regenerado. A implementação de produção e os
marcadores do checklist foram preservados.
[Registro do ensaio](ensaio-regeneracao.md#ensaio-2--2026-11-17)

## 2026-11-18 · Especificação e revisão da Spec 003

A pasta `instruções` forneceu a especificação-base da S3, o briefing, a
constituição, as decisões e os cinco artefatos de planejamento da S1 como
referência de formato. A branch `003-visualizacao-operacao` partiu da
`main` marcada com `spec-002-fechada`. A CLI da S2 confirmou o Duelo
com Caçador e Girador, com vitória de vermelho no tick 34 em 0,68 s e 35
estados com o tick 0.

A revisão preservou as seis histórias e os 39 requisitos, completou as origens
e fixou 49 cenários. Ficaram explícitos o resultado como evento da partida,
a preparação atômica de mundos e controladores, o primeiro e o último tick
do replay e a coleta até o tick 100 000 inclusive. A checagem de ambiguidades
reaproveitou as decisões da S1 e da S2. O formato de gravação e os detalhes
de cena e agendamento ficaram para o plano.

O checklist interno de qualidade passou em 16 de 16. O checklist de operação
contém evidências documentais e marcadores próprios da revisão.
[Spec 003](../specs/003-visualizacao-operacao/spec.md) ·
[Checklist](../specs/003-visualizacao-operacao/checklists/operacao.md)

### Plano da Spec 003

O Constitution Check passou nos nove princípios. O desenho usa Three.js e
CodeMirror 6 conforme ADR-008, com os contratos existentes da S2 para o
núcleo. A cena projeta posições e raios e o relógio da interface conduz
somente passos fixos. O arquivo grava snapshots e usa prefixos de eventos
para preservar os dados sem repeti-los. O guia separa verificações
determinísticas e medições em Chromium da validação com pessoas.
[Plano](../specs/003-visualizacao-operacao/plan.md) ·
[Contrato de gravação](../specs/003-visualizacao-operacao/contracts/gravacao.md)

### Tarefas e análise da Spec 003

As 20 tarefas seguem Setup, Fundação, US1–US6 e Acabamento. Os testes
antecedem o código e cada fase tem seu próprio critério de pronto.
A análise cruzou a spec, o plano, os contratos, o modelo e as tasks.
Conferiu os 39 requisitos, os 49 cenários, as 20 dependências e 26
referências locais entre os dez artefatos. Não ficaram achados críticos
ou altos. As verificações com pessoas de SC-003 e SC-006 ficam na T020.
[Tarefas](../specs/003-visualizacao-operacao/tasks.md)

A referência pré-implementação em Node 24.22.3 passou no lint, no
typecheck e nos 233 testes das Specs 001 e 002, com 93,98% de cobertura
de linhas no projeto e 99,10% no núcleo. O checklist interno tem 16
itens concluídos e os 10 marcadores do checklist de operação aguardam
a revisão ou a autorização de continuidade.

### Execução da Spec 003

O usuário autorizou a implementação com os dez marcadores do checklist
de operação preservados. Os marcadores pertencem à revisão documental e
ficam fora da aplicação. A cobertura abaixo segue a ordem instruções,
ramos, funções e linhas.

| Tarefa | Testes | Projeto (%) | Núcleo (%) | Evidência |
|---|---|---|---|---|
| T001 | 233 passaram / 0 falharam | 93.61 / 90.88 / 99.2 / 93.98 | 98.59 / 97.58 / 99.09 / 99.10 | Node 24.22.3 e tag spec-002-fechada conferidos. Lint, tipos e 233 testes passaram na base. Duelo padrão terminou no tick 34. |
| T002 | 233 passaram / 0 falharam | 93.61 / 90.88 / 99.2 / 93.98 | 98.59 / 97.58 / 99.09 / 99.10 | Imports de Three.js, OrbitControls e CodeMirror verificados no Node. Build e regressão passaram com o lock atualizado. |
| T004 | 234 passaram / 0 falharam | 93.52 / 90.36 / 99.23 / 94.16 | 98.59 / 97.58 / 99.09 / 99.10 | O Duelo é publicado no tick 0 com Caçador e Girador. App e sessão leem o mesmo snapshot. |
| T003 | 234 passaram / 0 falharam | 93.52 / 90.36 / 99.23 / 94.16 | 98.59 / 97.58 / 99.09 / 99.10 | O teste falhou antes dos módulos e do título esperado. A suíte ficou verde com T004. O jsdom recebe motor injetado, pois seus intrínsecos impedem a inicialização real do SES nesse ambiente. |
| T006 | 245 passaram / 0 falharam | 85.18 / 83.04 / 89.63 / 85.18 | 98.59 / 97.58 / 99.09 / 99.10 | Cena, raios, controles de câmera e vetores geométricos validados. A verificação WebGL em Chromium fica na T018. |
| T005 | 245 passaram / 0 falharam | 85.18 / 83.04 / 89.63 / 85.18 | 98.59 / 97.58 / 99.09 / 99.10 | RED por ausência dos módulos de cena. Os dez IDs e a montagem dos recursos passaram com T006. |
| T008 | 255 passaram / 0 falharam | 85.55 / 82.86 / 89.52 / 85.65 | 98.59 / 97.58 / 99.09 / 99.10 | Relógio e desenho independentes. Histórico incremental, pausa por visibilidade, atraso sem pular ticks e reset determinístico. |
| T007 | 255 passaram / 0 falharam | 85.55 / 82.86 / 89.52 / 85.65 | 98.59 / 97.58 / 99.09 / 99.10 | Dez falhas RED confirmadas. UI, relógio e estado passaram sem asserção de tempo real. |
| T010 | 264 passaram / 0 falharam | 86.15 / 82.73 / 90.21 / 86.48 | 98.59 / 97.58 / 99.09 / 99.10 | Gravação e sessão anteriores permanecem em falhas. Catálogo, rascunho, reabertura, download e aplicação por robô validados. |
