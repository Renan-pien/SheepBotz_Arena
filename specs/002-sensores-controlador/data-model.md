# Modelo de dados · Spec 002

A S2 estende o [modelo da S1](../001-nucleo-simulacao/data-model.md). `World` continua normalizado pelo validador existente. A física usa as mesmas poses reais, comandos efetivos, bumper e odometria. Mudanças públicas são descritas nos [contratos](contracts/core-api.md).

## Configuração e entrada

| Entidade | Campos | Invariantes |
|---|---|---|
| `World` | `name`, `seed`, `dt`, `map`, `arena`, `match`, `obstacles`, `robots` | Semente inteira de 0 a 4 294 967 295. `sumo` requer arena e dois robôs, com os centros inicialmente dentro ou sobre o raio. `maxTicks` vai de 1 a 1 000 000. |
| `LaserConfig` | `rays: number`, `fov: number`, `maxRange: number` | 1 a 360 raios. `0 < fov ≤ 2π` em radianos e `0 < maxRange ≤ 100` em metros. `RobotConfig.laser = null` quando ausente. |
| Entrada de controlador | ID do robô → texto JS | Associação opcional, um texto por ID. ID existente e comando constante ausente para que o texto seja carregado. A validade do texto é verificada antes do tick 0. |
| Comando constante | ID do robô → `{ v, w }` | Valores finitos e mesmos erros da S1. A saturação é aplicada pela física. |

## Estado publicado

| Entidade | Campo | Tipo e significado |
|---|---|---|
| `RobotState` | `laser` | `readonly number[]`. Uma distância em metros por raio configurado, ordenada da direita à esquerda. Lista vazia sem configuração. |
| `RobotState` | `situacao` | `'ativo' \| 'desativado'`. `ativo` no tick 0, mesmo para robôs sem script. `desativado` mantém comando efetivo zero nos ticks seguintes e participa da física. |
| `SimState` | `status` | `'em_andamento' \| 'finalizada'`. Começa em andamento, inclusive no modo livre. |
| `SimState` | `resultado` | Campo obrigatório `MatchResult \| null`. Vale `null` no tick 0, enquanto `em_andamento` e no modo `free`. Contém o objeto de resultado quando `finalizada`. |
| `SimState` | `events` | `readonly SimEvent[]`. Sequência acumulada até o tick do snapshot. Vazia no estado inicial. |
| `MatchResult` | `vencedor` | `string \| null`. ID do robô vencedor ou nulo em empate. |
| `MatchResult` | `motivo` | `'saida_da_arena' \| 'ambos_sairam' \| 'tempo_esgotado' \| 'falta_de_progresso' \| 'saida_alcancada'`. Conforme a modalidade. |
| `MatchResult` | `tick` | Inteiro positivo, igual ao tick em que o estado foi finalizado. |
| `SimEvent` | `type`, `tick`, `robotId`, `message` | Tipo, tick inteiramente executado, ID do emissor ou `null`, texto. `fim_da_luta` é sempre da partida. |
| Histórico | `readonly SimState[]` | Quando habilitado, vai de 0 até o tick atual, em ordem, com comprimento `state.tick + 1`. O reset substitui a gravação anterior. |

Os campos S1 `tick`, `time` e `robots` permanecem. Cada robô preserva `id`, `pose`, `command`,
`bumper` e `odometry`. Um snapshot tem laser derivado das próprias poses. O estado final
é publicado uma vez e preserva seus eventos e resultado em avanços posteriores.

## Estado privado por simulação

| Entidade | Campos e duração |
|---|---|
| Sessão | Mundo normalizado, entradas copiadas, estado atual e histórico opcional. Possui instâncias independentes das de outras sessões. |
| Instância de controlador | ID e índice em `World.robots`, texto original, compartimento e referências estáveis para `setup`/`loop`. As variáveis do compartimento sobrevivem aos ticks e são recriadas no reset. |
| `ControllerRandom` | `state: uint32`. Inicializado com a semente do mundo e o índice. Cada `random()` avança somente o estado da instância do robô, que é recriado no reset. |
| `ControllerLogLimit` | `acceptedCount: number`, inteiro de 0 a 1 000. `warningEmitted: boolean` indica se o evento de limite já foi emitido. Cada robô começa com `0` e `false` no início e no reset. |
| Quadro de chamada | Snapshot observado, tick do evento, comando candidato e primeira falha da execução. Existe enquanto a API está disponível para `setup()` ou `loop()`. |

