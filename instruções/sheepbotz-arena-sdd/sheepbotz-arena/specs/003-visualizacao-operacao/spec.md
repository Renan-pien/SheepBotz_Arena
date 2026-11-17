# Especificação da Feature: Visualização 3D e Operação do Simulador

**Spec:** 003 · **Branch:** `003-visualizacao-operacao` · **Criada em:** 2026-11-11 · **Status:** Pronta para planejamento
**Depende de:** Spec 001 (núcleo) e Spec 002 (laser, controladores, sumô, exemplos)
**Origem:** RB-21, RB-22, RB-23, RB-24, RB-28, RB-36, RB-37, RB-39, RB-40 · ADR-003

---

## 1. Contexto e objetivo

As Specs 001 e 002 entregam um simulador completo, mas invisível. Esta spec entrega a **tela** que a equipe SheepBotz vai usar no dia a dia e que será mostrada no pitch: uma página no navegador onde se vê a luta em 3D, com os raios do laser, e onde se carrega o mundo, escreve as estratégias, controla o tempo, inspeciona os sensores e assiste ao replay do empurrão decisivo.

**Princípio central:** a tela **apenas mostra e comanda**. Ela nunca calcula movimento, colisão, leitura ou resultado: tudo vem do núcleo (RB-28). Por isso, o que a tela mostra no tick k é sempre exatamente o estado k do núcleo.

**Público:** membros da equipe SheepBotz (familiarizados com robótica, não necessariamente com o código do simulador) e a plateia do pitch (que precisa entender a luta em segundos).

---

## 2. Glossário

| Termo | Definição |
|---|---|
| **Cena** | Desenho 3D do estado atual: chão, mapa, arena, obstáculos, robôs e raios. |
| **Câmera orbital** | Câmera que gira, aproxima e desloca em torno de um ponto de interesse. |
| **Modo ao vivo** | A simulação é calculada pelo núcleo enquanto é exibida. |
| **Modo replay** | Exibição de uma gravação, sem calcular nada nem executar controladores. |
| **Gravação** | Registro do mundo, dos controladores e de todos os estados de uma execução, do tick 0 ao último. |
| **Velocidade de reprodução** | Quantas vezes mais rápido (ou mais devagar) que o tempo real a simulação é exibida. |

---

## 3. Cenários de usuário e testes

> Salvo indicação, os cenários partem da tela recém-aberta, com o mundo "Duelo padrão" e os controladores padrão (`vermelho`: "Caçador"; `azul`: "Girador").
> Números na tela seguem o formato pt-BR (vírgula decimal), por exemplo "0,68 s".

### User Story 1 — Ver a luta em 3D (Prioridade: P1)

Como membro da equipe (ou da plateia), quero ver a arena, os robôs e o que cada robô está enxergando, para entender a luta à primeira vista.

**Por que esta prioridade:** visualização 3D com câmera orbital e raios visíveis é escopo mínimo (RB-36, RB-37).

**Teste independente:** abrir a tela, conferir a cena no tick 0 e mexer a câmera.

**Cenários de aceitação:**

1. **Dado** a tela recém-aberta, **Quando** a cena aparece, **Então** mostra a arena (disco escuro com borda branca) de raio 0,385 m, o robô `vermelho` em (−0,2; 0,0) com a frente voltada para +x e o robô `azul` em (0,2; 0,0) com a frente voltada para −x, cada um na sua cor.
2. **Dado** o tick 0 do "Duelo padrão", **Quando** os raios estão visíveis, **Então** cada robô mostra 5 raios; o raio central de cada um termina a 0,35 m, junto ao oponente, e aparece como **raio que atingiu algo**; os outros 4 têm 0,8 m e aparecem como **raio livre**.
3. **Dado** um robô com pose (0,2; 0,1), θ = π/2, **Quando** a cena é desenhada, **Então** o centro do robô fica no ponto do chão correspondente a (0,2; 0,1) e o indicador de frente aponta para +y.
4. **Dado** a cena, **Quando** o usuário arrasta com o botão esquerdo, **Então** a câmera gira em torno do ponto de interesse; **Quando** usa a roda do mouse, **Então** a câmera aproxima ou afasta; **Quando** arrasta com o botão direito (ou Shift + arrastar), **Então** a câmera se desloca. Nenhuma dessas ações altera o estado da simulação.
5. **Dado** a câmera em qualquer posição, **Quando** o usuário clica em "Vista de cima", **Então** a câmera olha o chão de cima, com +x para a direita e +y para cima na tela; **Quando** clica em "Vista 3D", **Então** volta à vista inicial em perspectiva.
6. **Dado** a opção "Mostrar raios" desligada, **Quando** a cena é desenhada, **Então** nenhum raio aparece, e a simulação continua idêntica.
7. **Dado** o "Sala com obstáculos", **Quando** é carregado, **Então** a cena mostra as paredes do mapa, os três obstáculos e o robô `explorador` com 9 raios, sem arena.
8. **Dado** um robô desativado (Spec 002), **Quando** a cena é desenhada, **Então** ele aparece acinzentado, com um ícone de alerta.

