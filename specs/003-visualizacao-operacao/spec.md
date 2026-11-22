# Especificação da Feature: Visualização 3D e Operação do Simulador

**Spec:** 003 · **Branch:** `003-visualizacao-operacao` · **Criada em:** 2026-11-11 · **Revisada em:** 2026-11-18 · **Status:** Especificada
**Depende de:** Spec 001 (núcleo) e Spec 002 (laser, controladores, sumô, exemplos)
**Origem:** briefing da Trilha 4, constituição e ADRs aplicáveis. Veja a origem de cada requisito na seção 4.

---

## 1. Contexto e objetivo

As Specs 001 e 002 entregam a simulação pela biblioteca e pelo terminal. Esta spec entrega a **tela** que a equipe SheepBotz vai usar no dia a dia e que será mostrada no pitch: uma página no navegador onde se vê a luta em 3D, com os raios do laser, e onde se carrega o mundo, escreve as estratégias, controla o tempo, inspeciona os sensores e assiste ao replay do empurrão decisivo.

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
> Números na tela seguem o formato pt-BR, por exemplo "0,68 s". As verificações geométricas usam a tolerância da S1 (S1-FR-040). Ticks, estados de replay e campos já formatados para a tela são comparados exatamente.

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
9. **Dado** um rótulo visível, **Quando** "Mostrar rótulos" é desligado, **Então** o rótulo desaparece e o estado exibido é preservado. Na luta padrão, o contorno destaca azul ao sair da arena no tick 34.
10. **Dado** uma câmera deslocada, **Quando** o usuário escolhe "Centralizar", **Então** o ponto de interesse volta ao centro da área enquadrada, preservando a vista de cima ou 3D selecionada.

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
9. **Dado** o foco fora de campos de texto, do editor e de controles que usam a tecla pressionada, **Quando** o usuário pressiona Espaço, **Então** alterna entre executar e pausar. Seta para a direita avança 1 tick quando a simulação está parada e R reinicia. Com o foco no editor, essas teclas conservam sua função de edição.
10. **Dado** a execução, **Quando** a aba fica em segundo plano e volta à frente, **Então** a simulação permanece pausada no último estado, sem avançar ticks pelo tempo fora da aba.
11. **Dado** o Duelo parado no tick 10, **Quando** o usuário clica duas vezes em “Voltar 1 Tick”, ao lado de “Avançar 1 tick”, **Então** cena, inspeção, eventos e gravação corrente terminam no tick 8. No tick 0 e durante a execução o botão fica desabilitado.
12. **Dado** um controlador com memória, registros e sorteios, **Quando** a sessão volta e retoma por passo ou execução contínua, **Então** todos os estados e eventos são idênticos aos de uma execução contínua com as mesmas entradas, inclusive em ticks novos. Voltar do fim da luta remove o resultado até avançar de novo ao tick final.
13. **Dado** um mundo livre além de 100 000 ticks, **Quando** o usuário retrocede e avança através desse limite, **Então** cada ação percorre exatamente um tick e a gravação vai do tick 0 ao menor entre o tick exibido e 100 000.
14. **Dado** prazo de 5 s no Duelo, **Quando** houver pausa, retrocesso e retomada, **Então** o tempo segue os ticks observados, e a escolha só reabre ao começar outra rodada.
15. **Dado** o tick 249 sem progresso, **Quando** um passo ou um lote atingir o tick 250, **Então** registrar um empate, descartar o saldo do lote e publicar a próxima rodada pausada no tick 0. Pulsos adicionais deixam o tick em zero. Novo avanço explícito reproduz o primeiro passo original.
16. **Dado** o Duelo com dois Caçadores e “Regra de Tempo” em 10 s, **Quando** a rodada passar do tick 507 ao 508, inclusive após retroceder, **Então** registrar o empate, disponibilizar o replay e restaurar o tick 0 pausado. No tick 507 resta 0.02 s.

---

