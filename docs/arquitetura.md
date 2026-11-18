# Diretrizes de arquitetura

A [constituição](../.specify/memory/constitution.md) define as regras do projeto. Os [ADRs](decisoes.md)
registram as decisões aprovadas. Cada spec define o comportamento da sua etapa e seu plan detalha
como implementá-lo. A arquitetura abaixo consolida essas fontes para o trabalho nas três specs.

## Fronteiras do projeto

| Camada | Responsabilidade | Entrada e saída |
|---|---|---|
| `src/core` | Validação e normalização do mundo, estado, passo 2D, cinemática e contatos. A S2 acrescenta sensores, execução de controladores e regras de sumô. | Recebe texto do mundo, configuração e comandos. Devolve erros estruturados, estados e, na S2, eventos e resultado. |
| `src/cli` | Adaptador Node para ler arquivos, interpretar argumentos e escrever no terminal. | Usa a API pública do núcleo. Isola E/S atrás de `runCli(argv, io)` para teste. |
| `src/ui` | Adaptador de navegador para operação, apresentação e interação com arquivos. | Envia comandos pela API do núcleo e usa o mesmo estado para a cena, o contador e a inspeção. |

A direção das dependências é `src/ui → src/core ← src/cli` em um único pacote. O ESLint deve
proteger a fronteira do núcleo. Relógio real, APIs de plataforma, E/S e estado de interface ficam
nos adaptadores. A validação do mundo acontece no núcleo para preservar o mesmo catálogo de erros
na CLI e na UI. [Plan da S1](../specs/001-nucleo-simulacao/plan.md) · [Pesquisa R1 e R11](../specs/001-nucleo-simulacao/research.md)

## Evolução por spec

### S1 · Mundo e núcleo de simulação

- `loadWorld` recebe texto JSON e acumula erros de estrutura e de geometria. As verificações
  geométricas usam os campos pertinentes já validados. O núcleo trabalha com o mundo normalizado.
- `step(world, state, commands)` produz um novo estado a cada tick, com a ordem de processamento
  definida em S1-FR-017. Usa `dt` fixo, unidades SI e `time = tick × dt`. A geometria, a cinemática
  e o contato entre os robôs têm implementação própria.
- A fachada expõe avanço, reinício e histórico opcional desde o tick 0. A execução headless é
  acessível por biblioteca e CLI. O reset reconstrói o estado inicial.
- Contratos da etapa: [mundo](../specs/001-nucleo-simulacao/contracts/world.md),
  [API do núcleo](../specs/001-nucleo-simulacao/contracts/core-api.md),
  [estado](../specs/001-nucleo-simulacao/contracts/state.md),
  [erros](../specs/001-nucleo-simulacao/contracts/errors.md) e
  [CLI](../specs/001-nucleo-simulacao/contracts/cli.md).

### S2 · Sensores, controladores e sumô

- Os controladores recebem uma cópia das leituras do início do passo e emitem comandos
  pela API do Anexo B. Cada estado publicado guarda as leituras correspondentes às poses
  nele registradas (ADR-009). O estado interno do simulador permanece
  encapsulado. Cada robô tem uma sequência pseudoaleatória independente, determinada pela
  semente do mundo e por sua posição na lista. O gerador de 32 bits e seus vetores
  estão fixados na pesquisa da S2.
- O carregamento executa as instruções de nível superior antes do tick 0, sem a API do robô.
  Falhas nessa fase impedem o início com `CONTROLADOR_INVALIDO` (ADR-010). A execução sem
  interface, após validar o mundo, carrega os controladores com ID existente e sem comando
  constante concorrente. A resposta reúne os erros de entrada e as falhas de carregamento.
  Erros de controladores usam `controllers.<id>` (ADR-012 e ADR-014). O reset repete o
  carregamento. Erros durante `setup()` ou `loop()` geram eventos e desativam o robô conforme
  S2-FR-025 e S2-FR-026. Os controladores são código de confiança da equipe e compartilham
  o processo do simulador.
- As regras de sumô usam o estado após o movimento e as colisões, no último passo do tick, e
  só são executadas quando `match.mode = "sumo"`. O evento `fim_da_luta` pertence à partida
  e fica sem robô associado. O vencedor é identificado em `resultado.vencedor` (ADR-013).
  O histórico opcional guarda o tick 0 e um estado por tick executado, com uma única entrada
  para o fim da luta (ADR-011). Mundos e controladores de exemplo usam os mesmos contratos
  disponíveis à equipe.
  [Spec 002](../specs/002-sensores-controlador/spec.md)
  · [Plano](../specs/002-sensores-controlador/plan.md)
  · [Pesquisa](../specs/002-sensores-controlador/research.md)

### S3 · Visualização e operação

- A cena Three.js projeta o plano 2D em 3D e usa as leituras de laser já produzidas pela
  simulação. A câmera orbital e as opções de exibição pertencem à UI.
- A camada de operação pelo navegador agenda ticks fixos, desacoplados do desenho. A interface
  oferece controle de tempo, carregamento de mundos, edição de controladores e inspeção de
  sensores, eventos e resultado.
- O replay consome os estados gravados. O arquivo de gravação é versionado e contém mundo,
  controladores, data de criação e estados por tick. O plan da S3 deve documentar a estrutura
  e a validação desse contrato. [Spec 003](../specs/003-visualizacao-operacao/spec.md)

## Verificação das fronteiras

Os plans devem indicar como verificar isolamento do núcleo por lint, determinismo pela comparação
de históricos, física pelos exemplos numéricos das specs e fidelidade do replay pela comparação
com os estados gravados. Mudanças nos contratos públicos exigem ADR e revisão das specs e dos
consumidores afetados. [Constitution Check da S1](../specs/001-nucleo-simulacao/plan.md#constitution-check)
