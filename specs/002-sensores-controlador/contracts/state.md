# Contrato de estado publicado · v2

Extensão aditiva do [estado da S1](../../001-nucleo-simulacao/contracts/state.md), incluindo
as unidades e a ordem dos robôs. Biblioteca e CLI usam os mesmos nomes. Os campos abaixo
são emitidos também em `free` e nas simulações com comandos constantes.

| Objeto | Acréscimos obrigatórios |
|---|---|
| Robô | `laser: number[]` e `situacao: "ativo"` ou `"desativado"`. `laser` é vazio sem sensor e corresponde à pose publicada. |
| Estado | `status: "em_andamento"` ou `"finalizada"`, `resultado: MatchResult \| null` e `events: SimEvent[]`. |
| Resultado | `{ vencedor: string \| null, motivo, tick }`. Os motivos são `saida_da_arena`, `ambos_sairam`, `tempo_esgotado` e, com o detector, `falta_de_progresso`. |
| Evento | `{ type, tick, robotId: string \| null, message: string }`. `type` é `log`, `erro_controlador`, `limite_de_logs` ou `fim_da_luta`. |

No tick 0, todos os robôs estão ativos, `events` é `[]`, `resultado` é `null` e
`status` é `"em_andamento"`. Os estados da biblioteca são readonly. Na CLI, os números são
serializados sem arredondamento de apresentação. `time` continua igual a `tick * dt`.
`resultado` é uma chave obrigatória em todos os estados. Seu valor fica em `null`
durante a luta e em toda execução em modo `free`.

## Eventos e término

Eventos entram na ordem em que ocorrem. Dentro de um tick, valem a ordem de robôs no mundo
e a ordem das chamadas dentro de `setup()` ou `loop()`. Um evento de falha sucede os eventos
já emitidos por aquela chamada. `limite_de_logs` tem o ID do robô e a mensagem
`Limite de 1 000 logs atingido para '<id>'.`.

O evento `fim_da_luta` é o último evento do tick terminal e usa `robotId: null` em qualquer
resultado. Em uma vitória por saída, por exemplo:

```json
{
  "resultado": { "vencedor": "vermelho", "motivo": "saida_da_arena", "tick": 34 },
  "events": [
    { "type": "fim_da_luta", "tick": 34, "robotId": null,
      "message": "Fim da luta: vitória de 'vermelho' por saída da arena." }
  ]
}
```

Para impasse, a mensagem é `Fim da luta: empate por falta de progresso.`. Nos outros empates, as mensagens são `Fim da luta: empate por tempo esgotado.` e
`Fim da luta: empate. Os dois robôs saíram da arena.`, conforme o motivo. O último estado
guarda as leituras das poses finais. Um avanço posterior não publica outro evento nem amplia
o histórico.

## Consumo pela S3

O filtro por robô usa `robotId`. O aviso de resultado usa `resultado.vencedor` e `resultado.motivo`.
O replay preserva os estados publicados e sua ordem, inclusive os eventos acumulados e
`robotId: null`. A especificação do arquivo de gravação e o limite de 100 000 ticks pertencem
à S3. [Spec 003, §4.5 e §4.6](../../003-visualizacao-operacao/spec.md)

## Sumô com detector (ADR-018)

SimState.stall é opcional: { limitSeconds, sinceTick, centers: [{ x, y }, ...] }. Centros em metros na ordem do mundo. No tick 0 correspondem às posições iniciais. O motivo falta_de_progresso exige vencedor nulo e um único evento terminal.
