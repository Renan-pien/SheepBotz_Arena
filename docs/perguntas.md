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
| Q-007 | Haverá sensor de borda? | Time | Spec 002 (C23) | Resolvida (ADR-020) |
| Q-008 | Laser ou sonar? | Time | Spec 002 (C13, C14) | Proposta padrão adotada nas specs (ADR-007) |
| Q-009 | Arquivo de mundo em YAML ou JSON? | Time | Spec 001 | Proposta padrão adotada nas specs (ADR-007) |
| Q-010 | Quais leituras de laser devem aparecer no estado publicado ao fim de cada tick? | Time | Estado, inspeção e replay (S2, S3) | Resolvida (ADR-009) |
| Q-011 | Quando devem rodar as instruções fora de `setup()` e `loop()`? | Time | Carregamento, primeiro tick e tratamento de falhas (S2) | Resolvida (ADR-010) |
| Q-012 | Onde deve terminar o histórico quando a luta acaba antes do número de ticks solicitado? | Time | Histórico sem interface e replay (S2, S3) | Resolvida (ADR-011) |
| Q-013 | A execução sem interface deve reunir as falhas de carregamento dos controladores ou devolver só a primeira? | Time | Contrato de erros antes do tick 0 (S2) | Resolvida (ADR-012) |
| Q-014 | Quando há um vencedor, o evento de fim da luta deve ficar associado a ele? | Time | Eventos publicados e filtro por robô (S2, S3) | Resolvida (ADR-013) |
| Q-015 | Quais erros a execução sem interface devolve quando entradas incompatíveis coexistem com falhas de carregamento? | Time | Contrato de erros da S2 | Resolvida (ADR-014) |

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
- **Resposta:** Em 2026-11-21, Wesley aprovou a opção B com quatro lados para todas as estratégias de sumô.
- **Virou:** ADR-020, S2-FR-038 e S3-FR-042.

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

## Q-010 — Quais leituras de laser devem aparecer no estado publicado ao fim de cada tick?

- **Data** 2026-11-17.
- **Origem** S1-FR-017, S2-FR-007, S2-FR-008, S2-FR-013, S2-FR-016, S2-FR-020, S3-FR-002 e S3-FR-007.
- **Para quem** Time.
- **Regra já definida.** Na transição do tick `k` para `k + 1`, o controlador usa as leituras
  da pose e da geometria do tick `k`, antes dos comandos e do movimento. No primeiro passo,
  `setup()` e `loop()` observam o tick 0, conforme o momento especificado para cada chamada.
- **Ambiguidade.** S2-FR-007 fixa a leitura para o controlador no início do passo. S2-FR-008
  pede leituras correspondentes ao estado publicado, mas o vínculo entre as duas amostras fica
  implícito. A distinção afeta o estado inicial, o reset, o estado final da luta e o replay.
- **Caso que distingue as opções.** Em um mapa de 4 × 4 m, um robô na origem com um raio para
  frente e alcance de 3 m lê 2,0 m até a parede. Após avançar 0,1 m, a leitura da pose final é
  1,9 m. O controlador já usou 2,0 m para decidir o movimento desse passo.
- **Opções.** A) O estado publicado guarda as leituras calculadas com as poses nele registradas.
  Ao fim do primeiro passo do exemplo, publica 1,9 m. B) O estado publicado guarda as leituras
  usadas pelo controlador no passo que o produziu. No exemplo, publica 2,0 m e identifica a pose
  de origem da medição, que a visualização e o replay precisariam considerar.
- **Recomendação.** A. Cada estado leva medições compatíveis com as poses de todos os robôs,
  inclusive no tick 0, após o reset e no tick final. Isso permite que a Spec 003 desenhe os
  raios e reproduza gravações usando o próprio estado.
- **Resposta.** A, confirmada em 2026-11-17. O controlador usa a leitura do início do tick.
  O estado publicado guarda a leitura correspondente às poses nele registradas, inclusive no
  tick 0, após o reset e no fim da luta.
- **Virou** ADR-009 e alterações em S2-FR-007, S2-FR-008 e S2-FR-016.

## Q-011 — Quando devem rodar as instruções fora de `setup()` e `loop()`?

- **Data** 2026-11-17.
- **Origem** S2-FR-009, S2-FR-012, S2-FR-013, S2-FR-015, S2-FR-025 e S2-FR-026.
- **Para quem** Time.
- **Ambiguidade.** A spec separa a validação do controlador da execução de `setup()`. O momento
  das instruções fora dessas funções e o tratamento de suas falhas ainda precisam ser definidos.
- **Opções.** A) Executar essas instruções no carregamento, antes do tick 0, com a API do robô
  disponível apenas durante `setup()` e `loop()`. Uma falha no carregamento gera
  `CONTROLADOR_INVALIDO` e impede o início da simulação. B) Executar essas instruções no primeiro
  passo, antes de `setup()` e com a API do robô disponível. Uma falha nessa execução desativa o
  robô no tick 1. A verificação de sintaxe e da declaração de `loop()` continua antes da simulação.
- **Recomendação.** A. A inicialização das variáveis fica no carregamento, e comandos, leituras
  e eventos ficam associados a um passo identificável.
- **Resposta.** A, confirmada em 2026-11-17. As instruções de nível superior rodam no carregamento,
  antes do tick 0, sem a API do robô. Uma falha nessa fase gera `CONTROLADOR_INVALIDO` e impede
  o início da simulação.
