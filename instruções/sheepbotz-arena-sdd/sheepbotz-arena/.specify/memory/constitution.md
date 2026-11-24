<!--
Relatório de sincronização
- Versão: (template) → 1.0.0
- Princípios criados: I a IX (todos novos)
- Seções criadas: Stack tecnológica, Modalidade, Restrições adicionais, Fluxo de desenvolvimento e portões de qualidade, Governança
- Templates a verificar: .specify/templates/plan-template.md (Constitution Check deve listar os princípios I a IX),
  .specify/templates/tasks-template.md (formato de task e rastreabilidade do Princípio VI)
- Pendências: nenhuma
-->

# Constitution — SheepBotz Arena

Simulador genérico de robôs móveis no navegador, para a equipe Univille SheepBotz, com lógica 2D, visualização 3D e modalidade de demonstração **sumô**. Projeto desenvolvido como prova de conceito com Spec-Driven Development (GitHub SpecKit).

Esta constitution define os princípios inegociáveis do projeto. Ela prevalece sobre specs, plans, tasks e sobre o `AGENTS.md`, e só é superada pelo enunciado do trabalho (`docs/enunciado.md`).

---

## Princípios fundamentais

### I. A especificação é o produto

- A especificação DEVE ser capaz de recriar o sistema sem acesso ao código. Todo comportamento observável DEVE estar escrito nos artefatos (spec, plan, tasks); o que existe só no código é considerado não especificado.
- Specs DEVEM descrever o quê e o porquê, em user stories com critérios de aceite verificáveis, e NÃO DEVEM conter decisões de tecnologia. Contratos visíveis ao usuário (arquivo de mundo, API do controlador, mensagens de erro) são permitidos.
- Plans DEVEM conter as decisões técnicas, com alternativas e justificativas. Tasks DEVEM ser fatias verticais rastreáveis até a spec.
- Toda mudança de comportamento DEVE seguir a ordem spec → plan → tasks → código.
- Critérios de aceite com comportamento numérico DEVEM trazer valores concretos, unidades e tolerância.

**Razão:** o critério "Teste da Spec" avalia o código regenerado a partir dos artefatos (RB-06).

### II. Núcleo headless e determinístico

- O núcleo de simulação DEVE rodar sem interface gráfica, em Node e no navegador, com o mesmo código.
- O núcleo DEVE ser determinístico: mesmo mundo, mesmos controladores ou comandos, mesma semente e mesmo número de ticks produzem estados idênticos em todos os ticks.
- O núcleo NÃO DEVE usar relógio real, aleatoriedade sem semente (`Math.random`), rede, armazenamento, DOM ou qualquer API de navegador.
- Toda aleatoriedade DEVE vir de um gerador com semente, injetado explicitamente.
- O passo de tempo DEVE ser fixo durante a simulação, e o tempo DEVE ser calculado como `tick × dt`.

**Razão:** restrição da trilha (RB-27) e base dos testes de aceitação e do replay.

### III. Física própria, sem motores prontos

- Cinemática, colisões, empurrão entre robôs e raycast DEVEM ser implementados no projeto, exatamente como definidos nas specs.
- É PROIBIDO usar qualquer motor ou biblioteca de física (por exemplo, cannon-es, rapier, ammo.js, matter.js, oimo.js).
- A matemática de geometria DEVE ficar em módulos próprios, com testes dedicados aos casos de borda.

**Razão:** restrição da trilha (RB-29) e garantia de que todo comportamento é especificável e testável.

### IV. A interface apenas mostra e comanda

- O renderizador e a interface DEVEM apenas ler estados produzidos pelo núcleo e enviar comandos de operação (executar, pausar, avançar, reiniciar, carregar).
- A interface NÃO DEVE calcular movimento, colisão, leitura de sensor ou resultado de luta.
- O passo da simulação NÃO DEVE depender da taxa de quadros da tela.
- A dependência é sempre de fora para dentro: `ui` → `core`. O `core` NÃO DEVE importar nada da `ui`.

