# Quickstart: Spec 001

Passo a passo para rodar e validar a Spec 001 do zero. Executado no fechamento da spec (DoD).

## 1. Pré-requisitos

- Node LTS 24 (`nvm use` lê o `.nvmrc`)
- Git

## 2. Instalação

```bash
npm ci
```

## 3. Qualidade

```bash
npm run lint        # sem erros
npm run typecheck   # sem erros
npm test            # todos os testes passando
npm run test:coverage
```

**Esperado:** todos os testes passam; cobertura de linhas ≥ 80% no projeto e ≥ 90% em `src/core`.

## 4. Linha do README

```bash
npm run stats
```

**Esperado:** a linha do topo do `README.md` e `docs/cobertura/resumo.md` refletem os números da etapa 3.

## 5. Execução sem interface

Use `npm run --silent sim -- ...` para capturar apenas o JSON, sem o cabeçalho do npm.

**Movimento simples:**

```bash
npm run sim -- --world examples/worlds/duelo-padrao.json --ticks 10 --command vermelho=1,0 --pretty
```

**Esperado:** código de saída 0; `tick` 10; `time` 0.2; `vermelho` com pose x ≈ 0.0, y = 0, θ = 0; `azul` em (0.2, 0) com θ = π.

**Empurrão (vermelho empurra azul):**

```bash
npm run sim -- --world examples/worlds/duelo-padrao.json --ticks 30 --command vermelho=1,0 --pretty
```

**Esperado:** `vermelho` em x ≈ 0.25 e `azul` em x ≈ 0.35, ambos com `bumper: true`; a odometria de `vermelho` está em x ≈ 0.4 e a de `azul` continua em x = 0.2. (Sem as regras do sumô, que chegam na Spec 002, a luta não termina.)

**Mundo inválido:**

```bash
npm run sim -- --world tests/fixtures/worlds/invalido-tres-erros.json --ticks 1 --pretty
```

**Esperado:** código de saída 1 e três erros: `VALOR_FORA_DO_INTERVALO` em `dt`, em `seed` e em `robots[0].radius`.

**Robô inexistente:**

```bash
npm run sim -- --world examples/worlds/duelo-padrao.json --ticks 1 --command verde=1,0
```

**Esperado:** código de saída 1 e erro `ROBO_INEXISTENTE` em `commands.verde`.

## 6. Interface (placeholder)

```bash
npm run dev
```

**Esperado:** a página abre com o texto "SheepBotz Arena — em construção".

## 7. Desempenho (SC-003)

```bash
npm run bench
```

**Esperado:** 3 000 ticks com 2 robôs em menos de 1 s; registrar o tempo no fechamento da spec.

### Perfis no núcleo

Rode `npm test -- tests/core/acceptance/s1/perfis.test.ts`. Os confrontos de Nimbo e Baluarte devem reproduzir as posições de S1-US5-AC6/7 nos dois lados e a validação deve usar os raios efetivos.
