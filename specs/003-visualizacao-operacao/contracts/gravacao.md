# Contrato de gravação · v1

Arquivo JSON UTF-8, independente do estado atual da tela.

| Chave | Tipo e invariante |
|---|---|
| `format` | Constante `sheepbotz-arena`. |
| `version` | Inteiro `1`. |
| `world` | Texto original do mundo, aceito pelo validador da S1. |
| `controllers` | Objeto com o texto do controlador aplicado de cada ID, exatamente na mesma associação do mundo. |
| `createdAt` | Data UTC em ISO 8601 no formato de `Date.toISOString()`. |
| `events` | Lista em ordem acumulada, com os campos do estado da S2. Eventos de partida têm ID nulo. |
| `states` | De 1 a 100 001 objetos. Cada um contém todos os campos de `SimState`, com a lista `events` representada por `eventCount`. |

`states[k]` representa o tick `k`, tempo `k × dt`, robôs na mesma ordem
e com os IDs do mundo. `eventCount` é o comprimento do prefixo de `events`
visível naquele estado. Não diminui e a contagem final é exatamente o
comprimento da lista. O primeiro estado tem tick 0 e nenhum evento.
A sessão finalizada só pode existir no último snapshot e contém um
resultado compatível e exatamente um evento global de fim.
O modo livre fica em andamento. Gravações parciais podem terminar com a
luta em andamento. O limite do histórico é o tick 100 000 inclusive.

A validação confere estrutura, versão, mundo, vínculo de IDs, campos
finitos, comprimento e alcance do laser, ticks, tempo, estado, resultado,
mensagens e ordem de eventos. Reconstrói as listas cumulativas e usa os
snapshots sem recalcular física nem avaliar o texto de controladores.
O teste de determinismo da gravação produzida compara separadamente a
reexecução da mesma entrada até o mesmo tick. A igualdade no arquivo usa
a representação numérica JSON, que representa `-0` como `0`.

Falha retorna `{ code: 'GRAVACAO_INVALIDA', path, message }` em pt-BR e
preserva a sessão anterior. A UI gera o nome
`sheepbotz-<nome>-<AAAA-MM-DD-HHmm>.json` com o tempo UTC de criação.
No nome, transliterar acentos e substituir espaços ou caracteres fora de
letras e dígitos por hífen, com `mundo` como componente padrão.