O motor e suas referências de execução pertencem à sessão e não entram em `SimState`.
Após a carga, as variáveis do script evoluem apenas durante `setup()` e `loop()` síncronos.
O mundo, scripts e sementes iguais produzem o mesmo histórico em lote ou passo a passo.
Leituras retornadas ao controlador são cópias. O histórico conserva snapshots readonly,
com reutilização segura da lista de eventos quando nenhum foi produzido. Quando houver novos
eventos, concatenar o lote uma vez na publicação e manter intactos os snapshots anteriores.

## Transições

| Origem | Condição | Resultado |
|---|---|---|
| Entrada | Mundo inválido | Lista de erros de mundo da S1. |
| Mundo válido | Entrada ou carregamento falha | Lista conjunta de erros, sem estado inicial publicado. |
| Mundo válido | Entradas e carregamentos válidos | Tick 0, todos ativos, eventos vazios, resultado nulo e laser das poses iniciais. |
| Robô ativo | `setup()` ou `loop()` falha | Desativado no tick em curso, com comando zero e um evento `erro_controlador`. |
| Luta em andamento | Saída de um robô, saída dos dois, limite de ticks ou impasse habilitado, nessa prioridade | Finalizada com resultado e um único `fim_da_luta`. |
| Luta finalizada | Avanço ou consulta | Mesmo snapshot e lista de histórico intacta. |
| Sessão iniciada | `reset()` | Novas instâncias e sementes, tick 0, sem eventos e histórico reiniciado. `setup()` ocorre no próximo passo. |

## Limites e invariantes de aceitação

- Ordem de robôs, raios e eventos é estável. `time = tick × dt`. O caso de `free` não tem término automático.
- Condição de saída usa apenas o centro e `distância > arena.radius`. Tolerâncias de aceitação da S1 se aplicam a valores de distância e ângulo, sem alterar a comparação da regra.
- Código, caminho e categoria de erros são dados estruturados. Um erro de execução vira evento no tick, e uma falha de carga vira erro de validação antes do tick 0.
- O armazenamento é em memória. A S2 já fornece snapshots para replay, e a S3 define o arquivo de gravação e seus limites.

## Monitor opcional de progresso

`StallState` acompanha o snapshot do sumô. Guarda o prazo em segundos, o tick do último deslocamento e os dois centros que iniciam o intervalo. Poses são reais, em metros. Durante imobilidade, os snapshots compartilham a referência imutável do monitor.

No detector da ADR-019, `StallState.pair` é opcional. Guarda `center` (ponto médio de referência em metros) e `sinceTick` (início do intervalo conjunto). `StallState.sinceTick` continua sendo a referência individual. `StallState.pairContact` vale `true` apenas quando o resolvedor detecta colisão entre os robôs naquele passo. Ausência indica falso.

## Leitura derivada de borda

`EdgeReading.front`, `EdgeReading.rear`, `EdgeReading.left` e `EdgeReading.right` são booleanos independentes. A leitura inteira vale `null` em modo livre. Suas entradas são `World.match.mode`, `World.arena.radius`, `RobotConfig.radius` e `RobotState.pose` do tick observado. Nenhuma posição física é exposta ao controlador por essa função.

## Resultado de navegação

A chegada usa `MatchResult.motivo = "saida_alcancada"` e `SimEvent.type = "fim_do_nivel"` no tick terminal do explorador (ADR-021).

A presença de `SimState.sumoStartDelay` identifica uma execução com a largada fixa. `falseStarters` pertence ao tick de infração. `MatchResult.pontos` pertence à queima e tem as duas chaves do duelo. O tempo absoluto continua igual a tick × dt.
