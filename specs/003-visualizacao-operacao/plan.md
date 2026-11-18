# Plano de implementação · Visualização 3D e operação

**Branch** `003-visualizacao-operacao` · **Data** 2026-11-18 · [Spec 003](spec.md)

## Resumo

A aplicação React conduz a sessão ao vivo através da API pública da S2 e passa
o mesmo snapshot à cena e aos painéis. Uma sessão de replay apenas percorre
estados validados. O núcleo e a CLI permanecem sob seus contratos atuais.

## Contexto técnico

| Item | Diretriz |
|---|---|
| Stack | TypeScript estrito, React e Vite existentes, Three.js 0.187.0 e CodeMirror 6 conforme ADR-008. Versões exatas em [pesquisa](research.md). |
| Dados | Textos de mundo e controlador em memória. Importação e exportação locais por arquivo. Nunca carregar recursos da rede para a demo. |
| Plataforma | Chrome, Edge e Firefox desktop com WebGL 2. O aviso de indisponibilidade gráfica conserva os controles e a inspeção. |
| Testes | Vitest, Testing Library e jsdom para modelo de sessão, propriedades da cena e integração da interface. Chromium para WebGL real, arquivos e desempenho. |
| Limites | Até 8 robôs, 360 raios por robô, 100 obstáculos validados pelo núcleo e 100 001 snapshots de uma gravação. |
| Metas | 30 fps a 1× e feedback de controles em menos de 100 ms. Medir no quickstart, fora das asserções temporais do CI. |

## Constitution Check

| Princípio | Decisão e evidência |
|---|---|
| I · Spec primeiro | S3 deriva da pasta de instruções e da S2. As seis histórias, 39 FRs e 49 cenários constam da spec. |
| II · Núcleo determinístico | Relógio e velocidade pertencem à UI, o núcleo avança um tick por chamada e reaproveita a semente do mundo. |
| III · Física própria | Cena calcula projeção visual e segmentos dados pelo snapshot, usando a física da S2. |
| IV · Mostrar e comandar | `src/ui` depende das fachadas de `src/core` e do adaptador de runtime. Nenhuma dependência inversa. |
| V · Testes como contrato | Um teste por ID global, sem timeout temporal na suíte. Cobertura ≥ 80% no projeto e ≥ 90% no núcleo. |
| VI · Rastreabilidade | Origem na spec, FR e cenário nas tasks e registro de métricas por tarefa. |
| VII · PoC | Um pacote estático, dependências do ADR-008. Mínimo US1–US3, completo US4–US5, depois US6. |
| VIII · Interface clara | pt-BR, contraste, foco, rótulos, alternativas textuais e mensagens estruturadas. |
| IX · Modalidade como configuração | O resultado vem da S2 e o modo livre conserva seu comportamento. |

A revisão pós-design confronta o [modelo](data-model.md), os [contratos de operação](contracts/operacao.md) e de [gravação](contracts/gravacao.md) com os nove princípios. Nenhuma exceção à constituição foi identificada.

## Estrutura do projeto

```text
src/ui/
├── App.tsx e arena.css
├── arena/{catalog,session,clock,recording,recording-state}.ts
├── scene/{projection,camera,graphics}.ts e ArenaView.tsx
└── panels/{Controllers,CodeEditor,Inspection,Events}.tsx
tests/ui/
├── app.test.tsx
└── s3/{us1-cena,us2-operacao,us3-controladores,us4-inspecao,us5-replay,us6-apresentacao}.test.tsx
specs/003-visualizacao-operacao/
├── plan.md, research.md, data-model.md e quickstart.md
├── contracts/{operacao,gravacao}.md
├── checklists/
└── tasks.md
```

### Sessão e relógio

A abertura inicial prepara o Duelo com Caçador e Girador. O catálogo importa
os arquivos em UTF-8 como texto. `ArenaSession` publica um único `SessionView`
para consumo por `useSyncExternalStore`. A sessão valida mundo e scripts por
`loadWorld` e `prepareSimulation` com um único motor inicializado no
adaptador. Cargas completas são candidatas antes da troca de sessão. Aplicar
um editor preserva o rascunho dos outros. Falhas apresentam os erros e
preservam o modo, o snapshot, as fontes aplicadas e a gravação em curso.