---

### User Story 2 — Controlar o tempo da simulação (Prioridade: P1)

Como membro da equipe, quero executar, pausar, avançar tick a tick e reiniciar a simulação, para analisar com calma os momentos importantes.

**Por que esta prioridade:** play, pause, step e reset são escopo mínimo (RB-24).

**Teste independente:** usar os controles e conferir o tick, o tempo e a cena.

**Cenários de aceitação:**

1. **Dado** a simulação no tick 0, **Quando** o usuário clica em "Executar", **Então** os ticks avançam continuamente e o contador mostra o tick e o tempo atuais.
2. **Dado** a simulação executando, **Quando** o usuário clica em "Pausar", **Então** os ticks param e a cena fica no último estado calculado.
3. **Dado** a simulação pausada no tick 10, **Quando** o usuário clica em "Avançar 1 tick", **Então** o contador mostra o tick 11 e a cena mostra o estado 11.
4. **Dado** a simulação em qualquer tick, **Quando** o usuário clica em "Reiniciar", **Então** volta ao tick 0, a cena mostra o estado inicial e os controladores recomeçam do zero.
5. **Dado** os controladores padrão, **Quando** o usuário executa até o fim, reinicia e executa de novo, **Então** as duas execuções terminam no mesmo tick, com o mesmo resultado e as mesmas poses.
6. **Dado** a velocidade de reprodução 1×, **Quando** a simulação executa, **Então** o tempo simulado acompanha o tempo real; em 2× anda duas vezes mais rápido; em 0,25×, quatro vezes mais devagar. As opções são 0,25×, 0,5×, 1×, 2× e 4×.
7. **Dado** um computador que não consegue acompanhar a velocidade escolhida, **Quando** a simulação executa, **Então** nenhum tick é pulado; a exibição fica mais lenta e aparece o aviso "abaixo do tempo real".
8. **Dado** a simulação finalizada, **Quando** o usuário olha os controles, **Então** "Executar" e "Avançar 1 tick" estão desabilitados e "Reiniciar" está habilitado.
9. **Dado** o foco fora do editor de código, **Quando** o usuário pressiona Espaço, **Então** alterna entre executar e pausar; **seta para a direita**, avança 1 tick (se pausado); **R**, reinicia. Com o foco no editor de código, essas teclas digitam normalmente.

---

### User Story 3 — Carregar mundos e escrever controladores (Prioridade: P1)

Como membro da equipe, quero escolher ou abrir um mundo e escrever a estratégia de cada robô na própria tela, para testar ideias sem sair do navegador.

**Por que esta prioridade:** o usuário descreve o mundo num arquivo e escreve o controlador (RB-22, RB-23).

**Teste independente:** trocar de mundo, abrir arquivos válidos e inválidos, editar e aplicar controladores.

**Cenários de aceitação:**

