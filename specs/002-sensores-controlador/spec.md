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

## Clarifications

### Session 2026-11-17

- Q: Qual leitura do laser deve aparecer no estado publicado ao fim de cada tick? → A: O controlador usa as leituras do início do tick. O estado publicado guarda as leituras calculadas com as poses nele registradas, inclusive no tick 0, após o reset e no fim da luta. (Q-010, ADR-009)
- Q: Quando devem rodar as instruções fora de `setup()` e `loop()`? → A: As instruções de nível superior rodam no carregamento, antes do tick 0, sem acesso à API do robô. Uma falha nessa fase gera `CONTROLADOR_INVALIDO` e impede o início da simulação. (Q-011, ADR-010)
- Q: Onde deve terminar o histórico quando a luta acaba antes do número de ticks solicitado? → A: O histórico contém um estado por tick executado, do tick 0 ao tick final, inclusive. Pedidos de avanço além do fim devolvem o estado final e deixam o histórico intacto. (Q-012, ADR-011)
- Q: A execução sem interface deve reunir as falhas de carregamento dos controladores ou devolver só a primeira? → A: Com um mundo válido, a execução verifica todos os controladores com entrada válida, conforme FR-011, e devolve na mesma chamada um `CONTROLADOR_INVALIDO` por falha, no caminho `controllers.<id>`. (Q-013, ADR-012)
- Q: Quando há um vencedor, o evento de fim da luta deve ficar associado a ele? → A: `fim_da_luta` é um evento da partida, sem robô associado em vitórias ou empates. `resultado.vencedor` identifica o vencedor e vale `null` em empates. (Q-014, ADR-013)

### Revisão do checklist · 2026-11-17

- Q: Quais erros a execução sem interface devolve quando entradas incompatíveis coexistem com falhas de carregamento? → A: `ROBO_INEXISTENTE` e `ENTRADA_CONFLITANTE` de controladores usam `controllers.<id>`. A mesma resposta reúne os erros de entrada e as falhas de carregamento dos controladores cujas entradas são válidas. (Q-015, ADR-014)

## 2. Glossário

| Termo | Definição |
|---|---|
| **Laser** | Sensor de alcance com N raios em leque, cada um medindo a distância até o primeiro objeto atingido. |
| **Raio k** | O k-ésimo raio do laser, de 0 a N−1. O raio 0 é o mais à direita do robô; o último, o mais à esquerda. |
| **Leitura** | Distância medida por um raio, em metros, de 0 até o alcance máximo. |
| **Controlador** | Texto em JavaScript, associado a um robô, que define a função `loop()` (obrigatória) e a função `setup()` (opcional). |
| **API do controlador** | Conjunto limitado de funções que o controlador pode usar (Anexo B). |
| **Robô desativado** | Robô cujo controlador falhou. Seu comando fica em `(0, 0)` até o fim da execução, e ele continua sujeito a colisões e empurrões. |
| **Evento** | Registro de algo que aconteceu na simulação, com tick e mensagem. Pode ser associado a um robô ou à partida. |
| **Luta** | Simulação no modo `sumo`, com resultado de vitória, derrota ou empate. |

---

## 3. Cenários de usuário e testes

> Tolerância e **mundo-base de teste** como na Spec 001 (mapa 4 × 4 m, modo livre, robôs de raio 0.1 m, `maxLinearSpeed` 1.0, `maxAngularSpeed` 6.0, `dt` = 0.1 s), salvo indicação contrária. Ângulos escritos como frações de π usam o valor numérico de π.

### User Story 1 — Enxergar com o laser (Prioridade: P1)

Como membro da equipe, quero que o robô meça distâncias em várias direções, para que minhas estratégias possam encontrar o oponente e evitar obstáculos.

**Por que esta prioridade:** "leituras do laser em mundos simples" é item dos testes de aceitação (RB-45) e escopo mínimo (RB-32).

**Teste independente:** consultar as leituras em mundos simples no tick 0, após um movimento e após o reset. Comparar a leitura usada pelo controlador com a leitura publicada.

**Cenários de aceitação:**

