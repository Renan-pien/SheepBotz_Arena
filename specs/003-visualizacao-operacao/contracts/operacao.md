# Contrato de operação da tela · v1

## Projeção

- Mundo para cena `(x, y) → (x, 0, -y)`. Frente de ângulo θ é o
  vetor `(cos θ, 0, -sin θ)`. Por exemplo, em `(0.2, 0.1)`, θ = π/2,
  o centro projeta em `(0.2, 0, -0.1)` e a frente tem direção −Z.
- Para o raio `i` em `N` raios, o ângulo relativo é zero se N = 1, ou
  `-fov/2 + i*fov/(N-1)`. Seu comprimento é o valor publicado.
- A faixa branca da arena mede 5% do raio, centrada no limite da arena.
  O realce de saída em sumô vem do estado final. O marcador de raio é
  visível quando a leitura é estritamente menor que `maxRange`.
- Vista 3D inicial olha para a origem, enquadra a arena quando configurada
  e o mapa nos demais casos. Vista de cima usa +X à direita e +y para cima.
  Centralizar restaura o alvo e o enquadramento da vista corrente.

## Comandos e estados

| Comando | Ao vivo | Replay |
|---|---|---|
| Executar | Ativo para pronta ou pausada | Ativo antes do último tick. |
| Pausar | Ativo durante execução | Ativo durante execução. |
| Avançar 1 tick | Ativo parada e sem resultado final | Ativo parada e antes do último tick. |
| Voltar 1 Tick | Ao lado de Avançar. Ativo parada e após o tick 0, inclusive no fim da luta. Publica o estado anterior e pausa. | Ativo parada e após o tick 0. |
| Reiniciar | Recarrega mundo e controladores no tick 0 | Volta ao primeiro estado gravado, sem executar scripts. |
| Linha do tempo | Indisponível | Seleciona e pausa no tick observado. |
| Aplicar controlador / Abrir mundo | Prepara e troca sessão no sucesso | Bloqueado. |
| Abrir gravação | Valida sem executar scripts | Valida sem executar scripts. |
| Sair do replay | Indisponível | Prepara estado vivo no tick 0 ou preserva o replay em erro. |

A tela usa um único snapshot para descrição visual, tick, inspeção, eventos
e resultado. Atualização de velocidade, aba e configurações visuais não
modifica as fontes nem o snapshot. Espaço, setas e R respeitam a habilitação
e o foco. Campos editáveis, seletores e controles nativos preservam suas
teclas de interação. P alterna apresentação e Esc sai da apresentação.

## Mensagens e formatos

Os caminhos e códigos do núcleo aparecem junto das mensagens originais.
A abertura assíncrona de um arquivo usa somente o resultado do último
pedido de abertura e descarta uma resposta que perdeu a sessão de origem.
O cartão do robô mostra o primeiro erro que o desativou desde o reset. O
painel de eventos aplica os filtros antes de limitar as 500 entradas mais
recentes e rotula eventos com `robotId: null` como **Partida**.
Associações, unidades, casas decimais e mensagens de resultado seguem a
Spec 003. Distinguir raios, alertas e tipos de evento por texto ou forma
além da cor.

## Nomes acessíveis e formatos

- A região da cena se chama **Cena 3D**. As opções são **Mostrar raios**
  e **Mostrar rótulos**. **Controladores**, **Inspeção** e **Eventos**
  têm papel de aba. Inspeção e Eventos também nomeiam as regiões de conteúdo.
- **Modo** oferece **Sumô** (`sumo`) e **Labirinto** (`maze`). No Labirinto, **Dificuldade** oferece **Fácil** (`facil`), **Médio** (`medio`) e **Difícil** (`dificil`). Cada lista tem um rótulo acessível próprio. O arquivo da Sala continua disponível em **Abrir mundo**.
  Os campos de arquivo têm rótulos **Abrir mundo** e **Abrir gravação**.
  Os erros de preparação ou de arquivo aparecem em uma região de alerta.
- Os nomes por robô são **Exemplo de `<id>`**, **Código de `<id>`**,
  **Aplicar `<id>`**, **Restaurar exemplo de `<id>`**, **Abrir código de `<id>`**
  e **Salvar código de `<id>`**. O editor é uma caixa de texto nomeada
  e fica somente para leitura no replay. A falha em execução aparece
  como `desativado · <mensagem>`.
  Com foco no editor de um robô, a barra de inserção clara indica onde o próximo caractere será digitado. Clique e setas usam a navegação nativa do texto em ambos os modos.
- O cartão de inspeção se chama **Inspeção de `<id>`**. A pose tem formato
  `x <x> m · y <y> m · θ <ângulo>°`, com uma casa no ângulo. O sinal
  negativo visível é `−`. **Pose real**, **Odometria** e **Diferença**
  aparecem como pares de rótulo e valor.
- Os filtros são **Robô do evento** e **Tipo de evento**. A lista vazia
  mostra “Nenhum evento para os filtros selecionados.”. Eventos globais
  usam o rótulo **Partida** em destaque.
