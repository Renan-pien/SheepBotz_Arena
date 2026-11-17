# Roteiro de Execução com a z.ai — SheepBotz Arena

> Guia operacional do time (Renan, Julio e Wesley). Siga as etapas **na ordem**. Cada etapa diz quem faz, o que fazer, o prompt exato e o que conferir antes de seguir.

---

## Como funciona

Vocês **não** enviam os arquivos um por um para a z.ai. Todos os arquivos ficam no repositório, e a z.ai os lê sozinha a partir da pasta do projeto. O que vocês enviam são os **prompts** deste roteiro, um de cada vez.

### Mapa dos arquivos, por ordem de importância

| Ordem | Arquivo | Para que serve | Quando a IA usa |
|---|---|---|---|
| 1 | `AGENTS.md` | Regras de comportamento, papéis, processo | Toda sessão (lido automaticamente) |
| 2 | `docs/enunciado.md` | Enunciado oficial | Autoridade máxima em conflitos |
| 3 | `.specify/memory/constitution.md` | Princípios, stack, modalidade | Todo plan (Constitution Check) |
| 4 | `docs/requisitos-briefing.md` | Briefing quebrado em RB-## | Origem dos requisitos |
| 5 | `docs/decisoes.md` | ADRs aprovadas | Sempre que houver dúvida de decisão |
| 6 | `docs/perguntas.md` | Perguntas e propostas padrão | Quando algo não estiver decidido |
| 7 | `specs/001-nucleo-simulacao/spec.md` | Spec 001 | Etapa 2 |
| 8 | `specs/002-sensores-controlador/spec.md` | Spec 002 | Etapa 3 |
| 9 | `specs/003-visualizacao-operacao/spec.md` | Spec 003 | Etapa 4 |
| 10 | `docs/backlog.md`, `docs/rastreabilidade.md`, `docs/ensaio-regeneracao.md`, `README.md` | Apoio | Fechamento de cada spec |

### Regras do operador

- Comece **toda** sessão nova da z.ai com o prompt de abertura (1.1).
- Nunca deixe a z.ai alterar números, fórmulas ou exemplos das specs para "fazer o teste passar". Se o código não bate com a spec, o código está errado, ou a dúvida vem para revisão com o time.
- Não pule o `/speckit.analyze`.
- Faça push ao fim de cada fase de implementação e confira o CI.
- Uma etapa grande por sessão: sessões curtas erram menos.

---

## Etapa 0 — Preparação (vocês, sem IA)

**0.1 Instalar:** Git, Node LTS atual, Python 3.11 ou mais recente e `uv`.

**0.2 Criar o repositório** `sheepbotz-arena` no GitHub (público, para o GitHub Pages funcionar no plano gratuito) e cloná-lo.

