# Enunciado do trabalho

> Fonte oficial do projeto e autoridade nº 1 na hierarquia do `AGENTS.md` §2. Texto copiado do enunciado entregue pelo professor, sem alterações de conteúdo (apenas formatação Markdown). As descrições das Trilhas 1, 2 e 3 foram omitidas por não se aplicarem a este projeto; todo o restante está completo.

**Título:** Trabalho Final - Trilhas de Spec Driven Development (SDD)

## Instruções

Cada grupo escolhe uma de quatro trilhas e constrói o produto do zero com Spec-Driven Development, usando o assistente de IA que preferir.

O código conta, mas a especificação é o artefato principal: no fim, ela precisa ser capaz de recriar o sistema.

Nota: os projetos são provas de conceito (PoCs).
A IA acelera o desenvolvimento, mas o que será avaliado são os documentos gerados (constitution, specs, plans, tasks) e o pitch.
Com o pouco tempo disponível, pensem sempre num escopo reduzido,
o mínimo viável: é melhor uma PoC pequena, bem especificada e funcionando do que um sistema grande e incompleto

## Regras

Grupo: o trabalho é feito estritamente em grupo, e cada grupo escolhe uma trilha.
Assistente de IA: livre. Vale OpenCode, Kiro, Antigravity ou outro agente de código.
Framework de SDD: GitHub SpecKit ou OpenSpec, à escolha do grupo, inclusive no ciclo greenfield.
Testes: cobertura mínima de 80%, comprovada por relatório de cobertura no repositório. O README deve exibir, logo no início, a quantidade de testes e o percentual de cobertura, atualizados a cada entrega (por exemplo, "142 testes · 87% de cobertura").
Stack: livre, salvo quando a trilha impõe uma restrição técnica (indicada como Restrição). Toda escolha de stack fica registrada na constitution.
Repositório: um repositório GitHub por dupla. Cada commit aponta para a task que implementa, e cada task para o requisito que atende.
Escopo: cada trilha tem um escopo mínimo, que é a base para aprovação, e um escopo completo, exigido para a nota máxima. Os itens marcados como bônus valem pontos extras.
Ecossistema meuPiá. Os repositórios estão em github.com/meuPia. O Core (Portugol para Python e o comando mpgp), o Maker (ESP32 e Pico com MicroPython) e o Lab (IDE no navegador) podem ser usados, sempre pelas interfaces públicas e sem modificar o código deles. Nas trilhas 1, 3 e 4, usá-los conta para o escopo ou para o bônus, conforme indicado em cada trilha.

## Os ciclos

Todas as trilhas passam pelos mesmos ciclos.

O primeiro é obrigatório; o segundo é opcional.

Greenfield. Constitution, spec, plan, tasks e implementação da PoC, com SpecKit ou OpenSpec. Antes de escrever a spec, o grupo precisa extrair os requisitos do briefing da trilha.
Ele é propositalmente incompleto: perguntas e decisões ficam registradas.
BMAD Method (opcional). Um épico novo, do levantamento aos testes, conduzido com os agentes do BMAD. Vale como bônus (apenas se conseguirmos abordar em aula)

## Trilha 4: SheepBotz Arena (trilha escolhida)

Simulador genérico de robôs móveis no navegador, para a equipe Univille SheepBotz. Complexidade: alta a muito alta.

**O desafio.**
A equipe precisa testar estratégias de controle sem desgastar os robôs físicos.

**O projeto.**
Um simulador no espírito do Stage (Player/Stage), com a aparência de um Gazebo leve: lógica em 2D e visualização 3D com Three.js ou WebGL.
O usuário descreve o mundo num arquivo, escreve o controlador do robô e acompanha a simulação com play, pause, step e reset.

**Referências.**
Gazebo Sim, Stage, Webots, roboton.io, GearsBot, Open Roberta Lab, sBotics e Projeto Thayane.

**Foco sugerido.**
O simulador é genérico, mas o grupo pode escolher uma modalidade para guiar as specs e a demo, como fazem o GearsBot e o Webots (com o Erebus): sumô, seguidor de linha, labirinto ou arena de resgate.
A modalidade escolhida entra na constitution e define as condições de vitória e os mundos de exemplo; o núcleo do simulador continua independente dela.

**Restrições.**
O núcleo de simulação é headless e determinístico (seed e passo de tempo fixos). Ele roda sem interface gráfica, e o renderizador apenas desenha o estado.
Sem motor de física pronto. A cinemática e as colisões são implementadas pela dupla.

**Escopo mínimo.**
Mundo descrito em YAML ou JSON: mapa, obstáculos, robôs e sensores.
Robô de tração diferencial (velocidade linear e angular) com colisão simples.
Sensores: laser ou sonar (raycast com N raios e alcance máximo), odometria e bumper.
Controlador em JS contra uma API limitada (por exemplo, readLaser() e setSpeed(v, w) ), executado a cada tick.
Visualização 3D com câmera orbital e os raios dos sensores visíveis.

**Escopo completo.**
Vários robôs na mesma arena. Painel de inspeção com as leituras dos sensores. Gravação e replay de simulações.

**Bônus.**
Controladores escritos em Portugol, usando o meuPiá Maker.
Controlador remoto via WebSocket, no estilo Player/ROS, para comandar o robô a partir de um programa externo.

**O que os testes de aceitação verificam.**
O núcleo é executado sem interface: posição final do robô após N ticks (com tolerância), leituras do laser em mundos simples e erros claros para arquivos de mundo inválidos

## Entregáveis

Repositório GitHub com constitution, specs, plans, tasks e o README.md explicando como rodar.
Testes automatizados dos critérios de aceite da própria dupla, com cobertura mínima de 80%, o relatório de cobertura e a quantidade de testes e o percentual de cobertura exibidos no README.
Pitch com demo ao vivo de até 10 minutos, sem código nos slides.

## Rubrica de avaliação (100 pontos)

| Parte | Critério | Pontos | O que se avalia |
|---|---|---|---|
| Universal | Pitch e demo | 20 | Clareza, demo funcionando ao vivo, valor para o público da trilha |
| Universal | Constitution e rastreabilidade | 10 | Princípios claros e respeitados; commit → task → requisito; cobertura de testes ≥ 80% |
| Trilha | Qualidade dos artefatos de especificação | 40 | Spec com o quê e o porquê, em user stories com critérios de aceite verificáveis e sem detalhe técnico; plan com as decisões técnicas (arquitetura, stack, dados); tasks em fatias verticais rastreáveis até a spec; separação clara entre os três |
| Trilha | Teste da Spec | 20 | Fração da suíte oculta que passa no código regenerado |
| Bônus | Itens bônus da trilha e ciclo BMAD* (Depende da Aula sobre BMAD) | 10 | Entregas além do escopo completo, conforme os bônus de cada trilha |

Os 10 pontos de bônus só são alcançáveis com entregas além do escopo completo;
