# Contrato: Arquivo de Mundo → Mundo Normalizado

O formato do arquivo é definido na spec (Anexo B). Este contrato define como cada campo do arquivo vira o `World` normalizado (`../data-model.md`).

| Arquivo | Mundo normalizado | Regra |
|---|---|---|
| `name` | `name` | Padrão `"Mundo sem nome"` |
| `seed` | `seed` | Padrão `1` |
| `dt` | `dt` | Padrão `0.02` |
| `map.width`, `map.height` | `map.width`, `map.height` | Obrigatórios |
| `arena` ausente | `arena: null` | — |
| `arena.radius` | `arena.radius` | — |
| `match` ausente | `match: { mode: 'free', maxTicks: 3000 }` | — |
| `match.mode`, `match.maxTicks` | idem | Padrões `'free'` e `3000` |
| `obstacles` ausente | `obstacles: []` | — |
| `obstacles[k]` | `obstacles[k]` | Mesma ordem do arquivo |
| `robots[i].x`, `.y`, `.theta` | `robots[i].initialPose` | `theta` padrão 0, normalizado com `normalizeAngle` |
| `robots[i].radius` | `radius` | Padrão `0.05` |
| `robots[i].maxLinearSpeed` | `maxLinearSpeed` | Padrão `1.0` |
| `robots[i].maxAngularSpeed` | `maxAngularSpeed` | Padrão `6.0` |
| `robots[i].color` | `color` | Padrão pela posição `i` na paleta: `#E53935`, `#1E88E5`, `#43A047`, `#FDD835`, `#8E24AA`, `#FB8C00`, `#00ACC1`, `#6D4C41` (repete após a 8ª) |
| `robots[i].laser` ausente | `laser: null` | — |
| `robots[i].laser.rays`, `.fov`, `.maxRange` | `laser.rays`, `laser.fov`, `laser.maxRange` | Padrões `5`, `1.0471975511965976`, `1.0` |

## Regras de validação implementadas

- **Tipos:** número = `typeof v === 'number' && Number.isFinite(v)`; inteiro = número com `Number.isInteger(v)`; texto = `typeof v === 'string'`; objeto = não nulo, não lista; lista = `Array.isArray`.
- **Intervalos:** exatamente os do Anexo B da spec, com as desigualdades estritas ou não estritas ali indicadas.
- **Formatos:** `id` com `/^[A-Za-z0-9_-]{1,32}$/`; `color` com `/^#[0-9A-Fa-f]{6}$/`; `match.mode` em `'free' | 'sumo'`.
- **Campos desconhecidos:** cada chave não prevista em cada objeto gera um erro com seu próprio caminho.
- **Geometria (FR-008 a FR-011), só sobre itens válidos:**
  - Obstáculo dentro do mapa: `|x| + width/2 ≤ W/2` e `|y| + height/2 ≤ H/2`.
  - Arena: `radius ≤ min(W, H)/2`.
  - Robô dentro do mapa: `|x| ≤ W/2 − r` e `|y| ≤ H/2 − r`.
  - Robô sobre obstáculo: distância do centro ao ponto mais próximo do retângulo `< r`.
  - Robô sobre robô anterior: distância entre centros `< r_i + r_j`.
  - Deslocamento: `maxLinearSpeed × dt > radius` é erro.
  - No modo `sumo`, `REGRA_DA_MODALIDADE` aponta para `robots` se a lista não tiver 2 itens, para
    `arena` se a arena estiver ausente ou para `robots[i]` se o centro inicial do robô tiver
    `√(x² + y²) > arena.radius`. O centro sobre a borda é aceito e o corpo pode ultrapassá-la.
