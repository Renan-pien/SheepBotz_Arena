# Registro de Decisões — SheepBotz Arena

> Formato ADR (AGENTS.md §8.2). Decisões de produto e de stack só ficam "aceitas" com aprovação de um integrante do time.

---

## ADR-001 — Trilha 4: SheepBotz Arena
- **Data:** 2026-11-11
- **Status:** aceita
- **Contexto:** O grupo precisa escolher uma das quatro trilhas do trabalho (RB-01).
- **Opções consideradas:** A) Trilha 1, meuPiá Blocos. B) Trilha 2, Carona Univille. C) Trilha 3, Neural Arcade. D) Trilha 4, SheepBotz Arena.
- **Decisão:** D) Trilha 4, SheepBotz Arena.
- **Motivo:** Maior impacto visual no pitch; o núcleo headless e determinístico exigido pela trilha favorece critérios de aceite numéricos, que sobrevivem à regeneração do código.
- **Consequências:** Complexidade alta; exige especificação rigorosa das convenções do domínio (AGENTS.md §10).
- **Aprovado por:** Renan, Julio e Wesley

---

## ADR-002 — GitHub SpecKit como framework de SDD
- **Data:** 2026-11-11
- **Status:** aceita
- **Contexto:** O enunciado exige SpecKit ou OpenSpec (RB-03).
- **Opções consideradas:** A) GitHub SpecKit. B) OpenSpec. C) SDD manual (descartado: fora da regra).
- **Decisão:** A) GitHub SpecKit.
- **Motivo:** Os artefatos do SpecKit (constitution, spec, plan, tasks) têm os mesmos nomes da rubrica, o que facilita a avaliação; possui etapas de clarificação e análise de consistência.
- **Consequências:** Fluxo e portões definidos em AGENTS.md §4.
- **Aprovado por:** Renan, Julio e Wesley

---

## ADR-003 — Modalidade: Sumô
- **Data:** 2026-11-11
- **Status:** aceita
- **Contexto:** A trilha pede uma modalidade para guiar specs, condições de vitória e mundos de exemplo (RB-25).
- **Opções consideradas:** A) Sumô. B) Labirinto (em formato de corrida). C) Seguidor de linha. D) Arena de resgate.
- **Decisão:** A) Sumô.
- **Motivo:** Maior apelo no pitch (duelo ao vivo entre estratégias); conexão direta com o valor da trilha (testar estratégias de luta sem desgastar robôs físicos); puxa naturalmente itens do escopo completo (vários robôs, painel de inspeção, replay).
- **Consequências:**
  - RB-38 (vários robôs) passa a ser necessário já na Spec 001.
  - É preciso especificar a regra do empurrão entre robôs (C21), sem motor de física, com exemplos numéricos. É o principal risco para o Teste da Spec.
  - Novas convenções C20 a C23 em AGENTS.md §10.
  - Condições de vitória, derrota e empate na Spec 002.
  - A regra de contato é genérica (vale para quaisquer robôs), preservando o núcleo independente da modalidade (RB-26).
- **Aprovado por:** Renan, Julio e Wesley

---

## ADR-004 — Agente de IA: app de desktop da z.ai
- **Data:** 2026-11-11
- **Status:** aceita
- **Contexto:** O assistente de IA é livre (RB-02).
- **Opções consideradas:** A) App de desktop da z.ai. B) Claude Code. C) OpenCode.
- **Decisão:** A) App de desktop da z.ai.
- **Motivo:** Ferramenta já disponível para o time; validada como agente de código (abre pasta do projeto, roda comandos no terminal e lê o AGENTS.md automaticamente).
- **Consequências:** Mesmo cliente e mesmo modelo do início ao fim. Se o app não reconhecer `/speckit.*`, o agente executa o arquivo Markdown do comando correspondente.
- **Aprovado por:** Renan, Julio e Wesley

---

## ADR-005 — Projeto dividido em 3 specs
- **Data:** 2026-11-11
- **Status:** aceita
- **Contexto:** Tempo curto; necessidade de fatias demonstráveis e testáveis (RB-07).
- **Opções consideradas:** A) 3 specs. B) 5 ou mais specs menores. C) Uma spec única.
- **Decisão:** A) 3 specs: S1 Mundo e núcleo de simulação; S2 Sensores e controlador; S3 Visualização e operação.
- **Motivo:** Equilíbrio entre poucas cerimônias e fatias independentes; o núcleo testável (S1, S2) vem antes da interface (S3).
- **Consequências:** Mapa e regras em AGENTS.md §6.
- **Aprovado por:** Renan, Julio e Wesley