**0.3 Inicializar o SpecKit** dentro da pasta do repositório:

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init --here
```

Quando ele perguntar o agente, escolham a z.ai (ou GLM) se aparecer na lista; senão, escolham **opencode**. Confiram as opções com `specify init --help`, porque elas mudam entre versões.

**0.4 Copiar os arquivos do pacote** para a raiz do repositório, **substituindo** o `.specify/memory/constitution.md` que o `specify init` criou.

**0.5 Primeiros commits** (na `main`):

```bash
git add AGENTS.md
git commit -m "docs(agents): adiciona regras globais da IA"
git add docs/enunciado.md docs/requisitos-briefing.md docs/perguntas.md docs/decisoes.md docs/backlog.md
git commit -m "docs(briefing): adiciona enunciado, requisitos, perguntas e decisões"
git add .specify
git commit -m "docs(constitution): ratifica constitution 1.0.0 e inicializa SpecKit"
git add specs
git commit -m "docs(specs): adiciona specs 001, 002 e 003 aprovadas"
git add README.md docs/rastreabilidade.md docs/ensaio-regeneracao.md docs/roteiro.md
git commit -m "docs(setup): adiciona README e documentos de apoio"
git push
```

Se o `specify init` criar outras pastas (por exemplo, a pasta de comandos do agente), incluam no commit da constitution.

---

## Etapa 1 — Primeira sessão com a z.ai

Abram a pasta do repositório no app da z.ai.

**Prompt 1.1 — Abertura (usar no início de TODA sessão):**

```
Leia integralmente AGENTS.md, .specify/memory/constitution.md e docs/decisoes.md.
Não altere nenhum arquivo. Responda apenas:
1. As regras de ouro do projeto, em até 5 linhas.
2. Qual papel você assume em cada etapa do fluxo.
3. Em que etapa o projeto está agora, olhando o repositório, e qual é a próxima.
```

**Conferir:** se ele citou as regras certas e identificou a etapa corretamente. Se errar, peça para reler o AGENTS.md.

**Prompt 1.2 — Propagar a constitution (só uma vez):**

```
/speckit.constitution A constitution já está completa e aprovada. Não altere
princípios, stack, modalidade nem governança. Apenas valide o arquivo e atualize
os templates dependentes (plan-template e tasks-template) para refletirem os
princípios I a IX e o formato de tasks do AGENTS.md §9.3. Mostre o diff antes
de concluir.
```

**Se ele não reconhecer `/speckit.constitution`:** troque o início do prompt por "Abra o arquivo do comando speckit.constitution na pasta de comandos do projeto e execute as instruções dele na íntegra, com este argumento:". Use a mesma troca para todos os comandos `/speckit.*` deste roteiro.

**Commit:** `docs(constitution): propaga princípios para os templates`.

---

## Etapa 2 — Spec 001: Mundo e núcleo de simulação

**2.1 (vocês):**

```bash
git checkout -b 001-nucleo-simulacao
```

**Prompt 2.2 — Clarificação:**

```
/speckit.clarify A spec specs/001-nucleo-simulacao/spec.md foi redigida e aprovada
pelo time. Procure apenas ambiguidades reais que impediriam duas implementações de
produzirem os mesmos resultados. NÃO altere números, fórmulas, exemplos nem as
convenções aprovadas na ADR-007. Se encontrar algo, registre como pergunta em
docs/perguntas.md e pare sem alterar a spec.
```

**Conferir:** se surgiram perguntas, resolvam com o time antes de seguir. Nenhuma pergunta é o resultado esperado.

**2.3 Plano e tasks (já prontos no pacote).** A pasta `specs/001-nucleo-simulacao/` já contém `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` e `tasks.md`, escritos e revisados fora da z.ai (opção B). Não rodem `/speckit.plan` nem `/speckit.tasks` nesta spec.

Commits (na branch da spec):

```bash
git add specs/001-nucleo-simulacao/plan.md specs/001-nucleo-simulacao/research.md specs/001-nucleo-simulacao/data-model.md specs/001-nucleo-simulacao/contracts specs/001-nucleo-simulacao/quickstart.md
git commit -m "docs(S1-plan): adiciona plano da Spec 001"
git add specs/001-nucleo-simulacao/tasks.md
git commit -m "docs(S1-tasks): adiciona tasks da Spec 001"
```

**Prompt 2.4 — Leitura do plano:**

```
Papel: Tech Lead. Leia por completo, sem alterar nada: specs/001-nucleo-simulacao/
spec.md, plan.md, research.md, data-model.md, quickstart.md, todos os arquivos de
contracts/ e tasks.md. Responda:
1. A arquitetura em até 8 linhas (camadas, passo puro, fachada, validação).
2. A ordem das fases e o que é o MVP.
3. Qualquer ponto que você não saberia implementar exatamente como está escrito.
```

**Conferir:** se ele entendeu o passo puro em 9 etapas e a ordem das fases. Dúvidas do item 3 vêm para revisão antes de implementar.

**Prompt 2.5 — Análise:**

```
/speckit.analyze Papel: Auditor de Regeneração. Verifique consistência entre
spec, plan, tasks, contracts e constitution. Liste os problemas por gravidade,
com o arquivo e o trecho envolvidos. NÃO corrija nada: apenas relate.
```

**Conferir:** se houver problemas críticos ou altos, tragam o relatório para revisão antes de implementar. Problemas baixos podem ser anotados e seguir.

**Prompt 2.6 — Implementação, em fases (uma sessão por fase):**

```
/speckit.implement Execute somente a fase <NOME DA FASE> do tasks.md.
Siga o papel do AGENTS.md para cada task. Um commit por task, no formato do
AGENTS.md §7.3. Marque cada task concluída no tasks.md. Ao final da fase, rode
lint, testes e cobertura, mostre os números reais e pare.
```

Ordem das fases: Setup → Fundação → US1 → US2 → US3 → US4 → US5 → US6 → Acabamento.

**Conferir após cada fase:** testes passando, cobertura ≥ 80%, CI verde no GitHub, commits no formato certo. Se algum teste de aceitação não bater com o número da spec, **não deixem alterar a spec**: tragam o caso para revisão.

**Prompt 2.7 — Fechamento:**

```
Feche a Spec 001 conforme a DoD do AGENTS.md §15.2: atualize
docs/rastreabilidade.md (RB → FR → tasks → testes), atualize o README, execute o
quickstart.md do zero e relate o resultado. Liste o que falta para a tag
spec-001-fechada. Não faça merge.
```

**2.8 (vocês):** abrir pull request para a `main`, conferir o CI, fazer o merge e criar a tag:

```bash
git checkout main && git pull
git tag spec-001-fechada && git push --tags
```

**2.9 Ensaio de regeneração da Spec 001:** ver Etapa 5.

---

## Etapa 3 — Spec 002: Sensores, controlador e sumô

Repitam os passos da Etapa 2, trocando `001` por `002` e `S1` por `S2`:

```bash
git checkout -b 002-sensores-controlador
```

Prompts 2.2, 2.4, 2.5, 2.6 e 2.7 iguais (ajustando o caminho da spec e `S1` para `S2`).

**Plano e tasks:** serão escritos e revisados fora da z.ai, como na Spec 001 (opção B). Peçam o pacote da Spec 002 antes de começar esta etapa.

Ao final, tag `spec-002-fechada`.

---

## Etapa 4 — Spec 003: Visualização e operação

```bash
git checkout -b 003-visualizacao-operacao
```

Prompts 2.2, 2.4, 2.5, 2.6 e 2.7 iguais (ajustando o caminho da spec e `S1` para `S3`). Na implementação, o papel principal é **UI Engineer / Design Engineer**.

**Plano e tasks:** serão escritos e revisados fora da z.ai, como na Spec 001 (opção B). Peçam o pacote da Spec 003 antes de começar esta etapa.

Ao final, tag `spec-003-fechada`.

---

## Etapa 5 — Ensaio de regeneração (ao fechar cada spec e antes da entrega)

**5.1 (vocês):**

```bash
git checkout -b ensaio-regeneracao-N
```

**5.2:** abram uma **sessão nova** da z.ai, sem histórico.

**Prompt 5.3:**

```
Papel: Auditor de Regeneração. Siga o AGENTS.md §18.
1. Apague o código de produção em src/, mantendo os testes, os artefatos SDD e a
   configuração do projeto.