1. **Dado** o seletor de mundos, **Quando** o usuário escolhe "Sala com obstáculos", **Então** a cena e os painéis passam a refletir esse mundo no tick 0, com o controlador "Desviador" no robô `explorador`.
2. **Dado** o botão "Abrir mundo", **Quando** o usuário escolhe um arquivo de mundo válido, **Então** o mundo é carregado no tick 0 e todos os robôs começam com o controlador "Parado".
3. **Dado** um arquivo de mundo com 3 erros, **Quando** o usuário o abre, **Então** aparece a lista dos 3 erros, cada um com código, caminho e mensagem em pt-BR, e o mundo anterior continua carregado e intacto.
4. **Dado** a aba "Controladores", **Quando** o usuário escolhe um exemplo para um robô (Parado, Avança, Girador, Caçador ou Desviador), **Então** o código do exemplo aparece no editor daquele robô.
5. **Dado** um código alterado e não aplicado, **Quando** o usuário olha o cartão do robô, **Então** aparece o aviso "alterações não aplicadas"; **Quando** clica em "Aplicar", **Então** o código é verificado e, se válido, a simulação é reiniciada com o novo controlador.
6. **Dado** um código com erro de sintaxe, **Quando** o usuário clica em "Aplicar", **Então** aparece a mensagem de `CONTROLADOR_INVALIDO` (com a linha do erro, quando disponível) e o controlador anterior continua valendo.
7. **Dado** um editor de controlador, **Quando** o usuário clica em "Salvar código", **Então** o navegador baixa um arquivo `.js` com o código; **Quando** clica em "Abrir código" e escolhe um arquivo `.js`, **Então** o código aparece no editor, ainda não aplicado.
8. **Dado** um robô cujo controlador falha durante a execução, **Quando** o erro ocorre, **Então** o cartão do robô mostra "desativado" com a mensagem do erro, e a simulação continua.

---

### User Story 4 — Inspecionar sensores, eventos e resultado (Prioridade: P2)

Como membro da equipe, quero ver em números o que cada robô está sentindo e fazendo, para entender por que a estratégia tomou cada decisão.

**Por que esta prioridade:** painel de inspeção é escopo completo (RB-39).

**Teste independente:** comparar os valores do painel com o estado do núcleo em ticks conhecidos.

**Cenários de aceitação:**

1. **Dado** o tick 0 do "Duelo padrão", **Quando** o usuário abre a aba "Inspeção", **Então** o cartão de `vermelho` mostra: situação "ativo"; pose x −0,200 m, y 0,000 m, θ 0,0°; odometria igual à pose; comando (0,00 m/s; 0,00 rad/s); bumper "inativo"; e a tabela do laser com 5 linhas (raio, ângulo relativo e distância): −30°/0,800, −15°/0,800, 0°/0,350, 15°/0,800, 30°/0,800.
2. **Dado** a simulação avançando, **Quando** o estado muda, **Então** o painel mostra os valores do estado exibido na cena (nunca de outro tick).
3. **Dado** um robô empurrado, **Quando** o usuário olha o cartão, **Então** vê a pose real, a odometria e a diferença entre elas em metros.
4. **Dado** a aba "Eventos", **Quando** ocorrem logs, erros de controlador ou o fim da luta, **Então** cada evento aparece com tick, robô, tipo e mensagem, em ordem; erros aparecem destacados; é possível filtrar por robô e por tipo.
5. **Dado** os controladores padrão, **Quando** a luta termina, **Então** aparece o aviso de resultado "Vitória de vermelho — saída da arena · tick 34 · 0,68 s", com os botões "Reiniciar" e "Ver replay".
6. **Dado** uma luta que termina por tempo, **Quando** ela termina, **Então** o aviso diz "Empate — tempo esgotado"; se os dois saírem juntos, "Empate — os dois saíram da arena".

---

### User Story 5 — Gravar e assistir ao replay (Prioridade: P2)

Como membro da equipe, quero rever qualquer momento da luta, avançando e voltando, e guardar a luta num arquivo, para analisar e compartilhar o que aconteceu.

**Por que esta prioridade:** gravação e replay são escopo completo (RB-40) e o ponto alto da demo.

**Teste independente:** executar, entrar no replay, navegar, exportar e reimportar a gravação.

**Cenários de aceitação:**

