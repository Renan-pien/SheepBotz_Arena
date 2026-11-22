# Contrato de gravação · v1 a v5

Arquivo JSON UTF-8, independente do estado atual da tela.

| Chave | Tipo e invariante |
|---|---|
| `format` | Constante `sheepbotz-arena`. |
| `version` | Inteiro `1` sem detector, `2` com critério individual, `3` com os critérios individual e conjunto sem largada, `4` em labirinto ou `5` no sumô com largada. |
| `stallSeconds` | Obrigatório nas versões 2, 3 e 5. Inteiro 5, 10 ou 30 em sumô. |
| `world` | Texto original do mundo, aceito pelo validador da S1. |
| `controllers` | Objeto com o texto do controlador aplicado de cada ID, exatamente na mesma associação do mundo. |
| `createdAt` | Data UTC em ISO 8601 no formato de `Date.toISOString()`. |
| `events` | Lista em ordem acumulada, com os campos do estado da S2. Eventos de partida têm ID nulo. |
| `states` | De 1 a 100 001 objetos. Cada um guarda tick, tempo, robôs, status, resultado e o prefixo de eventos por `eventCount`. O monitor da v2 é derivado das poses. |

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

## Extensão v2 (ADR-018)

A v2 registra a configuração em `stallSeconds`. Na leitura, reconstruir os centros de referência e o tempo sem progresso em ordem de tick a partir das poses gravadas, conforme a regra individual da ADR-018. Conferir o resultado com o prazo escolhido. A v1 mantém os motivos de encerramento anteriores à ADR-018.

## Extensão v3 (ADR-019)

Na v3, um estado pode incluir `pairContact: true` para registrar colisão entre os robôs. Se presente, requer tick positivo e ambos os bumpers ativos. Omissão significa falso. A leitura reconstrói as duas contagens sequencialmente, usando esse sinal, os raios do mundo e as poses gravadas. O resultado deve coincidir com a regra da versão do arquivo. Ao salvar um replay importado, preservar a versão original.

A inspeção de borda da ADR-020 deriva as leituras do mundo e da pose gravada em cada tick. Isso se aplica às versões 1, 2 e 3, inclusive a arquivos gravados antes da revisão da API. Exibir a leitura dispensa executar o controlador.

## Versão 4 · Labirinto

Reservada a mundos `maze`, sem `stallSeconds`. Usa os estados e prefixos de eventos existentes. Conferir `fim_do_nivel` único no último tick positivo e validar `saida_alcancada` pela pose física e pelo id do robô. Uma chegada antecipada em estado em andamento invalida o arquivo. As versões 1–3 conservam seus modos anteriores.

### Versão 5 · Sumô com largada
A versão 5 identifica a espera fixa de 5 s e usa o mesmo stallSeconds e contato do par da v3. Durante a espera a física permanece no estado inicial. O último estado com queima registra falseStarters, uma lista dos infratores distintos na ordem dos robôs. O resultado registra motivo, tick, vencedor e pontos por ID. Validar a janela pelo tempo anterior ao passo, poses e comandos imóveis, vínculo entre infratores, vencedor e pontos e evento final único. Não executar os scripts ao ler. V1–v4 conservam as próprias regras.