---

## ADR-006 — AGENTS.md como regras globais da IA
- **Data:** 2026-11-11
- **Status:** aceita
- **Contexto:** Necessidade de manter o agente disciplinado ao longo de todo o projeto.
- **Opções consideradas:** A) Arquivo global único na raiz. B) Instruções coladas a cada sessão.
- **Decisão:** A) `AGENTS.md` na raiz, com papéis por etapa, portões, rastreabilidade e padrões.
- **Motivo:** Lido automaticamente pelo agente; fonte única de consulta em caso de dúvida.
- **Consequências:** Alterações exigem aprovação humana e novo ADR ou registro; versão no topo do arquivo.
- **Aprovado por:** Renan, Julio e Wesley

---

## ADR-007 — Convenções do domínio fixadas nas specs
- **Data:** 2026-11-11
- **Status:** aceita
- **Contexto:** As convenções C1 a C23 (AGENTS.md §10) precisavam ser fixadas para que as specs ficassem completas e o código regenerado produzisse os mesmos números.
- **Opções consideradas:** Para cada convenção, a alternativa mais simples de especificar e testar foi preferida.
- **Decisão (resumo):**
  - Unidades SI; x para a direita, y para cima, ângulo anti-horário, θ = 0 em +x, θ normalizado em (−π, π].
  - Integração de Euler com a orientação do início do tick; tempo = tick × dt; `dt` padrão 0.02 s.
  - Ordem do tick em 9 passos (Spec 001, FR-017).
  - Robôs circulares, obstáculos retangulares alinhados aos eixos, paredes nas bordas do mapa; colisão empurra o robô para fora sem alterar a orientação.
  - Regra do empurrão: separação simétrica ao longo da direção entre os centros no início do tick (equivale a choque de corpos de mesmo peso).
  - Bumper reflete o contato do tick anterior; odometria integra os comandos e ignora colisões.
  - Restrição `maxLinearSpeed × dt ≤ raio` para impedir atravessamentos.
  - Laser com raios partindo do centro, raio 0 à direita, leitura = alcance máximo quando nada é atingido; detecta paredes, obstáculos e outros robôs.
  - Controlador com `setup()`/`loop()`; erro desativa o robô sem parar a simulação; sem proteção contra laços infinitos.
  - Sumô: fora da arena quando a distância do centro à origem é maior que o raio; empate por tempo ou saída simultânea.
  - Arquivo de mundo em JSON (Q-009), laser em vez de sonar (Q-008), sem sensor de borda (Q-007), tolerância ±0.001 (Q-002), dimensões de mini-sumô (Q-006).
- **Motivo:** Simplicidade, determinismo e critérios de aceite numéricos verificáveis.
- **Consequências:** Specs 001, 002 e 003 completas. Qualquer mudança nestas convenções exige atualizar as specs e os exemplos numéricos.
- **Aprovado por:** Renan, Julio e Wesley

---

## ADR-008 — Stack tecnológica
- **Data:** 2026-11-11
- **Status:** aceita
- **Contexto:** A stack é livre, salvo restrições da trilha, e deve ser registrada na constitution (RB-10). Restrições relevantes: controlador em JavaScript (RB-35), núcleo headless (RB-27), visualização 3D no navegador (RB-21), sem motor de física (RB-29), cobertura ≥ 80% (RB-08).
- **Opções consideradas:** A) TypeScript + Vite + React + Three.js + Vitest. B) Núcleo em Python com interface web. C) Unity ou Godot exportando para web. D) Babylon.js. E) Núcleo em Rust/WebAssembly.
- **Decisão:** A), com CodeMirror 6 no editor, validador de mundo próprio, ESLint e Prettier, commitlint, GitHub Actions e GitHub Pages; Playwright opcional.
- **Motivo:** Mesma linguagem do controlador do usuário; mesmo código no Node e no navegador; Three.js citado no briefing e sem física embutida; ferramentas de cobertura nativas; site estático publicável como plano B da demo. B exigiria duas linguagens; C e D trazem física pronta e dificultam testes sem tela; E é desproporcional para uma PoC.
- **Consequências:** Detalhes na seção "Stack tecnológica" da constitution. Um único projeto com `src/core` e `src/ui`, com regra de lint impedindo o `core` de importar a `ui`.
- **Aprovado por:** Renan, Julio e Wesley

