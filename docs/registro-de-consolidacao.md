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
