# Especificação da Feature: Sensores de Alcance, Controlador e Regras do Sumô

**Spec:** 002 · **Branch:** `002-sensores-controlador` · **Criada em:** 2026-11-11 · **Status:** Pronta para planejamento
**Depende de:** Spec 001 (mundo, tick, cinemática, colisões, bumper, odometria)
**Origem:** RB-23, RB-25, RB-32, RB-35, RB-43, RB-45 · ADR-003 · ADR-007

---

## 1. Contexto e objetivo

Com o núcleo da Spec 001, os robôs só se movem por comandos fixos. Esta spec dá **inteligência** a eles:

- o **laser**, que permite ao robô "enxergar" paredes, obstáculos e o oponente;
- o **controlador**, um pequeno programa em JavaScript escrito pelo usuário e executado a cada tick, que lê os sensores e decide as velocidades;
- as **regras do sumô**, que decidem quem vence, quem perde e quando há empate;
- os **mundos e controladores de exemplo**, que servem de ponto de partida para a equipe e para a demo.

O objetivo é que um membro da equipe escreva uma estratégia, coloque-a para lutar contra outra e obtenha um resultado reproduzível, sem interface gráfica (a interface vem na Spec 003).

> Os exemplos de código dos anexos são **conteúdo do produto** (exemplos entregues ao usuário), escritos em JavaScript porque esta é a linguagem de controlador exigida pelo briefing (RB-35).

---

## 2. Glossário

| Termo | Definição |
|---|---|
| **Laser** | Sensor de alcance com N raios em leque, cada um medindo a distância até o primeiro objeto atingido. |
| **Raio k** | O k-ésimo raio do laser, de 0 a N−1. O raio 0 é o mais à direita do robô; o último, o mais à esquerda. |
| **Leitura** | Distância medida por um raio, em metros, de 0 até o alcance máximo. |
| **Controlador** | Texto em JavaScript, associado a um robô, que define a função `loop()` (obrigatória) e a função `setup()` (opcional). |
| **API do controlador** | Conjunto limitado de funções que o controlador pode usar (Anexo B). |
| **Robô desativado** | Robô cujo controlador falhou; fica parado até o fim da simulação. |
| **Evento** | Registro de algo que aconteceu na simulação (mensagem de log, erro de controlador, fim da luta), com tick e robô. |
| **Luta** | Simulação no modo `sumo`, com resultado de vitória, derrota ou empate. |

---

## 3. Cenários de usuário e testes

> Tolerância e **mundo-base de teste** como na Spec 001 (mapa 4 × 4 m, modo livre, robôs de raio 0.1 m, `maxLinearSpeed` 1.0, `maxAngularSpeed` 6.0, `dt` = 0.1 s), salvo indicação contrária. Ângulos escritos como frações de π usam o valor numérico de π.

### User Story 1 — Enxergar com o laser (Prioridade: P1)

Como membro da equipe, quero que o robô meça distâncias em várias direções, para que minhas estratégias possam encontrar o oponente e evitar obstáculos.

**Por que esta prioridade:** "leituras do laser em mundos simples" é item dos testes de aceitação (RB-45) e escopo mínimo (RB-32).

**Teste independente:** consultar as leituras no tick 0 de mundos simples.

**Cenários de aceitação:**