### User Story 3 — Carregar mundos e escrever controladores (Prioridade: P1)

Como membro da equipe, quero escolher ou abrir um mundo e escrever a estratégia de cada robô na própria tela, para testar ideias sem sair do navegador.

**Por que esta prioridade:** o usuário descreve o mundo num arquivo e escreve o controlador (RB-22, RB-23).

**Teste independente:** trocar de mundo, abrir arquivos válidos e inválidos, editar e aplicar controladores.

**Cenários de aceitação:**

1. **Dado** o seletor de modo, **Quando** o usuário escolhe Labirinto, **Então** a cena e os painéis passam a refletir esse mundo no tick 0, com o controlador "Navegador" no robô `explorador`.
2. **Dado** o botão "Abrir mundo", **Quando** o usuário escolhe um arquivo de mundo válido, **Então** o mundo é carregado no tick 0 e todos os robôs começam com o controlador "Parado".
3. **Dado** um arquivo de mundo com 3 erros, **Quando** o usuário o abre, **Então** aparece a lista dos 3 erros, cada um com código, caminho e mensagem em pt-BR, e o mundo anterior continua carregado e intacto.
4. **Dado** a aba "Controladores", **Quando** o usuário escolhe um exemplo para um robô (Parado, Avança, Girador, Caçador, Desviador ou Navegador), **Então** o código do exemplo aparece no editor daquele robô.
5. **Dado** um código alterado e não aplicado, **Quando** o usuário olha o cartão do robô, **Então** aparece o aviso "alterações não aplicadas"; **Quando** clica em "Aplicar", **Então** o código é verificado e, se válido, a simulação é reiniciada com o novo controlador.
6. **Dado** um código com erro de sintaxe, **Quando** o usuário clica em "Aplicar", **Então** aparece `CONTROLADOR_INVALIDO` com o detalhe original (e a linha, quando disponível). O código aplicado, a gravação e o modo em curso são preservados e o rascunho segue editável.
7. **Dado** um editor de controlador, **Quando** o usuário clica em "Salvar código", **Então** o navegador baixa um arquivo `.js` com o código; **Quando** clica em "Abrir código" e escolhe um arquivo `.js`, **Então** o código aparece no editor, ainda não aplicado.
8. **Dado** um robô cujo controlador falha durante a execução, **Quando** o erro ocorre, **Então** o cartão do robô mostra "desativado" com a mensagem do erro, e a simulação continua.
9. **Dado** que há rascunhos nos dois robôs, **Quando** o usuário aplica um deles, **Então** só esse código muda na configuração em execução e o rascunho do outro permanece. "Restaurar exemplo" repõe no editor o último exemplo escolhido para aquele robô, com o exemplo inicial como padrão, deixando a aplicação a cargo de "Aplicar".

---

### User Story 4 — Inspecionar sensores, eventos e resultado (Prioridade: P2)

Como membro da equipe, quero ver em números o que cada robô está sentindo e fazendo, para entender por que a estratégia tomou cada decisão.

**Por que esta prioridade:** painel de inspeção é escopo completo (RB-39).

**Teste independente:** comparar os valores do painel com o estado do núcleo em ticks conhecidos.

**Cenários de aceitação:**

