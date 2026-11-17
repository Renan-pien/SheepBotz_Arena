# Especificação do SheepBotz Arena · Mundo e núcleo de simulação

**Spec** 001 · **Identificador** `001-nucleo-simulacao` · **Criada em** 2026-11-11

**Revisada em** 2026-11-17 · **Status** Especificação oficial da primeira etapa

## Contexto e objetivo

A equipe Univille SheepBotz precisa comparar estratégias de controle sem desgastar os robôs
físicos. A Spec 001 define a base dessa prova de conceito. A equipe descreve o mundo, aplica
comandos a robôs de tração diferencial e consulta os estados produzidos pela simulação sem
interface. As mesmas entradas produzem os mesmos estados em cada tick.

O escopo segue o ADR-005. A [Spec 002](../002-sensores-controlador/spec.md) acrescenta sensores
de alcance, controladores e regras de sumô. A [Spec 003](../003-visualizacao-operacao/spec.md)
acrescenta visualização 3D, operação e replay. As fórmulas desta spec definem os resultados
numéricos esperados da simulação.

## Glossário

| Termo | Definição |
|---|---|
| **Mundo** | Descrição completa de um cenário: mapa, arena, obstáculos, robôs, semente e passo de tempo. |
| **Mapa** | Retângulo centrado na origem cujas bordas são paredes. |
| **Arena** | Círculo centrado na origem que delimita a área de luta (usado pelas regras do sumô na Spec 002). Não é parede. |
| **Obstáculo** | Retângulo alinhado aos eixos, fixo, que os robôs não atravessam. |
| **Robô** | Corpo circular de tração diferencial, com pose, comando, bumper e odometria. |
| **Pose** | Posição `(x, y)` em metros e orientação `θ` em radianos. |
| **Comando** | Par `(v, w)`: velocidade linear em m/s e velocidade angular em rad/s. |
| **Tick** | Um passo da simulação. O tick 0 é o estado inicial. |
| **Passo de tempo (`dt`)** | Duração, em segundos, de um tick. Fixo durante toda a simulação. |
| **Semente (`seed`)** | Número inteiro que fixa toda a aleatoriedade da simulação (usada na Spec 002). |
| **Contato** | Situação em que um robô encosta em outro robô, em um obstáculo ou em uma parede durante um tick. |
| **Execução sem interface** | Rodar a simulação informando mundo, comandos e número de ticks, e receber o estado resultante, sem nenhuma tela. |

## Cenários de usuário e testes

> Os exemplos usam a **tolerância padrão** do FR-040, de ±0.001 m para distâncias e ±0.001 rad para ângulos. A comparação entre execuções idênticas segue o FR-036 e usa igualdade de estados.
> Salvo indicação contrária, os exemplos usam um mapa de 4 × 4 m, sem arena, sem obstáculos, modo livre, robôs de raio 0.1 m, `maxLinearSpeed` 1.0 m/s, `maxAngularSpeed` 6.0 rad/s e `dt` = 0.1 s. Esse conjunto é chamado de **mundo-base de teste**.

### História 1 — Descrever e validar um mundo (Prioridade: P1)

Como membro da equipe, quero descrever um cenário num arquivo e saber exatamente o que está errado quando eu errar, para montar mundos de teste sem adivinhação.

**Por que esta prioridade:** nada funciona sem um mundo válido, e "erros claros para arquivos de mundo inválidos" é um dos itens verificados pelos testes de aceitação (RB-46).

**Teste independente:** carregar arquivos válidos e inválidos e conferir o resultado da validação, sem executar nenhum tick.

**Cenários de aceitação:**