- **Virou** ADR-010 e alterações em S2-FR-012, S2-FR-015, S2-FR-024 e S2-SC-004.

## Q-012 — Onde deve terminar o histórico quando a luta acaba antes do número de ticks solicitado?

- **Data** 2026-11-17.
- **Origem** S1-FR-033, S2-FR-030 a S2-FR-032 e S3-FR-031.
- **Para quem** Time.
- **Ambiguidade.** A S1 descreve o histórico até o número de ticks solicitado. A S2 fixa
  o estado no tick final da luta. A lista que a execução sem interface devolve quando o
  pedido ultrapassa esse limite ainda precisa ser definida.
- **Opções.** A) Guardar um estado por tick efetivamente executado, do tick 0 até o fim da
  luta. B) Completar a lista até o tamanho solicitado repetindo o estado final, com seu
  número de tick inalterado.
- **Recomendação.** A. Uma luta que termina no tick 100 devolve 101 estados, mesmo quando
  são solicitados 110 ticks. Cada entrada corresponde a um tick efetivamente executado,
  com uma única entrada para o tick final no replay.
- **Resposta.** A, confirmada em 2026-11-17. O histórico devolve um estado por tick executado,
  do tick 0 ao tick final, inclusive. Pedidos de avanço além do fim preservam o histórico.
- **Virou** ADR-011 e alteração em S2-FR-032.

## Q-013 — A execução sem interface deve reunir as falhas de carregamento dos controladores ou devolver só a primeira?

- **Data** 2026-11-17.
- **Origem** S1-FR-033, S1-FR-035 e S2-FR-012.
- **Para quem** Time.
- **Ambiguidade.** Com um mundo válido, cada falha de carregamento impede a publicação do
  tick 0. A spec ainda não diz quantas falhas a execução sem interface devolve na mesma chamada.
- **Caso que distingue as opções.** `vermelho` tem erro de sintaxe e `azul` define `loop()`
  mas lança uma exceção ao carregar. Ambos os IDs existem no mundo.
- **Opções.** A) Verificar todos os controladores dos robôs e devolver os dois erros
  `CONTROLADOR_INVALIDO`, cada um em `controllers.<id>`. B) Parar na primeira falha, seguindo
  a ordem dos robôs no arquivo, e devolver um erro naquela chamada.
- **Recomendação.** A. O chamador pode corrigir ambos os controladores em uma rodada e o
  resultado segue o padrão da Spec 001 de reunir falhas independentes.
- **Resposta.** A, confirmada em 2026-11-17. Com um mundo válido, a execução sem interface
  verifica todos os controladores fornecidos para os robôs do mundo e devolve, na mesma
  resposta, um `CONTROLADOR_INVALIDO` por falha, em `controllers.<id>`.
- **Virou** ADR-012 e alterações em S2-FR-012 e S2-SC-004.

## Q-014 — Quando há um vencedor, o evento de fim da luta deve ficar associado a ele?

- **Data** 2026-11-17.
- **Origem** S2-FR-031, entidade `Evento`, S3-FR-027 e S3-FR-030.
- **Para quem** Time.
- **Ambiguidade.** S2-FR-031 registra um evento `fim_da_luta`, e o modelo permite eventos
  sem robô associado. Falta definir a associação quando a luta tem um vencedor.
- **Caso que distingue as opções.** `vermelho` vence por saída de `azul`. O filtro de eventos
  por `vermelho` pode incluir o evento de fim da luta ou incluir apenas eventos do próprio robô.
- **Opções.** A) O evento de fim da luta é da partida em vitórias e empates, sem robô associado.
  O vencedor da luta fica em `resultado.vencedor`. B) O evento fica associado ao vencedor em
  vitórias e fica sem robô associado em empates.
- **Recomendação.** A. A mesma regra vale para todos os desfechos, e `resultado.vencedor`
  já identifica quem ganhou.
- **Resposta.** A, confirmada em 2026-11-17. `fim_da_luta` é um evento da partida, sem robô
  associado em vitórias ou empates. O vencedor fica em `resultado.vencedor`, que vale `null`
  em empates.
- **Virou** ADR-013 e alteração em S2-FR-031.

## Q-015 — Quais erros a execução sem interface devolve quando entradas incompatíveis coexistem com falhas de carregamento?

- **Data** 2026-11-17.
- **Origem** S2-FR-011, S2-FR-012, cenário 7 da US4 e CHK006 da [Spec 002](../specs/002-sensores-controlador/checklists/clarificacao.md).
- **Para quem** Time.
- **Impacto** Completar o contrato de erros para IDs inexistentes e entradas que trazem comando e controlador para o mesmo robô, inclusive quando outro controlador falha ao carregar.
- **Proposta padrão.** Usar `controllers.<id>` para associar ao controlador os erros `ROBO_INEXISTENTE` e `ENTRADA_CONFLITANTE`. Reunir os erros estruturais e as falhas dos controladores das entradas válidas, preservando a devolução conjunta aprovada na Q-013. O catálogo de erros e o cenário de aceite devem explicitar a regra escolhida.
- **Resposta.** Proposta aprovada em 2026-11-17. Os dois erros de entrada do controlador usam `controllers.<id>`. A mesma resposta reúne os erros de entrada e as falhas de carregamento dos controladores com ID existente e sem comando constante concorrente.
- **Virou** ADR-014 e alterações em S2-FR-011, S2-FR-012, US4 e Anexo E.