---

## ADR-009 — Leituras do laser alinhadas às poses do estado publicado

- **Data** 2026-11-17.
- **Status** Aceita.
- **Contexto.** S2-FR-007 define a leitura usada pelo controlador no início do passo. S2-FR-008
  define o conteúdo do estado publicado, usado pela inspeção e pelo replay (Q-010).
- **Opções consideradas.** A) Publicar as leituras das poses do próprio estado. B) Publicar as
  leituras usadas pelo controlador, com a identificação da pose anterior usada na medição.
- **Decisão.** A. Na transição de `k` para `k + 1`, o controlador observa as leituras do
  tick `k`. O estado publicado contém as leituras das poses registradas naquele estado,
  inclusive no tick 0, após o reset e no fim da luta.
- **Motivo.** A visualização pode desenhar raios e robôs usando o mesmo estado. Os estados
  gravados contêm os dados necessários para repetir a exibição.
- **Consequências.** S2-FR-007, S2-FR-008 e S2-FR-016 especificam as duas leituras. S3-FR-002
  e S3-FR-007 consomem as poses e os raios do mesmo estado publicado.
- **Aprovação.** Opção A confirmada na Q-010.

---

## ADR-010 — Carregamento do controlador antes do tick 0

- **Data** 2026-11-17.
- **Status** Aceita.
- **Contexto.** S2-FR-012 valida o controlador antes da simulação e S2-FR-013 executa
  `setup()` no primeiro passo. A Q-011 definiu o momento e o tratamento de falhas das
  instruções de nível superior.
- **Opções consideradas.** A) Executar instruções de nível superior no carregamento, sem a API do
  robô. B) Executá-las no primeiro passo com a API, antes de `setup()`.
- **Decisão.** A. O carregamento executa as instruções de nível superior antes do tick 0.
  Falhas nessa fase geram `CONTROLADOR_INVALIDO` e impedem o início. A API fica disponível
  durante `setup()` e `loop()`, incluindo os auxiliares chamados por elas.
- **Motivo.** A validação pode rejeitar um controlador antes de iniciar a simulação.
  Leituras, comandos e eventos ficam associados ao passo em execução.
- **Consequências.** O reset carrega uma instância nova antes de publicar o tick 0. A aplicação
  de um controlador na S3 usa a mesma validação, que preserva o controlador anterior se a
  proposta for inválida (S3-FR-024).
- **Aprovação.** Opção A confirmada na Q-011.

---

## ADR-011 — Histórico até o último tick executado

- **Data** 2026-11-17.
- **Status** Aceita.
- **Contexto.** S1-FR-033 expõe o histórico opcional da execução sem interface. Em uma luta
  de sumô, o tick final pode chegar antes do limite solicitado (Q-012).
- **Opções consideradas.** A) Guardar um estado por tick executado, incluindo o tick 0.
  B) Completar a lista até o limite solicitado com cópias do estado final.
- **Decisão.** A. O histórico termina no tick final e inclui esse estado uma única vez.
  Pedidos adicionais de avanço devolvem o mesmo estado final e preservam a lista.
- **Motivo.** Cada entrada corresponde a um tick da simulação, inclusive na linha do tempo
  da gravação.
- **Consequências.** S2-FR-032 aplica a regra ao histórico da execução sem interface e à
  consulta da simulação. O replay da S3 percorre somente os estados gravados (S3-FR-031).
- **Aprovação.** Opção A confirmada na Q-012.

---

## ADR-012 — Falhas de carregamento dos controladores na mesma resposta

- **Data** 2026-11-17.
- **Status** Aceita.
- **Contexto.** S2-FR-012 exige que os controladores sejam carregados e verificados antes do
  tick 0. A Q-013 definiu o que ocorre se mais de um controlador falhar na mesma execução.
- **Opções consideradas.** A) Reunir as falhas de carregamento. B) Encerrar a verificação na
  primeira falha, na ordem dos robôs no arquivo.
