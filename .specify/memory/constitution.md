<!--
Relatório de sincronização — 2026-11-17
- Versão: 1.0.0 (constituição ratificada no dossiê) → 1.0.1 (consolidação editorial na raiz).
- Princípios I a IX: preservados; redação e referências ajustadas ao repositório atual.
- Seções reorganizadas: stack, modalidade e restrições reunidas em Diretrizes de arquitetura.
  Fluxo de desenvolvimento, portões de qualidade e governança preservados.
- Seções removidas: nenhuma regra removida.
- Templates: a estrutura do template ativo foi aplicada. Os templates de plan e tasks continuam
  disponíveis para o fluxo normal. O Constitution Check da S1 usa os mesmos nove princípios.
- Pendências: nenhum campo da constituição. Divergências e perguntas externas registradas em
  docs/registro-de-consolidacao.md e docs/perguntas.md.
-->

# Constituição do SheepBotz_Arena

O SheepBotz Arena é uma prova de conceito para a equipe Univille SheepBotz. Simula robôs móveis no
navegador, com lógica 2D, visualização 3D e sumô como modalidade de demonstração. O projeto segue
Spec-Driven Development com GitHub Spec Kit (ADR-001 a ADR-003).

## Core Principles

### I. A especificação é o produto

- Os artefatos DEVEM permitir regenerar o sistema a partir de uma sessão sem acesso ao código de
  produção. Todo comportamento observável DEVE estar especificado.
- A spec DEVE definir comportamento, motivação, contratos públicos e critérios de aceite
  verificáveis. Decisões de tecnologia e as alternativas avaliadas DEVEM ficar no plan. As tasks
  DEVEM decompor o trabalho em fatias verificáveis e rastreáveis.
- Toda mudança de comportamento DEVE seguir a ordem spec → plan → tasks → código. Critérios de
  aceite numéricos DEVEM declarar valores, unidades e tolerâncias aplicáveis (RB-06).

### II. Núcleo headless e determinístico

- O mesmo núcleo DEVE rodar em Node e no navegador. O núcleo NÃO DEVE acessar relógio real,
  aleatoriedade global, rede, disco, armazenamento nem APIs de interface ou de um ambiente específico.
- Mundo, controladores ou comandos, semente e número de ticks iguais DEVEM produzir estados iguais
  a cada tick em todas as execuções com essas entradas. A ordem de processamento DEVE ser explícita.
- Cada execução DEVE usar um `dt` fixo e calcular `time = tick × dt`. A aleatoriedade DEVE vir de um
  gerador com semente fornecido explicitamente (RB-27).

### III. Física própria

- Cinemática, colisões, empurrão e raycast DEVEM ser implementados no projeto conforme as specs.
  Motores e bibliotecas de física são proibidos (RB-29).
- A geometria DEVE ficar em módulos próprios e ter testes dedicados aos casos de borda.

### IV. A interface apenas mostra e comanda

- O renderizador DEVE ler os estados do núcleo. A interface DEVE enviar comandos de operação pela
  API e manter o agendamento de ticks independente da frequência de desenho (RB-28).
- Movimento, colisão, sensores e resultado pertencem ao domínio da simulação. UI e CLI DEVEM
  depender da API pública do núcleo. O núcleo DEVE permanecer independente desses adaptadores.

### V. Testes como contrato

- O teste de aceite do núcleo DEVE preceder a implementação. Cada critério de aceite DEVE ter pelo
  menos um teste automatizado cujo nome comece pelo ID global, como `S1-US2-AC4`.
- Testes DEVEM ser independentes de tempo real, rede e ordem de execução. Comparações numéricas
  DEVEM usar a tolerância da spec quando ela se aplicar. É proibido enfraquecer uma asserção para
  fazer um teste passar.
- O merge exige ao menos **80% de cobertura de linhas no projeto**. A meta do núcleo é **90%**.
  Limites específicos de uma spec também se aplicam. O relatório DEVE ser comprovável no
  repositório e os totais no topo do README DEVEM ser gerados a partir dos relatórios reais
  (RB-08, RB-09 e RB-16).

### VI. Rastreabilidade total

- Cada requisito funcional DEVE citar um `RB-##` do briefing ou um `ADR-###`. Cada task de
  comportamento DEVE citar a história e os requisitos que atende. Tasks transversais DEVEM citar
  os requisitos ou decisões correspondentes.
- Cada commit de implementação DEVE se limitar a uma task e usar o cabeçalho
  `<tipo>(S<n>-T###): <descrição>` com a linha `Requisitos: S<n>-FR-###`. Commits de artefatos
  DEVEM indicar o artefato no escopo, como `docs(S1-spec)` ou `docs(constitution)`.
- A [matriz de rastreabilidade](../../docs/rastreabilidade.md) DEVE ser atualizada ao fechar cada
  spec (RB-12).

### VII. Simplicidade de prova de conceito

- O desenvolvimento DEVE seguir a ordem mínimo → completo → bônus. Comportamento de produto
  DEVE ter respaldo na spec ativa. Cada dependência externa DEVE ter justificativa no plan (RB-07).
- Ideias fora do escopo DEVEM ser registradas no [backlog](../../docs/backlog.md).

### VIII. Interface clara para a equipe e para a plateia