1. **Dado** uma execução no modo ao vivo, **Quando** os ticks avançam, **Então** todos os estados, desde o tick 0, ficam gravados automaticamente.
2. **Dado** uma luta encerrada no tick 34, **Quando** o usuário clica em "Ver replay", **Então** a tela entra no modo replay, com a linha do tempo de 0 a 34, e a edição de mundo e de controladores fica bloqueada.
3. **Dado** o modo replay, **Quando** o usuário arrasta a linha do tempo até o tick 20, **Então** a cena, o contador e o painel de inspeção mostram exatamente o estado 20 gravado.
4. **Dado** o modo replay no tick 20, **Quando** o usuário usa "Voltar 1 tick" (ou a seta para a esquerda) e "Avançar 1 tick", **Então** vai ao tick 19 e ao tick 20, respectivamente; "Executar" reproduz a gravação na velocidade escolhida.
5. **Dado** uma gravação, **Quando** o usuário clica em "Exportar gravação", **Então** o navegador baixa um arquivo com o mundo, os controladores e todos os estados.
6. **Dado** o arquivo exportado, **Quando** o usuário clica em "Abrir gravação" e o escolhe, **Então** a tela entra no modo replay mostrando exatamente os mesmos estados da execução original.
7. **Dado** um arquivo de gravação corrompido ou de outro tipo, **Quando** o usuário tenta abri-lo, **Então** aparece o erro `GRAVACAO_INVALIDA` com a explicação, e a tela continua como estava.
8. **Dado** uma gravação, **Quando** seu mundo e seus controladores são executados de novo pelo núcleo pelo mesmo número de ticks, **Então** os estados obtidos são idênticos aos gravados.
9. **Dado** o modo replay, **Quando** o usuário clica em "Sair do replay", **Então** volta ao modo ao vivo com o mundo e os controladores da gravação carregados no tick 0.

---

### User Story 6 — Modo apresentação (Prioridade: P3)

Como apresentador do pitch, quero uma tela limpa e legível de longe, para que a plateia acompanhe a luta.

**Por que esta prioridade:** melhora a demo, mas não é exigida pelo briefing.

**Teste independente:** ativar o modo e conferir o que aparece.

**Cenários de aceitação:**

1. **Dado** a tela normal, **Quando** o usuário ativa "Modo apresentação" (ou pressiona P), **Então** os painéis laterais somem, a cena ocupa a tela toda e aparece um placar grande com os nomes e cores dos robôs, o tempo e, ao final, o resultado.
2. **Dado** o modo apresentação, **Quando** o usuário pressiona Esc ou P, **Então** a tela normal volta, sem alterar a simulação.

---

### 3.7 Casos de borda

- Trocar de mundo durante a execução: a simulação pausa, o novo mundo é carregado no tick 0 e a gravação anterior é descartada.
- Aplicar controlador durante a execução: a simulação reinicia no tick 0 com o novo controlador.
- Gravação muito longa: até 100 000 ticks são gravados; ao atingir o limite, a gravação para e aparece o aviso "limite de gravação atingido", sem interromper a simulação.
- Janela redimensionada: a cena se ajusta sem distorcer e sem reiniciar a simulação.
- Aba do navegador em segundo plano: a execução pausa automaticamente e não "dispara" ticks acumulados ao voltar.
- Mundo com 8 robôs: todos aparecem nas abas de controladores e de inspeção, com rolagem.
- Mais de 500 eventos: a aba mostra os 500 mais recentes, com o aviso de quantos foram ocultados.

---

## 4. Requisitos funcionais

### 4.1 Princípios

- **FR-001:** A tela NÃO DEVE calcular nenhum comportamento da simulação; DEVE apenas exibir os estados produzidos pelo núcleo e enviar comandos de operação (executar, pausar, avançar, reiniciar, carregar). *(RB-28)*
- **FR-002:** O que a tela exibe (cena, contador e painéis) DEVE corresponder sempre a um único estado do núcleo, o mesmo para todos os elementos. *(RB-28)*
- **FR-003:** Toda a interface DEVE estar em pt-BR, com números no formato pt-BR. *(Constitution)*
- **FR-004:** A taxa de desenho da tela NÃO DEVE influenciar o resultado da simulação. *(RB-27)*

