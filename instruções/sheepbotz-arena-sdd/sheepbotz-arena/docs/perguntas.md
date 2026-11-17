# Perguntas em Aberto — SheepBotz Arena

> Formato definido em AGENTS.md §8.3. Toda pergunta tem uma **proposta padrão**, usada se não houver resposta até o prazo.

## Resumo

| ID | Pergunta | Para quem | Bloqueia | Status |
|---|---|---|---|---|
| Q-001 | Como a suíte oculta chama o código regenerado? | Professor | Contratos do plan (S1, S2) | Aberta |
| Q-002 | Qual tolerância numérica a suíte oculta usa? | Professor | Critérios de aceite (S1, S2) | Proposta padrão adotada nas specs (ADR-007) |
| Q-003 | Como é feita a regeneração do código? | Professor | Ensaio de regeneração | Aberta |
| Q-004 | O repositório é por dupla ou por grupo? | Professor | Setup do repositório | Aberta |
| Q-005 | Qual formato de relatório de cobertura é aceito? | Professor | CI e README | Aberta |
| Q-006 | A SheepBotz compete em sumô? Em qual categoria? | Time | Dimensões da arena (C20) | Proposta padrão adotada nas specs (ADR-007) |
| Q-007 | Haverá sensor de borda? | Time | Spec 002 (C23) | Proposta padrão adotada nas specs (ADR-007) |
| Q-008 | Laser ou sonar? | Time | Spec 002 (C13, C14) | Proposta padrão adotada nas specs (ADR-007) |
| Q-009 | Arquivo de mundo em YAML ou JSON? | Time | Spec 001 | Proposta padrão adotada nas specs (ADR-007) |

---

## Q-001 — Como a suíte oculta interage com o código regenerado?
- **Data:** 2026-11-11
- **Origem:** RB-43, RB-44, RB-45, RB-46
- **Para quem:** professor
- **Detalhe:** A suíte chama funções de uma biblioteca, executa um comando de terminal, ou lê arquivos de saída? Ela usa arquivos de mundo e controladores escritos por ela, no formato definido na nossa spec?
- **Impacto se não respondida:** Os contratos públicos do núcleo (AGENTS.md §11, item 8) podem não casar com a forma como a suíte chama o código.
- **Proposta padrão:** O núcleo expõe duas portas de entrada documentadas no plan: uma biblioteca (carregar mundo, avançar N ticks, ler estado) e um comando headless que recebe arquivo de mundo, controladores e número de ticks e imprime o estado final.
- **Resposta:** —
- **Virou:** —

## Q-002 — Qual tolerância numérica a suíte oculta usa?
- **Data:** 2026-11-11
- **Origem:** RB-44, RB-45
- **Para quem:** professor
- **Detalhe:** Funções trigonométricas podem variar na última casa decimal entre motores JavaScript.
- **Impacto se não respondida:** Critérios de aceite podem ser mais rígidos ou mais frouxos que a suíte.
- **Proposta padrão:** ±0.001 m para posições e leituras de distância; ±0.001 rad para ângulos.
- **Resposta:** —
- **Virou:** —

## Q-003 — Como é feita a regeneração do código?
- **Data:** 2026-11-11
- **Origem:** Rubrica, critério "Teste da Spec"
- **Para quem:** professor
- **Detalhe:** Qual agente ou modelo é usado? A regeneração usa só a spec, ou também plan e tasks?
- **Impacto se não respondida:** O ensaio de regeneração (AGENTS.md §18) pode não simular as condições reais.
- **Proposta padrão:** Assumir que constitution, spec, plan e tasks são usados, e que o agente é diferente do nosso.
- **Resposta:** —
- **Virou:** —

## Q-004 — O repositório é por dupla ou por grupo?
- **Data:** 2026-11-11
- **Origem:** RB-11
- **Para quem:** professor
- **Detalhe:** O enunciado fala em trabalho "estritamente em grupo" e em "um repositório GitHub por dupla".
- **Impacto se não respondida:** Organização do repositório e da autoria dos commits.
- **Proposta padrão:** Um único repositório para o grupo inteiro.
- **Resposta:** —
- **Virou:** —

## Q-005 — Qual formato de relatório de cobertura é aceito?
- **Data:** 2026-11-11
- **Origem:** RB-08
- **Para quem:** professor
- **Impacto se não respondida:** O relatório pode não ser reconhecido como comprovação.
- **Proposta padrão:** Resumo em Markdown versionado em `docs/cobertura/`, gerado pelo CI, mais o relatório HTML completo na mesma pasta.
- **Resposta:** —
- **Virou:** —

## Q-006 — A SheepBotz compete em sumô? Em qual categoria?
- **Data:** 2026-11-11
- **Origem:** ADR-003, convenção C20
- **Para quem:** time (confirmar com a equipe SheepBotz)
- **Detalhe:** Usar as dimensões reais da categoria em que a equipe compete deixa o simulador útil de verdade e fortalece o pitch.
- **Impacto se não respondida:** Dimensões da arena e dos robôs ficam arbitrárias.
- **Proposta padrão:** Usar como referência as medidas do mini-sumô (robô de 10 cm × 10 cm, arena de 77 cm de diâmetro), **a confirmar nas regras oficiais da competição** antes de entrar na spec.
- **Resposta:** —
- **Virou:** —

## Q-007 — Haverá sensor de borda?
- **Data:** 2026-11-11
- **Origem:** ADR-003, convenção C23
- **Para quem:** time
- **Detalhe:** Robôs de sumô reais usam um sensor de chão para detectar a borda da arena. Esse sensor não está no escopo mínimo do briefing.
- **Opções:** A) Não ter sensor de borda; o controlador usa odometria e o raio da arena. B) Ter um sensor de borda simples.
- **Impacto se não respondida:** API do controlador e estratégias de exemplo da Spec 002.
- **Proposta padrão:** A) Sem sensor de borda no escopo; o sensor fica em `docs/backlog.md`.
- **Resposta:** —
- **Virou:** —

## Q-008 — Laser ou sonar?
- **Data:** 2026-11-11
- **Origem:** RB-32
- **Para quem:** time
- **Opções:** A) Laser (raios finos, N raios). B) Sonar (cone, leitura mais grosseira).
- **Impacto se não respondida:** Spec 002 e visualização dos raios (S3).
- **Proposta padrão:** A) Laser: mais simples de especificar com exemplos numéricos e mais visível na demo.
- **Resposta:** —
- **Virou:** —

## Q-009 — Arquivo de mundo em YAML ou JSON?
- **Data:** 2026-11-11
- **Origem:** RB-30
- **Para quem:** time
- **Opções:** A) JSON. B) YAML.
- **Impacto se não respondida:** Spec 001 e todos os mundos de exemplo e de teste.
- **Proposta padrão:** A) JSON: sem ambiguidades de interpretação e sem dependência extra para leitura.
- **Resposta:** —
- **Virou:** —