1. **S1-US1-AC1** · **Dado** o arquivo "Duelo padrão" (Anexo A), **Quando** ele é carregado, **Então** a validação é aprovada, o mundo tem 2 robôs (`vermelho` e `azul`) e o estado no tick 0 tem `vermelho` em (-0.2, 0.0), θ = 0, e `azul` em (0.2, 0.0), θ = π.
2. **S1-US1-AC2** · **Dado** um arquivo cujo conteúdo não é um documento estruturado válido (por exemplo, `{"map": `), **Quando** ele é carregado, **Então** a validação falha com exatamente um erro de código `ARQUIVO_INVALIDO` e caminho vazio.
3. **S1-US1-AC3** · **Dado** o mundo-base de teste sem o campo `map`, **Quando** carregado, **Então** a validação falha com um erro `CAMPO_OBRIGATORIO` no caminho `map`.
4. **S1-US1-AC4** · **Dado** um mundo em que `robots[0].radius` vale `"0.1"` (texto), **Quando** carregado, **Então** há um erro `TIPO_INVALIDO` no caminho `robots[0].radius`.
5. **S1-US1-AC5** · **Dado** um mundo com `dt` = 0.5, **Quando** carregado, **Então** há um erro `VALOR_FORA_DO_INTERVALO` no caminho `dt`.
6. **S1-US1-AC6** · **Dado** um mundo com dois robôs de `id` `"r1"`, **Quando** carregado, **Então** há um erro `ID_DUPLICADO` no caminho `robots[1].id`.
7. **S1-US1-AC7** · **Dado** um mundo com um campo `robots[0].velocidade` (não previsto), **Quando** carregado, **Então** há um erro `CAMPO_DESCONHECIDO` no caminho `robots[0].velocidade`.
8. **S1-US1-AC8** · **Dado** um mundo com **três** problemas independentes (por exemplo, `dt` fora do intervalo, `seed` negativa e `robots[0].radius` igual a 0), **Quando** carregado, **Então** a validação devolve os **três** erros, não apenas o primeiro.
9. **S1-US1-AC9** · **Dado** um robô com `theta` = 7.0 no arquivo, **Quando** o mundo é carregado, **Então** a orientação inicial do robô é 0.716815 rad (normalizada, FR-012).
10. **S1-US1-AC10** · **Dado** um robô de raio 0.1 com `maxLinearSpeed` = 2.0 e `dt` = 0.1, **Quando** carregado, **Então** há um erro `DESLOCAMENTO_EXCESSIVO` no caminho `robots[0].maxLinearSpeed` (0.2 m por tick é maior que o raio).
11. **S1-US1-AC11** · **Dado** o “Duelo padrão” com o robô `azul` em (0.385, 0.0) m ou em (0.400, 0.0) m, **Quando** cada variante é carregada separadamente, **Então** a primeira é aceita porque o centro está sobre a borda da arena, mesmo com parte do corpo para fora. A segunda é rejeitada com `REGRA_DA_MODALIDADE` no caminho `robots[1]`.

---

### História 2 — Mover um robô de tração diferencial (Prioridade: P1)

Como membro da equipe, quero aplicar velocidades a um robô e saber exatamente onde ele estará depois de N ticks, para validar estratégias de movimento.

**Por que esta prioridade:** "posição final do robô após N ticks" é o principal item verificado pelos testes de aceitação (RB-44).

**Teste independente:** execução sem interface com um robô e comando constante, conferindo a pose final.

**Cenários de aceitação:**

1. **S1-US2-AC1** · **Dado** um robô em (0.0, 0.0), θ = 0, **Quando** recebe o comando (1.0, 0.0) por 10 ticks, **Então** está em (1.000, 0.000), θ = 0.000.
2. **S1-US2-AC2** · **Dado** um robô em (0.0, 0.0), θ = 0, **Quando** recebe o comando (0.5, 1.0) por 1 tick, **Então** está em (0.050000, 0.000000), θ = 0.100000.
3. **S1-US2-AC3** · **Dado** o mesmo robô e comando, **Quando** se passam 2 ticks, **Então** está em (0.099750, 0.004992), θ = 0.200000.
4. **S1-US2-AC4** · **Dado** o mesmo robô e comando, **Quando** se passam 10 ticks, **Então** está em (0.431877, 0.208620), θ = 1.000000.
5. **S1-US2-AC5** · **Dado** um robô em (0.0, 0.0), θ = 0, **Quando** recebe (0.0, π/2) por 10 ticks, **Então** permanece em (0.000, 0.000), com θ = 1.570796.
6. **S1-US2-AC6** · **Dado** um robô em (0.0, 0.0), θ = 0, **Quando** recebe (−0.5, 0.0) por 10 ticks, **Então** está em (−0.500, 0.000), θ = 0 (marcha à ré).
7. **S1-US2-AC7** · **Dado** um robô com `maxLinearSpeed` 1.0 e `maxAngularSpeed` 6.0, em (0.0, 0.0), θ = 0, **Quando** recebe (3.0, −10.0) por 1 tick, **Então** o comando efetivo é (1.0, −6.0) e o robô está em (0.100, 0.000), θ = −0.600.
8. **S1-US2-AC8** · **Dado** um robô sem comando informado, **Quando** se passam 10 ticks, **Então** ele permanece na pose inicial (comando padrão (0, 0)).

---

### História 3 — Simulação determinística e controle do tempo (Prioridade: P1)

Como membro da equipe, quero que a mesma simulação produza sempre o mesmo resultado, para comparar estratégias de forma justa e reproduzir qualquer situação.

**Por que esta prioridade:** determinismo é restrição do briefing (RB-27) e base do replay (Spec 003).

**Teste independente:** executar duas vezes as mesmas entradas e comparar todos os estados.

**Cenários de aceitação:**