1. **Dado** o mundo-base de teste com um robô em (0.0, 0.0), θ = 0, e laser de 3 raios, campo de visão π/3 e alcance 3.0, **Quando** as leituras do tick 0 são consultadas, **Então** são [2.309401, 2.000000, 2.309401] (raios a −30°, 0° e +30°, atingindo as paredes).
2. **Dado** o mesmo robô com θ = π/2, **Quando** as leituras são consultadas, **Então** são [2.309401, 2.000000, 2.309401] (o leque gira junto com o robô).
3. **Dado** o cenário 1 com um obstáculo centrado em (1.0, 0.0), largura 0.2 e altura 0.4, **Quando** as leituras são consultadas, **Então** são [2.309401, 0.900000, 2.309401] (o raio central atinge o obstáculo; os laterais passam por fora dele).
4. **Dado** o cenário 1 com alcance 1.5, **Quando** as leituras são consultadas, **Então** são [1.5, 1.5, 1.5] (nada dentro do alcance).
5. **Dado** um robô `A` em (0.0, 0.0), θ = 0, com laser de 1 raio e alcance 1.0, e um robô `B` de raio 0.1 em (0.5, 0.0), **Quando** as leituras de `A` são consultadas, **Então** são [0.400000] (o laser enxerga outros robôs).
6. **Dado** o cenário 5 com `B` em (1.5, 0.0), **Quando** as leituras de `A` são consultadas, **Então** são [1.0] (oponente fora do alcance).
7. **Dado** `A` em (0.0, 0.0), θ = 0, com laser de 5 raios, campo de visão π/2 e alcance 1.0, e `B` de raio 0.1 em (0.5, 0.05), **Quando** as leituras de `A` são consultadas, **Então** são [1.0, 1.0, 0.413397, 1.0, 1.0].
8. **Dado** o "Duelo padrão" (Spec 001, Anexo A), **Quando** as leituras do tick 0 são consultadas, **Então** cada robô lê [0.8, 0.8, 0.35, 0.8, 0.8] (o raio central vê o oponente a 0.35 m).
9. **Dado** um robô sem laser configurado, **Quando** o controlador chama `readLaser()`, **Então** recebe uma lista vazia.

---

### User Story 2 — Escrever um controlador (Prioridade: P1)

Como membro da equipe, quero escrever em JavaScript a lógica do meu robô, usando funções simples para ler sensores e definir velocidades, para testar estratégias sem programar o simulador.

**Por que esta prioridade:** controlador contra API limitada executado a cada tick é escopo mínimo (RB-35).

**Teste independente:** execução sem interface com controladores curtos, conferindo poses finais.

**Cenários de aceitação** (mundo-base de teste):

1. **Dado** um robô em (0.0, 0.0), θ = 0, com controlador cujo `loop()` chama `setSpeed(1, 0)`, **Quando** se passam 10 ticks, **Então** o robô está em (1.000, 0.000).
2. **Dado** um controlador cujo `loop()` chama `setSpeed(1, 0)` apenas quando `getInfo().tick` é 0, **Quando** se passam 10 ticks, **Então** o robô está em (1.000, 0.000) (o comando permanece até ser substituído).
3. **Dado** um controlador cujo `loop()` chama `setSpeed(1, 0)` enquanto `getInfo().tick < 5` e `setSpeed(0, 0)` depois, **Quando** se passam 10 ticks, **Então** o robô está em (0.500, 0.000).
4. **Dado** um controlador que, no mesmo `loop()`, chama `setSpeed(1, 0)` e depois `setSpeed(0, 1)`, **Quando** se passa 1 tick, **Então** o comando efetivo é (0, 1) (vale a última chamada).
5. **Dado** um robô em (0.0, 0.0), θ = 0, com laser de 1 raio e alcance 2.0, um obstáculo centrado em (1.5, 0.0), largura 0.2 e altura 0.4, e um controlador que anda a (1, 0) enquanto a leitura for maior que 0.55 e para caso contrário, **Quando** se passam 20 ticks, **Então** o robô está em (0.900, 0.000), e o comando efetivo é (0, 0) a partir do tick 10.
6. **Dado** um mapa de 2 × 2 m, um robô em (0.75, 0.0), θ = 0, e um controlador que anda a (1, 0) até `readBumper()` ser verdadeiro pela primeira vez e, a partir daí, anda a (−1, 0) para sempre, **Quando** se passam 10 ticks, **Então** o robô está em (0.100, 0.000), a odometria em (0.150, 0.000) e o bumper está inativo.
7. **Dado** um controlador com `setup()` que guarda um contador iniciado em 0 e um `loop()` que o incrementa, **Quando** se passam 10 ticks, **Então** `setup()` foi executada 1 vez e `loop()` 10 vezes.
8. **Dado** uma simulação no tick 10, **Quando** ela é reiniciada e executada de novo, **Então** `setup()` é executada outra vez e o estado interno do controlador recomeça do zero.
9. **Dado** o "Duelo padrão", **Quando** o controlador de `vermelho` consulta `getInfo()` no primeiro `loop()`, **Então** recebe `id` = "vermelho", `tick` = 0, `time` = 0, `dt` = 0.02, `radius` = 0.05, `maxLinearSpeed` = 1.0, `maxAngularSpeed` = 6.0, `arenaRadius` = 0.385 e `laser` = { rays: 5, fov: 1.047198, maxRange: 0.8 }.
10. **Dado** dois robôs cujos controladores chamam `random()` 10 vezes cada, **Quando** a simulação é executada duas vezes com a mesma semente, **Então** cada robô recebe a mesma sequência nas duas execuções; **e Quando** a semente muda, **Então** as sequências mudam.
11. **Dado** um controlador que chama `log("olá", 42)` no tick 0, **Quando** se passa 1 tick, **Então** há um evento do tipo `log` com o `id` do robô, tick 1 e mensagem "olá 42".

