# Quickstart de validação · Spec 002

Este guia descreve as verificações de aceite da S2 com os arquivos de exemplo e os
comandos do [plano](plan.md).

## 1. Preparar o ambiente

Use Node 24 (`.nvmrc`) e npm, na raiz do repositório.

```bash
nvm use
npm ci
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

A suíte deve manter as regressões da S1 e cobrir os 48 cenários de aceite da S2. Para
conferir apenas os critérios do núcleo da S2, execute `npm test -- tests/core/acceptance/s2`.
Os nomes dos testes começam com `S2-US1-AC1` e os demais IDs da sua história e cenário.
A CI confere lint, tipos, testes e cobertura em push e pull request.

## 2. Laser e estado inicial

```bash
npm run --silent sim -- --world examples/worlds/duelo-padrao.json --ticks 0 --pretty
```

Espere tick 0, `status: "em_andamento"`, `resultado: null` e a lista de eventos vazia.
O raio central de cada robô mede 0.35 m e os demais medem 0.8 m. A US1 cenários 10 e 11
verifica a leitura de 2.000 m entregue ao controlador, os 1.900 m da pose publicada após o
movimento e a volta a 2.000 m depois do reset. [Estado](contracts/state.md)

## 3. Luta, evento final e histórico

```bash
npm run --silent sim -- --world examples/worlds/duelo-padrao.json --ticks 40 \
  --controller vermelho=examples/controllers/avanca.js \
  --controller azul=examples/controllers/parado.js --history
```

Espere 35 estados de tick 0 a 34. O estado final tem `status: "finalizada"`, vencedor
`vermelho` e motivo `saida_da_arena`. Há um único evento `fim_da_luta` no tick 34 com
`robotId: null`. A última entrada de `history` coincide com `state`. [CLI](contracts/cli.md)

## 4. Falhas de entrada

```bash
npm run --silent sim -- --world examples/worlds/duelo-padrao.json --ticks 1 \
  --command vermelho=0,0 --controller vermelho=examples/controllers/parado.js \
  --controller fantasma=examples/controllers/parado.js --pretty
```

Espere saída 1 e `ok: false`, com `ENTRADA_CONFLITANTE` em `controllers.vermelho` e
`ROBO_INEXISTENTE` em `controllers.fantasma`. Os cenários 10 e 12 da US4 verificam a
devolução de falhas de carregamento junto dos demais erros. [Erros](contracts/errors.md)

## 5. Modo livre

```bash
npm run --silent sim -- --world examples/worlds/sala-com-obstaculos.json --ticks 2000 \
  --controller explorador=examples/controllers/desviador.js --pretty
```

Espere tick 2 000, `status: "em_andamento"`, `resultado: null` e ausência de
`erro_controlador`. [Configuração do mundo](contracts/world.md)

## 6. Benchmark e compatibilidade

```bash
npm run bench
npm run bench:s2
```

`bench` usa a geometria e os comandos de referência da S1 em modo livre para preservar
3 000 ticks executados. `bench:s2` usa o Duelo padrão, Parado em `vermelho`,
Girador em `azul` e histórico desabilitado. Devolva tick 3 000, motivo `tempo_esgotado` e
tempo medido em uma chamada `runHeadless`. Os textos e o motor estão em memória antes do
cronômetro. A validação de entradas, a avaliação dos scripts e os passos ficam dentro da
janela. A meta é menos de 2 s no ambiente de SC-003. Registre CPU, SO, versão exata do Node
e duração efetiva. [Critério SC-003](spec.md#6-critérios-de-sucesso)

Para conferir o mesmo motor no navegador, rode o teste de integração e sirva a fixture local.

```bash
npm test -- tests/runtime
npm exec -- vite build tests/runtime/fixtures/controller-browser --outDir "$PWD/dist/controller-browser"
npm exec -- vite preview tests/runtime/fixtures/controller-browser --outDir "$PWD/dist/controller-browser" --host 127.0.0.1 --port 4173 --strictPort
```

Abra `http://127.0.0.1:4173/` em Chromium. No console, `document.documentElement.dataset.status`
deve devolver `"ok"`. A fixture verifica a indisponibilidade de `Promise` e `Array.fromAsync`
no controlador e compara execução em lote com execução em passos intercalados com microtarefas
do host. O atributo `data-history` publica os cinco estados para comparação com o teste Node.

### Julgar a largada no terminal
Execute `npm run sim -- --world examples/worlds/duelo-padrao.json --ticks 25 --sumo-start-delay --command vermelho=0,1`. O resultado deve registrar queima de vermelho e um ponto para azul. Acrescente `--command azul=-1,0` para reproduzir a queima dupla. Ambos os casos registram a infração no tick 1 e terminam no tick 25. Com `--history`, confira as poses intermediárias e o evento final único.

### Conferir o adaptador Portugol
Após npm ci, execute `npm test -- --run tests/runtime/portugol.test.ts`. A suíte usa a distribuição local de Pyodide, o Core e o Maker oficiais. Verifica a integridade dos arquivos, comandos do pino, isolamento, limites, sensores, memória por robô e reset. O perfil aceito está no [contrato do controlador](contracts/controller-api.md#perfil-portugol--adr-025).
