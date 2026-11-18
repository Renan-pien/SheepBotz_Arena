# Contrato: Comando de Terminal Headless

## Uso

```bash
npm run sim -- --world <arquivo.json> --ticks <N> [--command <id>=<v>,<w>]... [--history] [--pretty]
```

| Argumento | Obrigatório | Descrição |
|---|---|---|
| `--world` | sim | Caminho do arquivo de mundo |
| `--ticks` | sim | Número inteiro de ticks, ≥ 0 |
| `--command` | não | Comando constante de um robô; pode repetir. Ex.: `--command vermelho=1,0` |
| `--history` | não | Inclui o histórico de estados |
| `--pretty` | não | JSON indentado |

## Saída

- **stdout:** o `HeadlessResult` em JSON (`{ "ok": true, "state": … }` ou `{ "ok": false, "errors": [ … ] }`).
- **stderr:** apenas mensagens de uso, em pt-BR.

## Códigos de saída

| Código | Situação |
|---|---|
| `0` | Simulação executada |
| `1` | Mundo ou comandos inválidos (erros impressos no stdout) |
| `2` | Uso incorreto: argumento ausente ou malformado, arquivo inexistente |

Na opção `--command`, a estrutura `id=v,w` exige três partes preenchidas. Um valor de velocidade
não numérico ou não finito em uma expressão com essa estrutura gera `COMANDO_INVALIDO` em
`stdout`, com saída 1. Exemplos de erro de uso com saída 2 incluem `--command vermelho=1` e
`--command vermelho=,0`.

Nas falhas de sintaxe da chamada, publique a linha de instruções iniciada por `Uso:` em
`stderr`. Para arquivo ilegível, use um diagnóstico iniciado por `Não foi possível ler`.
A saída 2 mantém `stdout` vazio.

## Exemplo

```bash
npm run sim -- --world examples/worlds/duelo-padrao.json --ticks 10 --command vermelho=1,0 --pretty
```

Resultado esperado: `vermelho` em x ≈ 0.0, y = 0, θ = 0; `azul` parado em (0.2, 0).