1. **Dado** o tick 0 do "Duelo padrão", **Quando** o usuário abre a aba "Inspeção", **Então** o cartão de `vermelho` mostra: situação "ativo"; pose x −0,200 m, y 0,000 m, θ 0,0°; odometria igual à pose; comando (0,00 m/s; 0,00 rad/s); bumper "inativo"; e a tabela do laser com 5 linhas (raio, ângulo relativo e distância): −30°/0,800, −15°/0,800, 0°/0,350, 15°/0,800, 30°/0,800.
2. **Dado** a simulação avançando, **Quando** o estado muda, **Então** o painel mostra os valores do estado exibido na cena (nunca de outro tick).
3. **Dado** um robô empurrado, **Quando** o usuário olha o cartão, **Então** vê a pose real, a odometria e a diferença entre elas em metros.
4. **Dado** a aba "Eventos", **Quando** ocorrem logs, erros de controlador ou o fim da luta, **Então** cada evento aparece com tick, robô, tipo e mensagem, em ordem, com erros destacados. É possível filtrar por robô e por tipo. O evento da luta aparece como "Partida", sem associação ao vencedor. Dos eventos que atendem aos filtros, aparecem os 500 mais recentes em ordem e a quantidade oculta.
5. **Dado** os controladores padrão, **Quando** a luta termina, **Então** aparece o aviso de resultado "Vitória de vermelho — saída da arena · tick 34 · 0,68 s", com os botões "Reiniciar" e "Ver replay".
6. **Dado** uma luta que termina por tempo, **Quando** ela termina, **Então** o aviso diz "Empate — tempo esgotado"; se os dois saírem juntos, "Empate — os dois saíram da arena".
7. **Dado** um robô de sumô que cruza a faixa entre dois ticks, **Quando** a inspeção avança, retrocede, reinicia ou exibe uma gravação v1, v2 ou v3, **Então** as quatro leituras correspondem ao tick mostrado. No modo livre, a inspeção informa que a borda está indisponível.

---

### User Story 5 — Gravar e assistir ao replay (Prioridade: P2)

Como membro da equipe, quero rever qualquer momento da luta, avançando e voltando, e guardar a luta num arquivo, para analisar e compartilhar o que aconteceu.

**Por que esta prioridade:** gravação e replay são escopo completo (RB-40) e o ponto alto da demo.

**Teste independente:** executar, entrar no replay, navegar, exportar e reimportar a gravação.

**Cenários de aceitação:**

1. **Dado** uma execução no modo ao vivo, **Quando** os ticks avançam, **Então** todos os estados, desde o tick 0, ficam gravados automaticamente.
2. **Dado** uma luta encerrada no tick 34, **Quando** o usuário clica em "Ver replay", **Então** a tela entra no modo replay pausada no tick 0, com a linha do tempo de 0 a 34 e a edição de mundo e de controladores bloqueada.
3. **Dado** o modo replay, **Quando** o usuário arrasta a linha do tempo até o tick 20, **Então** a cena, o contador e o painel de inspeção mostram exatamente o estado 20 gravado.
4. **Dado** o modo replay no tick 20, **Quando** o usuário usa "Voltar 1 Tick" (ou a seta para a esquerda) e "Avançar 1 tick", **Então** vai ao tick 19 e ao tick 20, respectivamente; "Executar" reproduz a gravação na velocidade escolhida.
5. **Dado** uma gravação, **Quando** o usuário clica em "Exportar gravação", **Então** o navegador baixa um arquivo com o mundo, os controladores e todos os estados.
6. **Dado** o arquivo exportado, **Quando** o usuário clica em "Abrir gravação" e o escolhe, **Então** a tela entra no modo replay pausada no tick 0 e reproduz exatamente os estados exportados, inclusive quando a gravação é parcial.
7. **Dado** um arquivo de gravação corrompido ou de outro tipo, **Quando** o usuário tenta abri-lo, **Então** aparece o erro `GRAVACAO_INVALIDA` com a explicação, e a tela continua como estava.
8. **Dado** uma gravação, **Quando** seu mundo e seus controladores são executados de novo pelo núcleo pelo mesmo número de ticks, **Então** os estados obtidos são idênticos aos gravados.
9. **Dado** o modo replay, **Quando** o usuário clica em "Sair do replay", **Então** volta ao modo ao vivo pausado no tick 0, com o mundo e os controladores da gravação. Se houver falha na preparação ao vivo, os erros são exibidos e o replay permanece disponível no mesmo tick.
10. **Dado** uma execução livre no tick 100 000, **Quando** ela chega ao tick 100 001, **Então** o estado ao vivo avança, a tela informa "limite de gravação atingido" e a gravação contém exatamente 100 001 estados, do tick 0 ao 100 000.
11. **Dado** o replay no primeiro ou último tick gravado, **Quando** o usuário tenta ir além da extremidade correspondente, **Então** o cursor permanece naquela posição. A reprodução contínua para ao atingir o último tick.
12. **Dada** uma gravação legada ou uma rodada empatada, **Quando** o replay alcança o último tick, **Então** conserva o último estado e não prepara uma nova batalha.
13. **Dada** uma gravação anterior à regra de giro em que os dois Caçadores passam do tick 508, **Quando** aberta e salva novamente, **Então** conserva o resultado e a contagem individuais. Uma gravação nova reproduz o empate no tick 508 para o prazo de 10 s.