**Razão:** restrição da trilha (RB-28) e separação que permite testar o núcleo sozinho.

### V. Testes como contrato

- No núcleo, o teste do critério de aceite DEVE ser escrito antes da implementação (TDD).
- Todo critério de aceite das specs DEVE ter ao menos um teste automatizado cujo nome comece pelo ID global do critério (por exemplo, `S1-US2-AC4`).
- A cobertura de linhas DEVE ser de no mínimo **80%** no projeto (bloqueia o merge), com meta de **90%** no `core`.
- Testes DEVEM ser determinísticos: proibido depender de tempo real, rede ou ordem de execução. Comparações numéricas DEVEM usar a tolerância da spec.
- É PROIBIDO enfraquecer uma asserção para fazer um teste passar.
- O README DEVE exibir no início a quantidade de testes e o percentual de cobertura (ex.: `142 testes · 87% de cobertura`), gerados a partir dos relatórios reais.

**Razão:** exigências do trabalho (RB-08, RB-09, RB-16) e proteção contra regressões.

### VI. Rastreabilidade total

- Todo requisito funcional DEVE ter origem: um `RB-##` do briefing ou um `ADR-###`.
- Toda task DEVE citar a user story e os requisitos que atende.
- Todo commit DEVE seguir o formato `<tipo>(S<n>-T###): <descrição>` com a linha `Requisitos: S<n>-FR-###`; commits de artefatos usam o artefato como escopo (por exemplo, `docs(S1-spec)`).
- Uma task por commit; nunca várias tasks no mesmo commit.
- `docs/rastreabilidade.md` DEVE ser atualizado no fechamento de cada spec.

**Razão:** exigência do trabalho (RB-12).

### VII. Simplicidade de prova de conceito

- O escopo DEVE seguir a ordem: mínimo → completo → bônus.
- NÃO DEVE ser implementado nada que nenhuma spec peça (sem generalizações, opções ou abstrações antecipadas).
- Ideias fora da spec ativa DEVEM ir para `docs/backlog.md`.
- Cada dependência externa DEVE ser justificada no plan.

**Razão:** o trabalho valoriza uma PoC pequena, bem especificada e funcionando (RB-07).

### VIII. Interface clara para a equipe e para a plateia

- Toda a interface DEVE estar em pt-BR, com números no formato pt-BR.
- Controles DEVEM ser acessíveis por teclado, com foco visível, rótulo textual e contraste mínimo de 4,5:1.
- Informação NÃO DEVE ser transmitida apenas por cor.
- Erros (de mundo, de controlador, de gravação) DEVEM ser mostrados com mensagens claras, sem travar a aplicação.

**Razão:** o público são membros da equipe SheepBotz e a plateia do pitch (RB-17, RB-20).

### IX. Modalidade como configuração

- O núcleo DEVE permanecer genérico: as regras do sumô ficam isoladas e só se aplicam quando o mundo declara `match.mode = "sumo"`.
- Mundos e controladores de exemplo DEVEM ser dados, não código especial no núcleo.

**Razão:** restrição da trilha (RB-26).

---

## Stack tecnológica

Decisão registrada em ADR-008. Mudanças exigem novo ADR e emenda desta constitution.

| Camada | Escolha | Justificativa |
|---|---|---|
| Linguagem | TypeScript em modo estrito | Controladores do usuário são JavaScript (RB-35); mesmo código no Node e no navegador |
| Ambiente | Node LTS atual | Testes e execução sem interface |
| Build e servidor de desenvolvimento | Vite | Rápido, simples, gera site estático |
| Interface | React | Painéis, abas, editor e linha do tempo com manutenção simples |
| Cena 3D | Three.js, usado diretamente (sem react-three-fiber) | Citado no briefing (RB-21); sem física embutida; deixa explícito que a cena só lê o estado |
| Editor de código | CodeMirror 6 | Leve, com números de linha e realce de sintaxe |
| Arquivo de mundo | JSON, com validador próprio | Catálogo de erros específico da Spec 001 (códigos, caminhos, todos os erros) |
| Testes e cobertura | Vitest com cobertura v8; jsdom e Testing Library para a interface | Relatório e limite mínimo nativos |
| Testes ponta a ponta | Playwright, poucos fluxos da demo (opcional) | Confiabilidade da demo ao vivo |
| Lint e formatação | ESLint e Prettier | Inclui regra que proíbe o `core` de importar a `ui` e de usar `Math.random`, `Date` e APIs de navegador |
| Commits | commitlint | Valida o formato do Princípio VI |
| CI e publicação | GitHub Actions e GitHub Pages | Testes, cobertura, conferência do README e publicação da demo |

