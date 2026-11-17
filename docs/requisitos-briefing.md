# Requisitos extraídos do briefing — SheepBotz Arena

> **Etapa 0 do fluxo SDD** (AGENTS.md §4). Este documento quebra o enunciado em requisitos rastreáveis (`RB-##`) antes de qualquer spec.
> **Fonte:** `docs/enunciado.md` (texto integral do enunciado, sem edição).
> **Versão:** 1.0 · **Data:** 2026-11-11 · **Modalidade:** Sumô (ADR-003)

## Legenda

**Tipo**
- **Regra:** regra do trabalho (processo, entrega, avaliação).
- **Restrição:** restrição técnica imposta pela trilha.
- **Mínimo / Completo / Bônus:** nível de escopo da trilha.
- **Aceitação:** o que os testes de aceitação do professor verificam.

**Destino**
- **Constitution:** vira princípio ou restrição na constitution.
- **S1 / S2 / S3:** vira requisito funcional na Spec 001, 002 ou 003.
- **Processo:** cumprido pelo fluxo de trabalho (AGENTS.md, CI, README).
- **Backlog:** fora do escopo atual (`docs/backlog.md`).

---

## 1. Regras do trabalho

| ID | Requisito | Tipo | Destino | Observações |
|---|---|---|---|---|
| RB-01 | O trabalho é feito em grupo, e cada grupo escolhe uma trilha | Regra | Processo | Trilha 4 escolhida (ADR-001) |
| RB-02 | O assistente de IA é livre | Regra | Processo | z.ai, app de desktop (ADR-004) |
| RB-03 | O framework de SDD é GitHub SpecKit ou OpenSpec | Regra | Processo | SpecKit (ADR-002) |
| RB-04 | O ciclo greenfield é obrigatório: constitution, spec, plan, tasks e implementação da PoC | Regra | Processo | AGENTS.md §4 |
| RB-05 | Antes da spec, os requisitos devem ser extraídos do briefing; perguntas e decisões ficam registradas | Regra | Processo | Este documento, `perguntas.md` e `decisoes.md` |
| RB-06 | A especificação é o artefato principal e precisa ser capaz de recriar o sistema | Regra | Constitution | Base do ensaio de regeneração (AGENTS.md §18) |
| RB-07 | O projeto é uma PoC de escopo reduzido; melhor pequeno, bem especificado e funcionando | Regra | Constitution | AGENTS.md §17 |
| RB-08 | Cobertura mínima de 80%, comprovada por relatório de cobertura no repositório | Regra | Constitution | Ver Q-005 |
| RB-09 | O README exibe no início a quantidade de testes e o percentual de cobertura, atualizados a cada entrega | Regra | Processo | Automatizado no CI |
| RB-10 | A stack é livre, salvo restrição da trilha, e toda escolha fica registrada na constitution | Regra | Constitution | Stack `[A DEFINIR]` |
| RB-11 | Um repositório GitHub (o enunciado cita "por dupla") | Regra | Processo | Ambiguidade dupla × grupo: Q-004 |
| RB-12 | Cada commit aponta para a task que implementa, e cada task para o requisito que atende | Regra | Constitution | AGENTS.md §7 |
| RB-13 | Escopo mínimo é base para aprovação; completo é exigido para nota máxima; bônus vale pontos extras | Regra | Processo | AGENTS.md §17 |
| RB-14 | Ciclo BMAD é opcional e vale bônus | Regra | Backlog | Depende de aula sobre BMAD |
| RB-15 | O repositório contém constitution, specs, plans, tasks e README explicando como rodar | Regra | Processo | AGENTS.md §19 |
| RB-16 | Testes automatizados dos critérios de aceite da própria equipe | Regra | Constitution | AGENTS.md §13 |
| RB-17 | Pitch com demo ao vivo de até 10 minutos, sem código nos slides | Regra | Processo | Roteiro da demo após a Spec 003 |
| RB-18 | O ecossistema meuPiá só pode ser usado pelas interfaces públicas, sem modificar seu código | Restrição | Backlog | Só relevante para o bônus RB-41 |

## 2. Visão e restrições da trilha

| ID | Requisito | Tipo | Destino | Observações |
|---|---|---|---|---|
| RB-20 | Simulador genérico de robôs móveis no navegador, para a equipe Univille SheepBotz | Regra | Constitution | Público: membros da equipe |
| RB-21 | Lógica em 2D com visualização 3D (Three.js ou WebGL), no espírito do Stage com aparência de um Gazebo leve | Restrição | Constitution / S3 | |
| RB-22 | O usuário descreve o mundo num arquivo | Mínimo | S1 / S3 | S1 define o formato; S3 carrega pela interface |
| RB-23 | O usuário escreve o controlador do robô | Mínimo | S2 / S3 | S2 define a API; S3 carrega pela interface |
| RB-24 | O usuário acompanha a simulação com play, pause, step e reset | Mínimo | S3 | |
| RB-25 | A modalidade escolhida entra na constitution e define as condições de vitória e os mundos de exemplo | Regra | Constitution / S2 | Sumô (ADR-003) |
| RB-26 | O núcleo do simulador continua independente da modalidade | Restrição | Constitution | AGENTS.md R10 |
| RB-27 | O núcleo de simulação é headless e determinístico (seed e passo de tempo fixos) e roda sem interface gráfica | Restrição | Constitution / S1 | AGENTS.md R1 |
| RB-28 | O renderizador apenas desenha o estado | Restrição | Constitution / S3 | AGENTS.md R2 |
| RB-29 | Sem motor de física pronto: cinemática e colisões implementadas pela equipe | Restrição | Constitution / S1 | AGENTS.md R3 |

