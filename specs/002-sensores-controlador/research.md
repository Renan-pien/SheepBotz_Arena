# Pesquisa técnica · Spec 002

## R1 · Runtime JavaScript e fronteira síncrona

**Decisão.** Usar Endo SES `2.3.0` para criar um `Compartment` por controlador e Acorn `8.15.0` para validar a forma síncrona do script antes da avaliação. O adaptador inicializa SES uma vez, com `repairIntrinsics()`, a remoção de `Array.fromAsync` e `hardenIntrinsics()`. Antes da carga, configura os recursos disponíveis em cada compartimento conforme o plano. O carregamento, o tick e o reset são síncronos. O núcleo recebe o motor pronto. O projeto mantém Node, TypeScript e Vite, com versões exatas e lockfile para as duas bibliotecas quando forem instaladas. [Guia do Endo SES](https://github.com/endojs/endo/blob/master/docs/guide.md)

**Motivo.** O compartimento tem escopo próprio, retém as variáveis do script e permite expor a API depois da avaliação de nível superior. SES bloqueia hora corrente e `Math.random`, mas expõe `Promise` por padrão e mantém `Array.fromAsync`. A verificação da sintaxe exclui as formas descritas pelo FR-009. O perfil de capacidades exclui agendamento durante e entre as chamadas. Juntas, as duas medidas preservam o comportamento quando a UI entrega os ticks em passos separados. Fixar a gramática em ECMAScript 2025 e modo script evita que a versão do host decida a forma aceita. [SES 2.3.0](https://docs.endojs.org/modules/ses.html#compartment) · [Acorn 8.15.0](https://www.npmjs.com/package/acorn/v/8.15.0)

**Alternativas avaliadas.**

- `new Function` no host exigiria reproduzir a fronteira de globais e intrínsecos. `node:vm` atenderia somente à CLI.
- QuickJS 0.32.0 embarcado em WebAssembly permitiu 6 000 chamadas síncronas em um microteste isolado. Ao alocar um contexto com `Date` desabilitado no convidado, a variante consultou `Date.now()` no host. O desenho escolhido evita adaptar a interface de relógio do binário. [QuickJS Emscripten](https://github.com/justjake/quickjs-emscripten#usage)
- Usar apenas a validação sintática e o compartimento padrão ainda deixaria recursos de agendamento disponíveis. Usar apenas o perfil de capacidades deixaria a sintaxe assíncrona no contrato. A combinação aplica o ADR-016.

**Verificação de viabilidade.** Em processo isolado com Node 22.22.0, SES 2.3.0 preservou a closure do controlador, bloqueou `Date.now()`, `new Date()` e `Math.random()` e permitiu expor uma função da API depois da carga. Um microteste com duas funções e 6 000 chamadas diretas levou aproximadamente 1.08 ms. Em Node 24.22.3, o ensaio com SES e Acorn confirmou análise, carga sem API, estado persistente, recarga em contexto novo e bloqueio de hora corrente e aleatoriedade global. Uma página compilada em Vite 8.3.8 confirmou a análise ECMAScript 2025, a execução SES e a ausência de relógio, `fetch` e API do robô na carga no Chrome. A integração com a aplicação e a medição de SC-003 ficam para a implementação.

**Revisão de C02.** Em protótipos isolados com Node 24.22.3 e Chrome com Vite, confirmei a
indisponibilidade de `Promise` e `Array.fromAsync` no compartimento configurado e a
preservação de operações síncronas de array. Um contador de teste produziu os mesmos
valores em lote e em chamadas separadas por processamento de microtarefas no host.
São ensaios do adaptador. A paridade de estados e históricos da simulação está nas tasks.

## R2 · Laser a partir da geometria da S1

**Decisão.** Usar interseção por intervalos para retângulos alinhados aos eixos e projeção para círculos. O raycast recebe posições reais, meio tamanho do mapa, obstáculos e raios dos outros robôs. O alcance inicial é `maxRange` e cada interseção pode reduzir o mínimo. A parede usa o primeiro contato com a fronteira do mapa, obtido pelo limite de saída do intervalo quando a origem está no interior.

**Motivo.** A mesma primitiva de retângulo trata obstáculos e paredes. Os valores de referência incluem 2.309401 m nos raios a ±30° em mapa de 4 × 4 m, 0.900000 m diante do obstáculo e 0.413397 m no círculo deslocado. Uma publicação no duelo do benchmark mede 10 raios contra dois alvos por raio, contando a caixa do mapa como um alvo. O limite admitido pela S1 é 8 robôs, 360 raios por robô e 100 obstáculos, até 311 040 testes de interseção por publicação se todos os alvos forem avaliados.

**Alternativas avaliadas.** Testar cada lado separadamente repetiria a lógica de paralelismo e canto. Um índice espacial adicionaria estado derivado e atualizações a cada passo. A varredura direta, com encerramento quando o mínimo chega a zero, atende à escala desta etapa.

## R3 · Leituras, física, eventos e fim da luta

**Decisão.** Reutilizar a transformação física de `step()` da S1. O `step()` público permanece puro com comandos explícitos, e a fachada que executa scripts compartilha a mesma transformação e publicação. Todos os comandos partem do mesmo snapshot `k`. O avaliador de sumô decide após a atualização física e do tick. A leitura já publicada no snapshot `k` é a leitura disponível no início do próximo passo.

**Motivo.** Uma varredura por estado publicado realiza os dois usos definidos no ADR-009. Controladores jamais observam o movimento parcial do próprio passo. O raycast do último tick usa as poses finais e chamadas posteriores retornam esse snapshot, conforme ADR-011. O avaliador aceita apenas modo `sumo` e compara a distância real do centro com o raio, usando `>`.

**Alternativas avaliadas.** Calcular o laser duas vezes por passo duplica trabalho. Executar um controlador e aplicar física para o robô imediatamente violaria a leitura simultânea do estado inicial. Acoplar o avaliador de sumô ao integrador da S1 misturaria modalidade com cinemática.

## R4 · Sequência pseudoaleatória por robô

**Decisão.** Usar um gerador congruencial de 32 bits, com índice `i` de base 0 em `world.robots`. O estado inicial é `s = (world.seed + Math.imul(i, 0x9E3779B9)) >>> 0`. A cada chamada, atualizar `s = (Math.imul(1664525, s) + 1013904223) >>> 0` e devolver `s / 4294967296`. O contador implícito é privado do robô e o reset recria o estado inicial. [ECMAScript, Math.imul](https://tc39.es/ecma262/2025/multipage/numbers-and-dates.html#sec-math.imul)

| Semente | Índice | Estado inicial | Primeiros numeradores |
|---:|---:|---:|---|
| 0 | 0 | 0 | 1013904223, 1196435762, 3519870697 |
| 1 | 0 | 1 | 1015568748, 1586005467, 2165703038 |
| 1 | 1 | 2654435770 | 1122647505, 6184188, 4007793707 |
| 4294967295 | 7 | 1401181198 | 1761790997, 2633018992, 588803855 |

**Motivo.** A multiplicação modular de 32 bits é definida pela linguagem. O gerador aceita todas as sementes da S1, inclusive zero, e requisições de um robô deixam intacta a sequência dos demais. A finalidade é repetibilidade para a PoC.

**Alternativas avaliadas.** Um gerador global faria o número de chamadas de um robô alterar o fluxo do outro. Xorshift32 precisa tratar o estado zero. Geradores baseados em inteiros de 64 bits trariam complexidade sem requisito de qualidade estatística adicional.

## R5 · Compatibilidade, erros e consumidores

**Decisão.** Preservar a fachada síncrona da S1 e o formato da resposta discriminada de `runHeadless`. Acrescentar `prepareSimulation` para validar e preparar um candidato uma vez, incluindo a validação do controller. A CLI ganha a opção repetível `--controller <id>=<arquivo.js>`. Usar `laser` e `situacao` no robô e `status`, `resultado` e `events` no estado. Eventos da partida usam `robotId: null`. O contrato anterior do mundo é a referência para JSON.

**Motivo.** A S1 já prevê campos aditivos no estado. A S3 pode testar um conjunto de controladores com o mesmo contrato e preservar a simulação anterior se a preparação falhar. A ordem fixa dos grupos de erros conserva o comportamento S1 e aplica ADR-012/014 na chamada única. Q-001 continua aberta. A premissa documentada é fornecer API de biblioteca e CLI.

**Alternativas avaliadas.** Tornar assíncrono o avanço quebraria a fachada da S1. Uma CLI separada duplicaria E/S, validação e serialização. Validar e depois recarregar os mesmos scripts para publicar o estado inicial executaria duas vezes suas instruções de nível superior.

**Impacto verificado.** Algumas regressões físicas e o benchmark da S1 usam a arena de sumô
com janelas fixas. A S2 passa a encerrar lutas que saem da arena. Usar o modo livre com a
mesma geometria nas verificações de janela fixa preserva as asserções físicas e de histórico
da S1. A comparação no núcleo atual confirmou históricos idênticos para as fixtures de
S1-US3-AC1, S1-US3-AC4 e do benchmark. Seus primeiros centros fora da arena aparecem nos
ticks 33, 82 e 41, respectivamente. A S2 adiciona testes específicos para encerramento e
histórico da luta.

## R6 · Benchmarks e regressão

**Decisão.** Manter a convenção de benchmark externo à suíte. Cronometrar `runHeadless` com entradas em memória e motor pronto. O cronômetro cobre validação, carga dos dois controladores e 3 000 passos com histórico desabilitado. Usar o Duelo padrão com Parado e Girador conforme SC-003. Manter os testes de aceitação independentes de relógio, com TDD e IDs estáveis.

**Motivo.** Os dois controladores mantêm os centros dentro da arena, garantindo a duração efetiva sem omitir o laser nem a execução de `loop()`. O mesmo hardware, sistema e versão Node publicados para a S1 são a referência da meta de 2 s.

**Alternativas avaliadas.** Usar Avança e Parado termina a luta no tick 34. Colocar o tempo como asserção da CI compartilhada liga o aceite à carga da máquina.