1. **Dado** o mundo-base de teste com um robô em (0.0, 0.0), θ = 0, e laser de 3 raios, campo de visão π/3 e alcance 3.0, **Quando** as leituras do tick 0 são consultadas, **Então** são [2.309401, 2.000000, 2.309401] (raios a −30°, 0° e +30°, atingindo as paredes).
2. **Dado** o robô do cenário 1 em um mapa de 4 × 2 m, com θ = π/2, **Quando** as leituras do tick 0 são consultadas, **Então** são [1.154701, 1.000000, 1.154701] m. Os três raios atingem a parede em y = 1 m.
3. **Dado** o cenário 1 com um obstáculo centrado em (1.0, 0.0), largura 0.2 e altura 0.4, **Quando** as leituras são consultadas, **Então** são [2.309401, 0.900000, 2.309401] (o raio central atinge o obstáculo; os laterais passam por fora dele).
4. **Dado** o cenário 1 com alcance 1.5, **Quando** as leituras são consultadas, **Então** são [1.5, 1.5, 1.5] (nada dentro do alcance).
5. **Dado** um robô `A` em (0.0, 0.0), θ = 0, com laser de 1 raio e alcance 1.0, e um robô `B` de raio 0.1 em (0.5, 0.0), **Quando** as leituras de `A` são consultadas, **Então** são [0.400000] (o laser enxerga outros robôs).
6. **Dado** o cenário 5 com `B` em (1.5, 0.0), **Quando** as leituras de `A` são consultadas, **Então** são [1.0] (oponente fora do alcance).
7. **Dado** `A` em (0.0, 0.0), θ = 0, com laser de 5 raios, campo de visão π/2 e alcance 1.0, e `B` de raio 0.1 em (0.5, 0.05), **Quando** as leituras de `A` são consultadas, **Então** são [1.0, 1.0, 0.413397, 1.0, 1.0].
8. **Dado** o "Duelo padrão" (Spec 001, Anexo A), **Quando** as leituras do tick 0 são consultadas, **Então** cada robô lê [0.8, 0.8, 0.35, 0.8, 0.8] (o raio central vê o oponente a 0.35 m).
9. **Dado** um robô sem laser configurado, **Quando** o controlador chama `readLaser()`, **Então** recebe uma lista vazia.
10. **Dado** o mundo-base com um robô na origem, θ = 0, laser de 1 raio com alcance de 3.0 m e um controlador que registra `readLaser()[0]` em `setup()` e `loop()` e chama `setSpeed(1, 0)` em `loop()`, **Quando** o primeiro tick é executado, **Então** ambas as chamadas leem 2.000 m e o estado publicado do tick 1 mostra x = 0.100 m e leitura de 1.900 m.
11. **Dado** o estado do tick 1 do cenário anterior, **Quando** a simulação é reiniciada, **Então** o estado publicado do tick 0 mostra x = 0.000 m e leitura de 2.000 m, disponíveis antes do próximo passo.

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
12. **Dado** um controlador que inicializa `contador` em 0 e o incrementa no nível superior, registra o valor em `setup()` e a cada `loop()` incrementa e registra o contador, **Quando** se executam dois ticks, **Então** os logs têm mensagens "1" e "2" no tick 1 e "3" no tick 2. Após o reset, o primeiro tick volta a registrar "1" e "2".

---

### User Story 3 — Lutar sumô (Prioridade: P1)

Como membro da equipe, quero colocar duas estratégias para lutar e saber quem venceu, por quê e em que momento, para comparar estratégias de forma objetiva.

**Por que esta prioridade:** a modalidade define as condições de vitória (RB-25, ADR-003) e é o centro da demo.

**Teste independente:** lutas sem interface com controladores simples, conferindo resultado e tick final.

**Cenários de aceitação** ("Duelo padrão": arena de raio 0.385, robôs de raio 0.05, `dt` = 0.02, limite de 3 000 ticks):