### 4.2 Cena 3D

- **FR-005:** A cena DEVE representar o plano da simulação como o chão, com +x para a direita e +y para o fundo na vista inicial. *(RB-21, RB-36)*
- **FR-006:** A cena DEVE mostrar: chão com grade de 0,1 m; paredes baixas nas bordas do mapa; arena, quando existir, como disco escuro com borda branca de largura igual a 5% do raio; obstáculos como caixas; robôs como cilindros na cor do mundo, com altura igual ao raio e um indicador de frente apontando para θ. *(RB-36)*
- **FR-007:** A cena DEVE mostrar, para cada robô com laser, um segmento por raio, partindo do centro do robô até a distância lida; raios com leitura menor que o alcance máximo aparecem como **atingiu** (cor quente e marcador no ponto atingido) e os demais como **livres** (traço claro e translúcido). A distinção NÃO DEVE depender só da cor. *(RB-37)*
- **FR-008:** A cena DEVE permitir ligar e desligar os raios e os rótulos com o `id` de cada robô.
- **FR-009:** Robôs desativados DEVEM aparecer acinzentados com ícone de alerta; robôs fora da arena, com destaque de contorno.
- **FR-010:** A câmera DEVE ser orbital: girar (arrastar com botão esquerdo), aproximar e afastar (roda do mouse, entre 0,3 m e 20 m do ponto de interesse) e deslocar (botão direito ou Shift + arrastar), além dos botões "Vista de cima", "Vista 3D" e "Centralizar". *(RB-36)*
- **FR-011:** A vista inicial DEVE enquadrar todo o mapa (ou toda a arena, quando houver) em perspectiva elevada.

### 4.3 Controles de tempo

- **FR-012:** A tela DEVE oferecer "Executar", "Pausar", "Avançar 1 tick" e "Reiniciar", com habilitação coerente ao estado (por exemplo, "Avançar 1 tick" só com a simulação pausada; "Executar" e "Avançar" desabilitados após o fim da luta). *(RB-24)*
- **FR-013:** A tela DEVE exibir o tick atual, o tempo atual (em segundos, 2 casas decimais) e o status ("pronta", "executando", "pausada", "finalizada"). *(RB-24)*
- **FR-014:** A tela DEVE oferecer as velocidades 0,25×, 0,5×, 1×, 2× e 4×; em 1×, o tempo simulado acompanha o tempo real.
- **FR-015:** Nenhum tick DEVE ser pulado; quando o computador não acompanhar a velocidade escolhida, a execução desacelera e o aviso "abaixo do tempo real" é mostrado.
- **FR-016:** "Reiniciar" DEVE voltar ao tick 0 do mundo atual, com os controladores recarregados (Spec 002, FR-015), e iniciar uma nova gravação.
- **FR-017:** A tela DEVE oferecer os atalhos: Espaço (executar/pausar), seta para a direita (avançar 1 tick), seta para a esquerda (voltar 1 tick, só no replay), R (reiniciar) e P (modo apresentação); os atalhos são ignorados quando o foco está num campo de texto ou no editor.
- **FR-018:** Quando a aba do navegador ficar em segundo plano, a execução DEVE pausar.

### 4.4 Mundos e controladores

- **FR-019:** A tela DEVE oferecer um seletor com os mundos de exemplo (Spec 002, FR-035) e um botão "Abrir mundo" para escolher um arquivo `.json`. *(RB-22)*
- **FR-020:** Ao abrir um mundo inválido, a tela DEVE listar todos os erros (código, caminho, mensagem) e manter o mundo anterior. *(RB-46)*
- **FR-021:** Ao carregar um mundo, os controladores iniciais DEVEM ser: no "Duelo padrão", `vermelho` com "Caçador" e `azul` com "Girador"; no "Sala com obstáculos", `explorador` com "Desviador"; em mundos abertos de arquivo, "Parado" para todos.
- **FR-022:** A tela inicial DEVE abrir com o "Duelo padrão" e seus controladores iniciais, no tick 0, pausada.
- **FR-023:** A aba "Controladores" DEVE ter um cartão por robô (com `id` e cor), contendo: seletor de exemplos (Spec 002, Anexo D), editor de código com fonte monoespaçada e números de linha, aviso de "alterações não aplicadas" e os botões "Aplicar", "Restaurar exemplo", "Abrir código" (`.js`) e "Salvar código" (`.js`). *(RB-23)*
- **FR-024:** "Aplicar" DEVE verificar o controlador; se inválido, mostrar a mensagem de `CONTROLADOR_INVALIDO` e manter o controlador anterior; se válido, reiniciar a simulação com ele.
- **FR-025:** Erros de controlador durante a execução DEVEM aparecer no cartão do robô ("desativado" + mensagem) e na aba "Eventos".