O relógio da UI acumula o tempo por um timer periódico, independente de
`requestAnimationFrame`. Cada passo devido chama `simulation.step()`. A
reprodução começa sem saldo acumulado e pausa ao ocultar a página.
O limite de 64 passos por callback preserva responsividade. Quando há mais
passos devidos, a UI descarta o excedente de orçamento temporal, mostra
o aviso e prossegue a partir do próximo tick. A gravação incorpora cada
tick executado, inclusive ticks intermediários de um mesmo callback.

### Cena

O plano lógico `(x, y)` vira `(x, h, -y)` na cena Three.js. A vista inicial
olha de `(0, altura, +distância)` para a origem. A câmera de cima olha
do eixo vertical e usa `(0,0,-1)` como direção de cima da tela. A frente
do robô local é +X, rotacionada de `theta` no eixo Y. Cilindros têm centro
a `radius / 2` e altura `radius`. Ray endpoints usam `theta + offset` e
a leitura do snapshot, com um marcador quando o valor é menor que o alcance.
Mapas, obstáculos, robôs e arena desenham proporções em metros. A câmera ajusta elevação e
FOV para enquadrar mapas grandes dentro da faixa de zoom. A projeção dos
cantos garante o enquadramento nos dois eixos da tela. O contorno
de saída decorre de `resultado.motivo` e `resultado.vencedor` em sumô.

A cena tem seu próprio ciclo de desenho e ajuste por dimensão. Câmeras
perspectiva e superior, controles orbitais, geometria e materiais pertencem
ao adaptador visual e são descartados ao desmontar ou trocar de mundo.
Rótulos e ícones de alerta podem ser projetados como elementos acessíveis
sobre a cena. O seletor de raios e rótulos altera somente a visibilidade.

### Arquivos e replay

Arranjos de eventos cumulativos são compartilhados nos snapshots vivos.
No arquivo, cada snapshot referencia um prefixo validado de uma única
lista ordenada de eventos. O importador reconstrói o estado da S2 e reutiliza
prefixos com o mesmo tamanho. Códigos dos controladores são lidos como
dados. Somente voltar ao vivo tenta preparar scripts. O formato e as
rejeições são detalhados no [contrato de gravação](contracts/gravacao.md).

## Mapeamento requisito → módulo

| Requisitos | Módulos e caso de aceite |
|---|---|
| FR-001 a FR-004 | Fachada S2, `arena/session.ts`, `arena/clock.ts` e snapshot comum em `App.tsx`. US1, US2 e US4. |
| FR-005 a FR-011 | `scene/projection.ts`, `camera.ts`, `graphics.ts` e `ArenaView.tsx`. US1. |
| FR-012 a FR-018 | Máquina de sessão, relógio e controles do `App`. US2. |
| FR-019 a FR-025 | `catalog.ts`, `session.ts`, `Controllers.tsx` e `CodeEditor.tsx`. US3. |
| FR-026 a FR-028 | `Inspection.tsx`, `Events.tsx` e resultado do `App`. US4. |
| FR-029 a FR-035 | `recording.ts`, `recording-state.ts`, sessão e controles no `App`. US5. |
| FR-036 a FR-039 | `App.tsx`, `arena.css` e foco dos painéis. US6. |

## Testes e validação

Os testes de aceitação recebem IDs globais S3-USn-ACn. A mudança da tela
inicial mantém a verificação de montagem da S1 com o novo título oficial.
Os cenários de carga, replay e paridade com a S2 exercitam a fachada real
quando viável. Testes da cena sem WebGL usam a projeção e a geometria
inspecionáveis. O quickstart mede em Chromium o percurso completo sem
misturar o relógio em tempo real com a suíte determinística.

[Pesquisa](research.md) · [Modelo](data-model.md) · [Quickstart](quickstart.md)