---

### User Story 3 — Lutar sumô (Prioridade: P1)

Como membro da equipe, quero colocar duas estratégias para lutar e saber quem venceu, por quê e em que momento, para comparar estratégias de forma objetiva.

**Por que esta prioridade:** a modalidade define as condições de vitória (RB-25, ADR-003) e é o centro da demo.

**Teste independente:** lutas sem interface com controladores simples, conferindo resultado e tick final.

**Cenários de aceitação** ("Duelo padrão": arena de raio 0.385, robôs de raio 0.05, `dt` = 0.02, limite de 3 000 ticks):

1. **Dado** `vermelho` com o controlador "Avança" e `azul` com "Parado", **Quando** a luta é executada, **Então** ela termina no tick 34 com vitória de `vermelho`, motivo `saida_da_arena`; `vermelho` está em (0.290, 0.000) e `azul` em (0.390, 0.000).
2. **Dado** `vermelho` com "Caçador" e `azul` com "Parado", **Quando** a luta é executada, **Então** ela termina no tick 34 com vitória de `vermelho`, motivo `saida_da_arena`.
3. **Dado** os dois robôs com "Parado" e `match.maxTicks` = 100, **Quando** a luta é executada, **Então** ela termina no tick 100 em empate, motivo `tempo_esgotado`.
4. **Dado** `vermelho` em (−0.3, 0.0), θ = π, e `azul` em (0.3, 0.0), θ = 0, ambos com "Avança", **Quando** a luta é executada, **Então** os dois saem da arena no tick 5 e a luta termina em empate, motivo `ambos_sairam`.
5. **Dado** `vermelho` com um controlador que chama `setSpeed(-1, 0)` (marcha à ré) e `azul` com "Parado", **Quando** a luta é executada, **Então** ela termina no tick 10 com vitória de `azul`, motivo `saida_da_arena`.
6. **Dado** uma luta encerrada no tick 34, **Quando** se pede para avançar mais 10 ticks, **Então** o estado continua idêntico ao do tick 34 (tick, poses e resultado não mudam).
7. **Dado** um mundo em modo `free`, **Quando** se passam 5 000 ticks, **Então** o status continua `em_andamento` e não há resultado.

---

### User Story 4 — Erros no controlador não derrubam a simulação (Prioridade: P2)

Como membro da equipe, quero que um erro no meu código seja mostrado com clareza e não trave o simulador, para corrigir rápido e seguir testando.