1. **S1-US3-AC1** · **Dado** o mundo "Duelo padrão" com comandos (1.0, 0.5) para `vermelho` e (0.3, −0.2) para `azul`, **Quando** a simulação é executada duas vezes por 500 ticks, **Então** os estados das duas execuções são idênticos em todos os ticks.
2. **S1-US3-AC2** · **Dado** qualquer mundo, **Quando** se executam 0 ticks, **Então** o estado devolvido é o estado inicial (tick 0, tempo 0).
3. **S1-US3-AC3** · **Dado** um mundo com `dt` = 0.02, **Quando** se executam 150 ticks, **Então** o tick é 150 e o tempo é 3.0 s (tempo = tick × dt, FR-016).
4. **S1-US3-AC4** · **Dado** uma simulação no tick 120 com histórico habilitado, **Quando** ela é reiniciada, **Então** volta ao tick 0 do mesmo mundo e o histórico contém apenas esse estado inicial. Avançar mais 120 ticks com as mesmas entradas reproduz exatamente os 121 estados da execução anterior. Com histórico desabilitado, a consulta continua retornando uma lista vazia após o reinício.

---

### História 4 — Colidir com paredes e obstáculos e sentir o bumper (Prioridade: P2)

Como membro da equipe, quero que os robôs não atravessem paredes e obstáculos e que o bumper avise quando houve contato, para testar comportamentos de reação a choques.

**Por que esta prioridade:** colisão simples e bumper são escopo mínimo (RB-31, RB-34).

**Teste independente:** robô andando contra uma parede ou obstáculo, conferindo posição final e bumper.

**Cenários de aceitação:**

1. **S1-US4-AC1** · **Dado** um mapa de 2 × 2 m (paredes em x = ±1 e y = ±1) e um robô de raio 0.1 em (0.8, 0.0), θ = 0, **Quando** recebe (1.0, 0.0) por 10 ticks, **Então** está em (0.900, 0.000) e o bumper está ativo.
2. **S1-US4-AC2** · **Dado** o mundo-base de teste com um obstáculo centrado em (0.55, 0.0), largura 0.2 e altura 0.2 (ocupa x de 0.45 a 0.65), e um robô em (0.0, 0.0), θ = 0, **Quando** recebe (1.0, 0.0) por 3 ticks, **Então** está em (0.300, 0.000) e o bumper está **inativo**.
3. **S1-US4-AC3** · **Dado** o mesmo cenário, **Quando** recebe (1.0, 0.0) por 10 ticks, **Então** está em (0.350, 0.000) e o bumper está **ativo**.
4. **S1-US4-AC4** · **Dado** um robô parado longe de tudo, **Quando** se passa 1 tick, **Então** o bumper está inativo.
5. **S1-US4-AC5** · **Dado** o cenário 1, **Quando** o comando passa a ser (−1.0, 0.0) por 1 tick após os 10 ticks, **Então** o robô está em (0.800, 0.000) e o bumper volta a ficar inativo.

---

### História 5 — Vários robôs e a regra do empurrão (Prioridade: P2)

Como membro da equipe, quero vários robôs na mesma arena, empurrando-se de forma previsível, para simular lutas de sumô.

**Por que esta prioridade:** vários robôs são escopo completo (RB-38), mas indispensáveis para a modalidade sumô (ADR-003).

**Teste independente:** dois robôs em contato, com comandos constantes, conferindo as posições finais.

**Cenários de aceitação** (mundo-base de teste, robôs de raio 0.1):

1. **S1-US5-AC1** · **Dado** `A` em (−0.1, 0.0), θ = 0, com comando (0.5, 0.0), e `B` em (0.1, 0.0), θ = π, parado, **Quando** se passam 10 ticks, **Então** `A` está em (0.150, 0.000), `B` em (0.350, 0.000) e ambos têm bumper ativo. *(O par se move a 0.25 m/s: metade da velocidade de `A`.)*
2. **S1-US5-AC2** · **Dado** `A` em (−0.1, 0.0), θ = 0, e `B` em (0.1, 0.0), θ = π, ambos com comando (0.5, 0.0), **Quando** se passam 10 ticks, **Então** `A` continua em (−0.100, 0.000) e `B` em (0.100, 0.000) (forças iguais se anulam), ambos com bumper ativo.
3. **S1-US5-AC3** · **Dado** `A` em (−0.1, 0.0), θ = 0, com (0.6, 0.0), e `B` em (0.1, 0.0), θ = π, com (0.2, 0.0), **Quando** se passam 10 ticks, **Então** `A` está em (0.100, 0.000) e `B` em (0.300, 0.000) (o mais rápido vence; o par anda a (0.6 − 0.2)/2 = 0.2 m/s).
4. **S1-US5-AC4** · **Dado** `A` em (−0.5, 0.0), θ = 0, com (1.0, 0.0), e `B` em (0.5, 0.0), θ = π, parado, **Quando** se passam 10 ticks, **Então** `A` está em (0.400, 0.000) e `B` em (0.600, 0.000).
5. **S1-US5-AC5** · **Dado** dois robôs distantes um do outro, **Quando** se movem sem se aproximar, **Então** nenhum deles tem bumper ativo e suas trajetórias são iguais às de robôs sozinhos.

---

### História 6 — Odometria (Prioridade: P3)

Como membro da equipe, quero que o robô tenha uma estimativa de onde acha que está, baseada só nos comandos das rodas, para testar estratégias que precisam lidar com o erro entre o estimado e o real (por exemplo, quando ele é empurrado).