- **Decisão.** A. Com um mundo válido, a execução sem interface verifica todos os controladores
  fornecidos para os robôs do mundo. Cada falha gera um `CONTROLADOR_INVALIDO` em
  `controllers.<id>` na mesma resposta. Qualquer falha impede a publicação do tick 0.
- **Motivo.** O chamador pode corrigir as falhas em uma rodada, seguindo o padrão de reunir
  erros independentes da Spec 001 (S1-FR-035).
- **Consequências.** A biblioteca e a CLI devolvem os erros de carregamento na lista prevista
  por S1-FR-033. A edição de um único controlador na interface da S3 continua usando a
  validação de S3-FR-024. O ADR-014 detalha quais entradas seguem para o carregamento.
- **Aprovação.** Opção A confirmada na Q-013.

---

## ADR-013 — Fim da luta registrado como evento da partida

- **Data** 2026-11-17.
- **Status** Aceita.
- **Contexto.** S2-FR-031 publica `fim_da_luta` quando o sumô termina. A Q-014 definiu se o
  evento fica associado a um robô, o que afeta sua exibição no filtro de eventos da S3.
- **Opções consideradas.** A) Registrar um evento da partida em vitórias e empates.
  B) Associar o evento ao vencedor nas vitórias e à partida nos empates.
- **Decisão.** A. `fim_da_luta` é um único evento da partida no tick final, sem robô associado
  em vitórias ou empates. `resultado.vencedor` guarda o `id` do vencedor ou `null` em empate.
- **Motivo.** A associação do evento é a mesma em todos os desfechos e o resultado já contém
  a identificação do vencedor.
- **Consequências.** A S3 usa a associação do evento para o filtro por robô (S3-FR-027),
  consulta o resultado para mostrar o vencedor (S3-FR-028) e grava ambos os dados para o replay
  (S3-FR-030 e S3-FR-031).
- **Aprovação.** Opção A confirmada na Q-014.

---

## ADR-014 — Erros de entrada e de carregamento na mesma resposta

- **Data** 2026-11-17.
- **Status** Aceita.
- **Contexto.** A Q-015 identificou uma lacuna no contrato da execução sem interface quando
  erros de entrada e falhas de carregamento ocorrem na mesma chamada (CHK006).
- **Decisão.** Com um mundo válido, `ROBO_INEXISTENTE` e `ENTRADA_CONFLITANTE` decorrentes de
  uma entrada de controlador usam `controllers.<id>`. O carregamento é feito para controladores
  com ID existente e sem comando constante concorrente. O resultado reúne as falhas dessas
  cargas e os erros de entrada na mesma lista, e qualquer erro impede a publicação do tick 0.
- **Motivo.** A mesma resposta permite corrigir problemas independentes sem várias chamadas e
  preserva o acúmulo de falhas de carregamento definido no ADR-012.
- **Consequências.** S2-FR-011, S2-FR-012 e o Anexo E definem a lista que a biblioteca e a CLI
  devolvem. Os erros de comandos continuam seguindo S1-FR-035. A S3 valida a aplicação de um
  controlador por vez conforme S3-FR-024.
- **Aprovação.** Proposta da Q-015 aprovada pelo usuário.

---

## ADR-015 — Execução e contratos da Spec 002

- **Data** 2026-11-17.
- **Status** Proposta técnica registrada no planejamento da S2.
- **Contexto.** S2-FR-007 a FR-034 exigem execução síncrona de scripts, estado determinístico e
  contratos consumíveis no Node e no navegador. ADR-009 a ADR-014 definem o comportamento.
- **Alternativas avaliadas.** Execução nativa no ambiente do host, SES com escopo por
  controlador e QuickJS em WebAssembly. A pesquisa também compara opções de raycast,
  aleatoriedade, preparação e compatibilidade.
- **Desenho.** Usar SES e Acorn em adaptador injetado, com análise prévia do script
  síncrono e API por fase. Reutilizar a física da S1, derivar a leitura de cada snapshot e
  manter PRNG de 32 bits por robô. A v2 estende estado e erros e mantém as entradas de
  biblioteca e CLI. O evento de partida usa `robotId: null` na interface pública.
- **Motivo.** A separação mantém horário e entrada e saída fora do núcleo. As alternativas,
  resultados do ensaio isolado e vetores determinísticos estão no
  [relatório de pesquisa](../specs/002-sensores-controlador/research.md).