- O banner tem **Reiniciar luta** como nome acessível de Reiniciar e
  **Ver replay**. O controle deslizante é **Linha do tempo**.
- O modo apresentação tem a região **Placar**. O painel complementar
  tem os botões **Recolher painel** e **Expandir painel**, com estado expandido.

A aba inicial é **Controladores**. O rodapé mantém o botão **Reiniciar**
habilitado no fim da luta, além da ação **Reiniciar luta** no banner. Tick,
tempo e status são elementos de texto separados no rodapé. O tempo inclui
duas casas e a unidade, por exemplo “0,06 s”.

Cada ângulo relativo do laser usa uma casa decimal, por exemplo “−30,0°”.
O aviso de limite dos eventos usa “1 evento oculto” no singular e
“<quantidade> eventos ocultos” no plural.

## Rodadas de sumô

“Regra de Tempo” contém 5 s, 10 s e 30 s. Disponível antes do primeiro avanço da rodada ao vivo parada. Exibir “Tempo até impasse” em segundos com duas casas, calculado pelo prazo menos (tick − início do intervalo ativo mais antigo) × dt, no mínimo zero. Durante o replay, mostrar a contagem apenas para gravações com detector. Após o empate mostrar último resultado e acesso à gravação anterior, inclusive quando o novo histórico só contém o tick 0. Reinício manual ou troca de mundo/controlador inicia uma sessão de rodadas nova.

## Inspeção da borda

Em sumô, o cartão de cada robô apresenta Frente, Traseira, Esquerda e Direita com os estados textuais “Na borda” e “Interior”. O modo livre apresenta “Indisponível no modo livre”. A inspeção consulta o tick exibido também no reset e no retrocesso.

## Labirinto · ADR-021

Os níveis 1, 2 e 3 são Fácil, Médio e Difícil. A saída quadriculada corresponde ao retângulo físico. O status ao vivo é `pausada` no tick da chegada. O banner mostra “Nível concluído em … s” (“Labirinto concluído” no terceiro mapa), o tick, **Reiniciar nível** e **Ver replay**. Nos dois primeiros níveis do catálogo, **Próximo nível** aparece também em apresentação. Avançar de nível e executar são duas ações explícitas distintas. **Voltar 1 Tick** permite rever o estado anterior. A modalidade usa as APIs comuns de navegação. O painel indica “Indisponível no labirinto” para a borda de sumô.

A entrada pelo seletor **Modo → Labirinto** abre o Fácil pausado no tick 0. Tanto uma troca direta em Dificuldade quanto Próximo nível preservam o controlador aplicado e o rascunho. No replay as listas indicam o mundo e o nível conhecidos e ficam bloqueadas. Mundos de arquivo são identificados pelo nome ao lado dos controles. Modo fica sem seleção em mundos livres e Dificuldade fica sem seleção em labirintos fora do catálogo.

Na v5, a indicação “Largada em … s” usa duas casas e o tempo observado. O tempo até impasse de uma rodada em andamento aparece a partir da liberação e usa como início mínimo o tick de liberação. Em queima, `pausada` no tick terminal permite Voltar, Reiniciar e Ver replay. O aviso com a pontuação aparece também no modo apresentação.

Com a ADR-024, “Queimou” acompanha o robô desde a primeira pose de infração até a pausa final. A indicação permanece visível mesmo com os nomes ocultos. Durante esse intervalo, Executar e Pausar seguem o relógio normal e os botões de avançar e voltar percorrem os snapshots. O aviso final identifica o tick da infração e o do encerramento. Em uma v5 importada continua valendo o aviso original.

### Editor por linguagem
Lista Linguagem independente em cada cartão. Abrir .por ou .js seleciona a linguagem correspondente sem aplicar. Salvar usa a extensão do rascunho. O botão ? tem nome acessível e abre tutorial da linguagem e modalidade, também disponível no replay. Preservar o rascunho, o foco ao fechar e o estado da simulação.

### Cenário do sumô

O seletor nativo Cenário permite escolher Clássico, Dojô de Bambu ou Hangar Orbital no sumô ao vivo ou em replay. Trocar a preferência só redesenha o entorno. A troca pode ocorrer com a simulação pausada ou em execução. A apresentação usa o fundo selecionado.

### Selecionar robôs

A escalação pertence ao sumô ao vivo. O modelo ocupado por uma equipe fica indisponível à outra. Cancelar descarta o rascunho da seleção. Confirmar substitui a rodada no tick 0 após validação completa do mundo. Uma falha preserva a sessão e informa os erros.

A grade agrupa os nove perfis por Peso leve, Peso médio e Peso pesado. São admitidos duelos dentro e entre categorias. Gerar outro labirinto usa uma nova semente. Se as paredes sorteadas coincidirem com as atuais na mesma dificuldade, inverter o bit de paridade e gerar novamente. O mapa retangular transposto sempre distingue o segundo resultado. Abrir o replay usa o JSON integral da partida.
