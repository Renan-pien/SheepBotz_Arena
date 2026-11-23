# Checklist de qualidade dos requisitos da Spec 002

**Objetivo** Validar as cinco decisões da clarificação contra os requisitos e os critérios de aceite, com atenção aos contratos de estado, histórico, eventos e erros.

**Criado em** 2026-11-17

**Escopo** Revisão documental de QA antes de `$speckit-plan`. [Spec 002](../spec.md) · [Decisões](../../../docs/decisoes.md) · [Perguntas](../../../docs/perguntas.md)

**Responsabilidade pela revisão** A pessoa revisora marca `[x]` quando considera o requisito satisfeito. A avaliação desta rodada está registrada na tabela abaixo.

## Consistência com as decisões aprovadas

- [ ] CHK001 A spec distingue a leitura do laser entregue ao controlador da leitura que acompanha a pose publicada, com critérios para o tick 0, o reset e o tick final? [Consistência, Spec §3 US1 e US3, §4.1 FR-007 e FR-008, §4.3 FR-016, ADR-009]
- [ ] CHK002 A spec distingue carregamento, primeiro passo e reset, com critérios que identificam quando a API está disponível e como a falha anterior ao tick 0 é devolvida? [Clareza, Spec §3 US2 e US4, §4.2 FR-012 a FR-015, §4.3 FR-024, ADR-010]
- [ ] CHK003 A spec define a resposta para duas falhas de carregamento no mesmo mundo válido, incluindo quantos erros são devolvidos, o caminho de cada erro e a ausência do estado inicial? [Cobertura de exceção, Spec §3 US4, §4.2 FR-012, §6 SC-004, Anexo E, ADR-012]
- [ ] CHK004 Os requisitos e critérios do histórico definem o intervalo de ticks, a entrada final única e o efeito de avanços adicionais e do reset? [Consistência, Spec §3 US3, §4.5 FR-032, §5, S1-FR-038, ADR-011]
- [ ] CHK005 A spec distingue a associação do evento `fim_da_luta` do campo `resultado.vencedor` e cobre vitória e empate? [Consistência, Spec §3 US3, §4.5 FR-031, §5, ADR-013]

## Cobertura de cenários e casos de borda

- [ ] CHK006 Os critérios de aceite da entrada sem interface especificam código e caminho para um ID inexistente e para a combinação de comando com controlador? A spec define a lista de erros quando esses problemas coexistem com uma falha de carregamento? [Lacuna, Spec §3 US4, §4.2 FR-011 e FR-012, Anexo E, S1-FR-035]
- [ ] CHK007 Os critérios de sumô cobrem o centro sobre o limite da arena e a saída coincidente com `match.maxTicks`? [Cobertura de borda, Spec §3 US3, §4.5 FR-029 e FR-030]
- [ ] CHK008 O glossário e os critérios de aceite distinguem comando zerado de deslocamento por empurrão em um robô desativado? [Clareza, Spec §2, §3 US4, §4.4 FR-026 e FR-027]
- [ ] CHK009 Os critérios de aceite distinguem o fim da janela solicitada da finalização de uma luta no mundo de exemplo em modo livre? [Consistência, Spec §3 US3 e US5, §4.5 FR-028 e FR-033, Anexo C]

## Mensurabilidade e rastreabilidade

- [ ] CHK010 O critério de desempenho identifica o cenário que chega aos 3 000 ticks e um ambiente e procedimento de referência para a meta de menos de 2 s? [Mensurabilidade, Spec §6 SC-003]
- [ ] CHK011 A spec distingue a tolerância para distâncias e ângulos da igualdade exigida para históricos de execuções idênticas com o mesmo mundo, controladores e semente? [Mensurabilidade, Spec §3, §4.3 FR-021, §6 SC-001 e SC-002, S1-FR-036 e S1-FR-040]
- [ ] CHK012 Cada requisito funcional cita sua origem por `RB-##` ou `ADR-###`, com correspondência no Anexo F? [Rastreabilidade, Spec §4 e Anexo F, Constituição VI]

## Dependências e contratos

- [ ] CHK013 As decisões sobre estado, falhas, resultado e eventos são compatíveis com os consumidores previstos na S3, incluindo filtro por robô e replay? [Consistência, Spec §4.1 FR-008, §4.2 FR-012, §4.5 FR-031 e FR-032, S3-FR-024 e S3-FR-026 a S3-FR-031]
- [ ] CHK014 A forma como a suíte de aceitação externa chama o núcleo está confirmada ou documentada como premissa dos contratos? [Dependência, Spec §1 e §4.2 FR-011, RB-43 e Q-001]

## Avaliação documental

