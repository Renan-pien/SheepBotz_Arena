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

## Interfaces internas verificadas pela suíte

Os testes determinísticos injetam um `ControllerEngine`. A inicialização
SES real fica no navegador e nos testes Node. Em jsdom, o motor injetado
mantém o teste da interface no ambiente suportado.

### Catálogo e sessão

`arena/catalog.ts` exporta `worldPresets` com chaves `duelo` e `sala`,
campos `{name, text, defaults}` e texto original do mundo. Exporta
`controllerPresets` com chaves `parado`, `avanca`, `girador`, `cacador`
e `desviador`, cada uma com `{name, source}`. `source` preserva espaços
e linhas do arquivo.

```ts
// arena/session.ts
type PlaybackSpeed = 0.25 | 0.5 | 1 | 2 | 4;
type SessionStatus = 'pronta' | 'executando' | 'pausada' | 'finalizada';
type ControllerPreset = keyof typeof controllerPresets;
type WorldPreset = keyof typeof worldPresets;

interface SessionView {
  readonly world: World;
  readonly worldText: string;
  readonly snapshot: SimState;
  readonly controllers: Readonly<Record<string, string>>;
  readonly drafts: Readonly<Record<string, {
    source: string;
    example: ControllerPreset;
  }>>;
  readonly errors: readonly { code: string; path: string; message: string }[];
  readonly mode: 'live' | 'replay';
  readonly status: SessionStatus;
  readonly speed: PlaybackSpeed;
  readonly behind: boolean;
  readonly limitReached: boolean;
  readonly replayLast: number | null;
  readonly preset: WorldPreset | '';
}

export class ArenaSession {
  constructor(engine?: ControllerEngine);
  getSnapshot(): SessionView;
  subscribe(listener: () => void): () => void;
  play(): void;
  pause(): void;
  setSpeed(speed: PlaybackSpeed): void;
  pulse(elapsedMs: number): void;
  step(): void;
  reset(): void;
  openWorld(text: string, preset?: WorldPreset | ''): void;
  chooseWorld(preset: WorldPreset): void;
  editSource(id: string, source: string): void;
  selectExample(id: string, example: ControllerPreset): void;
  restoreExample(id: string): void;
  apply(id: string): void;
  history(): readonly SimState[];
  recording(): Recording;
  enterReplay(): void;
  openRecording(text: string): void;
  seek(tick: number): void;
  back(): void;
  exitReplay(): void;
}
```

`getSnapshot` devolve a mesma referência até a próxima mudança. Ele e
`subscribe` podem ser passados diretamente a `useSyncExternalStore`.
Injetar o motor substitui a inicialização SES.
`pulse` recebe **o intervalo transcorrido em milissegundos** e consome
o orçamento aplicável desde a primeira chamada durante execução.
`behind` marca pulsos com mais de 64 passos devidos e limpa quando a
execução acompanha o ritmo. `limitReached` acusa o limite inclusivo.
`history` consulta snapshots gravados ao vivo ou do replay aberto.
`seek` publica o snapshot existente no índice limitado e pausa.
Ao avançar ou reproduzir até o fim do replay, o status torna-se
`finalizada`. Voltar e selecionar outro tick permanecem disponíveis.

`App` é o componente React nomeado de `src/ui/App.tsx`. A prop
`{session?: ArenaSession}` injeta a sessão. Sem prop, a montagem usa
o motor do navegador. A sessão não é recriada a cada renderização.

### Projeção e apresentação

```ts
// scene/projection.ts
type ScenePoint = [number, number, number];
type SceneFrame = Array<{
  id: string;
  center: ScenePoint;
  front: ScenePoint;
  theta: number;
  color: string;
  disabled: boolean;
  outside: boolean;
  rays: Array<{ start: ScenePoint; end: ScenePoint; hit: boolean }>;
}>;
export function projectFrame(world: World, state: SimState): SceneFrame;

// scene/camera.ts
type CameraView = '3d' | 'top';
export function configureCamera(
  camera: PerspectiveCamera, world: World, aspect: number, view: CameraView,
): void;

// scene/graphics.ts
export function buildScene(world: World): {
  scene: Scene;
  update(frame: SceneFrame, raysVisible: boolean): void;
  dispose(): void;
};
```