1. **Dado** `vermelho` com o controlador "Avança" e `azul` com "Parado", **Quando** a luta é executada, **Então** ela termina no tick 34 com `resultado.vencedor = "vermelho"` e motivo `saida_da_arena`. `vermelho` está em (0.290, 0.000) e `azul` em (0.390, 0.000). O estado final contém um único evento `fim_da_luta`, no tick 34 e sem robô associado.
2. **Dado** `vermelho` com "Caçador" e `azul` com "Parado", **Quando** a luta é executada, **Então** ela termina no tick 34 com vitória de `vermelho`, motivo `saida_da_arena`.
3. **Dado** os dois robôs com "Parado" e `match.maxTicks` = 100, **Quando** a luta é executada, **Então** ela termina no tick 100 com `resultado.vencedor = null` e motivo `tempo_esgotado`. O estado final contém um único evento `fim_da_luta`, no tick 100 e sem robô associado.
4. **Dado** `vermelho` em (−0.3, 0.0), θ = π, e `azul` em (0.3, 0.0), θ = 0, ambos com "Avança", **Quando** a luta é executada, **Então** os dois saem da arena no tick 5 e a luta termina em empate, motivo `ambos_sairam`.
5. **Dado** `vermelho` com um controlador que chama `setSpeed(-1, 0)` (marcha à ré) e `azul` com "Parado", **Quando** a luta é executada, **Então** ela termina no tick 10 com vitória de `azul`, motivo `saida_da_arena`. O estado final publica a leitura de 0.550 m no raio central de `vermelho`.
6. **Dado** uma luta encerrada no tick 34 com histórico habilitado, **Quando** se pede para avançar mais 10 ticks, **Então** o estado continua idêntico ao do tick 34, incluindo poses, leituras do laser, resultado e eventos. A consulta ao histórico continua devolvendo os mesmos 35 estados.
7. **Dado** um mundo em modo `free`, **Quando** se passam 5 000 ticks, **Então** o status continua `em_andamento` e não há resultado.
8. **Dado** o "Duelo padrão" com os dois robôs em "Parado", `match.maxTicks` = 100 e histórico habilitado, **Quando** se solicitam 110 ticks na execução sem interface, **Então** o estado devolvido tem `tick = 100` e `status = "finalizada"`. O histórico contém 101 estados, em ordem do tick 0 ao 100, e sua última entrada é o estado devolvido.
9. **Dado** o mundo-base em modo `sumo`, com arena de raio 0,5 m, `dt` = 0,0625 s e `match.maxTicks` = 2, ambos os robôs com θ = 0 rad, `vermelho` em (0,4375 m, 0 m) com "Avança" e `azul` em (−0,25 m, 0 m) com "Parado", **Quando** se executa o primeiro tick, **Então** o centro de `vermelho` chega a (0,5 m, 0 m), `status` permanece `em_andamento` e `resultado` vale `null`.
10. **Dado** o estado do tick 1 do cenário anterior, **Quando** se executa o tick 2, **Então** o centro de `vermelho` chega a (0,5625 m, 0 m), ultrapassando o raio da arena no mesmo tick em que o limite é alcançado. A luta termina no tick 2 com `resultado.vencedor = "azul"` e motivo `saida_da_arena`.

---

### User Story 4 — Erros no controlador não derrubam a simulação (Prioridade: P2)

Como membro da equipe, quero que um erro no meu código seja mostrado com clareza e não trave o simulador, para corrigir rápido e seguir testando.

**Por que esta prioridade:** controladores são escritos por usuários e vão falhar; o simulador precisa continuar previsível.

**Teste independente:** controladores com erros de sintaxe e de execução, conferindo erros e eventos.

**Cenários de aceitação:**

