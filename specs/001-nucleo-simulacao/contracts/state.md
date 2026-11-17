# Contrato: Estado da Simulação

Estrutura de `SimState` (`../data-model.md`), também usada na saída JSON do comando headless. Números são impressos sem arredondamento.

## Exemplo: "Duelo padrão" no tick 0

```json
{
  "tick": 0,
  "time": 0,
  "robots": [
    {
      "id": "vermelho",
      "pose": { "x": -0.2, "y": 0, "theta": 0 },
      "command": { "v": 0, "w": 0 },
      "bumper": false,
      "odometry": { "x": -0.2, "y": 0, "theta": 0 }
    },
    {
      "id": "azul",
      "pose": { "x": 0.2, "y": 0, "theta": 3.141592653589793 },
      "command": { "v": 0, "w": 0 },
      "bumper": false,
      "odometry": { "x": 0.2, "y": 0, "theta": 3.141592653589793 }
    }
  ]
}
```

## Regras

- `robots` sempre na ordem de `world.robots`.
- `time` é sempre `tick × dt`.
- `command` é o comando **efetivo** (após saturação) aplicado no último tick.
- `bumper` indica contato registrado no último tick.
- A Spec 002 acrescenta campos; consumidores devem ignorar campos que não conhecem.