- **Consumidores.** A CLI mantém a resposta discriminada. A S3 prepara uma sessão candidata
  e usa o estado publicado para inspeção, filtro de eventos, resultado e replay.
  [Contratos da S2](../specs/002-sensores-controlador/contracts/core-api.md)

---

## ADR-016 — Fronteira síncrona dos controladores da Spec 002

- **Data** 2026-11-17.
- **Status** Aceita.
- **Contexto.** C01 e C02 da análise da S2 identificaram uma divergência na aceitação dos
  scripts e a possibilidade de trabalho agendado fora do tick no SES padrão.
- **Decisão.** A S2 aceita scripts JavaScript síncronos em modo estrito. As formas excluídas
  por FR-009 geram `CONTROLADOR_INVALIDO` em `controllers.<id>` antes do tick 0. A carga
  ocorre sem API do robô. Depois dela, o estado do script só muda em chamadas síncronas
  de `setup()` e `loop()`. Avançar em lote ou passo a passo produz os mesmos snapshots,
  eventos e histórico para as mesmas entradas.
- **Motivo.** O agendamento do host não determina a sequência nem o estado do script.
- **Consequências.** S2-FR-009, FR-012 e FR-024 definem o comportamento. O plano mantém
  a proposta de SES/Acorn do ADR-015 e acrescenta a atenuação das capacidades no adaptador.
  A CLI e a S3 compartilham a mesma validação de controladores. Os testes conferem rejeição
  antes do tick 0, disponibilidade de recursos e paridade entre as formas de avanço.
- **Aprovação.** Correções de C01 e C02 autorizadas pelo usuário.

## ADR-017 — Retrocesso de um tick na execução ao vivo

- **Data:** 2026-11-21
- **Status:** aceita
- **Contexto:** a equipe quer examinar uma batalha passo a passo nos dois sentidos.
- **Opções consideradas:** navegação exclusiva no replay ou retrocesso também na sessão ao vivo.
- **Decisão:** oferecer “Voltar 1 Tick” ao lado de “Avançar 1 tick” na sessão ao vivo parada, inclusive após o resultado. A continuação deve reproduzir a trajetória original.
- **Motivo:** a análise de uma colisão ou do fim da luta precisa preservar o estado da estratégia, seus sorteios e os eventos de cada passo.
- **Consequências:** revisão de S3-FR-012 e do contrato de operação da S3. O limite do arquivo de gravação e a API das estratégias continuam os definidos nas specs.
- **Aprovado por:** solicitante, no pedido de implementação do retrocesso ao vivo.

## ADR-018 — Empate por falta de progresso no sumô

- **Data** 2026-11-21. **Status** aceita pelo administrador na aprovação da funcionalidade.
- **Contexto** Um robô pode continuar acionando os motores contra outro corpo ou girando no lugar.
- **Opções consideradas** Comparar a odometria, comparar poses entre ticks adjacentes ou acompanhar os centros físicos desde o último progresso.
- **Decisão** Usar o deslocamento dos centros físicos após os contatos. A margem de 0.001 m corresponde à tolerância de aceitação S1-FR-040 e a 1% do diâmetro no Duelo padrão. O prazo fixo por rodada é 5, 10 ou 30 s de simulação. A interface inicia com 10 s. O administrador determinou reset automático com espera por ação explícita no tick zero.
- **Consequências** A S2 aceita o detector opcional. A S3 o ativa no sumô ao vivo, conserva o último empate e lê gravações anteriores. A biblioteca e a CLI mantêm o cenário histórico S2-SC-003 quando a opção é omitida.

- **Motivo** Comparar com o último centro de referência detecta movimento lento acumulado e conta o deslocamento provocado por empurrão.
- **Aprovado por** Wesley, administrador do projeto, em 2026-11-21.

## ADR-019 — Impasse durante o giro conjunto

