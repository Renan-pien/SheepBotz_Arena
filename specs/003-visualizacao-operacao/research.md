# Pesquisa técnica · Spec 003

## R1 · Cena Three.js e editor

- **Decisão.** Fixar `three@0.187.0`, `@types/three@0.187.0` como dependência
  de desenvolvimento, `@codemirror/state@6.7.6` e `@codemirror/view@6.43.15`.
  Reutilizar React e Vite. As versões foram conferidas no registro npm.
- **Motivo.** Three.js fornece geometria, câmeras e controles orbitais. O
  editor precisa de texto, numeração, modo leitura e foco. Estado e view do
  CodeMirror cobrem esse conjunto. O núcleo usa o motor da S2.
- **Alternativas consideradas.** WebGL direto aumenta código de projeção e
  gerenciamento de recursos. Um editor avançado com pacote agregador excede
  o recorte. React Three Fiber introduziria outra camada no ADR-008.
- **Fontes.** [Three.js r187](https://github.com/mrdoob/three.js/releases/tag/r187) ·
  [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html) ·
  [Referência CodeMirror](https://codemirror.net/docs/ref/).

## R2 · Projeção e enquadramento

- **Decisão.** Usar `(x,h,-y)` e câmera vista de cima com eixo superior −Z.
  Montagem visual lê somente um snapshot da S2.
- **Motivo.** A transformação mantém +X para a direita na vista inicial e
  +Y para cima vista de cima. Orientação de robô e pontas dos raios ficam
  mensuráveis fora do WebGL.
- **Alternativas consideradas.** Usar +Z para +y exigiria inverter a
  convenção da rotação e ajustar a orientação das câmeras. Fazer raycast
  visual duplicaria o sensor da S2.

## R3 · Tempo de apresentação e ciclo de sessão

- **Decisão.** Timer de 10 ms com tempo monotônico, acumulador por velocidade
  e até 64 passos por turno. Pausa por visibilidade. Renderização
  por frame em circuito separado. Um candidato é preparado antes da troca.
- **Motivo.** Um timer quantizado ainda respeita o passo do mundo. Ao descartar
  apenas tempo de parede excedente, a simulação encadeia todos os ticks.
  Sessão candidata permite manter rascunhos e estado em erro. Com `dt` mínimo
  de 0,001 s, 4× exige 40 passos em 10 ms. O limite de 64 preserva esse caso.
  [Relógio monotônico](https://www.w3.org/TR/hr-time-3/#sec-monotonic-clock) ·
  [Visibilidade de página](https://html.spec.whatwg.org/multipage/interaction.html#page-visibility)
- **Alternativas consideradas.** Dirigir ticks pelo FPS torna o comportamento
  de exibição dependente do desenho. Executar toda a dívida em um turno
  pode bloquear a interface. Mutar a sessão antes de preparar impede rollback.

## R4 · Registro e replay

- **Decisão.** Guardar snapshots em memória até o limite. Persistir todos
  os campos, com uma lista de eventos e contagens por snapshot no JSON v1.
  Validar por leitura e continuar replay se a volta ao vivo falhar.
- **Motivo.** A lista de eventos da S2 é cumulativa. Prefixos evitam repetir
  milhares de logs a cada snapshot no arquivo. Estados de replay mantêm a
  mesma forma da S2. Códigos importados só rodam na passagem intencional ao vivo.
- **Arquivos.** Usar `File.text()` e `Blob` com URL local revogada após o download.
  [File API](https://www.w3.org/TR/FileAPI/#dom-blob-text)
- **Alternativas consideradas.** JSON com cópia integral de eventos cresce
  de maneira quadrática. Gravar apenas comandos exige recalcular e pode
  depender da versão do simulador. Um banco local amplia o escopo.

## R5 · Validação

- **Decisão.** Cenários de apresentação e mapeamento em testes determinísticos,
  mais Chromium real no quickstart. Manter os dois benchmarks das specs
  anteriores e confrontar o Duelo da UI com a CLI da S2.
- **Motivo.** O jsdom não emula GPU. A validação gráfica real cobre gestos e
  contexto WebGL, ao passo que tempo, snapshots e geometria permanecem
  independentes da máquina na suíte.
- **Alternativas consideradas.** Usar somente screenshots não demonstra
  igualdade de estados. Fixar limiares temporais no CI introduz flutuação.

## R6 · Custo do desenho

- **Decisão.** Usar materiais Lambert para os volumes, luzes simples e
  contexto WebGL sem antialias por amostragem. Manter o tamanho do canvas
  e o agendamento dos ticks. O painel lateral rola na altura da cena.
- **Evidência.** No ensaio de referência por software, a primeira versão
  com amostragem e materiais padrão mediu de 23,1 a 25,3 FPS. A cena
  revisada, no mesmo canvas e cenário, mediu de 41,8 a 51,4 FPS. Os 35
  estados exportados foram iguais aos da CLI antes e depois.
  [Medição](quickstart.md#medição-de-referência-da-implementação)
- **Alternativas consideradas.** Diminuir a resolução do canvas ou mudar
  o intervalo de desenho. O custo de materiais e amostragem foi reduzido
  com resolução e cadência preservadas.

### Tutorial e carregamento por linguagem
Manter um editor por robô permite disputar com linguagens diferentes. O diálogo nativo mantém a navegação por teclado no tutorial da modalidade atual e devolve o foco ao botão. Uma aplicação de Portugol aguarda o runtime do próprio site. Revisão da sessão e identidade do rascunho impedem uma resposta atrasada de substituir edição ou mundo posteriores.