**Por que esta prioridade:** controladores são escritos por usuários e vão falhar; o simulador precisa continuar previsível.

**Teste independente:** controladores com erros de sintaxe e de execução, conferindo erros e eventos.

**Cenários de aceitação:**

1. **Dado** um controlador com erro de sintaxe, **Quando** a simulação vai começar, **Então** ela não começa e há um erro `CONTROLADOR_INVALIDO` no caminho `controllers.<id do robô>`, com a mensagem original do erro.
2. **Dado** um controlador sem a função `loop`, **Quando** a simulação vai começar, **Então** há um erro `CONTROLADOR_INVALIDO` com mensagem informando que a função `loop` é obrigatória.
3. **Dado** um robô em (0.0, 0.0), θ = 0, cujo controlador chama `setSpeed(1, 0)` enquanto `getInfo().tick < 5` e lança um erro quando `getInfo().tick` é 5, **Quando** se passam 10 ticks, **Então** o robô está em (0.500, 0.000), está desativado, e há um evento `erro_controlador` no tick 6 com a mensagem do erro.
4. **Dado** um controlador que chama `setSpeed("rápido", 0)`, **Quando** o tick é executado, **Então** o robô é desativado com evento `erro_controlador` informando que `setSpeed` exige dois números finitos.
5. **Dado** um controlador cuja `setup()` lança um erro, **Quando** o tick 1 é executado, **Então** o robô é desativado nesse tick e `loop()` nunca é chamada.
6. **Dado** um robô desativado numa luta de sumô, **Quando** a luta continua, **Então** as regras valem normalmente (ele pode ser empurrado para fora e perder).
7. **Dado** controladores informados para um `id` inexistente, **Quando** a simulação vai começar, **Então** há um erro `ROBO_INEXISTENTE`.

---

### User Story 5 — Mundos e controladores de exemplo (Prioridade: P2)

Como membro da equipe, quero exemplos prontos de arena e de estratégias, para começar a testar em segundos e ter uma base para minhas próprias estratégias.

**Por que esta prioridade:** a modalidade define os mundos de exemplo (RB-25), e eles são a base da demo.

**Teste independente:** carregar cada exemplo e executá-lo sem erros.

**Cenários de aceitação:**

1. **Dado** os mundos de exemplo "Duelo padrão" (Spec 001, Anexo A) e "Sala com obstáculos" (Anexo C), **Quando** cada um é validado, **Então** ambos são válidos.
2. **Dado** os controladores de exemplo do Anexo D, **Quando** cada um é carregado, **Então** nenhum gera erro de carregamento.
3. **Dado** "Sala com obstáculos" com o controlador "Desviador", **Quando** se passam 2 000 ticks, **Então** a simulação termina sem nenhum evento `erro_controlador`.

---

### 3.6 Casos de borda

- Laser com 1 raio: o raio aponta para a frente (α = 0) e o campo de visão é ignorado.
- Campo de visão de 2π: o primeiro e o último raio apontam para trás (−π e +π) e coincidem.
- Origem do raio dentro de outro robô ou de um obstáculo (sobreposição remanescente): a leitura é 0.
- Raio paralelo a um lado de obstáculo e alinhado com ele: conta como atingido na distância em que toca o lado.
- Controlador que nunca chama `setSpeed`: robô parado.
- Controlador que modifica a lista devolvida por `readLaser()`: não afeta a simulação nem leituras futuras.
- Controlador que tenta acessar dados de outro robô: a API não oferece esse acesso (FR-024).
- Mais de 1 000 chamadas de `log` por um robô: as excedentes são ignoradas e um único evento `limite_de_logs` é registrado.
- Os dois robôs desativados numa luta: a luta segue até o tempo esgotar ou alguém sair da arena.
- Laços infinitos no controlador: fora do escopo (seção 8).

---

## 4. Requisitos funcionais

### 4.1 Laser