---

### User Story 6 — Modo apresentação (Prioridade: P3)

Como apresentador do pitch, quero uma tela limpa e legível de longe, para que a plateia acompanhe a luta.

**Por que esta prioridade:** melhora a demo, mas não é exigida pelo briefing.

**Teste independente:** ativar o modo e conferir o que aparece.

**Cenários de aceitação:**

1. **Dado** a tela normal, **Quando** o usuário ativa "Modo apresentação" (ou pressiona P), **Então** os painéis laterais somem, a cena ocupa a tela toda e aparece um placar grande com os nomes e cores dos robôs, o tempo e, ao final, o resultado.
2. **Dado** o modo apresentação, **Quando** o usuário pressiona Esc ou P, **Então** a tela normal volta, sem alterar a simulação.
3. **Dado** a janela com 1024 px de largura e navegação por teclado, **Quando** o usuário percorre os controles, **Então** pode operá-los com rótulos textuais e foco visível, e o painel lateral pode ser recolhido. A 1023 px o painel fica abaixo da cena, sem reiniciar a sessão.

---

### 3.7 Casos de borda

- Trocar de mundo durante a execução: após validar o candidato, a simulação pausa, o novo mundo é carregado no tick 0 e a gravação anterior é descartada. Uma troca inválida preserva a sessão em curso.
- Aplicar controlador durante a execução: a simulação reinicia pausada no tick 0 se o controlador for válido.
- Gravação muito longa: a gravação inclui o tick 100 000 e para nesse limite. Ao salvar esse tick, o aviso "limite de gravação atingido" aparece e a execução ao vivo pode continuar.
- Janela redimensionada: a cena se ajusta sem distorcer e sem reiniciar a simulação.
- Aba do navegador em segundo plano: a execução pausa automaticamente e não "dispara" ticks acumulados ao voltar.
- Mundo com 8 robôs: todos aparecem nas abas de controladores e de inspeção, com rolagem.
- Mais de 500 eventos que atendem aos filtros: a aba mostra os 500 mais recentes, com o aviso de quantos foram ocultados.

---

## 4. Requisitos funcionais

### 4.1 Princípios

- **FR-001:** A tela NÃO DEVE calcular nenhum comportamento da simulação; DEVE apenas exibir os estados produzidos pelo núcleo e enviar comandos de operação (executar, pausar, avançar, reiniciar, carregar). *(RB-28)*
- **FR-002:** O que a tela exibe (cena, contador e painéis) DEVE corresponder sempre a um único estado do núcleo, o mesmo para todos os elementos. *(RB-28)*
- **FR-003:** Toda a interface DEVE estar em pt-BR, com números no formato pt-BR. *(RB-20, Constituição VIII)*
- **FR-004:** A taxa de desenho da tela NÃO DEVE influenciar o resultado da simulação. *(RB-27)*

### 4.2 Cena 3D

