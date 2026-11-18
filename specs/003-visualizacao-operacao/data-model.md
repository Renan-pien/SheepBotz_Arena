# Modelo de dados · Spec 003

O mundo e o estado são `World` e `SimState` do núcleo. Seus campos seguem
os [contratos da S1](../001-nucleo-simulacao/contracts/world.md) e o
[estado da S2](../002-sensores-controlador/contracts/state.md).

| Entidade | Campos |
|---|---|
| Sessão viva | `worldText` original, `world` normalizado, `simulation`, `controllers` aplicados por ID, `drafts`, gravação corrente. |
| Rascunho | Texto corrente e ID do último exemplo selecionado. O aviso compara o texto com a fonte aplicada ao robô. |
| Sessão de replay | `mundo` normalizado, `gravação` validada e `cursor` inteiro de 0 ao último índice. |
| `SessionView` | Snapshot observado, mundo, modo, status, velocidade, avisos e erros de carga, opções e fontes aplicadas. |
| Preferências | `velocidade` em 0,25×, 0,5×, 1×, 2× ou 4×. `raios`, `rótulos`, `vista`, `painel` e `apresentação` são opções visuais. `filtros` por robô e por tipo pertencem ao painel. |
| Gravação | `format`, `version`, `world`, `controllers`, `createdAt` e `states` completos em memória. `states` contém do tick 0 ao tick 100 000 inclusive. Na serialização, `events` é a lista cumulativa e `eventCount` é o tamanho inteiro do prefixo referenciado. O [contrato](contracts/gravacao.md) fixa formato, versão, data e vínculo de controladores. |
| Relógio | `tempo` monotônico da última pulsação e `fração` acumulada. O estado não entra no núcleo nem no arquivo. |

## Transições

| Origem | Comando | Resultado |
|---|---|---|
| Ao vivo parada no tick 0 | Executar ou avançar 1 | Executando ou pausada no tick 1. |
| Ao vivo executando | Pausar ou ocultar aba | Pausada no último tick publicado. Sem saldo de tempo. |
| Ao vivo | Reiniciar, carga de mundo ou aplicação válida | Pronta no tick 0, gravação nova. |
| Ao vivo | Carga de mundo ou aplicação inválida | Preserva sessão e rascunhos, apresenta erros. |
| Ao vivo executando ou pausada | Resultado do núcleo | Finalizada com o mesmo snapshot final. |
| Ao vivo ou replay | Abrir gravação válida, ou ver gravação corrente | Replay parado no tick 0. |
| Replay | Seek / passo / execução | Índice limitado ao intervalo gravado. Pausa no fim. |
| Replay | Sair e preparar com sucesso | Sessão viva no tick 0 das fontes gravadas. |
| Replay | Sair com erro do núcleo | Preserva o cursor e mostra erros. |

O relógio e o ciclo de desenho leem a sessão, que é a única dona do avanço
ao vivo. Apenas a sessão mantém a lista mutável de referências a snapshots
da gravação corrente. Um snapshot entregue à interface nunca é editado.
