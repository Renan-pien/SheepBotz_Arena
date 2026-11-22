# Contrato: Erros e Mensagens

Objeto de erro: `{ code, path, message }`. Testes de aceitação comparam `code` e `path`; a mensagem deve conter o caminho entre aspas simples (exceto quando o caminho é vazio).

## Caminhos

- Notação: chaves separadas por ponto e índices entre colchetes, a partir da raiz: `map.width`, `robots[1].laser.rays`, `obstacles[0]`.
- Documento inteiro: caminho vazio `''`.
- Comandos da execução sem interface: `commands.<id>`.

## Mensagens (pt-BR)

`{c}` = caminho; demais marcadores entre chaves são valores do caso.

| Código | Caminho | Mensagem |
|---|---|---|
| `ARQUIVO_INVALIDO` | `''` | `O arquivo de mundo não é um JSON válido: {detalhe}.` ou `A raiz do arquivo de mundo deve ser um objeto.` |
| `CAMPO_OBRIGATORIO` | campo ausente | `O campo '{c}' é obrigatório.` |
| `CAMPO_DESCONHECIDO` | campo extra | `O campo '{c}' não é reconhecido.` |
| `TIPO_INVALIDO` | campo | `O campo '{c}' deve ser {tipo}.` — tipo: `um número`, `um número inteiro`, `um texto`, `um objeto` ou `uma lista` |
| `FORMATO_INVALIDO` | campo | `O campo '{c}' tem formato inválido: {regra}.` — regras: `use de 1 a 32 letras, números, '_' ou '-'`; `use uma cor no formato #RRGGBB`; `use "free", "sumo" ou "maze"` |
| `VALOR_FORA_DO_INTERVALO` | campo ou lista | `O campo '{c}' está fora do intervalo permitido ({intervalo}); valor recebido: {valor}.` ou `A lista '{c}' deve ter de {min} a {max} itens; recebidos: {n}.` |
| `ID_DUPLICADO` | `….id` da repetição | `O id '{id}' em '{c}' já foi usado.` |
| `FORA_DO_MAPA` | `obstacles[k]`, `robots[i]` ou `arena.radius` | `O obstáculo em '{c}' não está inteiramente dentro do mapa.` / `O robô em '{c}' não está inteiramente dentro do mapa.` / `A arena em '{c}' não cabe no mapa: o raio máximo é {max}.` |
| `POSICAO_INICIAL_INVALIDA` | `robots[i]` | `O robô em '{c}' começa sobrepondo o obstáculo '{id}'.` / `O robô em '{c}' começa sobrepondo o robô '{id}'.` |
| `DESLOCAMENTO_EXCESSIVO` | `robots[i].maxLinearSpeed` | `Em '{c}', maxLinearSpeed × dt ({d} m) é maior que o raio do robô ({r} m); reduza a velocidade máxima ou o dt.` |
| `REGRA_DA_MODALIDADE` | `robots`, `arena` ou `robots[i]` | `No modo sumô, '{c}' deve ter exatamente 2 robôs; recebidos: {n}.` / `No modo sumô, o campo '{c}' é obrigatório.` / `No modo sumô, o robô em '{c}' deve começar dentro da arena.` |
| `ROBO_INEXISTENTE` | `commands.<id>` | `Não existe robô com id '{id}' (em '{c}').` |
| `COMANDO_INVALIDO` | `commands.<id>` | `O comando em '{c}' deve ter v e w numéricos e finitos.` |

## Regras de geração

- Um erro por problema, todos acumulados (FR-005).
- `ID_DUPLICADO` aponta para a segunda ocorrência em diante.
- Quando um objeto obrigatório tem tipo errado, seus campos internos não são verificados.
- Verificações geométricas só sobre itens cujos campos envolvidos são válidos (FR-007).
