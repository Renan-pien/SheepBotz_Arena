# Research: Decisões Técnicas da Spec 001

Cada decisão registra alternativas e motivo. Decisões de stack estão na ADR-008; aqui ficam as decisões de implementação desta spec.

---

## R1 — Projeto único com pastas separadas

- **Decisão:** um único `package.json`, com `src/core`, `src/cli` e `src/ui`.
- **Alternativas:** monorepo com workspaces (`packages/core`, `packages/ui`).
- **Motivo:** menos configuração para uma PoC; a fronteira é garantida por regra de lint (R11).

## R2 — Validador do mundo escrito à mão, guiado por uma descrição declarativa

- **Decisão:** `schema.ts` descreve cada campo (tipo, obrigatório, padrão, intervalo, inteiro, formato) e um percorredor genérico produz os erros; verificações entre campos ficam em `geometry-checks.ts`.
- **Alternativas:** Zod; Ajv com JSON Schema.
- **Motivo:** o catálogo de erros da spec (códigos próprios, caminhos no formato `robots[1].laser.rays`, mensagens em pt-BR, todos os erros de uma vez, verificações condicionais do FR-007) exigiria adaptar extensivamente as mensagens e caminhos dessas bibliotecas. Um validador pequeno é mais previsível e 100% testável.

## R3 — Passo puro sobre estados imutáveis

- **Decisão:** `step(world, state, commands)` cria um novo estado a cada tick e nunca altera o anterior.
- **Alternativas:** mutar um único estado.
- **Motivo:** determinismo e histórico sem cópias defensivas; base direta para o replay (Spec 003). O custo é irrelevante com até 8 robôs.

## R4 — Aritmética de ponto flutuante

- **Decisão:** números de dupla precisão do JavaScript; distâncias com `Math.sqrt(dx*dx + dy*dy)`; trigonometria com `Math.cos` e `Math.sin`; nenhum arredondamento interno.
- **Alternativas:** `Math.hypot`; arredondar estados a cada tick.
- **Motivo:** `Math.hypot` pode variar mais entre motores JavaScript; arredondar mudaria os resultados em relação aos exemplos da spec, que foram calculados sem arredondamento.

## R5 — Normalização de ângulo

- **Decisão:** `normalizeAngle(t)` usa `t − 2π · Math.ceil((t − π) / (2π))`, com `Math.PI`. Se o
  cálculo direto produzir um valor `≤ −π` ou `> π` por cancelamento em ponto flutuante, aplique a
  mesma fórmula a `t % (2 * Math.PI)`. `angleDiff(a, b)` devolve a diferença normalizada de
  `a − b`, usada nas comparações com tolerância.
- **Alternativas:** laços `while`; `atan2(sin, cos)`.
- **Motivo:** fórmula fechada e idêntica à da spec.

## R6 — Ordem determinística

- **Decisão:** robôs e obstáculos sempre iterados na ordem dos arrays do mundo normalizado; nenhum `Map`/`Set` usado como fonte de ordem; comandos recebidos como objeto são consultados por `id`, nunca iterados para decidir a ordem.
- **Motivo:** FR-023 e determinismo.

## R7 — Histórico opcional

- **Decisão:** a fachada guarda o histórico apenas quando `{ history: true }`. A lista contém os
  estados do tick 0 ao atual. O reset inicia uma nova lista com apenas o estado do tick 0 quando
  o histórico está habilitado. Com histórico desabilitado, a consulta retorna uma lista vazia.
- **Motivo:** economia de memória em execuções longas sem histórico; replay na Spec 003 liga o histórico.

## R8 — Execução sem interface em duas portas (proposta padrão da Q-001)

- **Decisão:** biblioteca (`runHeadless`, `loadWorld`, `createSimulation`) e comando de terminal (`npm run sim -- ...`, executado com `tsx`), que imprime o resultado em JSON.
- **Alternativas:** só biblioteca; só comando.
- **Motivo:** cobre as duas formas mais prováveis de a suíte oculta chamar o código. Se o professor responder a Q-001 de outra forma, ajusta-se só a camada de entrada.

## R9 — CLI testável

- **Decisão:** `runCli(argv, io)` recebe os argumentos e um objeto de E/S (`readFile`, `stdout`, `stderr`) e devolve o código de saída; `src/cli/index.ts` só conecta ao processo real.
- **Motivo:** testar o comando sem criar processos.

## R10 — Relatório de cobertura e linha do README (proposta padrão da Q-005)

- **Decisão:** a cobertura bruta fica em `coverage/`, ignorada pelo Git. `scripts/update-stats.ts`
  gera `docs/cobertura/resumo.md`, grava uma cópia versionada do `coverage-summary.json` com caminhos
  relativos à raiz do projeto e atualiza a linha do README. O relatório HTML é artefato do CI
  e será publicado no GitHub Pages na Spec 003.
- **Alternativas:** versionar o HTML completo; atualizar o README à mão.
- **Motivo:** o relatório comprovável fica no repositório sem milhares de arquivos HTML mudando a cada commit; o número do README nunca é digitado à mão (Princípio V).

## R11 — Fronteiras por lint

- **Decisão:** em `src/core/**`, ESLint com `no-restricted-imports` (proíbe `react`, `react-dom`, `three`, qualquer `node:*`, `fs`, `path` e caminhos para `ui/` e `cli/`), `no-restricted-globals` (`window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `performance`, `setTimeout`, `setInterval`, `Date`, `fetch`, `process`) e `no-restricted-properties` (`Math.random`).
- **Motivo:** Princípios II e IV verificados automaticamente.

## R12 — Validação de commits

- **Decisão:** commitlint com cabeçalho `^(feat|fix|test|refactor|docs|chore|ci)\((S[1-3]-T\d{3}|S[1-3]-(spec|plan|tasks)|constitution|agents|briefing|specs|setup)\): .+$` e regra local que exige a linha `Requisitos:` quando o escopo é uma task. Commits de merge são ignorados.
- **Motivo:** Princípio VI verificado automaticamente.

## R13 — Semente

- **Decisão:** nesta spec, a semente é apenas validada e guardada no mundo. O gerador pseudoaleatório é definido na Spec 002.
- **Motivo:** nenhum requisito da Spec 001 usa aleatoriedade (Princípio VII).

## R14 — Testes de desempenho fora da suíte

- **Decisão:** SC-003 é medido por `npm run bench` (script fora da suíte de testes) e o resultado é registrado no fechamento da spec.
- **Motivo:** testes que dependem de tempo real são proibidos pela constitution (Princípio V).

### Contato de perfis · ADR-026

Escolhemos guardar o ID no mundo e resolver o raio antes da validação geométrica. Guardar bônus por quadro duplicaria dados e poderia divergir da leitura dos sensores. Usar as poses candidatas livres para decidir avanço permite manter a correção sequencial dos pares da ADR-007.