**Por que esta prioridade:** odometria é escopo mínimo (RB-33), mas só é útil plenamente com os controladores (Spec 002).

**Teste independente:** comparar a pose real e a odometria em movimento livre e em colisão.

**Cenários de aceitação:**

1. **S1-US6-AC1** · **Dado** um robô em movimento livre (S1-US2-AC4), **Quando** se passam 10 ticks, **Então** a odometria é igual à pose real: (0.431877, 0.208620), θ = 1.000000.
2. **S1-US6-AC2** · **Dado** o cenário de parede (S1-US4-AC1), **Quando** se passam 10 ticks, **Então** a pose real é (0.900, 0.000), mas a odometria é (1.800, 0.000), θ = 0.
3. **S1-US6-AC3** · **Dado** o cenário de empurrão (S1-US5-AC1), **Quando** se passam 10 ticks, **Então** a odometria de `A` é (0.400, 0.000) e a de `B` é (0.100, 0.000), θ = π, embora `B` tenha sido empurrado.

---

### Casos de borda

- Robô com `theta` fora de (−π, π] no arquivo: normalizado na carga (FR-012).
- Orientação exatamente −π: representada como π.
- Dois robôs cujas posições no início do tick coincidem exatamente: a direção de separação é o eixo +x (FR-025).
- Robô empurrado contra uma parede por outro robô: a parede prevalece; uma eventual sobreposição restante entre os robôs é resolvida nos ticks seguintes (FR-028).
- Mundo com um único robô: válido no modo livre.
- Execução de 0 ticks: devolve o estado inicial.
- Comando informado para um `id` que não existe no mundo: erro `ROBO_INEXISTENTE` antes de iniciar.
- Comando não numérico ou não finito na execução sem interface: erro `COMANDO_INVALIDO` antes de iniciar.
- Arquivo com erros de tipo em um robô. A validação geométrica omite as verificações que dependem dos campos inválidos e mantém as que usam apenas campos válidos (FR-007).

## Requisitos

### Requisitos funcionais

#### Arquivo de mundo e validação

- **FR-001:** O sistema DEVE aceitar a descrição do mundo como um documento JSON com a estrutura do **Anexo B**. *(RB-30)*
- **FR-002:** O sistema DEVE validar o mundo por completo **antes** de iniciar qualquer simulação; um mundo inválido nunca é simulado. *(RB-46)*
- **FR-003:** Cada erro de validação DEVE conter: **código** (Anexo C), **caminho** do campo com problema e **mensagem** em pt-BR que cite o caminho e explique o problema. *(RB-46)*
- **FR-004:** O caminho DEVE usar a notação de pontos e colchetes a partir da raiz, por exemplo `robots[1].laser.rays`; erros sobre o documento inteiro usam o caminho vazio. *(RB-46)*
- **FR-005:** A validação DEVE devolver **todos** os erros encontrados, não apenas o primeiro. A ordem da lista não faz parte do contrato. *(RB-46)*
- **FR-006:** Campos opcionais ausentes DEVEM assumir os valores padrão do Anexo B. *(RB-30)*
- **FR-007:** As verificações geométricas de um item (FR-008 a FR-010 e a posição inicial no FR-011) só DEVEM ser feitas quando os campos envolvidos forem válidos. *(RB-46)*
- **FR-008:** Todo obstáculo DEVE estar inteiramente dentro do mapa; a arena DEVE ter raio menor ou igual à metade do menor lado do mapa. Caso contrário: `FORA_DO_MAPA`. *(RB-30)*
- **FR-009:** A pose inicial de cada robô DEVE estar com o corpo inteiro dentro do mapa (`FORA_DO_MAPA`), sem sobrepor obstáculos e sem sobrepor robôs anteriores na lista (`POSICAO_INICIAL_INVALIDA`). Encostar (distância igual à soma dos raios) é permitido. *(RB-30, RB-31)*
- **FR-010:** Para cada robô, `maxLinearSpeed × dt` DEVE ser menor ou igual ao raio do robô; caso contrário, `DESLOCAMENTO_EXCESSIVO` no caminho `robots[i].maxLinearSpeed`. *(ADR-007, RB-31)*
- **FR-011:** Quando `match.mode` for `"sumo"`, o mundo DEVE ter exatamente 2 robôs e DEVE ter `arena`. A distância do **centro inicial** de cada robô à origem DEVE ser menor ou igual ao raio da arena. O corpo pode ultrapassar a borda da arena. Violações geram `REGRA_DA_MODALIDADE`. As regras da luta estão na Spec 002. *(RB-25, ADR-003)*

#### Sistema de coordenadas, unidades e tempo

