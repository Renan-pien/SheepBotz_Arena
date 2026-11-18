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
