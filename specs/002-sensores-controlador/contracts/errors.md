# Contrato de erros da execução sem interface · v2

Preserva o objeto `{ code, path, message }` e as regras de mundo e comandos do [contrato v1](../../001-nucleo-simulacao/contracts/errors.md). Os erros abaixo pertencem à preparação do estado inicial e voltam em `{ ok: false, errors }`.

## Regras e textos

| Código | Caminho | Mensagem |
|---|---|---|
| `ROBO_INEXISTENTE` | `controllers.<id>` | `Não existe robô com id '<id>' (em 'controllers.<id>').` |
| `ENTRADA_CONFLITANTE` | `controllers.<id>` | `O campo 'controllers.<id>' não pode ser combinado com 'commands.<id>'.` |
| `CONTROLADOR_INVALIDO` | `controllers.<id>` | `Controlador inválido em 'controllers.<id>': <detalhe>` |

Para `CONTROLADOR_INVALIDO`, preserve a mensagem original da exceção no detalhe, sem a
pilha. Para ausência de `loop()`, use `A função loop() é obrigatória.`. Para uma forma excluída
pelo FR-009, o detalhe identifica o recurso rejeitado antes do tick 0. Uma exceção de
nível superior ao tentar usar recurso indisponível é falha de avaliação e mantém o
detalhe original.

Para construções assíncronas use `O script não aceita código assíncrono.`, para
importação dinâmica use `O script não aceita importação dinâmica.` e para callbacks
geradores use `O callback <nome>() não pode ser um gerador.`, com `setup` ou `loop`.
Compare código e caminho de forma exata. Para erros de sintaxe nativos, o trecho original
segue o parser e a origem do diagnóstico. Para uma mensagem lançada pelo próprio script,
o texto informado pelo controlador é preservado.

## Ordem de validação

1. Validar o mundo. Se inválido, devolver apenas seus erros.
2. Acumular erros de `commands` pelas regras e na ordem de enumeração já definidas na S1.
3. Percorrer as chaves de `controllers` na ordem de enumeração da entrada. Para cada chave,
   registrar primeiro `ROBO_INEXISTENTE` se o ID estiver ausente e depois `ENTRADA_CONFLITANTE`
   se houver a mesma chave em `commands`. As verificações são independentes.
4. Na ordem de `world.robots`, carregar todos os controladores com ID existente e sem
   comando concorrente. Acrescentar um `CONTROLADOR_INVALIDO` por falha. Continuar com
   os outros controladores elegíveis.
5. Se houver qualquer erro, devolver a lista e descartar a preparação. Publicar o tick 0
   apenas quando a lista estiver vazia.

Exemplo de resposta com ID ausente, conflito e falha de carga, na ordem de entrada de
`controllers` `vermelho`, `azul` e `fantasma`:

```json
{
  "ok": false,
  "errors": [
    { "code": "ENTRADA_CONFLITANTE", "path": "controllers.vermelho",
      "message": "O campo 'controllers.vermelho' não pode ser combinado com 'commands.vermelho'." },
    { "code": "ROBO_INEXISTENTE", "path": "controllers.fantasma",
      "message": "Não existe robô com id 'fantasma' (em 'controllers.fantasma')." },
    { "code": "CONTROLADOR_INVALIDO", "path": "controllers.azul",
      "message": "Controlador inválido em 'controllers.azul': falha no carregamento" }
  ]
}
```

Após o início, uma falha em `setup()` ou `loop()` desativa o robô e gera `erro_controlador`
no [estado](state.md). A execução sem interface continua a devolver um resultado bem-sucedido
do núcleo, incluindo os eventos e o resultado da luta quando houver.