- **FR-012:** O sistema DEVE usar metros, radianos e segundos. O eixo x aponta para a direita, o eixo y para cima, a origem é o centro do mapa e o ângulo positivo é anti-horário. θ = 0 aponta para +x. Toda orientação finita DEVE ser mantida normalizada no intervalo (−π, π] pela regra `θn = θ − 2π · teto((θ − π) / 2π)`. O resultado DEVE respeitar o intervalo também para entradas finitas de magnitude elevada. *(RB-31)*
- **FR-013:** O mapa DEVE ocupar x ∈ [−largura/2, +largura/2] e y ∈ [−altura/2, +altura/2]; suas bordas são paredes. *(RB-30)*
- **FR-014:** A arena, quando existir, DEVE ser um círculo centrado na origem. Ela não é parede: os robôs podem sair dela. *(ADR-003)*
- **FR-015:** O estado inicial DEVE ser o tick 0. Cada avanço executa exatamente um tick com o `dt` do mundo. *(RB-27)*
- **FR-016:** O tempo de simulação DEVE ser calculado como `tick × dt` (e não por soma acumulada). *(RB-27)*

#### Ordem de um tick

- **FR-017:** Cada tick DEVE executar, nesta ordem: *(RB-27)*
  1. **Sensores:** as leituras de todos os robôs usam o estado do início do tick. Na S1, essa etapa mantém o bumper e a odometria disponíveis no estado. O cálculo de leituras do laser entra na Spec 002.
  2. **Comandos:** cada robô, na ordem do arquivo, recebe seu comando (nesta spec, o comando constante da execução; na Spec 002, o do controlador). Um comando vale até ser substituído.
  3. **Saturação:** cada comando é limitado (FR-019).
  4. **Movimento:** todos os robôs calculam a pose candidata a partir da pose do início do tick (FR-020).
  5. **Contato entre robôs:** resolvido pela regra do empurrão (FR-024 a FR-026).
  6. **Obstáculos e paredes:** resolvidos para cada robô (FR-027 a FR-029).
  7. **Bumper e odometria:** atualizados (FR-030, FR-031).
  8. **Tempo:** o tick é incrementado.
  9. **Regras da modalidade:** o estado permanece como saiu da etapa 8 na S1. A Spec 002 passa a verificar o resultado da luta nesta etapa.

#### Cinemática

- **FR-018:** Todo robô DEVE começar com comando (0, 0). *(RB-31, ADR-007)*
- **FR-019:** O comando efetivo DEVE ser `v' = limitar(v, −maxLinearSpeed, +maxLinearSpeed)` e `w' = limitar(w, −maxAngularSpeed, +maxAngularSpeed)`. *(RB-31)*
- **FR-020:** A pose candidata DEVE ser calculada a partir da pose do início do tick `(x, y, θ)` e do comando efetivo `(v', w')`: *(RB-31)*
  - `x_c = x + v' · cos(θ) · dt`
  - `y_c = y + v' · sin(θ) · dt`
  - `θ_c = normalizar(θ + w' · dt)`
- **FR-021:** Colisões e empurrões DEVEM alterar apenas a posição do robô, nunca a orientação. *(RB-31, ADR-007)*
- **FR-022:** Os robôs DEVEM ser tratados como círculos com o raio definido no mundo. *(RB-31, ADR-007)*
- **FR-023:** Os robôs DEVEM ser processados sempre na ordem em que aparecem no arquivo de mundo. *(RB-27, ADR-007)*

#### Contato entre robôs (regra do empurrão)

- **FR-024:** Os pares de robôs (i, j), com i antes de j no arquivo, DEVEM ser verificados em ordem (primeiro i, depois j), uma única vez por tick, usando as posições candidatas já ajustadas pelos pares anteriores. *(RB-38, ADR-003)*
- **FR-025:** Há contato quando a distância `d` entre os centros candidatos é **estritamente menor** que `r_i + r_j`. Nesse caso: *(ADR-003)*
  - `n` = vetor unitário que vai do centro de i ao centro de j **no início do tick** (antes do movimento). Se esses centros coincidirem, `n = (1, 0)`.
  - `s = (c_j − c_i) · n`, usando os centros candidatos (projeção na direção `n`).
  - `p = r_i + r_j − s`
  - `c_i ← c_i − n · p/2` e `c_j ← c_j + n · p/2`
  - Os dois robôs registram contato neste tick.
- **FR-026:** Todos os robôs têm o mesmo peso. Quando dois robôs começam o tick encostados e um avança na direção do outro, que está parado, cada centro avança metade do deslocamento do robô que empurra. Se os dois começarem encostados e avançarem um contra o outro com velocidades iguais, cada um termina o tick na própria posição inicial. Esses resultados decorrem da regra do FR-025. *(ADR-003)*

#### Obstáculos e paredes

