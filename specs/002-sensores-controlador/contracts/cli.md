# Contrato da CLI · v2

```bash
npm run sim -- --world <mundo.json> --ticks <N> \
  [--command <id>=<v>,<w>]... [--controller <id>=<arquivo.js>]... [--history] [--pretty]
```

Herdam-se os argumentos e os hábitos de saída do [comando v1](../../001-nucleo-simulacao/contracts/cli.md).
Cada `--controller` liga o texto UTF-8 de um arquivo a um robô. A CLI separa ID e caminho
no primeiro `=` e considera vazio um lado composto apenas por espaços. Para a mesma opção e
o mesmo ID, prevalece a última ocorrência, como na opção `--command`. Se existirem as duas
opções para o ID, ambas seguem para validação e geram `ENTRADA_CONFLITANTE`.

| Saída | Situação |
|---|---|
| `0` | JSON de sucesso em stdout. O JSON usa o [estado v2](state.md) e inclui `history` quando solicitado. |
| `1` | JSON em stdout com [erros de domínio](errors.md), incluindo conteúdo inválido de controlador. |
| `2` | Uso incorreto, argumento malformado ou falha de leitura de mundo ou controlador. Mensagem em pt-BR em stderr. |

O adaptador lê o mundo e os controladores antes da chamada ao núcleo. O caminho
`controllers.<id>` identifica o robô no erro de domínio, independentemente do caminho do arquivo.
Durante a simulação, chamadas a `log()` ficam no JSON de estado. O modo `--pretty` só altera
a indentação. `--ticks` limita quantos ticks serão executados e uma luta encerrada pode devolver
um tick menor. Os exemplos e verificações estão no [quickstart](../quickstart.md).

A falha de leitura de um controlador usa
`Não foi possível ler o arquivo de controlador '<caminho>'.` em stderr,
com stdout vazio. O diagnóstico distingue controlador de mundo.