- Interface, formatação numérica visível e mensagens de erro DEVEM usar pt-BR. Controles DEVEM
  oferecer acesso por teclado, indicação visível de foco, rótulo textual e contraste mínimo de
  4,5:1. A informação DEVE permanecer compreensível sem distinção por cor (RB-17 e RB-20).
- A aplicação DEVE tratar erros de mundo, controlador e gravação conforme os respectivos contratos
  e exibir mensagens claras.

### IX. Modalidade como configuração

- O núcleo genérico DEVE funcionar no modo livre. As regras e condições de vitória do sumô DEVEM
  ficar isoladas e só se aplicar quando `match.mode = "sumo"` (RB-26 e ADR-003).
- Mundos e controladores de exemplo DEVEM entrar pelas mesmas interfaces que os dados do usuário.

## Diretrizes de arquitetura

O projeto DEVE usar um pacote TypeScript em modo estrito, com versões exatas de dependências e
arquivo de lock versionado. A direção das dependências é `src/ui → src/core ← src/cli`.
Geometria, validação, estado e regras de simulação ficam no domínio. E/S, relógio de apresentação
e integração com o ambiente ficam nos adaptadores. A aplicação web DEVE funcionar como site
estático, sem servidor de aplicação, login, banco de dados ou coleta de dados pessoais.

| Camada | Stack decidida no ADR-008 |
|---|---|
| Ambiente e build | Node LTS para execução headless e ferramentas. Vite para desenvolvimento e build. |
| Interface e cena | React, Three.js diretamente e CodeMirror 6. |
| Mundo | JSON com validador próprio e erros estruturados. |
| Testes | Vitest com cobertura v8. jsdom e Testing Library para a UI. Playwright opcional para fluxos da demo. |
| Qualidade | ESLint para código e fronteiras de importação, Prettier e commitlint. |
| CI e publicação | GitHub Actions e GitHub Pages. |

Os controladores JavaScript são escritos pela equipe e operam no mesmo processo, com acesso aos
dados do simulador limitado à API documentada. A PoC pressupõe código de controlador confiável.
As fronteiras, a ordem de evolução e os contratos estão no [guia de arquitetura](../../docs/arquitetura.md).

Para o sumô, o mundo "Duelo padrão" usa arena circular centrada na origem com raio de 0,385 m e
dois robôs circulares com raio de 0,05 m. A saída é definida pelo centro do robô além do raio. Uma
saída dá vitória ao oponente. A saída simultânea ou o limite de ticks resulta em empate, conforme
a ordem definida na [Spec 002](../../specs/002-sensores-controlador/spec.md). "Sala com obstáculos"
demonstra o modo livre. Os cinco controladores de exemplo estão no Anexo D da Spec 002.

Os artefatos do projeto DEVEM usar Markdown e pt-BR, com identificadores de código em inglês.
Portugol com meuPiá Maker e controle remoto via WebSocket só entram após fechar a Spec 003. O
meuPiá só pode ser usado por suas interfaces públicas, conforme RB-18.

## Fluxo de desenvolvimento e portões de qualidade

- O desenvolvimento DEVE fechar as specs em ordem, em branches `00N-*`: 001 (mundo e núcleo),
  002 (sensores, controlador e sumô) e 003 (visualização e operação).
- Cada spec DEVE passar pelos portões do [AGENTS.md, §4](../../AGENTS.md#4-fluxo-sdd-com-speckit-e-portões-de-qualidade),
  da especificação ao fechamento. O Constitution Check de cada plan DEVE avaliar I a IX e
  justificar exceções em ADR. A análise de consistência DEVE preceder a implementação.
- O CI DEVE executar lint, testes, cobertura, verificação do formato dos commits e conferência
  das métricas do README em push e pull request. A `main` só recebe merge com CI verde.
- O fechamento de cada spec exige rastreabilidade atualizada, execução do quickstart do zero,
  registro do ensaio de regeneração e tag `spec-00N-fechada`. O ensaio também é exigido antes da
  entrega final. Os resultados DEVEM constar no [registro de ensaios](../../docs/ensaio-regeneracao.md).

## Governance

- O [enunciado](../../docs/enunciado.md) tem precedência. Esta constituição orienta e prevalece
  sobre specs, plans, tasks e instruções operacionais. Divergências DEVEM ser registradas em
  [perguntas e pendências](../../docs/perguntas.md) para revisão do artefato competente.
- Emendas exigem proposta no [registro de decisões](../../docs/decisoes.md), aprovação de um
  integrante do time, relatório de sincronização e revisão dos artefatos afetados. Mudanças de
  stack exigem ADR e emenda. Mudanças em contratos públicos exigem ADR e revisão dos consumidores.
- A versão segue SemVer. **MAJOR** aplica-se a remoções ou redefinições incompatíveis. **MINOR**
  aplica-se a novos princípios, novas regras ou ampliações materiais. **PATCH** aplica-se a
  correções e esclarecimentos editoriais.
- Cada plan, análise de consistência, revisão de mudança e fechamento de spec DEVE verificar
  conformidade, com evidência no artefato da etapa.

**Version**: 1.0.1 | **Ratified**: 2026-11-11 | **Last Amended**: 2026-11-17