- **FR-027:** Para cada robô (na ordem do arquivo) e cada obstáculo (na ordem do arquivo), seja `q` o ponto do retângulo mais próximo do centro `c` do robô e `d = |c − q|`: *(RB-31)*
  - Se `0 < d < r`: `c ← q + (c − q)/d · r` (o robô é empurrado para fora, encostando no obstáculo). Contato registrado.
  - Se `d = 0` (centro sobre a borda ou dentro do obstáculo): calcula-se a distância do centro a cada lado: esquerdo `cx − x_min`, direito `x_max − cx`, inferior `cy − y_min`, superior `y_max − cy`. Escolhe-se o menor (em empate, na ordem esquerdo, direito, inferior, superior) e o centro é colocado a `r` do lado de fora desse lado: esquerdo `cx = x_min − r`, direito `cx = x_max + r`, inferior `cy = y_min − r`, superior `cy = y_max + r`. Contato registrado.
- **FR-028:** Depois dos obstáculos, a posição DEVE ser limitada às paredes: `cx` em [−largura/2 + r, largura/2 − r] e `cy` em [−altura/2 + r, altura/2 − r]. Se houve limitação, contato registrado. Sobreposições que restarem entre robôs são tratadas no tick seguinte. *(RB-31)*
- **FR-029:** A resolução de obstáculos e paredes faz uma única passada por tick, com os obstáculos processados na ordem do FR-027 e as paredes tratadas em seguida pelo FR-028. *(RB-31, ADR-007)*

#### Bumper e odometria

- **FR-030:** O bumper DEVE estar ativo ao fim de um tick se, nesse tick, o robô registrou contato com robô, obstáculo ou parede; caso contrário, inativo. No tick 0, inativo. A leitura disponível no início do tick reflete o contato registrado no tick anterior. *(RB-34)*
- **FR-031:** A odometria DEVE ser uma pose estimada `(x_o, y_o, θ_o)`, iniciada igual à pose inicial real e atualizada a cada tick **com a mesma fórmula do FR-020**, aplicada ao comando efetivo e à própria orientação estimada. Ela **ignora** colisões e empurrões. *(RB-33)*

#### Execução sem interface e determinismo

- **FR-032:** O sistema DEVE permitir executar uma simulação sem interface informando: o mundo, um comando constante opcional por `id` de robô e um número inteiro de ticks N ≥ 0. *(RB-27, RB-43)*
- **FR-033:** O resultado DEVE ser: a lista de erros de validação (se houver) **ou** o estado após N ticks; opcionalmente, o histórico com o estado de cada tick de 0 a N. *(RB-43, RB-44)*
- **FR-034:** O estado DEVE conter: tick, tempo e, para cada robô, `id`, pose real, comando efetivo, bumper e odometria (a Spec 002 acrescenta campos). *(RB-44)*
- **FR-035:** Comandos para `id` inexistente DEVEM gerar `ROBO_INEXISTENTE`. Comandos com velocidades não numéricas ou não finitas DEVEM gerar `COMANDO_INVALIDO`. As verificações são independentes e DEVEM acumular os dois erros se ambos se aplicarem ao mesmo comando. Cada erro usa o caminho `commands.<id>` e impede o início da simulação. *(RB-43, ADR-007)*
- **FR-036:** A simulação DEVE ser determinística: as mesmas entradas (mundo, comandos ou controladores e número de ticks) produzem estados idênticos em todos os ticks. *(RB-27)*
- **FR-037:** O núcleo NÃO DEVE depender de relógio real, de interface gráfica, de rede ou de aleatoriedade sem semente. *(RB-27)*
- **FR-038:** O sistema DEVE permitir reiniciar a simulação para o estado do tick 0 do mesmo mundo. Se o histórico estiver habilitado, o reinício DEVE substituir a lista anterior por uma lista contendo somente o estado inicial. Se estiver desabilitado, a consulta ao histórico DEVE retornar uma lista vazia. *(RB-24)*
- **FR-039:** O sistema DEVE permitir avançar a simulação um tick por vez e consultar o estado após cada tick. *(RB-24)*
- **FR-040:** Para fins de aceitação, valores DEVEM ser comparados com tolerância de ±0.001 m para distâncias e ±0.001 rad para ângulos; ângulos são comparados pela menor diferença angular (π e −π são iguais). *(RB-44, Q-002)*

### Entidades principais

| Entidade | Atributos |
|---|---|
| **Mundo** | nome, semente, `dt`, mapa, arena (opcional), partida (modo e limite de ticks), obstáculos, robôs |
| **Mapa** | largura, altura |
| **Arena** | raio |
| **Partida** | modo (`free` ou `sumo`), limite de ticks |
| **Obstáculo** | `id`, centro (x, y), largura, altura |
| **Configuração do robô** | `id`, pose inicial, raio, velocidades máximas, cor, laser (opcional) |
| **Estado da simulação** | tick, tempo, estados dos robôs (a Spec 002 acrescenta status e resultado) |
| **Estado do robô** | `id`, pose real, comando efetivo, bumper, odometria (a Spec 002 acrescenta leituras do laser e situação do controlador) |
| **Erro de validação** | código, caminho, mensagem |

## Critérios de sucesso

### Resultados mensuráveis