`orbitSettings` contém `minDistance: 0.3`, `maxDistance: 20` e
`mouseButtons` com `LEFT: MOUSE.ROTATE`, `MIDDLE: MOUSE.DOLLY` e
`RIGHT: MOUSE.PAN`. `projectFrame` usa altura `radius/2` no centro
e um vetor unitário da frente. O robô desativado recebe cor cinza
e `disabled: true`. `outside` vem do resultado do núcleo.
`buildScene` monta objetos em memória, sem exigir WebGL. O adaptador
da cena instancia a renderização quando disponível.

`panels/Events.tsx` exporta `Events` e `panels/Inspection.tsx`
exporta `Inspection`. Ambos recebem `{world: World, snapshot: SimState}`.
Filtros são locais a `Events`. `Inspection.tsx` também exporta
`resultLabel(state: SimState): string | null`, com `null` quando a
luta segue em andamento e a frase completa de desfecho ao terminar.

### Gravação e observação

No modo ao vivo, o tick do snapshot publicado é o cursor. A sessão guarda o motor
e seus controladores no último tick calculado. Retroceder ou revisitar um tick da
gravação usa seu snapshot completo. O motor só calcula um passo novo ao alcançar
o próprio estado, preservando closures, sorteios e contadores de log. A gravação
exporta somente o prefixo até o cursor. Reinício e troca de configuração abrem
um histórico novo. Após o limite da gravação, uma janela circular conserva os
estados recentes. Para recuperar um estado fora da janela, a sessão reconstrói
o motor com o mundo, fontes aplicadas e semente originais e reconstitui a janela
até o tick pedido. A sessão publica apenas o estado de destino.

```ts
// arena/recording.ts
export interface Recording {
  readonly world: string;
  readonly controllers: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly version: 1 | 2 | 3;
  readonly stallSeconds?: 5 | 10 | 30;
  readonly states: readonly SimState[];
}
type DecodeResult =
  | { ok: true; world: World; recording: Recording }
  | { ok: false; error: { code: 'GRAVACAO_INVALIDA'; path: string; message: string } };
export function encodeRecording(recording: Recording): string;
export function decodeRecording(text: string): DecodeResult;
export function recordingName(name: string, createdAt: string): string;
```

O discriminador e a versão entram na serialização. Em memória, cada
estado possui seu prefixo de `events`. Estados cuja contagem não muda
reutilizam a referência do prefixo. O codec valida os [formatos v1, v2 e v3](contracts/gravacao.md).

A região de cena publica `data-tick`, `data-rays` e `data-labels`.
A região de inspeção publica `data-tick`. O tick é uma string decimal
e as opções de visibilidade usam `true` ou `false`. O contador
`data-testid="current-tick"` contém `Tick <k>`. Esses pontos permitem
verificar a igualdade entre tela e núcleo mesmo sem WebGL.
Os nomes e papéis são os do [contrato de operação](contracts/operacao.md#nomes-acessíveis-e-formatos).


## Testes e validação

Os testes de aceitação recebem IDs globais S3-USn-ACn. A mudança da tela
inicial mantém a verificação de montagem da S1 com o novo título oficial.
Os cenários de carga, replay e paridade com a S2 exercitam a fachada real
quando viável. Testes da cena sem WebGL usam a projeção e a geometria
inspecionáveis. O quickstart mede em Chromium o percurso completo sem
misturar o relógio em tempo real com a suíte determinística.

[Pesquisa](research.md) · [Modelo](data-model.md) · [Quickstart](quickstart.md)

## Transição por impasse

O núcleo decide o resultado. A sessão guarda a última gravação e resumo do impasse, reinicia pelo reset da simulação e publica o tick zero pausado em uma transição. O lote termina com a rodada. O cursor de retrocesso publica a contagem contida no snapshot. Guardar apenas uma rodada anterior. A importação deriva os dados do detector das poses gravadas sem executar estratégias.

A sessão ao vivo grava sumô com detector em v3. O leitor seleciona a regra histórica pelo número da versão. A UI e o núcleo usam o mesmo cálculo de tempo de impasse, a partir das referências do snapshot.

## Borda no cartão de inspeção

Consultar o sensor da S2 com a pose do snapshot exibido, o raio do robô correspondente e o mundo. Usar essa leitura em pausa, retrocesso e replay. O raio interno da faixa desenhada e o limiar físico usam a mesma proporção.

## ADR-021 · S3-FR-043

Catalogar os três JSONs por ordem de nível. Desenhar uma chegada quadriculada no piso. Reusar o estado terminal e a navegação pelo histórico. Ao avançar de nível, preparar uma nova simulação com o controlador aplicado e rascunho preservado. O replay apenas consome snapshots.