### 4.5 Inspeção e eventos

- **FR-026:** A aba "Inspeção" DEVE ter um cartão por robô com: situação; pose real (x e y em metros com 3 casas; θ em graus com 1 casa); odometria no mesmo formato; diferença entre pose real e odometria (em metros); comando efetivo (v em m/s e w em rad/s, com 2 casas); bumper ("ativo"/"inativo", com ícone); e tabela do laser (número do raio, ângulo relativo em graus e distância com 3 casas), acompanhada de um gráfico de barras das distâncias. *(RB-39)*
- **FR-027:** A aba "Eventos" DEVE listar os eventos (tick, robô, tipo, mensagem) em ordem, com filtro por robô e por tipo, destacando erros; DEVE exibir os 500 mais recentes e informar quantos foram ocultados.
- **FR-028:** Ao fim de uma luta, a tela DEVE mostrar um aviso de resultado com vencedor (ou empate), motivo em pt-BR ("saída da arena", "tempo esgotado", "os dois saíram da arena"), tick e tempo, e os botões "Reiniciar" e "Ver replay". *(RB-25)*

### 4.6 Gravação e replay

- **FR-029:** Toda execução no modo ao vivo DEVE ser gravada automaticamente, desde o tick 0, até 100 000 ticks. *(RB-40)*
- **FR-030:** A gravação DEVE conter: identificação do formato e sua versão, o mundo (texto original), os controladores de cada robô (texto), a data de criação e a lista de estados de todos os ticks gravados (incluindo eventos e resultado). *(RB-40)*
- **FR-031:** O modo replay DEVE exibir exclusivamente os estados gravados, sem executar o núcleo nem os controladores; DEVE oferecer linha do tempo, "Executar", "Pausar", "Avançar 1 tick", "Voltar 1 tick" e as mesmas velocidades do modo ao vivo; e DEVE bloquear a edição de mundo e de controladores. *(RB-40)*
- **FR-032:** A tela DEVE permitir "Exportar gravação" (baixar arquivo `.json` com nome `sheepbotz-<nome do mundo>-<AAAA-MM-DD-HHmm>.json`) e "Abrir gravação". *(RB-40)*
- **FR-033:** Ao abrir uma gravação inválida (estrutura incorreta, versão desconhecida ou mundo inválido), a tela DEVE mostrar o erro `GRAVACAO_INVALIDA` com a explicação e manter o estado anterior.
- **FR-034:** Re-executar no núcleo o mundo e os controladores de uma gravação, pelo mesmo número de ticks, DEVE produzir estados idênticos aos gravados. *(RB-27, RB-40)*
- **FR-035:** "Sair do replay" DEVE voltar ao modo ao vivo com o mundo e os controladores da gravação, no tick 0.

### 4.7 Modo apresentação

- **FR-036:** A tela DEVE oferecer o "Modo apresentação", que esconde os painéis, amplia a cena e mostra um placar grande (robôs com nome e cor, tempo e resultado), ativado por botão ou pela tecla P e encerrado por P ou Esc.

### 4.8 Acessibilidade e layout

- **FR-037:** Todos os controles DEVEM ser acessíveis por teclado, com foco visível e rótulo textual (inclusive botões com ícone).
- **FR-038:** Textos e controles DEVEM ter contraste mínimo de 4,5:1 com o fundo.
- **FR-039:** O layout DEVE funcionar a partir de 1024 px de largura, com a cena ao centro e o painel lateral recolhível; abaixo disso, o painel passa para baixo da cena.