- **SC-001:** 100% dos cenários de aceitação desta spec passam dentro da tolerância do FR-040.
- **SC-002:** Duas execuções com as mesmas entradas produzem estados idênticos em todos os ticks, em 100% das execuções testadas.
- **SC-003:** Uma simulação de 3 000 ticks com 2 robôs termina sem interface em menos de 1 segundo num notebook comum. O resultado da medição registra o ambiente usado.
- **SC-004:** Cada código do Anexo C tem pelo menos um caso de entrada inválida, de arquivo de mundo ou de comando conforme o erro, com código e caminho esperados. Nenhum caso interrompe o sistema de forma inesperada.
- **SC-005:** Um membro da equipe consegue escrever um mundo válido com 2 robôs e 1 obstáculo, consultando apenas o Anexo B, em menos de 10 minutos.

## Premissas e dependências

- O público da S1 são os membros da equipe que preparam mundos e comparam estratégias em execuções sem interface.
- A S1 funciona de forma independente da interface e de controladores programáveis. A configuração de laser já pode constar no mundo para uso pela S2.
- As convenções C1–C12, C16, C17, C20 e C21 do AGENTS.md seguem o ADR-007, incluindo JSON, as unidades, o passo fixo e as tolerâncias numéricas.
- As dimensões do “Duelo padrão” seguem a referência de mini-sumô adotada no ADR-007. A confirmação da categoria real da equipe continua registrada em Q-006.
- A forma de execução sem interface é detalhada nos contratos da S1. A forma usada pela suíte oculta continua em Q-001. A tolerância desta spec segue o padrão adotado em Q-002.

## Fora do escopo

- Leituras de laser, controladores programáveis e regras de vitória (Spec 002).
- Visualização, controles na tela e replay (Spec 003).
- Obstáculos girados, circulares ou móveis; terrenos e rampas.
- Atrito, inércia, aceleração, massa diferente entre robôs, deslizamento de rodas.
- Ruído nos sensores e na odometria.
- Arquivo de mundo em YAML.

## Anexo A — Mundo "Duelo padrão"

```json
{
  "name": "Duelo padrão",
  "seed": 1,
  "dt": 0.02,
  "map": { "width": 2.0, "height": 2.0 },
  "arena": { "radius": 0.385 },
  "match": { "mode": "sumo", "maxTicks": 3000 },
  "obstacles": [],
  "robots": [
    {
      "id": "vermelho",
      "x": -0.2, "y": 0.0, "theta": 0.0,
      "radius": 0.05,
      "maxLinearSpeed": 1.0, "maxAngularSpeed": 6.0,
      "color": "#E53935",
      "laser": { "rays": 5, "fov": 1.0471975511965976, "maxRange": 0.8 }
    },
    {
      "id": "azul",
      "x": 0.2, "y": 0.0, "theta": 3.141592653589793,
      "radius": 0.05,
      "maxLinearSpeed": 1.0, "maxAngularSpeed": 6.0,
      "color": "#1E88E5",
      "laser": { "rays": 5, "fov": 1.0471975511965976, "maxRange": 0.8 }
    }
  ]
}
```

## Anexo B — Estrutura do arquivo de mundo

O documento raiz é um objeto. Campos não listados geram `CAMPO_DESCONHECIDO`. Números devem ser finitos.

| Caminho | Tipo | Obrigatório | Padrão | Regra de validação |
|---|---|---|---|---|
| `name` | texto | não | `"Mundo sem nome"` | 1 a 80 caracteres |
| `seed` | inteiro | não | `1` | 0 a 4 294 967 295 |
| `dt` | número | não | `0.02` | 0.001 ≤ dt ≤ 0.1 |
| `map` | objeto | **sim** | — | — |
| `map.width` | número | **sim** | — | 0 < valor ≤ 100 |
| `map.height` | número | **sim** | — | 0 < valor ≤ 100 |
| `arena` | objeto | não | ausente | obrigatória no modo `sumo` |
| `arena.radius` | número | sim, se `arena` existir | — | 0 < valor ≤ min(largura, altura)/2 |
| `match` | objeto | não | `{ "mode": "free", "maxTicks": 3000 }` | — |
| `match.mode` | texto | não | `"free"` | `"free"` ou `"sumo"` |
| `match.maxTicks` | inteiro | não | `3000` | 1 a 1 000 000 |
| `obstacles` | lista | não | `[]` | 0 a 100 itens |
| `obstacles[k].id` | texto | **sim** | — | formato `[A-Za-z0-9_-]`, 1 a 32 caracteres; único entre obstáculos |
| `obstacles[k].x`, `.y` | número | **sim** | — | centro; obstáculo inteiro dentro do mapa |
| `obstacles[k].width`, `.height` | número | **sim** | — | 0 < valor ≤ 100 |
| `robots` | lista | **sim** | — | 1 a 8 itens |
| `robots[i].id` | texto | **sim** | — | formato `[A-Za-z0-9_-]`, 1 a 32 caracteres; único entre robôs |
| `robots[i].x`, `.y` | número | **sim** | — | posição inicial (FR-009) |
| `robots[i].theta` | número | não | `0` | qualquer valor finito; normalizado na carga |
| `robots[i].radius` | número | não | `0.05` | 0.01 ≤ valor ≤ 1 |
| `robots[i].maxLinearSpeed` | número | não | `1.0` | 0 < valor ≤ 10; e FR-010 |
| `robots[i].maxAngularSpeed` | número | não | `6.0` | 0 < valor ≤ 50 |
| `robots[i].color` | texto | não | ver nota | formato `#RRGGBB` |
| `robots[i].laser` | objeto | não | ausente (robô sem laser) | — |
| `robots[i].laser.rays` | inteiro | não | `5` | 1 a 360 |
| `robots[i].laser.fov` | número | não | `1.0471975511965976` (π/3) | 0 < valor ≤ 2π; ignorado se `rays` = 1 |
| `robots[i].laser.maxRange` | número | não | `1.0` | 0 < valor ≤ 100 |