## 3. Escopo mínimo

| ID | Requisito | Tipo | Destino | Observações |
|---|---|---|---|---|
| RB-30 | Mundo descrito em YAML ou JSON: mapa, obstáculos, robôs e sensores | Mínimo | S1 | Formato: Q-009 |
| RB-31 | Robô de tração diferencial (velocidade linear e angular) com colisão simples | Mínimo | S1 | Convenções C1–C10 |
| RB-32 | Sensor laser ou sonar: raycast com N raios e alcance máximo | Mínimo | S2 | Laser ou sonar: Q-008 |
| RB-33 | Sensor de odometria | Mínimo | S1 | Convenção C12 |
| RB-34 | Sensor bumper | Mínimo | S1 | Convenção C11 |
| RB-35 | Controlador em JS contra uma API limitada (ex.: `readLaser()` e `setSpeed(v, w)`), executado a cada tick | Mínimo | S2 | Convenções C6, C8, C15 |
| RB-36 | Visualização 3D com câmera orbital | Mínimo | S3 | |
| RB-37 | Raios dos sensores visíveis na visualização | Mínimo | S3 | |

## 4. Escopo completo

| ID | Requisito | Tipo | Destino | Observações |
|---|---|---|---|---|
| RB-38 | Vários robôs na mesma arena | Completo | S1 | **Essencial para o sumô** (ADR-003) |
| RB-39 | Painel de inspeção com as leituras dos sensores | Completo | S3 | |
| RB-40 | Gravação e replay de simulações | Completo | S3 | Convenção C19 |

## 5. Bônus

| ID | Requisito | Tipo | Destino | Observações |
|---|---|---|---|---|
| RB-41 | Controladores escritos em Portugol, usando o meuPiá Maker | Bônus | Backlog | Respeitar RB-18 |
| RB-42 | Controlador remoto via WebSocket, no estilo Player/ROS | Bônus | Backlog | |

## 6. O que os testes de aceitação do professor verificam

| ID | Requisito | Tipo | Destino | Observações |
|---|---|---|---|---|
| RB-43 | O núcleo é executado sem interface nos testes | Aceitação | S1 / S2 | Como a suíte chama o código: Q-001 |
| RB-44 | Posição final do robô após N ticks, com tolerância | Aceitação | S1 | Tolerância: Q-002 |
| RB-45 | Leituras do laser em mundos simples | Aceitação | S2 | |
| RB-46 | Erros claros para arquivos de mundo inválidos | Aceitação | S1 | Convenção C16 |

---

## 7. Implicações da modalidade Sumô (origem: ADR-003)

Estes itens **não estão no briefing**: nascem da decisão de modalidade. Nas specs, os FRs correspondentes têm origem `ADR-003`.

| Item | O que precisa ser especificado | Destino | Convenção |
|---|---|---|---|
| Arena | Arena circular, raio, posições e orientações iniciais dos dois robôs | S1 (mundo) / S2 (regras) | C20 |
| Contato entre robôs | Regra do empurrão: como dois robôs em contato se movem | S1 | C21 |
| Fim da luta | Saída da arena, vencedor, empate por tempo limite, saída simultânea | S2 | C22 |
| Detecção do oponente | O laser precisa detectar outros robôs, não só obstáculos | S2 | C13, C14 |
| Detecção da borda | Sensor de borda opcional ou uso da odometria | S2 | C23 / Q-007 |
| Mundos de exemplo | Arena padrão de duelo e controladores de exemplo (ex.: "agressivo" e "defensivo") | S2 / S3 | — |

**Observação de escopo:** como o sumô exige dois robôs, o item RB-38 (escopo completo) passa a ser necessário já na Spec 001. A regra do empurrão é genérica (contato entre quaisquer robôs), o que mantém o núcleo independente da modalidade (RB-26).

---

## 8. Lacunas do briefing

O briefing é propositalmente incompleto. As lacunas técnicas estão listadas como convenções obrigatórias em **AGENTS.md §10 (C1–C23)** e serão fechadas nas specs. As lacunas que dependem do professor ou do time estão em **`docs/perguntas.md`** (Q-001 a Q-009).

---

## 9. Distribuição por spec

| Destino | Requisitos |
|---|---|
| Constitution | RB-06, RB-07, RB-08, RB-10, RB-12, RB-16, RB-20, RB-21, RB-25, RB-26, RB-27, RB-28, RB-29 |
| **S1** — Mundo e núcleo de simulação | RB-22, RB-27, RB-29, RB-30, RB-31, RB-33, RB-34, RB-38, RB-43, RB-44, RB-46 + arena e contato (ADR-003) |
| **S2** — Sensores e controlador | RB-23, RB-25, RB-32, RB-35, RB-43, RB-45 + fim da luta e detecção (ADR-003) |
| **S3** — Visualização e operação | RB-21, RB-22, RB-23, RB-24, RB-28, RB-36, RB-37, RB-39, RB-40 |
| Processo | RB-01 a RB-05, RB-09, RB-11, RB-13, RB-15, RB-17 |
| Backlog | RB-14, RB-18, RB-41, RB-42 |