- **FR-005:** A cena DEVE representar o plano da simulação como o chão, com +x para a direita e +y para o fundo na vista inicial. *(RB-21, RB-36)*
- **FR-006:** A cena DEVE mostrar: chão com grade de 0,1 m; paredes baixas nas bordas do mapa; arena, quando existir, como disco escuro com borda branca de largura igual a 5% do raio; obstáculos como caixas; robôs como cilindros na cor do mundo, com altura igual ao raio e um indicador de frente apontando para θ. *(RB-36)*
- **FR-007:** A cena DEVE mostrar, para cada robô com laser, um segmento por raio, partindo do centro do robô até a distância lida; raios com leitura menor que o alcance máximo aparecem como **atingiu** (cor quente e marcador no ponto atingido) e os demais como **livres** (traço claro e translúcido). A distinção NÃO DEVE depender só da cor. *(RB-37)*
- **FR-008:** A cena DEVE permitir ligar e desligar os raios e os rótulos com o `id` de cada robô. *(RB-37)*
- **FR-009:** Robôs desativados DEVEM aparecer acinzentados com ícone de alerta; robôs fora da arena, com destaque de contorno. *(RB-25, ADR-003)*
- **FR-010:** A câmera DEVE ser orbital: girar (arrastar com botão esquerdo), aproximar e afastar (roda do mouse, entre 0,3 m e 20 m do ponto de interesse) e deslocar (botão direito ou Shift + arrastar), além dos botões "Vista de cima", "Vista 3D" e "Centralizar". *(RB-36)*
- **FR-011:** A vista inicial DEVE enquadrar todo o mapa (ou toda a arena, quando houver) em perspectiva elevada. *(RB-36)*

### 4.3 Controles de tempo

- **FR-012:** A tela DEVE oferecer "Executar", "Pausar", "Avançar 1 tick", "Voltar 1 Tick" e "Reiniciar". Os dois comandos de passo ficam adjacentes e disponíveis com a sessão parada quando existe um passo naquela direção. Retroceder deixa a sessão pausada no estado anterior completo. Retomar reproduz a trajetória, incluindo a memória e os sorteios de cada estratégia. "Executar" e "Avançar" ficam desabilitados após o fim da luta. *(RB-24, ADR-017)*
- **FR-013:** A tela DEVE exibir o tick atual, o tempo atual (em segundos, 2 casas decimais) e o status ("pronta", "executando", "pausada", "finalizada"). "Pronta" identifica uma sessão parada no tick 0 após carregar ou reiniciar. *(RB-24)*
- **FR-014:** A tela DEVE oferecer as velocidades 0,25×, 0,5×, 1×, 2× e 4×; em 1×, o tempo simulado acompanha o tempo real dentro da resolução de um passo, se o computador acompanhar. *(RB-24)*
- **FR-015:** Nenhum tick DEVE ser pulado; quando o computador não acompanhar a velocidade escolhida, a execução desacelera e o aviso "abaixo do tempo real" é mostrado. *(RB-24, RB-27)*
- **FR-016:** "Reiniciar" DEVE voltar ao tick 0 do mundo atual, com os controladores recarregados (Spec 002, FR-015), e iniciar uma nova gravação. *(RB-24, RB-40)*
- **FR-017:** A tela DEVE oferecer os atalhos: Espaço (executar/pausar), seta para a direita (avançar 1 tick), seta para a esquerda (voltar 1 tick, só no replay), R (reiniciar) e P (modo apresentação); os atalhos são ignorados quando o foco está num campo de texto ou no editor. *(RB-17, RB-24)*
- **FR-018:** Quando a aba do navegador ficar em segundo plano, a execução DEVE pausar. *(RB-24)*

### 4.4 Mundos e controladores