- **FR-001:** Cada robô PODE ter um laser, configurado no mundo por número de raios N, campo de visão `fov` e alcance máximo (Spec 001, Anexo B). *(RB-32)*
- **FR-002:** O ângulo do raio k em relação à frente do robô DEVE ser `α_k = −fov/2 + k · fov/(N−1)` para N > 1, e `α_0 = 0` para N = 1. A direção absoluta é `θ + α_k`. *(RB-32)*
- **FR-003:** Todos os raios DEVEM partir do centro do robô. *(RB-32)*
- **FR-004:** A leitura de um raio DEVE ser a menor distância `t ≥ 0`, ao longo do raio, até: as paredes do mapa, os obstáculos e o corpo (círculo) dos **outros** robôs. O próprio robô é ignorado. A borda da arena **não** é detectada. *(RB-32, ADR-003)*
- **FR-005:** Se nada for atingido até o alcance máximo, ou se a menor distância for maior que ele, a leitura DEVE ser igual ao alcance máximo. *(RB-32)*
- **FR-006:** Se a origem do raio estiver dentro de um obstáculo ou de outro robô, a leitura DEVE ser 0.
- **FR-007:** As leituras de todos os robôs DEVEM ser calculadas no passo 1 do tick (Spec 001, FR-017), a partir do estado do início do tick, antes da execução de qualquer controlador. *(RB-27)*
- **FR-008:** O estado de cada robô DEVE incluir as leituras do laser correspondentes àquele estado, na ordem do raio 0 ao raio N−1. *(RB-45)*

### 4.2 Controlador: contrato

- **FR-009:** Um controlador DEVE ser um texto em JavaScript que define a função `loop()` (obrigatória) e pode definir a função `setup()`. *(RB-35)*
- **FR-010:** Cada robô PODE ter no máximo um controlador. Robô sem controlador e sem comando constante permanece com comando (0, 0). *(RB-35)*
- **FR-011:** Na execução sem interface, para cada robô PODE ser informado um controlador **ou** um comando constante (Spec 001, FR-032), nunca os dois; informar os dois gera o erro `ENTRADA_CONFLITANTE`.
- **FR-012:** O controlador DEVE ser verificado antes do início da simulação; erro de sintaxe ou ausência de `loop` geram `CONTROLADOR_INVALIDO` no caminho `controllers.<id>`, com a mensagem original, e a simulação não começa.
- **FR-013:** `setup()` DEVE ser executada uma única vez, no tick 1, imediatamente antes da primeira execução de `loop()` daquele robô; as funções de leitura já funcionam dentro dela. *(RB-35)*
- **FR-014:** `loop()` DEVE ser executada uma vez por tick para cada robô ativo, no passo 2 do tick, na ordem dos robôs no arquivo. *(RB-35)*
- **FR-015:** Variáveis do controlador DEVEM persistir entre ticks; ao reiniciar a simulação, o controlador DEVE ser recarregado do zero e `setup()` executada novamente.

### 4.3 Controlador: API (detalhes no Anexo B)