1. **Dado** um controlador com erro de sintaxe, **Quando** a simulação vai começar, **Então** ela não começa e há um erro `CONTROLADOR_INVALIDO` no caminho `controllers.<id>`, com a mensagem original do erro.
2. **Dado** um controlador sem a função `loop`, **Quando** a simulação vai começar, **Então** há um erro `CONTROLADOR_INVALIDO` com mensagem informando que a função `loop` é obrigatória.
3. **Dado** um robô em (0.0, 0.0), θ = 0, cujo controlador chama `setSpeed(1, 0)` enquanto `getInfo().tick < 5` e lança um erro quando `getInfo().tick` é 5, **Quando** se passam 10 ticks, **Então** o robô está em (0.500, 0.000), está desativado, e há um evento `erro_controlador` no tick 6 com a mensagem do erro.
4. **Dado** um controlador que chama `setSpeed("rápido", 0)`, **Quando** o tick é executado, **Então** o robô é desativado com evento `erro_controlador` informando que `setSpeed` exige dois números finitos.
5. **Dado** um controlador cuja `setup()` lança um erro, **Quando** o tick 1 é executado, **Então** o robô é desativado nesse tick e `loop()` nunca é chamada.
6. **Dado** o "Duelo padrão" com "Avança" em `vermelho` e um controlador de `azul` cuja `setup()` lança um erro, **Quando** a luta é executada, **Então** `azul` fica desativado no tick 1 com comando `(0, 0)` e é empurrado de (0,200 m, 0 m) até (0,390 m, 0 m). `vermelho` vence no tick 34, por `saida_da_arena`.
7. **Dado** um mundo válido e um controlador "Parado" informado para o ID `fantasma`, ausente do mundo, **Quando** se solicita a execução sem interface, **Então** a resposta contém `ROBO_INEXISTENTE` em `controllers.fantasma` e o tick 0 não é publicado.
8. **Dado** um controlador que define `loop()` e executa `throw new Error("falha no carregamento")` no nível superior, **Quando** o controlador é carregado, **Então** a simulação não inicia e é devolvido `CONTROLADOR_INVALIDO` em `controllers.<id>` com a mensagem "falha no carregamento".
9. **Dado** um robô com laser e um controlador que chama `readLaser()` no nível superior, **Quando** o controlador é carregado, **Então** a leitura fica indisponível, é devolvido `CONTROLADOR_INVALIDO` em `controllers.<id>` e a simulação não inicia.
10. **Dado** um mundo válido em que o controlador de `vermelho` contém um erro de sintaxe e o de `azul` lança uma exceção no nível superior, **Quando** a execução sem interface é solicitada, **Então** a mesma resposta contém dois erros `CONTROLADOR_INVALIDO`, em `controllers.vermelho` e `controllers.azul`, com a mensagem da falha correspondente. O estado do tick 0 não é publicado.
11. **Dado** um mundo válido e um comando constante `(0, 0)` junto com o controlador "Parado" para `vermelho`, **Quando** se solicita a execução sem interface, **Então** a resposta contém `ENTRADA_CONFLITANTE` em `controllers.vermelho` e o tick 0 não é publicado.
12. **Dado** o "Duelo padrão", um comando constante válido e um controlador com erro de sintaxe para `vermelho`, um controlador que falha no carregamento para `azul` e um controlador "Parado" para o ID inexistente `fantasma`, **Quando** se solicita a execução sem interface, **Então** a resposta contém exatamente `ENTRADA_CONFLITANTE` em `controllers.vermelho`, `CONTROLADOR_INVALIDO` em `controllers.azul` e `ROBO_INEXISTENTE` em `controllers.fantasma`. O estado do tick 0 não é publicado.

---

### User Story 5 — Mundos e controladores de exemplo (Prioridade: P2)

Como membro da equipe, quero exemplos prontos de arena e de estratégias, para começar a testar em segundos e ter uma base para minhas próprias estratégias.

**Por que esta prioridade:** a modalidade define os mundos de exemplo (RB-25), e eles são a base da demo.

**Teste independente:** carregar cada exemplo e executá-lo sem erros.

**Cenários de aceitação:**

1. **Dado** os mundos de exemplo "Duelo padrão" (Spec 001, Anexo A) e "Sala com obstáculos" (Anexo C), **Quando** cada um é validado, **Então** ambos são válidos.
2. **Dado** os controladores de exemplo do Anexo D, **Quando** cada um é carregado, **Então** nenhum gera erro de carregamento.
3. **Dado** "Sala com obstáculos", em modo `free`, com o controlador "Desviador", **Quando** se solicitam 2 000 ticks sem interface, **Então** o estado devolvido tem `tick = 2000`, `status = "em_andamento"`, `resultado = null` e nenhum evento `erro_controlador`.

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
- **FR-006:** Se a origem do raio estiver dentro de um obstáculo ou de outro robô, a leitura DEVE ser 0. *(RB-32)*
- **FR-007:** No passo 1 da transição do tick `k` para `k + 1`, as leituras disponibilizadas aos controladores DEVEM corresponder às poses de todos os robôs no estado do tick `k`, antes de qualquer execução de controlador no passo 2 (Spec 001, FR-017). *(RB-27, ADR-009)*
- **FR-008:** O estado publicado DEVE incluir, para cada robô, as leituras calculadas com as poses de todos os robôs registradas naquele mesmo estado, na ordem do raio 0 ao raio N−1. No tick 0, inclusive após o reset, use as poses iniciais. Em cada tick posterior, inclusive no tick final da luta, use as poses resultantes do movimento e das colisões. O campo de um robô sem laser DEVE ser uma lista vazia. *(RB-45, ADR-009)*