2. Reimplemente o sistema usando SOMENTE constitution, specs, plans e tasks,
   sem consultar o histórico do git.
3. Rode toda a suíte de testes e relate quantos passaram e quantos falharam.
4. Para cada falha, identifique se a causa é ambiguidade nos artefatos.
5. Registre o resultado em docs/ensaio-regeneracao.md.
Não corrija nada nos artefatos ainda.
```

**5.4:** levem as falhas para revisão. As correções vão para a spec ou para o plan (na branch da spec), nunca só no código. Depois, descartem a branch de ensaio:

```bash
git checkout main && git branch -D ensaio-regeneracao-N
```

Copiem antes o registro do `docs/ensaio-regeneracao.md` para a `main`.

---

## Etapa 6 — Entrega

- [ ] As três specs fechadas, com tags.
- [ ] README com a linha de testes e cobertura atualizada pelo script, e instruções de como rodar.
- [ ] Relatório de cobertura versionado.
- [ ] `docs/rastreabilidade.md` completo.
- [ ] Ensaio de regeneração final registrado.
- [ ] Demo publicada no GitHub Pages (plano B do pitch).
- [ ] Pitch de até 10 minutos, sem código nos slides, com demo ao vivo do "Duelo padrão".
- [ ] Bônus (só depois de tudo acima): itens do `docs/backlog.md`.

---

## Quando trazer para revisão

- Antes de começar as Specs 002 e 003, para receber o pacote de plano e tasks.
- Quando a leitura do plano (prompt 2.4) levantar dúvidas.
- Quando o `/speckit.clarify` ou o `/speckit.analyze` levantar algo que exija mudar a spec.
- Quando um teste de aceitação não bater com o número da spec.
- Quando o professor responder as perguntas Q-001 a Q-005.
- Para montar o roteiro do pitch.