**Cores padrão** (pela posição do robô na lista, repetindo após a 8ª): `#E53935`, `#1E88E5`, `#43A047`, `#FDD835`, `#8E24AA`, `#FB8C00`, `#00ACC1`, `#6D4C41`.

## Anexo C — Catálogo de erros

| Código | Quando ocorre |
|---|---|
| `ARQUIVO_INVALIDO` | O conteúdo não é um JSON válido ou a raiz não é um objeto (caminho vazio) |
| `CAMPO_OBRIGATORIO` | Campo obrigatório ausente |
| `CAMPO_DESCONHECIDO` | Campo não previsto no Anexo B |
| `TIPO_INVALIDO` | Tipo errado (texto no lugar de número, número não inteiro onde se exige inteiro, lista no lugar de objeto etc.) |
| `FORMATO_INVALIDO` | Texto fora do formato exigido (`id`, `color`, `match.mode`) |
| `VALOR_FORA_DO_INTERVALO` | Número fora do intervalo permitido, ou lista com quantidade de itens fora do permitido |
| `ID_DUPLICADO` | `id` repetido (o erro aponta para a segunda ocorrência em diante) |
| `FORA_DO_MAPA` | Obstáculo, robô ou arena que não cabe no mapa |
| `POSICAO_INICIAL_INVALIDA` | Robô que começa sobrepondo obstáculo ou robô anterior |
| `DESLOCAMENTO_EXCESSIVO` | `maxLinearSpeed × dt` maior que o raio do robô |
| `REGRA_DA_MODALIDADE` | Violação das exigências do modo `sumo` (FR-011) |
| `ROBO_INEXISTENTE` | Comando ou controlador associado a um `id` que não existe (execução) |
| `COMANDO_INVALIDO` | Comando não numérico ou não finito na execução sem interface |

## Anexo D — Rastreabilidade

As tarefas citadas registram verificações planejadas. Os cenários e os casos de borda
definem os resultados esperados.

| Requisitos | Origem | Evidência de aceitação ou verificação planejada |
|---|---|---|
| FR-001 a FR-007 | RB-30, RB-46 | S1-US1-AC1 a AC8. S1-T018 para o catálogo de erros. |
| FR-008 a FR-011 | RB-25, RB-30, RB-31, ADR-003, ADR-007 | S1-US1-AC1, AC10 e AC11. S1-T017 e S1-T018 para validação da geometria e da modalidade. |
| FR-012 a FR-014 | RB-30, RB-31, ADR-003 | S1-US1-AC1 e AC9, S1-US4-AC1. S1-T010 para ângulos e S1-T018 para limites do mapa e da arena. |
| FR-015 a FR-017 | RB-27 | S1-US3-AC1 a AC4, S1-US4-AC3 e S1-US6-AC2 para passo fixo, movimento, colisão, bumper e odometria. |
| FR-018 a FR-023 | RB-27, RB-31, ADR-007 | S1-US2-AC1 a AC8, S1-US4-AC1 e S1-US5-AC1. S1-T037 e S1-T041 para orientação e ordem dos pares. |
| FR-024 a FR-026 | RB-38, ADR-003 | S1-US5-AC1 a AC5. S1-T041 para a ordem dos pares, os centros coincidentes e o limiar de contato. |
| FR-027 a FR-030 | RB-31, RB-34, ADR-007 | S1-US4-AC1 a AC5. S1-T037 para casos de borda de obstáculos e paredes. |
| FR-031 | RB-33 | S1-US6-AC1 a AC3. |
| FR-032 a FR-035 | RB-43, RB-44, ADR-007 | S1-US2-AC1, S1-US3-AC1 e AC2. S1-T030 e S1-T034 para entradas inválidas, estado final e histórico. |
| FR-036 a FR-039 | RB-24, RB-27 | S1-US3-AC1 a AC4 e S1-US4-AC5. S1-T047 para o isolamento do núcleo. |
| FR-040 | RB-44, Q-002 | As poses esperadas usam a tolerância deste requisito. S1-T009 e S1-T010 definem as comparações de posição e ângulo. |