### 4.2 Controlador: contrato

- **FR-009:** Um controlador DEVE ser um script JavaScript síncrono em modo estrito, com uma função `loop()` obrigatória e uma função `setup()` opcional. Módulos, importação dinâmica, construções assíncronas e callbacks geradores para `setup()` ou `loop()` ficam fora do contrato. *(RB-35, ADR-016)*
- **FR-010:** Cada robô PODE ter no máximo um controlador. Robô sem controlador e sem comando constante permanece com comando (0, 0). *(RB-35)*
- **FR-011:** Na execução sem interface, com um mundo válido, a validação das entradas DEVE ocorrer antes do carregamento dos controladores. Para cada entrada de controlador, um ID ausente do mundo DEVE gerar `ROBO_INEXISTENTE` e a presença de um comando constante para o mesmo ID DEVE gerar `ENTRADA_CONFLITANTE`. As verificações são independentes e os dois códigos usam o caminho `controllers.<id>`. A validação de comandos mantém os códigos e caminhos da Spec 001 (S1-FR-035). A resposta DEVE reunir os erros de entrada e as falhas de carregamento das entradas de controlador válidas (FR-012). Qualquer erro impede a publicação do tick 0. *(RB-43, ADR-014)*
- **FR-012:** O controlador DEVE ser carregado e verificado antes de publicar o estado inicial do tick 0. As instruções de nível superior DEVEM ser executadas uma vez por carregamento, sem acesso à API do robô. Erro de sintaxe, forma fora do contrato síncrono (FR-009), ausência de `loop()` ou falha na execução dessas instruções DEVEM gerar `CONTROLADOR_INVALIDO` no caminho `controllers.<id>` e impedir o início da simulação. O erro identifica a forma rejeitada, informa que `loop()` é obrigatória quando ausente ou preserva a mensagem original da falha de sintaxe ou de avaliação. Com um mundo válido, a execução sem interface DEVE verificar o código de todos os controladores com ID existente e sem comando constante para o mesmo ID, mesmo que haja erros em outras entradas. Cada falha de carregamento DEVE aparecer como um `CONTROLADOR_INVALIDO` na mesma resposta (FR-011). *(RB-35, RB-43, ADR-010, ADR-012, ADR-014, ADR-016)*
- **FR-013:** `setup()` DEVE ser executada uma única vez, no tick 1, imediatamente antes da primeira execução de `loop()` daquele robô; as funções de leitura já funcionam dentro dela. *(RB-35)*
- **FR-014:** `loop()` DEVE ser executada uma vez por tick para cada robô ativo, no passo 2 do tick, na ordem dos robôs no arquivo. *(RB-35)*
- **FR-015:** Variáveis do controlador DEVEM persistir entre ticks. Ao reiniciar a simulação, cada controlador DEVE ser recarregado do zero conforme FR-012. O novo `setup()`, se definido, é executado no primeiro passo da nova execução, conforme FR-013. *(RB-35, ADR-010)*

### 4.3 Controlador: API (detalhes no Anexo B)

