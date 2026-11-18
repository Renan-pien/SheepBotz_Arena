# SheepBotz Arena

**233 testes · 93% de cobertura**

Métricas geradas a partir dos relatórios com `npm run stats`.

Simulador de robôs móveis para a equipe **Univille SheepBotz**. A simulação 2D usa mundos em JSON
e controladores em JavaScript. O projeto usa GitHub Spec Kit.

## Status

| Spec | Escopo | Artefatos disponíveis |
|---|---|---|
| [001](specs/001-nucleo-simulacao/spec.md) | Mundo e núcleo de simulação | Spec oficial, [checklist](specs/001-nucleo-simulacao/checklists/requirements.md), [plan](specs/001-nucleo-simulacao/plan.md), contratos, [tasks](specs/001-nucleo-simulacao/tasks.md) e anexos |
| [002](specs/002-sensores-controlador/spec.md) | Laser, controladores e sumô pela biblioteca e pela CLI | [Plano](specs/002-sensores-controlador/plan.md), [contratos](specs/002-sensores-controlador/contracts/core-api.md), [tasks](specs/002-sensores-controlador/tasks.md) e [quickstart](specs/002-sensores-controlador/quickstart.md) |
| [003](specs/003-visualizacao-operacao/spec.md) | Visualização 3D e operação | Spec |

A Spec 001 fornece o núcleo de simulação. A Spec 002 acrescenta sensores, execução de
controladores e resultado da luta de sumô. A interface atual exibe a tela inicial da
prova de conceito. A visualização 3D pertence à Spec 003.

## Como rodar

Use Node 24 e rode, a partir da raiz, o Duelo padrão com Caçador Reativo em vermelho
e Parado em azul.

```bash
npm ci
npm run --silent sim -- --world examples/worlds/duelo-padrao.json --ticks 3000 \
  --controller vermelho=examples/controllers/cacador-reativo.js \
  --controller azul=examples/controllers/parado.js --pretty
```

O comando imprime JSON com o estado final da luta. Com `--history`, inclui um estado por
tick executado, a partir do tick 0. Para escrever um controlador, consulte a API do
[Anexo B da Spec 002](specs/002-sensores-controlador/spec.md#anexo-b--api-do-controlador).

Para abrir a tela inicial, use `npm run dev`. Para validar a implementação e gerar o
[relatório de cobertura](docs/cobertura/resumo.md), rode os comandos abaixo. O benchmark
da Spec 002 é executado à parte com `npm run bench:s2`.

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run stats
```

[Quickstart da Spec 001](specs/001-nucleo-simulacao/quickstart.md) ·
[Quickstart da Spec 002](specs/002-sensores-controlador/quickstart.md)

## Documentação

- [Constituição](.specify/memory/constitution.md) e [diretrizes de arquitetura](docs/arquitetura.md)
- [Registro de consolidação](docs/registro-de-consolidacao.md) com etapas executadas e pendências
- [Fluxo de trabalho e instruções do agente](AGENTS.md)
- [Enunciado](docs/enunciado.md) e [requisitos do briefing](docs/requisitos-briefing.md)
- [Decisões](docs/decisoes.md), [perguntas](docs/perguntas.md) e [backlog](docs/backlog.md)
- [Matriz de rastreabilidade](docs/rastreabilidade.md) e [ensaios de regeneração](docs/ensaio-regeneracao.md)

## Equipe

Renan, Julio e Wesley.
