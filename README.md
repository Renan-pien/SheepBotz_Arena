# SheepBotz Arena

**129 testes · 96% de cobertura**

Métricas geradas a partir dos relatórios com `npm run stats`.

Simulador genérico de robôs móveis no navegador para a equipe **Univille SheepBotz**, com lógica 2D,
visualização 3D e sumô como modalidade de demonstração. O projeto usa GitHub Spec Kit. O usuário
descreve o mundo em JSON, define controladores em JavaScript e acompanha a simulação tick a tick.

## Status

| Spec | Escopo | Artefatos disponíveis |
|---|---|---|
| [001](specs/001-nucleo-simulacao/spec.md) | Mundo e núcleo de simulação | Spec oficial, [checklist](specs/001-nucleo-simulacao/checklists/requirements.md), [plan](specs/001-nucleo-simulacao/plan.md), contratos, [tasks](specs/001-nucleo-simulacao/tasks.md) e anexos |
| [002](specs/002-sensores-controlador/spec.md) | Sensores, controlador e regras do sumô | Spec |
| [003](specs/003-visualizacao-operacao/spec.md) | Visualização 3D e operação | Spec |

A Spec 001 fornece a biblioteca e a CLI de simulação. A interface exibe a tela inicial
da prova de conceito. Sensores de alcance e visualização 3D pertencem às etapas seguintes.

## Como rodar

Com Node 24, instale as dependências e execute o exemplo headless.

```bash
npm ci
npm run --silent sim -- --world examples/worlds/duelo-padrao.json --ticks 10 --command vermelho=1,0 --pretty
```

Para abrir a tela inicial, use `npm run dev`. Para validar a implementação, rode
`npm run lint`, `npm run typecheck` e `npm run test:coverage`.
[Quickstart da Spec 001](specs/001-nucleo-simulacao/quickstart.md)

## Documentação

- [Constituição](.specify/memory/constitution.md) e [diretrizes de arquitetura](docs/arquitetura.md)
- [Registro de consolidação](docs/registro-de-consolidacao.md) com etapas executadas e pendências
- [Fluxo de trabalho e instruções do agente](AGENTS.md)
- [Enunciado](docs/enunciado.md) e [requisitos do briefing](docs/requisitos-briefing.md)
- [Decisões](docs/decisoes.md), [perguntas](docs/perguntas.md) e [backlog](docs/backlog.md)
- [Matriz de rastreabilidade](docs/rastreabilidade.md) e [ensaios de regeneração](docs/ensaio-regeneracao.md)

## Equipe

Renan, Julio e Wesley.