- **FR-016:** `readLaser()` DEVE devolver uma **cópia** da lista do robô do início do passo em execução, correspondente ao tick observado em `getInfo().tick` (FR-007 e FR-020). `setup()` e `loop()` observam as leituras do tick 0 no primeiro passo. Para um robô sem laser, devolve uma lista vazia. *(RB-32, RB-35, ADR-009)*
- **FR-017:** `readBumper()` DEVE devolver o bumper do robô (Spec 001, FR-030). *(RB-34)*
- **FR-018:** `readOdometry()` DEVE devolver `{ x, y, theta }` da odometria do robô (Spec 001, FR-031). *(RB-33)*
- **FR-019:** `setSpeed(v, w)` DEVE definir o comando do robô; exige dois números finitos (caso contrário, erro do controlador, FR-026). Se chamada várias vezes no mesmo tick, vale a última. Se não for chamada, o comando anterior permanece. A saturação da Spec 001 (FR-019 de lá) se aplica. *(RB-35)*
- **FR-020:** `getInfo()` DEVE devolver `{ id, tick, time, dt, radius, maxLinearSpeed, maxAngularSpeed, arenaRadius, laser }`, em que `tick` e `time` são os do estado observado (no primeiro `loop()`, tick 0 e tempo 0), `arenaRadius` é `null` quando o mundo não tem arena e `laser` é `{ rays, fov, maxRange }` ou `null`. *(RB-35)*
- **FR-021:** `random()` DEVE devolver um número em [0, 1). A sequência de cada robô DEVE depender apenas da semente do mundo e da posição do robô na lista; chamadas de um robô não afetam a sequência de outro. O algoritmo exato é fixado no plano. *(RB-27)*
- **FR-022:** `log(...valores)` DEVE registrar um evento do tipo `log` com o `id` do robô, o tick em execução e a mensagem formada pelos valores convertidos em texto e separados por um espaço. Máximo de 1 000 eventos de log por robô por simulação; os excedentes são ignorados e um único evento `limite_de_logs` é registrado. *(RB-35)*
- **FR-023:** O tick registrado em eventos DEVE ser o tick em execução (o estado resultante daquele passo); o primeiro tick é 1. *(RB-27)*
- **FR-024:** A API do Anexo B DEVE estar disponível apenas durante a execução síncrona de `setup()` e `loop()`, inclusive para as funções auxiliares chamadas por elas. O acesso do controlador aos dados do simulador DEVE ficar restrito a essa API. O ambiente do controlador NÃO DEVE oferecer acesso ao relógio real, aleatoriedade sem semente, APIs do host, agendamento de trabalho ou avaliação dinâmica de código. Após a carga, o estado do controlador só DEVE mudar durante suas chamadas síncronas. Avançar em lote ou um tick por vez com as mesmas entradas DEVE produzir os mesmos estados, eventos e histórico, quando habilitado. *(RB-27, RB-35, ADR-010, ADR-016)*

### 4.4 Controlador: erros

- **FR-025:** Erros em `setup()` ou `loop()` NÃO DEVEM interromper a simulação. *(RB-35)*
- **FR-026:** Se `setup()` ou `loop()` lançar um erro, ou se `setSpeed` for chamada com argumentos inválidos: as chamadas de `setSpeed` daquela execução são descartadas; o robô fica **desativado** com comando (0, 0) a partir daquele mesmo tick e até o fim; `loop()` não é mais chamada; e um evento `erro_controlador` é registrado com o tick, o `id` e a mensagem do erro. *(RB-35)*
- **FR-027:** Um robô desativado continua sujeito a colisões, empurrões e às regras do sumô. *(RB-25, RB-31, ADR-003)*

### 4.5 Regras do sumô

- **FR-028:** Somente em `match.mode = "sumo"` o simulador DEVE avaliar a saída da arena e o limite de ticks como condições de encerramento (FR-029 e FR-030). *(RB-25, ADR-003)*
- **FR-029:** Um robô está **fora da arena** quando a distância do seu centro à origem é **estritamente maior** que o raio da arena. *(ADR-003)*
- **FR-030:** No passo 9 do tick (Spec 001, FR-017), na seguinte ordem: *(ADR-003)*
  1. Se exatamente um robô estiver fora, a luta termina com vitória do outro, motivo `saida_da_arena`.
  2. Se os dois estiverem fora, a luta termina em empate, motivo `ambos_sairam`.
  3. Senão, se o tick atual for igual a `match.maxTicks`, a luta termina em empate, motivo `tempo_esgotado`.
