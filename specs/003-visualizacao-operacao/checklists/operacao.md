# Checklist de requisitos · Operação e replay

**Data** 2026-11-18 · **Spec** [Visualização 3D e operação](../spec.md)

Os marcadores pertencem à pessoa revisora. Uma marcação indica aprovação da qualidade do requisito.

## Cena e operação

- [ ] CHK001 Os eixos visíveis, a orientação da frente e os comprimentos de raio têm casos numéricos? [Mensurabilidade, §3 US1 e FR-005 a FR-007]
- [ ] CHK002 As opções de câmera e de exibição preservam o estado observado? [Consistência, §3 US1 e FR-001 a FR-011]
- [ ] CHK003 A habilitação dos controles cobre tick 0, pausa, execução e fim de luta? [Cobertura, §3 US2 e FR-012 a FR-018]
- [ ] CHK004 A spec define o comportamento sob atraso e ao ocultar a aba? [Limites, §3 US2 e FR-015, FR-018]

## Erros e observação

- [ ] CHK005 O efeito de uma carga inválida e de aplicar só um rascunho está explícito? [Recuperação, §3 US3 e FR-019 a FR-025]
- [ ] CHK006 A apresentação de sensores, eventos da partida, filtros e resultado usa o mesmo tick? [Consistência, §3 US4 e FR-002, FR-026 a FR-028]
- [ ] CHK007 Teclado, foco, contraste e quebra de layout têm critérios observáveis? [Acessibilidade, §3 US2/US6 e FR-017, FR-037 a FR-039]

## Gravação e aceite

- [ ] CHK008 Os limites, metadados e a sequência dos estados gravados são explícitos? [Completude, §3 US5 e FR-029 a FR-032]
- [ ] CHK009 O modo replay, seus limites e a recuperação de gravação inválida estão definidos? [Cobertura, §3 US5 e FR-031 a FR-035]
- [ ] CHK010 Desempenho, igualdade do replay e validação do pitch têm resultados mensuráveis? [Mensurabilidade, §6]

## Evidências para a revisão

| Itens | Evidência documental |
|---|---|
| CHK001–CHK004 | US1 usa o Duelo e o vetor de frente +y. US2 define as condições de avanço, atraso e aba em segundo plano. |
| CHK005–CHK007 | US3 preserva a sessão e rascunhos em erros. US4 deriva os dados de um snapshot. US2/US6 explicitam foco e layout. |
| CHK008–CHK010 | US5 fixa o intervalo inclusivo e a transição de volta ao vivo. SC-001 a SC-006 definem as medidas de conclusão. |

## Revisão dos cenários de sumô · 2026-11-23

- [x] CHK011 O FR-047 enumera o fundo inicial e os dois ambientes novos, distingue os motivos visuais e define o alcance da preferência por modalidade.
- [x] CHK012 S3-US1-AC11 e AC12 permitem conferir a mesma luta, no mesmo tick, com qualquer fundo, e a seleção após reinício ou troca de modo.

- [x] CHK013 FR-048, S3-US3-AC16/17 cobrem as duas ordens de reserva, cancelamento, aplicação, importação e leitura de modelos em replay.