A revisão inicial de 36 requisitos e 44 cenários de aceite encontrou 7 verificações conformes, 6 pendências documentais e 1 dependência externa. Após a aprovação da Q-015, a revalidação de 36 requisitos e 48 cenários encontrou 13 verificações conformes e 1 dependência externa documentada como premissa. As cinco decisões da clarificação e o ADR-014 estão cobertos pelos requisitos e critérios de aceite.

| Item | Avaliação | Evidência ou encaminhamento |
|---|---|---|
| CHK001 | Conforme | S2-FR-007, FR-008 e FR-016. US1 cenários 10–11 distinguem 2,000 m no início do passo de 1,900 m na pose publicada e conferem o reset. US3 cenário 5 espera 0,550 m no estado final. |
| CHK002 | Conforme | S2-FR-012 a FR-015 e FR-024. US2 cenário 12 distingue o carregamento do primeiro passo e cobre o reset. US4 cenários 1–2 e 8–9 separam erro de sintaxe, ausência de `loop()`, exceção no nível superior e indisponibilidade da API nessa fase. |
| CHK003 | Conforme | S2-FR-012, SC-004 e Anexo E. US4 cenário 10 exige dois `CONTROLADOR_INVALIDO` em `controllers.vermelho` e `controllers.azul`, na mesma resposta e antes da publicação do tick 0. Os demais erros de entrada estão avaliados no CHK006. |
| CHK004 | Conforme | S2-FR-032 e US3 cenários 6 e 8. Pedir 110 ticks numa luta encerrada no tick 100 devolve 101 estados. Pedir mais ticks depois do fim mantém o mesmo histórico. O reset e a consulta com histórico desabilitado são definidos em S1-FR-038. |
| CHK005 | Conforme | S2-FR-031, glossário e entidades. US3 cenários 1 e 3 fixam o evento único no tick final sem robô associado, com `resultado.vencedor` igual a `"vermelho"` na vitória e a `null` no empate. |
| CHK006 | Conforme | FR-011, FR-012 e Anexo E aplicam a Q-015 (ADR-014). US4 cenários 7, 11 e 12 fixam os caminhos e cobrem a devolução conjunta de `ROBO_INEXISTENTE`, `ENTRADA_CONFLITANTE` e `CONTROLADOR_INVALIDO` antes do tick 0. |
| CHK007 | Conforme | US3 cenários 9 e 10 cobrem os dois limites. No tick 1, o centro permanece dentro ao alcançar 0,5 m. No tick 2, sua saída prevalece sobre o tempo esgotado. |
| CHK008 | Conforme | O glossário e FR-026 e FR-027 distinguem comando `(0, 0)` de deslocamento por contato. US4 cenário 6 fixa posições, tick de desativação, saída por empurrão e resultado. |
| CHK009 | Conforme | FR-028 restringe as condições de encerramento ao modo `sumo`. FR-033 e US5 cenário 3 fixam `em_andamento` e `resultado = null` no tick 2 000 de "Sala com obstáculos", em modo `free`. |
| CHK010 | Conforme | SC-003 fixa os controladores "Parado" e "Girador" no "Duelo padrão", o resultado no tick 3 000, o ambiente de referência e a janela de medição para a meta de menos de 2 s. A medição da S2 pertence à implementação. |
| CHK011 | Conforme | A abertura da seção 3 e SC-001 remetem a S1-FR-040. SC-002 exige estados e eventos idênticos e S1-FR-036 explicita as entradas que devem ser repetidas. FR-021 deixa o algoritmo pseudoaleatório para o plano. |
| CHK012 | Conforme | Os 36 requisitos têm origem `RB-##` ou `ADR-###` no próprio enunciado, com correspondência no Anexo F. |
| CHK013 | Conforme | S3-FR-024 usa a validação de controlador, FR-026 consome as leituras publicadas, FR-027 e FR-028 distinguem eventos e resultado, e FR-030 e FR-031 gravam e reproduzem os estados. A representação serializada do evento sem robô associado fica para o contrato. |
| CHK014 | Premissa documentada | A seção 7 adota a API de biblioteca e o comando sem interface da Spec 001 como premissa dos contratos. A confirmação do professor segue aberta na Q-001. |

## Notas

- Os marcadores pertencem à pessoa revisora. `[x]` representa a qualidade aprovada do requisito.
- `$speckit-implement` consulta os marcadores como parte do portão e preserva o estado registrado pela pessoa revisora.
- A checagem de pré-requisitos com `--template checklist-template` exige `plan.md`. Para respeitar a ordem do AGENTS.md §4, a revisão usou a identificação da feature em `--paths-only` e a resolução do template pelo próprio Spec Kit.

- [x] ADR-027 revisada quanto à origem, compatibilidade de mundos e critérios mensuráveis em S2-US5-AC6.
