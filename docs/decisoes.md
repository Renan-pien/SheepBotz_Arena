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
