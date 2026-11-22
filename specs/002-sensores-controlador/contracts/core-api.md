# Contrato da API do núcleo · v2

Entrada pública em `src/core/index.ts`. A [API v1](../../001-nucleo-simulacao/contracts/core-api.md)
continua sendo a base de `loadWorld`, dos tipos físicos, das funções de ângulo e das operações
síncronas. A v2 acrescenta campos ao estado e avalia a modalidade também em execuções com
comandos constantes. Consuma os campos da v2 conforme o [contrato de estado](state.md).

## Assinaturas

```ts
type ControllerOptions =
  | { readonly controllers?: undefined; readonly controllerEngine?: undefined }
  | {
      readonly controllers: Readonly<Record<string, string>>;
      readonly controllerEngine: ControllerEngine;
    };

type HeadlessInput = {
  readonly world: string;
  readonly commands?: Readonly<Record<string, Command>>;
  readonly stallSeconds?: 5 | 10 | 30;
  readonly sumoStartDelay?: boolean;
  readonly ticks: number;
  readonly history?: boolean;
} & ControllerOptions;

type PrepareResult =
  | { readonly ok: true; readonly simulation: Simulation }
  | { readonly ok: false; readonly errors: readonly ValidationError[] };

function prepareSimulation(
  world: World,
  options?: SimulationOptions & ControllerOptions,
): PrepareResult;

function runHeadless(input: HeadlessInput): HeadlessResult;
```

- `controllerEngine` é o motor pronto obtido por `initializeControllerEngine()` em `src/runtime/controller-engine.ts`. Inicialize no ponto de entrada da aplicação antes de usar os controladores. As execuções que só usam comandos constantes dispensam o motor. Em JavaScript, fornecer `controllers` sem motor é um erro de uso (`TypeError`).
- `runHeadless` valida `ticks` como inteiro ≥ 0, carrega o mundo e delega a preparação. Erros de domínio retornam `{ ok: false, errors }`. A execução bem-sucedida retorna `{ ok: true, state }` e `history` se solicitada. `ticks = 0` ainda valida e carrega controladores.
- `prepareSimulation` recebe um `World` normalizado por `loadWorld`. Valida todas as entradas aplicáveis e devolve os erros de acordo com o [catálogo](errors.md). Em caso de sucesso, a mesma preparação fornece a simulação no tick 0. A S3 usa o candidato retornado quando o conjunto de controladores for aceito.
- `createSimulation(world, options?)` conserva a assinatura e as precondições v1 para comandos constantes. `createInitialState(world)` publica o tick 0. `step(world, state, commands)` permanece uma operação pura com comandos explícitos. Scripts são processados pela fachada preparada.

## Avanço, reset e consulta

- `getState()` retorna o snapshot atual. `step()` executa um tick e `stepN(n)` executa até `n` ticks. Em luta finalizada, ambos devolvem o mesmo estado final. A verificação de `n` ainda ocorre e lança `RangeError` para valores inválidos.
- Com as mesmas entradas, avançar em lote ou um tick por vez produz os mesmos estados, eventos e histórico. O estado do controlador só evolui na carga ou em chamadas síncronas.
- `getHistory()` retorna uma cópia da lista externa de snapshots. Com histórico desabilitado, retorna lista vazia. Com histórico habilitado, cada tick executado aparece uma vez, inclusive o tick 0 e o final.
- `reset()` recarrega os mesmos textos e recria o tick 0, os contadores, eventos e sementes. Preserva a assinatura síncrona v1. A substituição da sessão e do histórico ocorre após o preparo do novo estado e dos controladores. Uma falha inesperada de infraestrutura propaga a exceção e mantém a sessão anterior.
- Comandos constantes e textos são copiados na preparação. Resultados anteriores permanecem estáveis em avanço, reset e preparo de outro candidato.

## Compatibilidade

Os nomes, unidades e campos da S1 permanecem, e os campos da S2 são aditivos. Em `sumo`, a
execução passa a respeitar o encerramento da S2. Em `free`, ela devolve o estado no tick solicitado
e permanece em andamento. Ver [estado](state.md) e [CLI](cli.md).

## Detector de impasse

As opções de `createSimulation`, `prepareSimulation` e `runHeadless` aceitam `stallSeconds` com valor 5, 10 ou 30. Em `createInitialState(world, stallSeconds?)`, o prazo é o segundo argumento. Omissão desliga a regra. Valor diferente gera `RangeError`. O monitor atua no sumô. O reset recarrega o mesmo prazo.

## Geometria da borda

A biblioteca exporta `readEdge(world, pose, robotRadius): EdgeReading | null`. Usa uma pose física em metros e radianos e o raio do robô em metros. `ARENA_EDGE_INNER_RATIO` vale 0.975. O [contrato do controlador](controller-api.md) define a função sem argumentos que já recebe o contexto do próprio robô.

## Conclusão de labirinto

No primeiro tick positivo com centro dentro de `match.exit`, `status` passa a `finalizada`, `resultado` traz `motivo: "saida_alcancada"`, `vencedor` com o id do explorador e `tick`. O evento `fim_do_nivel` acompanha esse tick.

### Largada de sumô (ADR-023)
`sumoStartDelay?: boolean` em createSimulation, prepareSimulation e runHeadless. A omissão mantém a execução legada. Quando ativo no sumô, cada snapshot contém `sumoStartDelay: true`. No tick de queima, `falseStarters` contém os IDs na ordem do mundo. O resultado tem motivo `queima_da_largada` (um infrator) ou `queima_dupla` (ambos), vencedor ou null e `pontos` com os dois IDs e os pontos da rodada. O combate dispõe de maxTicks passos completos após a liberação.

Na CLI, `--sumo-start-delay` ativa a mesma opção para reproduzir a rodada da interface.