- **FR-031:** O estado DEVE incluir `status` (`em_andamento` ou `finalizada`) e `resultado`. Enquanto a luta estiver em andamento, `resultado` DEVE ser `null`. Ao terminar, `resultado` DEVE conter `{ vencedor, motivo, tick }`, com `resultado.vencedor` igual ao `id` do vencedor ou `null` em empate. No tick final, o sistema DEVE registrar um único evento `fim_da_luta` da partida, sem robô associado em qualquer desfecho. *(RB-25, ADR-013)*
- **FR-032:** Um pedido de avanço que alcance ou ultrapasse o fim da luta DEVE devolver o estado final. Pedidos posteriores DEVEM devolver o mesmo estado e preservar o histórico. Quando habilitado, o histórico devolvido por `runHeadless()` e por `getHistory()` DEVE conter o estado inicial do tick 0 e um estado por tick efetivamente executado, em ordem, com uma única entrada para o tick final. *(RB-43, ADR-011)*
- **FR-033:** No modo `free`, o status DEVE permanecer `em_andamento` e o resultado `null`, inclusive quando a execução sem interface devolve o estado no tick solicitado. *(RB-25, ADR-003)*

### 4.6 Estado e exemplos

- **FR-034:** O estado de cada robô DEVE acrescentar aos campos da Spec 001 as leituras do laser da pose publicada (FR-008) e a situação (`ativo` ou `desativado`). O estado da simulação DEVE acrescentar status, resultado e a lista de eventos ocorridos até aquele tick, em ordem. *(RB-43, RB-45)*
- **FR-035:** O sistema DEVE oferecer os mundos de exemplo "Duelo padrão" (Spec 001, Anexo A) e "Sala com obstáculos" (Anexo C). *(RB-25)*
- **FR-036:** O sistema DEVE oferecer os controladores de exemplo do Anexo D, com exatamente o comportamento descrito. *(RB-25)*

---

## 5. Entidades principais

| Entidade | Atributos |
|---|---|
| **Configuração do laser** | número de raios, campo de visão, alcance máximo |
| **Leituras do laser** | lista de N distâncias, do raio 0 ao raio N−1 |
| **Controlador** | `id` do robô, texto do código |
| **Evento** | tipo (`log`, `erro_controlador`, `limite_de_logs`, `fim_da_luta`), tick, mensagem e `id` do robô quando associado. `fim_da_luta` pertence à partida e não tem robô associado. |
| **Resultado da luta** | vencedor (`id` ou nulo), motivo (`saida_da_arena`, `ambos_sairam`, `tempo_esgotado`), tick |
| **Estado do robô** (acréscimos) | leituras do laser correspondentes ao estado publicado (FR-008), situação (ativo ou desativado) |
| **Estado da simulação** (acréscimos) | status, resultado, eventos |
| **Histórico** | lista opcional de estados em ordem, do tick 0 até o último tick executado (FR-032) |

---

## 6. Critérios de sucesso

