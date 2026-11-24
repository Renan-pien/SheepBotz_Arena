# SheepBotz Arena

**418 testes · 89% de cobertura**

Métricas geradas a partir dos relatórios com `npm run stats`.

Simulador de robôs móveis para a equipe **Univille SheepBotz**. O navegador mostra a
simulação em 3D e permite editar estratégias, inspecionar sensores e salvar replays.
O núcleo 2D aceita mundos JSON. Na IDE, cada robô pode usar JavaScript ou Portugol com o meuPiá Maker.

### Escrever uma estratégia em Portugol

Na aba **Controladores**, escolha o robô e selecione **Linguagem → Portugol (meuPiá Maker)**. Escreva a decisão de cada tick em `decidir()` ou comece pelo exemplo do modo. Clique em **Aplicar** e depois em **Avançar 1 tick** ou **Executar**. O botão **? Comandos** mostra a API e um exemplo para o modo e a linguagem selecionados.

A IDE abre e salva arquivos `.por`. Cada equipe pode escolher sua linguagem. No Labirinto, trocar a dificuldade conserva o controlador aplicado e o rascunho. O primeiro uso do Portugol carrega o compilador a partir dos arquivos do próprio site. A instalação para quem clona o projeto continua usando `npm ci`. [Exemplo do Sumô](examples/controllers/borda.por) · [Exemplo do Labirinto](examples/controllers/parede.por)

## Status

| Spec | Escopo | Artefatos disponíveis |
|---|---|---|
| [001](specs/001-nucleo-simulacao/spec.md) | Mundo e núcleo de simulação | Spec oficial, [checklist](specs/001-nucleo-simulacao/checklists/requirements.md), [plan](specs/001-nucleo-simulacao/plan.md), contratos, [tasks](specs/001-nucleo-simulacao/tasks.md) e anexos |
| [002](specs/002-sensores-controlador/spec.md) | Laser, controladores e sumô pela biblioteca e pela CLI | [Plano](specs/002-sensores-controlador/plan.md), [contratos](specs/002-sensores-controlador/contracts/core-api.md), [tasks](specs/002-sensores-controlador/tasks.md) e [quickstart](specs/002-sensores-controlador/quickstart.md) |
| [003](specs/003-visualizacao-operacao/spec.md) | Visualização 3D, operação e replay | [Plano](specs/003-visualizacao-operacao/plan.md), [gravações v1 a v6](specs/003-visualizacao-operacao/contracts/gravacao.md), [tarefas](specs/003-visualizacao-operacao/tasks.md) e [quickstart](specs/003-visualizacao-operacao/quickstart.md) |

### Contribuições da branch `004-labirintos`

- **Labirinto** — Três níveis com bifurcações e dificuldade crescente. Ao chegar à saída quadriculada, o robô pausa. O usuário escolhe quando avançar para o próximo nível.
- **Sumô** — Sensor de borda nos quatro lados do robô, Regra de Tempo para empates por impasse e largada de 5 segundos. A indicação **Queimou** acompanha o infrator por 0,5 s. O adversário recebe 1 ponto se apenas um robô queimar a largada. Se ambos queimarem no mesmo tick, há empate sem pontos.
- **IDE e simulação** — Retrocesso de um tick, cursor visível nos editores e estratégias em Portugol com o meuPiá Maker. O botão **? Comandos** mostra exemplos para a modalidade e a linguagem selecionadas.

As entregas da branch integram as Specs 001, 002 e 003. A [matriz de rastreabilidade](docs/rastreabilidade.md) relaciona os requisitos às tarefas e aos testes, e o [registro de decisões](docs/decisoes.md) documenta as ADR-017 a ADR-025.

## Como rodar

### Primeira instalação no Windows