**Estrutura:** um único projeto com `src/core` (núcleo, sem dependências de interface) e `src/ui` (interface e cena). Dependências com versões exatas e arquivo de lock versionado.

---

## Modalidade: sumô

Decisão registrada em ADR-003.

- **Arena:** círculo centrado na origem, raio padrão 0,385 m (referência de mini-sumô, a confirmar em Q-006).
- **Robôs:** dois, circulares, raio padrão 0,05 m.
- **Vitória:** o robô cujo centro sair da arena perde; os dois saindo no mesmo tick é empate; atingir o limite de ticks é empate.
- **Mundos de exemplo:** "Duelo padrão" (sumô) e "Sala com obstáculos" (modo livre, demonstra que o núcleo é genérico).
- **Controladores de exemplo:** Parado, Avança, Girador, Caçador e Desviador.

As regras completas estão nas Specs 001 e 002.

---

## Restrições adicionais

- O sistema funciona inteiramente no navegador, sem servidor, login ou banco de dados. Não há coleta de dados pessoais.
- Controladores são código escrito pela própria equipe e executam no mesmo processo; o isolamento é de acesso a dados, não de segurança contra código malicioso.
- Itens de bônus (Portugol com meuPiá Maker, controle remoto via WebSocket) só entram após o fechamento da Spec 003, e o meuPiá só pode ser usado pelas interfaces públicas, sem modificar seu código (RB-18).
- Todos os artefatos são escritos em Markdown e em pt-BR. Identificadores de código são escritos em inglês.

---

## Fluxo de desenvolvimento e portões de qualidade

- **Specs:** o projeto tem três specs, executadas em sequência: 001 (mundo e núcleo), 002 (sensores, controlador e sumô) e 003 (visualização e operação). Cada uma tem sua branch `00N-*`.
- **Etapas por spec:** clarify → plan → tasks → analyze → implement, com os portões definidos no `AGENTS.md` §4. Nenhuma etapa é pulada.
- **Constitution Check:** todo plan DEVE verificar os princípios I a IX e justificar qualquer exceção em ADR.
- **CI obrigatório em todo push e pull request:** lint, testes, cobertura mínima de 80%, formato dos commits e conferência de que a linha de testes e cobertura do README corresponde aos relatórios.
- **Merge na `main`:** só com CI verde. Ao fechar uma spec: rastreabilidade atualizada, `quickstart.md` executado do zero e tag `spec-00N-fechada`.
- **Ensaio de regeneração:** ao fechar cada spec e antes da entrega final, conforme `AGENTS.md` §18.

---

## Governança

- Esta constitution prevalece sobre todos os outros artefatos do projeto, exceto o enunciado do trabalho.
- Emendas exigem: proposta registrada em ADR, aprovação de um integrante do time, atualização deste arquivo e do relatório de sincronização no topo, e revisão dos artefatos afetados.
- Versionamento semântico: **MAJOR** para remoção ou redefinição incompatível de princípio; **MINOR** para princípio ou seção nova, ou expansão relevante; **PATCH** para esclarecimentos de redação.
- A conformidade é verificada no Constitution Check de cada plan, no `/speckit.analyze` e no fechamento de cada spec.
- Em caso de dúvida operacional, consultar o `AGENTS.md`; em caso de conflito, esta constitution prevalece e o conflito é registrado em `docs/perguntas.md`.

**Versão:** 1.0.0 · **Ratificada em:** 2026-11-11 · **Última emenda:** 2026-11-11