- **Data e aprovação** 2026-11-21, Wesley. Decisão aceita como extensão da ADR-018.
- **Contexto** No Duelo padrão, dois Caçadores se encontram no tick 8. Enquanto giram, cada centro percorre um arco, o ponto médio fica estável e a folga entre os corpos chega a 1.92 mm.
- **Decisão** Contar também o tempo desde o contato físico dos dois robôs enquanto a folga for de até 2 mm e o ponto médio ficar a até 1 mm da referência. Um empurrão que ultrapasse a margem do ponto médio reinicia esse intervalo. Separação maior descarta o intervalo até novo contato. O critério individual da ADR-018 continua independente.
- **Alternativas** Medir apenas os dois centros perdeu o giro observado. Exigir contato em todos os ticks interromperia a contagem nos pequenos afastamentos. Contar desde a aproximação anteciparia o início do prazo.
- **Consequências** S2-FR-037 e S3-FR-040/041 passam a contemplar o giro. O seletor se chama “Regra de Tempo”. A versão 3 da gravação identifica a nova regra e permite reproduzir o contato observado. A versão 2 conserva a regra original.

## ADR-020 — Sensor de borda nos quatro lados do robô

- **Data e aprovação** 2026-11-21, Wesley. Decisão aceita. Substitui a decisão C23 da ADR-007.
- **Contexto** Na Q-007, o time deixou a detecção de borda no backlog. A odometria pode divergir da pose física durante um empurrão.
- **Opções consideradas** Estimar a aproximação por odometria ou oferecer a leitura do chão em pontos do próprio robô.
- **Decisão** Todo controlador de sumô pode consultar `readEdge()` dentro de `setup()` e `loop()`. Quatro pontos no perímetro acompanham frente, traseira, esquerda e direita. Cada ponto sinaliza a partir de 97.5% do raio da arena, inclusive para além da faixa branca. Em modo livre a leitura é nula.
- **Motivo** Os lados distinguem uma aproximação de frente de um empurrão lateral. A faixa já desenhada dá uma referência visível e a pose física mantém a leitura coerente com colisões.
- **Consequências** O contrato da API do controlador ganha uma revisão aditiva. O painel de inspeção deriva a mesma leitura do tick observado, inclusive em replays antigos. A decisão de reagir cabe a cada estratégia. Origem de S2-FR-038 e S3-FR-042.

## ADR-021 — Labirinto com progressão manual

- **Data** 2026-11-22
- **Status** Aceita por Wesley.
- **Contexto e opções** O cenário livre demonstra colisão e sensores. Para oferecer navegação com chegada, avaliamos alterar o comportamento do modo livre ou acrescentar uma modalidade de exploração.
- **Decisão** Acrescentar três mapas fixos, com 2, 4 e pelo menos 6 bifurcações na rota mais curta, respectivamente. Usar um robô idêntico nos três níveis. O centro físico determina a chegada. O usuário inspeciona o tick final e escolhe se avança com sua estratégia aplicada.
- **Consequências** A Sala permanece como mundo livre de arquivo. O sumô continua como demonstração definida pela ADR-003. A modalidade adicional usa os contratos S1-FR-041, S2-FR-039 e S3-FR-043.

## ADR-022 — Escolher modo e dificuldade em listas distintas

- **Data** 2026-11-22
- **Status** Aceita por Wesley.
- **Contexto e opções** O seletor enumerava o Duelo e os três mapas de labirinto no mesmo nível. A escolha aprovada agrupa os mapas por modalidade.
- **Decisão** Oferecer Sumô e Labirinto em Modo. Mostrar Dificuldade ao lado apenas no Labirinto, com Fácil, Médio e Difícil. A entrada no Labirinto abre o Fácil pausado. A troca direta de dificuldade preserva a estratégia e abre o mapa pausado no tick 0, como Próximo nível.
- **Consequências** Revisão da operação da S3 (FR-019, FR-043, FR-044). A interface reflete a modalidade do mundo carregado e identifica arquivos fora do catálogo pelo nome.

## ADR-023 — Largada de cinco segundos no sumô

- **Data** 2026-11-22. **Status** Aceita por Wesley.
- **Contexto e opções** Verificar o deslocamento físico deixaria passar uma tentativa contra um obstáculo ou um comando sobrescrito. A equipe escolheu julgar a intenção declarada no tick.
- **Decisão** Todo sumô ao vivo aguarda 5 s de tempo simulado. Um infrator concede um ponto da rodada ao adversário. Dois infratores no mesmo tick empatam, ambos com zero. A rodada encerrada aguarda ação do operador.
- **Consequências** S2-FR-040 e S3-FR-045. A duração é fixa. Geometria, sensores e demais modalidades conservam seus contratos. O placar desta decisão pertence à rodada. Acumulação entre lutas continua fora do escopo.
