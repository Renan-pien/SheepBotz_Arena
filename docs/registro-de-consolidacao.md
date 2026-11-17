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
- **Leituras de laser da S2.** S2-FR-007 calcula a leitura no estado do início do tick e S2-FR-008
  pede que as leituras no estado correspondam àquele estado. A revisão da S2 deve explicitar
  quais leituras aparecem no estado publicado e no tick 0, preservando o contrato do controlador
  e o consumo pela cena da S3.
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
