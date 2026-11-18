# Ensaios de Regeneração — SheepBotz Arena

> Simulação do critério "Teste da Spec" (AGENTS.md §18). Registrar um ensaio ao fechar cada spec e um antes da entrega final.

## Modelo de registro

```markdown
## Ensaio N — AAAA-MM-DD
- **Specs incluídas:** S1 / S1–S2 / S1–S3
- **Agente usado na regeneração:** <cliente e modelo>, sessão nova, sem histórico
- **Testes:** <N passaram> de <total> (<X%>)
- **Falhas e causas:**
  | Teste | Causa | Correção feita no artefato |
  |---|---|---|
- **Conclusão:** <o que mudou na spec ou no plan>
```

## Ensaios

### Ensaio 1 — 2026-11-17

- **Specs incluídas** S1. A branch temporária de ensaio partiu de `main` em `0e75cfc` e recebeu
  a árvore candidata do [PR #2](https://github.com/Renan-pien/SheepBotz_Arena/pull/2), com head `2ec9774`.
- **Agente** Codex em sessão independente sem histórico. A cópia entregue à sessão continha a
  constituição, a spec, o plan e seus anexos, as tasks e a configuração de ferramentas. O agente
  reconstruiu o código sem consultar a implementação original. A suíte original ficou em um
  diretório separado e foi aplicada depois que a implementação regenerada foi congelada.
- **Resultado da primeira execução cega** 109 de 129 testes passaram (84,50%), incluindo os
  36 critérios de aceite. Os 20 testes que falharam estão agrupados abaixo.

| Grupo de testes | Falhas | Causa | Correção documentada |
|---|---:|---|---|
| `contacts.test.ts` | 5 | O plano permitia que o resolvedor retornasse duas listas em um objeto. A suíte esperava uma lista de resultados individuais. | [Plan, interfaces internas](../specs/001-nucleo-simulacao/plan.md#interfaces-internas-verificadas-pela-suíte). |
| `obstacles.test.ts` | 9 | O nome da propriedade booleana do retorno estava implícito. A versão regenerada usava `contact` e a suíte esperava `contacted`. | [Plan, interfaces internas](../specs/001-nucleo-simulacao/plan.md#interfaces-internas-verificadas-pela-suíte). |
| `update-stats.test.ts` | 2 | Os exports de métricas e o formato portável do JSON estavam incompletos no plan. | [Plan, qualidade e automação](../specs/001-nucleo-simulacao/plan.md#qualidade-e-automação) e [pesquisa R10](../specs/001-nucleo-simulacao/research.md#r10--relatório-de-cobertura-e-linha-do-readme-proposta-padrão-da-q-005). |
| `angle.test.ts` | 2 | Para entradas grandes, o cálculo direto produziu valores fora de (−π, π] por cancelamento em ponto flutuante. | [Spec, FR-012](../specs/001-nucleo-simulacao/spec.md#sistema-de-coordenadas-unidades-e-tempo) e [pesquisa R5](../specs/001-nucleo-simulacao/research.md#r5--normalização-de-ângulo). |
| `run-cli.test.ts` | 1 | A descrição da saída 2 permitia classificar um texto no campo de velocidade como erro de sintaxe. | [Contrato da CLI](../specs/001-nucleo-simulacao/contracts/cli.md#códigos-de-saída) explicita saída 1 para a velocidade inválida em uma expressão bem formada. |
| `run-headless.test.ts` | 1 | A acumulação de dois erros para a mesma entrada estava implícita. | [Spec, FR-035](../specs/001-nucleo-simulacao/spec.md#execução-sem-interface-e-determinismo) e [contrato do núcleo](../specs/001-nucleo-simulacao/contracts/core-api.md#comportamento-de-runheadless). |

A auditoria também alinhou o caso de borda da validação geométrica ao FR-007. Cada verificação usa
os campos válidos dos quais depende.

#### Reexecução após as clarificações

A sessão de regeneração recebeu os artefatos revisados e ajustou sua implementação independente.
A suíte original passou com **129 de 129 testes**, incluindo os 36 critérios de aceite. O núcleo
atingiu **100% de cobertura de linhas** e o projeto, **95,09%**. Os limites de cobertura de
instruções, funções e ramos e a verificação de tipos também passaram. O benchmark regenerado
executou 3.000 ticks com dois robôs em **22,273 ms** no Node 24.22.3, Linux x64, Intel Core i5-1334U.

A branch temporária foi descartada após a verificação. A revisão no PR contém as clarificações nos
artefatos SDD e este registro.

### Ensaio 2 — 2026-11-17

- **Specs incluídas** S1 e S2. A branch temporária partiu da `main` em `d02c684`,
  merge do [PR #4](https://github.com/Renan-pien/SheepBotz_Arena/pull/4).
- **Agente** Codex em sessão independente, sem histórico. A sessão recebeu a
  constituição, os artefatos SDD das duas specs, seus anexos e a configuração de
  ferramentas em um diretório sem Git. A suíte original ficou separada e foi
  aplicada em outro diretório depois do congelamento de cada versão.
- **Primeira execução cega** 189 de 233 testes passaram (81,12%), incluindo os
  36 cenários de aceite da S1 e os 48 da S2. A cobertura de linhas foi de
  92,34% no projeto e 97,36% no núcleo. A checagem de tipos com a suíte original
  apontou, também, a assinatura do saturador de velocidade.

| Grupo de testes | Falhas | Causa | Artefato esclarecido |
|---|---:|---|---|
| CLI | 12 | Os diagnósticos eram em português e usavam saída 2, mas faltava o prefixo de uso esperado. | [Contrato de CLI da S1](../specs/001-nucleo-simulacao/contracts/cli.md#códigos-de-saída), herdado na S2. |
| Motor de controlador | 9 | A sessão escolheu uma assinatura de carga que lançava a exceção e vinculava a API em outra chamada. A suíte esperava um retorno discriminado e os vínculos como parâmetro. | [Interfaces da S2](../specs/002-sensores-controlador/plan.md#interfaces-internas-verificadas-pela-suíte). |
| Benchmark | 2 | Os construtores de entrada e os comandos constantes do benchmark de regressão da S1 estavam implícitos. | [Plano da S2](../specs/002-sensores-controlador/plan.md#qualidade-e-automação). |
| Ciclo, falhas e preparação | 6 | Os nomes, parâmetros e retornos do executor de callbacks e do preparador de entradas foram inferidos de outro modo. | [Interfaces da S2](../specs/002-sensores-controlador/plan.md#interfaces-internas-verificadas-pela-suíte). |
| Laser, raycast e sumô | 13 | O regenerado usou outras assinaturas para a varredura, o cálculo de intervalos, a distância ao círculo e o avaliador de resultado. | [Interfaces da S2](../specs/002-sensores-controlador/plan.md#interfaces-internas-verificadas-pela-suíte). |
| Regressões de falhas de controlador | 2 | A recusa de código assíncrono e a falha de `setSpeed` foram propagadas com mensagens de redação diferente. | [Contrato de erros](../specs/002-sensores-controlador/contracts/errors.md#regras-e-textos) e [API do controlador](../specs/002-sensores-controlador/contracts/controller-api.md). |

O plano da S1 explicita que a saturação depende somente dos limites linear e angular.
A auditoria também identificou dois pontos que poderiam gerar comportamentos distintos.
O [Anexo A da S2](../specs/002-sensores-controlador/spec.md#anexo-a--exemplos-de-leitura-do-laser-resumo)
identifica o mapa e a orientação de cada exemplo. O contrato de controlador esclarece
o descarte de logs excedentes antes de converter seus argumentos, ponto U01 da análise.

#### Reexecução após os esclarecimentos

A mesma sessão independente recebeu os artefatos revisados e congelou uma segunda
implementação. A suíte original passou com **233 de 233 testes**, incluindo os 84
cenários de aceite. Lint, tipos, build e os limites de cobertura passaram. A cobertura
de linhas foi de **94,38% no projeto** e **99,30% no núcleo**. As coberturas de ramos
foram de 92,18% no projeto e 96,23% no núcleo.

No Intel Core i5-1334U, Linux x64 e Node 24.22.3, o benchmark regenerado da S1
completou 3 000 ticks em 74,51 ms. O da S2 completou 3 000 ticks em 41,11 ms,
com resultado `tempo_esgotado`. A fixture de navegador confirmou igualdade entre
lote, avanço passo a passo e reset.

A implementação e a suíte da branch de entrega foram preservadas. O ensaio gerou
esclarecimentos nos artefatos SDD e a branch temporária foi descartada.

### Ensaio 3 — 2026-11-18

- **Specs incluídas** S1, S2 e S3, no ensaio de encerramento da S3 e da
  entrega das três specs. A branch temporária partiu da `main` em
  `e0e68c5` e a sessão recebeu os artefatos do [PR #6](https://github.com/Renan-pien/SheepBotz_Arena/pull/6),
  inicialmente no commit `6d7ac92`.
- **Agente** Codex em sessão nova, sem histórico. A árvore cega continha
  constituição, artefatos SDD e configuração de ferramentas. A suíte
  original ficou em outro diretório e foi aplicada às versões congeladas.
- **Primeira execução cega** 236 de 320 testes passaram (73,75%), com os
  36 cenários da S1, 48 da S2 e 4 dos 49 da S3. A cobertura de linhas foi
  de 64,43% no projeto e 99,03% no núcleo. A versão cega compilava e
  executava o Duelo, exportava 35 estados e oferecia replay no Chrome.
  Os tipos da suíte original expuseram diferenças nas assinaturas.

| Grupo | Falhas | Causa e correção |
|---|---:|---|
| CLI | 1 | O diagnóstico de arquivo ilegível omitia que o arquivo era de controlador. O [contrato CLI v2](../specs/002-sensores-controlador/contracts/cli.md) explicita o texto. |
| Catálogo e sessão inicial | 1 | Os nomes e as formas dos presets eram implícitos. O [plano da S3](../specs/003-visualizacao-operacao/plan.md#catálogo-e-sessão) define chaves e campos. |
| Cena e câmera | 11 | A sessão escolheu outra API de projeção e câmera. As opções de visibilidade tinham controles, mas os pontos de observação do snapshot eram implícitos. O [plano](../specs/003-visualizacao-operacao/plan.md#interfaces-internas-verificadas-pela-suíte) define interfaces, atributos e a montagem sem WebGL. |
| Operação | 6 | A chamada de relógio recebia um instante absoluto. A suíte usava um intervalo em milissegundos. A consulta determinística do histórico estava implícita. O [plano](../specs/003-visualizacao-operacao/plan.md#catálogo-e-sessão) fixa o delta, as transições e a API de consulta. |
| Mundos, inspeção e apresentação | 18 | Nomes de operações, papéis acessíveis e rótulos foram inferidos de outro modo. O [plano](../specs/003-visualizacao-operacao/plan.md#interfaces-internas-verificadas-pela-suíte) define as operações, e o [contrato](../specs/003-visualizacao-operacao/contracts/operacao.md#nomes-acessíveis-e-formatos) fixa a semântica observável. |
| Gravação e replay | 47 | A API interna de gravação e operação do replay tinha nomes diferentes, e a divergência no relógio impedia preparar o histórico de referência. O [plano](../specs/003-visualizacao-operacao/plan.md#gravação-e-observação) explicita tipos, assinaturas e a identidade dos prefixos de eventos. |

A revisão também explicita o motor injetável para testar a UI em jsdom.
O SES real permanece na integração em navegador e nos testes Node.

#### Segunda rodada cega

A versão reconstruída a partir dos artefatos revistos passou em **309 de
320 testes**. Passaram lint, tipos e build. A cobertura de linhas foi de
86,91% no projeto e 99,03% no núcleo. Os 84 cenários das Specs 001 e 002
continuaram verdes, e 38 dos 49 cenários da S3 passaram.

| Grupo | Falhas | Causa e correção |
|---|---:|---|
| Operação | 2 | O tempo estava concatenado ao status, e o botão Reiniciar do rodapé dava lugar ao do banner no fim da luta. O contrato distingue esses elementos e as duas ações. |
| Controladores e replay | 7 | A aba inicial escolhida era Inspeção. O contrato define Controladores como a aba inicial. |
| Inspeção e eventos | 2 | O número de casas do ângulo do raio e o texto de contagem de eventos ocultos eram implícitos. O contrato fixa uma casa e os avisos no singular e plural. |

[Detalhes do contrato de operação](../specs/003-visualizacao-operacao/contracts/operacao.md#nomes-acessíveis-e-formatos)

#### Terceira rodada e resultado final

A sessão independente recebeu o contrato revisado e congelou a terceira
versão em 58 arquivos de produção, com SHA-256 agregado
`60f23ca3b9d52cbb5621f56b4ad109ae077ddb3c5e69facb02a07730a32b20aa`.
A suíte original passou em **320 de 320 testes**, com zero falhas e os
**133 cenários de aceite** (36 da S1, 48 da S2 e 49 da S3). Lint, tipos,
build e os limites de cobertura passaram em Node 24.22.3.

| Código regenerado | Instruções | Ramos | Funções | Linhas |
|---|---:|---:|---:|---:|
| Projeto | 88,81% | 86,85% | 88,77% | 90,16% |
| Núcleo | 98,45% | 97,08% | 97,67% | 99,03% |

No Chrome 145.0.7632.116 com WebGL 2, vermelho venceu por saída da arena
no tick 34, com 0,68 s de tempo simulado. Os 35 estados exportados do
navegador, com seus eventos, coincidiram com a saída da CLI da branch de
entrega. Na mesma máquina (Intel Core i5-1334U, Linux x64), os benchmarks
regenerados completaram 3 000 ticks em 25,46 ms para a S1 e 20,73 ms
para a S2.

O código de entrega e a suíte original foram preservados. O ensaio
final das três specs foi aprovado, e a branch temporária de regeneração
foi descartada.