- **FR-016:** `readLaser()` DEVE devolver uma **cópia** da lista de leituras do robô no tick atual; lista vazia se o robô não tiver laser. *(RB-32, RB-35)*
- **FR-017:** `readBumper()` DEVE devolver o bumper do robô (Spec 001, FR-030). *(RB-34)*
- **FR-018:** `readOdometry()` DEVE devolver `{ x, y, theta }` da odometria do robô (Spec 001, FR-031). *(RB-33)*
- **FR-019:** `setSpeed(v, w)` DEVE definir o comando do robô; exige dois números finitos (caso contrário, erro do controlador, FR-026). Se chamada várias vezes no mesmo tick, vale a última. Se não for chamada, o comando anterior permanece. A saturação da Spec 001 (FR-019 de lá) se aplica. *(RB-35)*
- **FR-020:** `getInfo()` DEVE devolver `{ id, tick, time, dt, radius, maxLinearSpeed, maxAngularSpeed, arenaRadius, laser }`, em que `tick` e `time` são os do estado observado (no primeiro `loop()`, tick 0 e tempo 0), `arenaRadius` é `null` quando o mundo não tem arena e `laser` é `{ rays, fov, maxRange }` ou `null`.
- **FR-021:** `random()` DEVE devolver um número em [0, 1). A sequência de cada robô DEVE depender apenas da semente do mundo e da posição do robô na lista; chamadas de um robô não afetam a sequência de outro. O algoritmo exato é fixado no plano. *(RB-27)*
- **FR-022:** `log(...valores)` DEVE registrar um evento do tipo `log` com o `id` do robô, o tick em execução e a mensagem formada pelos valores convertidos em texto e separados por um espaço. Máximo de 1 000 eventos de log por robô por simulação; os excedentes são ignorados e um único evento `limite_de_logs` é registrado.
- **FR-023:** O tick registrado em eventos DEVE ser o tick em execução (o estado resultante daquele passo); o primeiro tick é 1.
- **FR-024:** O controlador NÃO DEVE ter acesso a nenhuma informação do simulador além das funções do Anexo B (nem ao estado de outros robôs, nem ao mundo, nem ao relógio real). *(RB-35)*

### 4.4 Controlador: erros

- **FR-025:** Erros em `setup()` ou `loop()` NÃO DEVEM interromper a simulação. *(RB-35)*
- **FR-026:** Se `setup()` ou `loop()` lançar um erro, ou se `setSpeed` for chamada com argumentos inválidos: as chamadas de `setSpeed` daquela execução são descartadas; o robô fica **desativado** com comando (0, 0) a partir daquele mesmo tick e até o fim; `loop()` não é mais chamada; e um evento `erro_controlador` é registrado com o tick, o `id` e a mensagem do erro.
- **FR-027:** Um robô desativado continua sujeito a colisões, empurrões e às regras do sumô.

### 4.5 Regras do sumô

- **FR-028:** As regras desta seção DEVEM valer apenas quando `match.mode` = `"sumo"`. *(RB-25, ADR-003)*
- **FR-029:** Um robô está **fora da arena** quando a distância do seu centro à origem é **estritamente maior** que o raio da arena. *(ADR-003)*
- **FR-030:** No passo 9 do tick (Spec 001, FR-017), na seguinte ordem: *(ADR-003)*
  1. Se exatamente um robô estiver fora, a luta termina com vitória do outro, motivo `saida_da_arena`.
  2. Se os dois estiverem fora, a luta termina em empate, motivo `ambos_sairam`.
  3. Senão, se o tick atual for igual a `match.maxTicks`, a luta termina em empate, motivo `tempo_esgotado`.
- **FR-031:** O estado DEVE incluir `status` (`em_andamento` ou `finalizada`) e `resultado` (`null` enquanto em andamento; depois, `{ vencedor, motivo, tick }`, com `vencedor` igual ao `id` ou `null` em empate). Ao terminar, um evento `fim_da_luta` é registrado.
- **FR-032:** Depois de finalizada, pedir novos ticks NÃO DEVE alterar o estado (tick, poses, resultado e eventos permanecem iguais).
- **FR-033:** No modo `free`, o status DEVE permanecer `em_andamento` e o resultado `null`.

### 4.6 Estado e exemplos

- **FR-034:** O estado de cada robô DEVE acrescentar aos campos da Spec 001: leituras do laser e situação (`ativo` ou `desativado`). O estado da simulação DEVE acrescentar: status, resultado e a lista de eventos ocorridos até aquele tick, em ordem. *(RB-43, RB-45)*
- **FR-035:** O sistema DEVE oferecer os mundos de exemplo "Duelo padrão" (Spec 001, Anexo A) e "Sala com obstáculos" (Anexo C). *(RB-25)*
- **FR-036:** O sistema DEVE oferecer os controladores de exemplo do Anexo D, com exatamente o comportamento descrito. *(RB-25)*

