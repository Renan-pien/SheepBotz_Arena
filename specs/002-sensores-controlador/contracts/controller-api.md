# Contrato da API do controlador · v1

O controlador é um script JavaScript síncrono em modo estrito. Declara `loop()` e pode declarar `setup()`.
Instruções no nível superior são avaliadas uma vez por carga, inclusive no reset, sem acesso
às funções do robô. Um erro de sintaxe, forma de script incompatível com a execução síncrona,
ausência de `loop()` ou falha durante a avaliação gera `CONTROLADOR_INVALIDO` antes do tick 0.

O script usa intrínsecos síncronos da linguagem e a API abaixo. Módulos, importação dinâmica,
construções assíncronas e callbacks geradores para `setup()` e `loop()` são rejeitados no
carregamento. O ambiente do controlador não oferece relógio real, acesso ao host, avaliação
dinâmica de código ou aleatoriedade sem semente. `Promise`, agendadores e `Array.fromAsync`
estão indisponíveis desde a carga. Para obter um número pseudoaleatório, use `random()`.

Uma tentativa de chamar um recurso indisponível pode lançar uma exceção. Quando ela
interrompe a carga, devolve-se `CONTROLADOR_INVALIDO`. Durante `setup()` ou `loop()`, uma
exceção que sai do callback gera `erro_controlador`. Essas regras também valem no reset.

## Fases e dados disponíveis

No primeiro tick executado, `setup()` roda imediatamente antes de `loop()`. Ambas observam a
pose e os sensores publicados no tick 0. Em cada passo `k → k + 1`, `loop()` é chamada uma vez
por robô ativo, na ordem do mundo, e observa os dados do tick `k`. A API está disponível durante
essas chamadas e seus auxiliares síncronos.

Entre chamadas, o estado do script permanece estável. Avanço em lote e passo a passo
produzem os mesmos estados, eventos e histórico para as mesmas entradas.

| Função | Retorno e efeito |
|---|---|
| `readLaser()` | Cópia mutável de `number[]` na ordem do raio 0 ao último. Lista vazia sem laser. |
| `readBumper()` | Booleano com o contato registrado no estado observado. Falso no tick 0. |
| `readOdometry()` | Cópia de `{ x, y, theta }` em metros e radianos. |
| `getInfo()` | Cópia de `{ id, tick, time, dt, radius, maxLinearSpeed, maxAngularSpeed, arenaRadius, laser }`. `tick` e `time` são observados. `laser` é `{ rays, fov, maxRange }` ou `null` e `arenaRadius` é o raio em metros ou `null`. |
| `setSpeed(v, w)` | Recebe dois números finitos em m/s e rad/s. O último comando válido do passo é aplicado após saturação pela física. Sem chamada, vale o comando efetivo anterior. |
| `random()` | Número em `[0, 1)`. Usa a semente do mundo e o índice do robô. `setup()` e `loop()` compartilham apenas a sequência daquele robô. |
| `log(...valores)` | Converte cada valor com `String(valor)` e junta com um espaço. Registra ID do robô e tick `k + 1`. São aceitos até 1 000 logs por robô por execução. A tentativa 1 001 gera o aviso único `limite_de_logs`. |

Argumento inválido de `setSpeed` caracteriza falha mesmo se o script capturar a exceção.
Uma falha em `setup()` suprime o primeiro `loop()`. Em ambas as fases, a primeira falha
desativa o robô, descarta o comando candidato e impõe comando zero desde o tick em curso.
Registros de log já emitidos permanecem. O evento `erro_controlador` leva a mensagem da
falha e o tick `k + 1`. Outros robôs e a física continuam no mesmo passo.

A [pesquisa R4](../research.md#r4--sequência-pseudoaleatória-por-robô) fixa o algoritmo e os
vetores do gerador. Os scripts fornecidos como exemplo são os do Anexo D da [spec](../spec.md).