---

## 5. Entidades principais

| Entidade | Atributos |
|---|---|
| **Sessão da tela** | modo (ao vivo ou replay), mundo atual, controladores atuais, status, velocidade, opções de exibição |
| **Gravação** | formato e versão, mundo, controladores, data de criação, estados por tick |
| **Opções de exibição** | mostrar raios, mostrar rótulos, vista da câmera, modo apresentação |

---

## 6. Critérios de sucesso

- **SC-001:** Com o "Duelo padrão", a tela mantém pelo menos 30 quadros por segundo num notebook comum em velocidade 1×.
- **SC-002:** Qualquer ação de controle (executar, pausar, avançar, reiniciar, mexer na linha do tempo) tem resposta visível em menos de 100 ms.
- **SC-003:** Uma pessoa que nunca usou o simulador consegue, sem ajuda, carregar o "Duelo padrão", trocar a estratégia de um robô por um exemplo e executar a luta até o fim em menos de 2 minutos.
- **SC-004:** Em 100% dos ticks verificados, o estado mostrado na cena e no painel de inspeção é igual ao estado do núcleo para aquele tick.
- **SC-005:** Uma gravação exportada e reaberta reproduz 100% dos estados originais.
- **SC-006:** No pitch, a luta padrão é compreendida pela plateia sem explicação de código (validação informal em ensaio com pessoas de fora do time).

---

## 7. Premissas e decisões

- Convenções C18 e C19 do AGENTS.md §10 foram fixadas nesta spec (ADR-007, aceita).
- A tecnologia de desenho 3D (Three.js ou WebGL, conforme RB-21) e a estrutura do arquivo de gravação são definidas no plano.
- A tela funciona inteiramente no navegador, sem servidor, sem login e sem banco de dados.
- Navegadores-alvo: versões atuais de Chrome, Edge e Firefox para desktop.

## 8. Fora do escopo

- Uso em celulares e tablets (layout abaixo de 1024 px é funcional, mas não otimizado).
- Editor visual de mundos (arrastar obstáculos e robôs); o mundo é editado em arquivo.
- Realce de sintaxe e autocompletar avançados no editor de código.
- Gravação em vídeo, compartilhamento por link e salvamento na nuvem.
- Som e efeitos visuais de impacto.
- Tema claro.

---

## Anexo A — Estrutura sugerida da tela

```
┌──────────────────────────────────────────────────────────────────────┐
│ SheepBotz Arena │ Mundo: [Duelo padrão ▾] [Abrir mundo] │ [Gravação ▾]│
├───────────────────────────────────────────────┬──────────────────────┤
│                                               │ [Controladores]      │
│                                               │ [Inspeção] [Eventos] │
│                 CENA 3D                       │                      │
│                                               │  cartões por robô    │
│   [Vista de cima] [Vista 3D] [Centralizar]    │                      │
│   [☑ Raios] [☑ Rótulos]                       │                      │
├───────────────────────────────────────────────┴──────────────────────┤
│ [▶ Executar] [⏸] [⏭ 1 tick] [↺ Reiniciar]  Vel.: [1× ▾]              │
│ Tick 34 · 0,68 s · finalizada     (no replay: ◀ linha do tempo ▶)    │
└──────────────────────────────────────────────────────────────────────┘
```

## Anexo B — Catálogo de erros (acréscimos)

| Código | Quando ocorre |
|---|---|
| `GRAVACAO_INVALIDA` | Arquivo de gravação com estrutura incorreta, versão desconhecida ou mundo inválido |

## Anexo C — Rastreabilidade

| Requisito do briefing | Requisitos desta spec |
|---|---|
| RB-21, RB-36 | FR-005, FR-006, FR-010, FR-011 |
| RB-22 | FR-019 a FR-022 |
| RB-23 | FR-023 a FR-025 |
| RB-24 | FR-012 a FR-018 |
| RB-28 | FR-001, FR-002, FR-004 |
| RB-37 | FR-007, FR-008 |
| RB-39 | FR-026 a FR-028 |
| RB-40 | FR-029 a FR-035 |