- **FR-019:** A tela DEVE oferecer o seletor Modo com Sumô e Labirinto (FR-044) e um botão "Abrir mundo" para escolher um arquivo `.json`. *(RB-22)*
- **FR-020:** Ao abrir um mundo inválido, a tela DEVE listar todos os erros (código, caminho, mensagem) e manter o mundo anterior. *(RB-46)*
- **FR-021:** Ao carregar um mundo, os controladores iniciais DEVEM ser: no "Duelo padrão", `vermelho` com "Caçador" e `azul` com "Girador"; nos três labirintos, `explorador` com "Navegador"; em mundos abertos de arquivo, "Parado" para todos. *(RB-22, RB-23, ADR-003)*
- **FR-022:** A tela inicial DEVE abrir com o "Duelo padrão" e seus controladores iniciais, no tick 0, pausada. *(RB-24, ADR-003)*
- **FR-023:** A aba "Controladores" DEVE ter um cartão por robô (com `id` e cor), contendo: seletor de exemplos (Spec 002, Anexo D), editor de código com fonte monoespaçada e números de linha, aviso de "alterações não aplicadas" e os botões "Aplicar", "Restaurar exemplo", "Abrir código" (`.js`) e "Salvar código" (`.js`). *(RB-23)*
- **FR-024:** "Aplicar" DEVE verificar o controlador; se inválido, mostrar a mensagem de `CONTROLADOR_INVALIDO` e manter o controlador anterior; se válido, reiniciar a simulação com ele. *(RB-23, ADR-014)*
- **FR-025:** Erros de controlador durante a execução DEVEM aparecer no cartão do robô ("desativado" + mensagem) e na aba "Eventos". *(RB-23, RB-39)*

### 4.5 Inspeção e eventos

- **FR-026:** A aba "Inspeção" DEVE ter um cartão por robô com: situação; pose real (x e y em metros com 3 casas; θ em graus com 1 casa); odometria no mesmo formato; diferença entre pose real e odometria (em metros); comando efetivo (v em m/s e w em rad/s, com 2 casas); bumper ("ativo"/"inativo", com ícone); e tabela do laser (número do raio, ângulo relativo em graus e distância com 3 casas), acompanhada de um gráfico de barras das distâncias. *(RB-39)*
- **FR-027:** A aba "Eventos" DEVE listar os eventos (tick, robô, tipo, mensagem) em ordem, com filtro por robô e por tipo, destacando erros; DEVE exibir os 500 mais recentes e informar quantos foram ocultados. *(RB-39, ADR-013)*
- **FR-028:** Ao fim de uma luta, a tela DEVE mostrar um aviso de resultado com vencedor (ou empate), motivo em pt-BR ("saída da arena", "tempo esgotado", "os dois saíram da arena"), tick e tempo, e os botões "Reiniciar" e "Ver replay". *(RB-25)*

- **FR-042:** A inspeção DEVE identificar Frente, Traseira, Esquerda e Direita de cada robô de sumô e exibir em texto se cada lado está na borda ou no interior, conforme S2-FR-038. A leitura acompanha o tick exibido, inclusive em replay de gravações anteriores. No modo livre informa indisponibilidade. *(RB-39, ADR-020)*

### 4.6 Gravação e replay

- **FR-029:** Toda execução no modo ao vivo DEVE ser gravada automaticamente, desde o tick 0, até 100 000 ticks. *(RB-40)*
- **FR-030:** A gravação DEVE conter: identificação do formato e sua versão, o mundo (texto original), os controladores de cada robô (texto), a data de criação e a lista de estados completos e consecutivos, a partir do tick 0, incluindo eventos e resultado. *(RB-40)*
- **FR-031:** O modo replay DEVE exibir exclusivamente os estados gravados, sem executar o núcleo nem os controladores; DEVE oferecer linha do tempo, "Executar", "Pausar", "Avançar 1 tick", "Voltar 1 Tick" e as mesmas velocidades do modo ao vivo; e DEVE bloquear a edição de mundo e de controladores. *(RB-40)*
- **FR-032:** A tela DEVE permitir "Exportar gravação" (baixar arquivo `.json` com nome `sheepbotz-<nome do mundo>-<AAAA-MM-DD-HHmm>.json`) e "Abrir gravação". *(RB-40)*
- **FR-033:** Ao abrir uma gravação inválida (estrutura incorreta, versão desconhecida, mundo inválido ou estados incompatíveis com o mundo), a tela DEVE mostrar o erro `GRAVACAO_INVALIDA` com a explicação e manter o estado anterior. *(RB-40)*
- **FR-034:** Reexecutar no núcleo o mundo e os controladores de uma gravação produzida pela aplicação, com a mesma semente e até seu último tick gravado, DEVE produzir estados idênticos aos gravados. *(RB-27, RB-40)*
- **FR-035:** "Sair do replay" DEVE voltar ao modo ao vivo com o mundo e os controladores da gravação, no tick 0. Se o núcleo rejeitar a preparação, a tela DEVE exibir os erros e conservar o replay. *(RB-40)*

