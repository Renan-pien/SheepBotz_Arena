# Quickstart · Spec 003

## Ambiente e regressões

Na raiz do projeto com Node 24, rode:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run dev
```

A suíte deve incluir os 49 cenários S3 e preservar as regressões S1–S2.
Confira `npm run bench` e `npm run bench:s2` para as duas specs anteriores.

## Duelo padrão

Abra a URL indicada por Vite em um desktop com WebGL 2. A tela parte do
tick 0. Confira raio central de 0,350 m no painel de inspeção, robôs nas
cores do mundo e frente orientada pelo estado. Exercite órbita, aproximação,
deslocamento, as duas vistas e centralização. Confira o comportamento
em 1024 px e 1023 px com teclado, sem depender só dos indicadores de cor.

Execute. O Duelo com Caçador e Girador termina com vitória de vermelho
por saída da arena, tick 34, 0,68 s. Reinicie, avance um tick e confira
que contador, painel e cena permanecem no mesmo tick. Em execução,
oculte a aba e volte. O estado permanece pausado e conserva o tick.

## Cargas e erros

Abra Sala com obstáculos e observe o Desviador. Abra o JSON do mesmo
mundo como arquivo para confirmar que começa com Parado. Abra um mundo
inválido e confira todos os erros e a preservação do mundo anterior.
No cartão, carregue um rascunho com erro, tente aplicar e conserve a sessão.
Salve o rascunho, restaure um exemplo válido e aplique para voltar ao tick 0.

## Replay

Após a luta padrão, clique em Ver replay e confira intervalo 0 a 34.
Vá ao tick 20, volte e avance. Exporte, abra o arquivo e compare os estados
com a gravação anterior e com o resultado CLI de referência. Verifique a
preservação da sessão ao abrir uma versão desconhecida e o retorno ao
vivo no tick 0 ao sair do replay. [Contrato v1](contracts/gravacao.md)

## Desempenho e apresentação

No notebook de referência da S2, em primeiro plano e com WebGL ativo,
registre o FPS observado durante o Duelo em 1×. Repita a luta para coletar
três amostras da janela viva. Registre a latência entre a interação e a
primeira atualização visível para execução, pausa, avanço, reset e seek.
Valide as metas de 30 fps e 100 ms e registre navegador, hardware e modo
de aceleração. Medições com renderização por software devem ser
identificadas no registro.

Ative o modo apresentação e use P e Esc. Para SC-003, cronometre uma
pessoa iniciante desde a abertura até o fim da luta após aplicar um
exemplo. Para SC-006, pergunte a uma pessoa de fora da equipe quem
venceu e por quê, após assistir ao Duelo.

### Medição de referência da implementação

Chrome 145.0.7632.116 em Linux x64, Intel Core i5-1334U e WebGL 2 via
SwiftShader, com canvas de 922 × 504 px. Três execuções do Duelo a 1×
mediram 48,8, 41,8 e 51,4 FPS. As latências de execução, pausa, avanço,
reset e linha do tempo foram 48,4, 46,9, 30,8, 53,9 e 19,0 ms,
respectivamente. O teste contou frames com desenho WebGL no intervalo
da luta e observou o primeiro frame após a mudança de estado para cada
controle. Os 35 estados exportados corresponderam à saída da CLI.

O ensaio também confirmou órbita, roda, arraste direito, Shift com
arraste, mudança de vista, rejeição de arquivo inválido, saída do replay,
edição por arquivo, apresentação e layout a 1024 e 1023 px.