- **SC-001:** 100% dos cenários de aceitação desta spec passam dentro da tolerância da Spec 001 (FR-040 de lá).
- **SC-002:** Duas execuções da mesma luta, com os mesmos controladores e a mesma semente, produzem estados e eventos idênticos em todos os ticks.
- **SC-003:** O "Duelo padrão", com "Parado" em `vermelho` e "Girador" em `azul`, DEVE terminar no tick 3 000 com motivo `tempo_esgotado`, em menos de 2 s no ambiente de referência da Spec 001 (Intel Core i5-1334U, Linux x64 e Node 24.22.3). A medição cobre uma chamada sem interface de 3 000 ticks com o histórico desabilitado, desde a entrada com mundo e controladores em memória até o retorno do estado final. A inicialização do processo e a leitura de arquivos ficam fora da medição. [Ambiente de referência](../../docs/registro-de-consolidacao.md#evidências-para-o-pr-da-spec-001)
- **SC-004:** Cada falha de carregamento devolve um erro estruturado e impede o início da simulação. Na execução sem interface, todas as falhas de carregamento são devolvidas na mesma resposta (FR-012). Todos os casos de erro durante `setup()` ou `loop()` desativam o robô e registram um evento conforme FR-026, preservando a execução do tick.
- **SC-005:** Um membro da equipe consegue, partindo do "Caçador", escrever uma estratégia própria e colocá-la para lutar em menos de 15 minutos, consultando apenas o Anexo B.

---

## 7. Premissas e decisões

- Convenções C5, C6, C13, C14, C15, C22 e C23 do AGENTS.md §10 foram fixadas nesta spec (ADR-007, aceita).
- Laser em vez de sonar (proposta padrão de Q-008).
- Enquanto a forma de chamada da suíte externa aguarda confirmação do professor (Q-001), os contratos da S2 partem das duas entradas da Spec 001: API de biblioteca e comando sem interface. [Q-001](../../docs/perguntas.md#q-001--como-a-suíte-oculta-interage-com-o-código-regenerado)
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
| 3 raios, π/3, alcance 3, mapa 4 × 2, robô na origem, θ = π/2 | [1.154701, 1.000000, 1.154701] |
| Idem, com obstáculo (1.0, 0.0), 0.2 × 0.4 | [2.309401, 0.900000, 2.309401] |
| Idem, alcance 1.5, sem obstáculo | [1.5, 1.5, 1.5] |
| 1 raio, alcance 1, robô de raio 0.1 em (0.5, 0.0) | [0.400000] |
| 5 raios, π/2, alcance 1, robô de raio 0.1 em (0.5, 0.05) | [1.0, 1.0, 0.413397, 1.0, 1.0] |
| "Duelo padrão", tick 0 | [0.8, 0.8, 0.35, 0.8, 0.8] para cada robô |

## Anexo B — API do controlador

As funções abaixo ficam disponíveis durante `setup()`, `loop()` e as chamadas a auxiliares
feitas por essas funções. As instruções de nível superior do carregamento rodam sem a API.
O controlador segue o formato síncrono do FR-009. Depois da carga, toda alteração de estado
do controlador ocorre durante uma chamada síncrona prevista no FR-024.

| Função | Devolve | Descrição |
|---|---|---|
| `readLaser()` | lista de números | Cópia das leituras do início do passo, do raio 0 (direita) ao raio N−1 (esquerda). Lista vazia sem laser. |
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

| Código | Caminho | Quando ocorre |
|---|---|---|
| `ROBO_INEXISTENTE` | `controllers.<id>` | Controlador informado para um ID ausente do mundo (FR-011). |
| `ENTRADA_CONFLITANTE` | `controllers.<id>` | Controlador e comando constante informados para o mesmo ID (FR-011). |
| `CONTROLADOR_INVALIDO` | `controllers.<id>` | Uma ocorrência por falha de carregamento em entrada de controlador válida. Abrange erro de sintaxe, forma fora do contrato síncrono, ausência de `loop()` ou falha nas instruções de nível superior (FR-012). |

Com um mundo válido, o resultado sem interface reúne as ocorrências desta tabela e os erros de comandos da Spec 001 na mesma lista. O código do controlador só é carregado quando seu ID existe no mundo e a entrada tem apenas o controlador (FR-011 e FR-012).

## Anexo F — Rastreabilidade

| Origem | Requisitos desta spec |
|---|---|
| RB-23, RB-35 | FR-009 a FR-027 |
| RB-25 | FR-027 a FR-033, FR-035, FR-036 |
| RB-27 | FR-007, FR-021, FR-023, FR-024 |
| RB-31 | FR-027 |
| RB-32 | FR-001 a FR-008, FR-016 |
| RB-33 | FR-018 |
| RB-34 | FR-017 |
| RB-43 | FR-011, FR-012, FR-032, FR-034 |
| RB-45 | FR-004, FR-008, FR-034, Anexo A |
| ADR-003 | FR-004, FR-027 a FR-030, FR-033 |
| ADR-009 | FR-007, FR-008, FR-016 |
| ADR-010 | FR-012, FR-015, FR-024 |
| ADR-011 | FR-032 |
| ADR-012 | FR-012 |
| ADR-013 | FR-031 |
| ADR-014 | FR-011, FR-012 |
| ADR-016 | FR-009, FR-012, FR-024 |