### 4.7 Modo apresentação

- **FR-036:** A tela DEVE oferecer o "Modo apresentação", que esconde os painéis, amplia a cena e mostra um placar grande (robôs com nome e cor, tempo e resultado), ativado por botão ou pela tecla P e encerrado por P ou Esc. *(RB-17)*

### 4.8 Acessibilidade e layout

- **FR-037:** Todos os controles DEVEM ser acessíveis por teclado, com foco visível e rótulo textual (inclusive botões com ícone). *(RB-20, Constituição VIII)*
- **FR-038:** Textos e controles DEVEM ter contraste mínimo de 4,5:1 com o fundo. *(RB-20, Constituição VIII)*
- **FR-039:** O layout DEVE funcionar a partir de 1024 px de largura, com a cena ao centro e o painel lateral recolhível; abaixo disso, o painel passa para baixo da cena. *(RB-20)*
- **FR-040:** Conforme ADR-018 e ADR-019, no sumô ao vivo, usar a lista “Regra de Tempo” para selecionar 5, 10 ou 30 segundos de tolerância temporal, inicialmente 10, junto aos controles. Fixar a escolha a partir do primeiro passo, inclusive após retroceder a zero. Exibir o menor tempo restante entre as contagens individual e conjunta ativas. Pausa conserva o tempo restante. Retroceder recupera a contagem do tick observado. Um empate por impasse encerra a rodada sem pontos, registra seu número, motivo, tick e tempo e restaura o estado inicial com as mesmas fontes aplicadas, semente e prazo. A rodada seguinte fica pausada no tick 0, aguardando Executar ou Avançar 1 tick.
- **FR-041:** Conforme ADR-018, mostrar o último empate e disponibilizar o replay da última rodada empatada até o limite de gravação já definido. Cada rodada começa com histórico próprio. Gravações anteriores continuam legíveis e o replay termina no último estado gravado, inclusive quando o motivo é impasse.

---

## 5. Entidades principais

| Entidade | Atributos |
|---|---|
| **Sessão da tela** | modo (ao vivo ou replay), mundo atual, controladores atuais, status, velocidade, opções de exibição |
| **Gravação** | formato e versão, mundo, controladores, data de criação, estados por tick |
| **Opções de exibição** | mostrar raios, mostrar rótulos, vista da câmera, modo apresentação |

---

## 6. Critérios de sucesso

- **SC-001:** Com o "Duelo padrão", a tela mantém pelo menos 30 quadros por segundo no notebook de referência da S2 (Intel Core i5-1334U, Linux x64), em velocidade 1× e com a aba em primeiro plano.
- **SC-002:** Qualquer ação de controle (executar, pausar, avançar, reiniciar, mexer na linha do tempo) tem resposta visível em menos de 100 ms.
- **SC-003:** Uma pessoa que nunca usou o simulador consegue, sem ajuda, carregar o "Duelo padrão", trocar a estratégia de um robô por um exemplo e executar a luta até o fim em menos de 2 minutos.
- **SC-004:** Em 100% dos ticks verificados, o estado mostrado na cena e no painel de inspeção é igual ao estado do núcleo para aquele tick.
- **SC-005:** Uma gravação exportada e reaberta reproduz 100% dos estados originais.
- **SC-006:** Em um ensaio do pitch, pelo menos uma pessoa de fora da equipe identifica quem venceu e o motivo da vitória da luta padrão após assistir à demo, sem explicação do código.

