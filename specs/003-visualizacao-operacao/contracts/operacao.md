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
| Voltar 1 tick | Indisponível | Ativo parada e após o tick 0. |
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
- O seletor é **Mundo**, com valores de catálogo `duelo` e `sala`.
  Os campos de arquivo têm rótulos **Abrir mundo** e **Abrir gravação**.
  Os erros de preparação ou de arquivo aparecem em uma região de alerta.
- Os nomes por robô são **Exemplo de `<id>`**, **Código de `<id>`**,
  **Aplicar `<id>`**, **Restaurar exemplo de `<id>`**, **Abrir código de `<id>`**
  e **Salvar código de `<id>`**. O editor é uma caixa de texto nomeada
  e fica somente para leitura no replay. A falha em execução aparece
  como `desativado · <mensagem>`.
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