---

## 5. Entidades principais

| Entidade | Atributos |
|---|---|
| **Configuração do laser** | número de raios, campo de visão, alcance máximo |
| **Leituras do laser** | lista de N distâncias, do raio 0 ao raio N−1 |
| **Controlador** | `id` do robô, texto do código |
| **Evento** | tipo (`log`, `erro_controlador`, `limite_de_logs`, `fim_da_luta`), tick, `id` do robô (quando houver), mensagem |
| **Resultado da luta** | vencedor (`id` ou nulo), motivo (`saida_da_arena`, `ambos_sairam`, `tempo_esgotado`), tick |
| **Estado do robô** (acréscimos) | leituras do laser, situação (ativo ou desativado) |
| **Estado da simulação** (acréscimos) | status, resultado, eventos |

---

## 6. Critérios de sucesso

- **SC-001:** 100% dos cenários de aceitação desta spec passam dentro da tolerância da Spec 001 (FR-040 de lá).
- **SC-002:** Duas execuções da mesma luta, com os mesmos controladores e a mesma semente, produzem estados e eventos idênticos em todos os ticks.
- **SC-003:** Uma luta completa de 3 000 ticks com dois controladores de exemplo termina sem interface em menos de 2 segundos num notebook comum.
- **SC-004:** Nenhum controlador com erro (sintaxe, exceção ou argumento inválido) interrompe a simulação ou o sistema.
- **SC-005:** Um membro da equipe consegue, partindo do "Caçador", escrever uma estratégia própria e colocá-la para lutar em menos de 15 minutos, consultando apenas o Anexo B.

---

## 7. Premissas e decisões

- Convenções C5, C6, C13, C14, C15, C22 e C23 do AGENTS.md §10 foram fixadas nesta spec (ADR-007, aceita).
- Laser em vez de sonar (proposta padrão de Q-008).
- Sem sensor de borda (proposta padrão de Q-007); o controlador pode usar a odometria e `arenaRadius`. O sensor de borda está no backlog (B-003).
- Controladores executam no mesmo processo do simulador; o isolamento do FR-024 é de **acesso a dados**, não de segurança contra código malicioso (a equipe executa o próprio código).

## 8. Fora do escopo

- Proteção contra laços infinitos ou controladores lentos (exigiria limite de tempo real, o que quebraria o determinismo).
- Sonar, câmera, sensor de cor ou de borda.
- Ruído nas leituras.
- Controladores em Portugol (B-001) e controle remoto via WebSocket (B-002).
- Contagem regressiva de início de luta, rounds múltiplos e placar entre lutas.
- Regras de sumô com mais de dois robôs.

---

## Anexo A — Exemplos de leitura do laser (resumo)

| Cenário | Leituras esperadas |
|---|---|
| 3 raios, π/3, alcance 3, mapa 4 × 4, robô na origem, θ = 0 | [2.309401, 2.000000, 2.309401] |
| Idem, com obstáculo (1.0, 0.0), 0.2 × 0.4 | [2.309401, 0.900000, 2.309401] |
| Idem, alcance 1.5, sem obstáculo | [1.5, 1.5, 1.5] |
| 1 raio, alcance 1, robô de raio 0.1 em (0.5, 0.0) | [0.400000] |
| 5 raios, π/2, alcance 1, robô de raio 0.1 em (0.5, 0.05) | [1.0, 1.0, 0.413397, 1.0, 1.0] |
| "Duelo padrão", tick 0 | [0.8, 0.8, 0.35, 0.8, 0.8] para cada robô |

## Anexo B — API do controlador