> **Exceção de aceite da Spec 003, aprovada em 2026-11-18.** Para esta entrega,
> a demonstração do Codex substitui as sessões com uma pessoa iniciante e com
> a plateia externa de SC-003 e SC-006.
> [Evidência da T020](../../docs/registro-de-consolidacao.md#exceção-de-aceite-da-t020)

---

## 7. Premissas e decisões

- Convenções C18 e C19 do AGENTS.md §10 foram fixadas nesta spec (ADR-007, aceita).
- O plano detalha a projeção da cena, o agendamento, a estrutura do arquivo de gravação e os protocolos de medição.
- A importação de gravação valida a estrutura dos estados e seus vínculos com o mundo por leitura. A execução dos scripts só é iniciada ao voltar ao modo ao vivo.
- O contorno de saída na cena distingue os desfechos de saída no sumô a partir do resultado publicado. No modo livre, cruzar a borda decorativa da arena não é uma eliminação.
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
| ADR-018, ADR-019 | FR-040, FR-041 |
| RB-39, ADR-020 | FR-042 |
| RB-28 | FR-001, FR-002, FR-004 |
| RB-37 | FR-007, FR-008 |
| RB-39 | FR-026 a FR-028 |
| RB-40 | FR-029 a FR-035 |
| RB-17, RB-20 e Constituição VIII | FR-003, FR-017 e FR-036 a FR-039 |

## Extensão de US3 — Escolher o nível (P2)

**FR-043** (ADR-021, RB-22, RB-24). Os três níveis estão disponíveis na lista Dificuldade do Labirinto (FR-044). A Sala pode ser importada de arquivo. A saída tem marca própria no piso. A chegada suspende o avanço no tick final e mostra a conclusão e o tempo. Nos dois primeiros mapas de catálogo, o comando explícito “Próximo nível” carrega o seguinte pausado no tick 0 com o controlador aplicado. O último informa “Labirinto concluído”. Replay apenas reproduz o nível gravado.

**S3-US3-AC10.** Dada a chegada ao vivo, quando passa tempo real, o nível permanece no tick final. Ao retroceder um tick e avançar, o resultado volta uma vez. Quando o usuário escolhe o próximo nível, a estratégia aplicada continua disponível e o histórico começa no tick 0. A gravação reproduz o tick de chegada e o replay conserva o nível.

**FR-044** (ADR-022, RB-22, RB-24). Modo oferece exatamente Sumô e Labirinto. A escolha de Labirinto abre o Fácil pausado no tick 0. Apenas no labirinto aparece Dificuldade, com Fácil, Médio e Difícil em ordem. Mudar de dificuldade ao vivo abre o mapa escolhido pausado no tick 0 e conserva o código aplicado e o rascunho do explorador. Próximo nível atualiza essa mesma indicação. Em replay, as listas são de consulta.

**S3-US3-AC11.** Dado o Sumô inicial, quando o usuário entra em Labirinto, então vê Fácil selecionado e o simulador pausado. Quando muda diretamente para Difícil e depois Médio, inclusive durante uma execução, cada nível inicia pausado no tick 0 com a mesma estratégia. Ao escolher Sumô, a lista Dificuldade desaparece. Uma nova entrada em Labirinto começa no Fácil.

**S3-US3-AC12.** Dado um mundo de arquivo ou replay, quando a tela mostra os controles, o nome do mundo pode ser consultado. Um mundo livre deixa Modo sem seleção e um labirinto personalizado deixa Dificuldade sem seleção. Os arquivos não acrescentam opções às listas. No replay de um nível do catálogo a dificuldade correspondente aparece selecionada e bloqueada.