Instale o Git e o **Node.js 24.x**. O npm acompanha o Node.js. Abra o PowerShell na pasta onde deseja guardar o projeto e execute os comandos abaixo. [Baixar Git](https://git-scm.com/downloads) · [Baixar Node.js](https://nodejs.org/en/download)

```powershell
git clone --branch main https://github.com/Renan-pien/SheepBotz_Arena.git
cd SheepBotz_Arena
npm.cmd ci
npm.cmd run dev
```

Abra o endereço indicado na linha **Local** do terminal em um navegador desktop com WebGL 2. Mantenha o terminal aberto enquanto usa o simulador. Para encerrar, pressione `Ctrl+C`.

### Da segunda vez em diante

Abra o PowerShell na pasta `SheepBotz_Arena` e execute apenas:

```powershell
npm.cmd run dev
```

Use `npm.cmd ci` na primeira instalação. Repita esse comando se uma atualização alterar o `package-lock.json` ou se precisar reinstalar as dependências. Ele recria a pasta `node_modules`. No Linux e no macOS, use `npm` no lugar de `npm.cmd`. [Documentação do npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/)

### Se o VS Code continuar mostrando erros de TypeScript

Após a instalação, confira os tipos do projeto pelo terminal:

```powershell
npm.cmd run typecheck
```

Se a verificação passar e o editor ainda mostrar erros, abra um arquivo `.ts` ou `.tsx` no VS Code, pressione `Ctrl+Shift+P` e selecione **TypeScript: Restart TS Server** na paleta de comandos. Se a verificação também apontar um erro no terminal, consulte o arquivo e a linha indicados na mensagem.

### Primeiro teste no simulador

A tela abre o **Duelo padrão** com Caçador e Girador. Clique em **Executar**
para ver a luta. Use **Inspeção** para consultar os sensores e **Ver replay**
para voltar a um tick. Os controles de gravação usam arquivos JSON locais.

Em **Modo**, escolha **Sumô** ou **Labirinto**. O Labirinto abre pausado no **Fácil**. Na lista **Dificuldade**, você pode escolher **Fácil**, **Médio** ou **Difícil**. Cada troca abre o mapa no tick 0 com sua estratégia aplicada. Clique em **Executar** para acompanhar o Navegador ou aplique sua própria estratégia ao `explorador`. A chegada é a área quadriculada. A simulação pausa ao alcançá-la. **Próximo nível** leva a estratégia aplicada ao tick 0 do novo mapa. Também é possível voltar um tick ou rever a chegada no replay. Para explorar a sala livre original, use **Abrir mundo** com [Sala com obstáculos](examples/worlds/sala-com-obstaculos.json).

No **Sumô**, cada rodada começa com **5 segundos de espera** no relógio da simulação. Os sensores já podem ser lidos. Qualquer tentativa de andar ou girar antes da liberação dá **1 ponto da rodada ao adversário**. Se os dois tentarem no mesmo tick, há empate sem pontos. O texto **Queimou** aparece junto a cada infrator, que mantém o movimento por **0,5 s simulados**. A rodada pausa na posição final. No Duelo padrão, uma queima no primeiro passo aparece no tick 1 e a rodada pausa no tick 25.

Após a largada, **Regra de Tempo** permite escolher 5, 10 ou 30 s antes do
primeiro passo. A rodada empata se os dois robôs ficarem parados ou se, após
se tocarem, continuarem girando juntos com folga de até 2 mm entre eles e
deslocamento de até 1 mm do ponto médio durante todo o prazo. A próxima fica pausada no tick 0, com as estratégias e
o prazo preservados. **Ver replay do empate** abre a gravação da última rodada.

No sumô, qualquer estratégia pode consultar `readEdge()` em `setup()` ou `loop()`. O retorno tem quatro lados relativos ao próprio robô: `front`, `rear`, `left` e `right`. Cada lado vale `true` a partir da borda interna da faixa branca. Em modo livre, a função retorna `null`. A aba **Inspeção** mostra as quatro leituras do tick exibido.

Exemplo de estratégia que avança e recua ao detectar a borda à frente:

```js
function loop() {
  if (getInfo().startReleased === false) return;
  const borda = readEdge();
  setSpeed(borda?.front ? -0.3 : 0.3, 0);
}
```

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