| Função | Devolve | Descrição |
|---|---|---|
| `readLaser()` | lista de números | Leituras do laser do raio 0 (direita) ao raio N−1 (esquerda); lista vazia sem laser |
| `readBumper()` | verdadeiro/falso | Se houve contato no tick anterior |
| `readOdometry()` | `{ x, y, theta }` | Pose estimada pela odometria |
| `setSpeed(v, w)` | nada | Define velocidade linear (m/s) e angular (rad/s); exige dois números finitos; saturada pelos limites do robô |
| `getInfo()` | `{ id, tick, time, dt, radius, maxLinearSpeed, maxAngularSpeed, arenaRadius, laser }` | Informações do próprio robô e do tempo |
| `random()` | número em [0, 1) | Número pseudoaleatório determinístico pela semente |
| `log(...valores)` | nada | Registra uma mensagem de log |

**Estrutura de um controlador:**

```js
function setup() {
  // opcional: executada uma vez, antes do primeiro loop
}

function loop() {
  // obrigatória: executada a cada tick
}
```

## Anexo C — Mundo "Sala com obstáculos"

```json
{
  "name": "Sala com obstáculos",
  "seed": 7,
  "dt": 0.05,
  "map": { "width": 4.0, "height": 4.0 },
  "match": { "mode": "free" },
  "obstacles": [
    { "id": "caixa-a", "x": 0.0, "y": 0.0, "width": 0.6, "height": 0.6 },
    { "id": "caixa-b", "x": 1.2, "y": -1.0, "width": 0.4, "height": 1.0 },
    { "id": "parede-c", "x": -1.0, "y": 1.2, "width": 1.2, "height": 0.2 }
  ],
  "robots": [
    {
      "id": "explorador",
      "x": -1.5, "y": -1.5, "theta": 0.7853981633974483,
      "radius": 0.1,
      "maxLinearSpeed": 1.0, "maxAngularSpeed": 4.0,
      "color": "#43A047",
      "laser": { "rays": 9, "fov": 3.141592653589793, "maxRange": 1.5 }
    }
  ]
}
```

## Anexo D — Controladores de exemplo

**Parado** — nunca se move.

```js
function loop() {}
```

**Avança** — anda sempre para a frente, em velocidade máxima de 1 m/s.

```js
function loop() {
  setSpeed(1, 0);
}
```

**Girador** — gira no lugar.

```js
function loop() {
  setSpeed(0, 3);
}
```

**Caçador** — gira até o raio central ver algo dentro do alcance e então avança.

```js
function loop() {
  const leituras = readLaser();
  const info = getInfo();
  if (leituras.length === 0) {
    setSpeed(0, 3);
    return;
  }
  const central = leituras[Math.floor(leituras.length / 2)];
  if (central < info.laser.maxRange) {
    setSpeed(1, 0);
  } else {
    setSpeed(0, 3);
  }
}
```

**Desviador** — anda e gira quando algo está perto à frente ou quando bate (feito para "Sala com obstáculos", 9 raios).

```js
function loop() {
  const l = readLaser();
  const frente = Math.min(l[3], l[4], l[5]);
  if (readBumper() || frente < 0.4) {
    setSpeed(0, 2);
  } else {
    setSpeed(0.5, 0);
  }
}
```

## Anexo E — Catálogo de erros (acréscimos à Spec 001)

| Código | Quando ocorre |
|---|---|
| `CONTROLADOR_INVALIDO` | Erro de sintaxe ou ausência de `loop` (caminho `controllers.<id>`) |
| `ENTRADA_CONFLITANTE` | Controlador e comando constante informados para o mesmo robô |

## Anexo F — Rastreabilidade

| Requisito do briefing | Requisitos desta spec |
|---|---|
| RB-23, RB-35 | FR-009 a FR-027 |
| RB-25, ADR-003 | FR-028 a FR-033, FR-035, FR-036 |
| RB-32 | FR-001 a FR-008 |
| RB-43 | FR-011, FR-034 |
| RB-45 | FR-004, FR-008, Anexo A |
