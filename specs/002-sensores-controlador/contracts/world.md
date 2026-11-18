# Contrato do mundo na Spec 002

O [formato v1 do arquivo de mundo](../../001-nucleo-simulacao/contracts/world.md) continua
sendo a fonte de campos, limites, unidades, padrões e validações. A S2 consome a configuração
`robots[k].laser`, a arena e `match.maxTicks` já aceitos na S1. A associação de scripts ocorre
através da [biblioteca](core-api.md) ou da [CLI](cli.md), separada do JSON de mundo.

| Configuração v1 | Uso na S2 |
|---|---|
| `robots[k].laser.rays` e `.fov` | Distribuem 1 a 360 raios, da direita à esquerda. Um raio aponta para a frente. Para `2π`, as direções inicial e final coincidem. |
| `robots[k].laser.maxRange` | Limita cada distância em metros. Ausência de laser dá lista vazia. |
| `seed` e ordem de `robots` | Determinam a sequência pseudoaleatória independente de cada robô. |
| `match.mode` e `arena.radius` | Ativam a regra de saída por centro no modo `sumo`. A arena é distinta das paredes do mapa para o laser. |
| `match.maxTicks` | Limite de desempate por tempo no modo `sumo`. |

Os exemplos são o "Duelo padrão" da S1 e "Sala com obstáculos" do Anexo C da [Spec 002](../spec.md).
O valor `maxTicks` em `free` não encerra a simulação. Nomes, geometria e laser passam pelo
validador de mundo existente.
