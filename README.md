# SheepBotz Arena

**346 testes · 89% de cobertura**

Métricas geradas a partir dos relatórios com `npm run stats`.

Simulador de robôs móveis para a equipe **Univille SheepBotz**. O navegador mostra a
simulação em 3D e permite editar estratégias, inspecionar sensores e salvar replays.
O núcleo 2D aceita mundos JSON e controladores JavaScript.

## Status

| Spec | Escopo | Artefatos disponíveis |
|---|---|---|
| [001](specs/001-nucleo-simulacao/spec.md) | Mundo e núcleo de simulação | Spec oficial, [checklist](specs/001-nucleo-simulacao/checklists/requirements.md), [plan](specs/001-nucleo-simulacao/plan.md), contratos, [tasks](specs/001-nucleo-simulacao/tasks.md) e anexos |
| [002](specs/002-sensores-controlador/spec.md) | Laser, controladores e sumô pela biblioteca e pela CLI | [Plano](specs/002-sensores-controlador/plan.md), [contratos](specs/002-sensores-controlador/contracts/core-api.md), [tasks](specs/002-sensores-controlador/tasks.md) e [quickstart](specs/002-sensores-controlador/quickstart.md) |
| [003](specs/003-visualizacao-operacao/spec.md) | Visualização 3D, operação e replay | [Plano](specs/003-visualizacao-operacao/plan.md), [gravações v1, v2 e v3](specs/003-visualizacao-operacao/contracts/gravacao.md), [tarefas](specs/003-visualizacao-operacao/tasks.md) e [quickstart](specs/003-visualizacao-operacao/quickstart.md) |

## Como rodar

Use Node 24 na raiz do repositório e abra a URL mostrada pelo Vite em um
navegador desktop com WebGL 2.

```bash
npm ci
npm run dev
```

A tela abre o **Duelo padrão** com Caçador e Girador. Clique em **Executar**
para ver a luta. Use **Inspeção** para consultar os sensores e **Ver replay**
para voltar a um tick. Os controles de gravação usam arquivos JSON locais.

No sumô ao vivo, **Regra de Tempo** permite escolher 5, 10 ou 30 s antes do
primeiro passo. A rodada empata se os dois robôs ficarem parados ou se, após
se tocarem, continuarem girando juntos com folga de até 2 mm entre eles e
deslocamento de até 1 mm do ponto médio durante todo o prazo. A próxima fica pausada no tick 0, com as estratégias e
o prazo preservados. **Ver replay do empate** abre a gravação da última rodada.

Para usar o núcleo pelo terminal, execute:

```bash
npm run --silent sim -- --world examples/worlds/duelo-padrao.json --ticks 3000 \
  --controller vermelho=examples/controllers/cacador-reativo.js \
  --controller azul=examples/controllers/parado.js --pretty
```

O comando imprime JSON com o estado final da luta. Com `--history`, inclui um estado por
tick executado, a partir do tick 0. Para escrever um controlador, consulte a API do
[Anexo B da Spec 002](specs/002-sensores-controlador/spec.md#anexo-b--api-do-controlador).

Para validar a implementação e atualizar o [relatório de cobertura](docs/cobertura/resumo.md),
rode os comandos abaixo. Para medir o núcleo, use `npm run bench` e `npm run bench:s2`.

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run stats
```

[Quickstart da Spec 001](specs/001-nucleo-simulacao/quickstart.md) ·
[Quickstart da Spec 002](specs/002-sensores-controlador/quickstart.md) ·
[Quickstart da Spec 003](specs/003-visualizacao-operacao/quickstart.md)

## Documentação

- [Constituição](.specify/memory/constitution.md) e [diretrizes de arquitetura](docs/arquitetura.md)
- [Registro de consolidação](docs/registro-de-consolidacao.md) com etapas executadas e pendências
- [Fluxo de trabalho e instruções do agente](AGENTS.md)
- [Enunciado](docs/enunciado.md) e [requisitos do briefing](docs/requisitos-briefing.md)
- [Decisões](docs/decisoes.md), [perguntas](docs/perguntas.md) e [backlog](docs/backlog.md)
- [Matriz de rastreabilidade](docs/rastreabilidade.md) e [ensaios de regeneração](docs/ensaio-regeneracao.md)

## Equipe

Renan, Julio e Wesley.
