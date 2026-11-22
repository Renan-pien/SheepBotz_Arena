import { useId, useRef } from 'react';
import type { MatchMode } from '../../core';
import { controllerPresets } from '../arena/catalog';
import { makerExample, type Language } from '../arena/languages';

export function CommandHelp({
  language,
  mode,
  robot,
}: {
  language: Language;
  mode: MatchMode;
  robot: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const title = useId();
  const pt = language === 'portugol';
  const sumo = mode === 'sumo';
  const example = pt
    ? makerExample(mode).source
    : controllerPresets[sumo ? 'avanca' : 'desviador'].source;
  const rows = [
    [
      pt ? 'definir_velocidade(v, w)' : 'setSpeed(v, w)',
      'Avanço em m/s e giro em rad/s. Use velocidade negativa para recuar e (0, 0) para parar.',
    ],
    [
      pt ? 'ler_laser() · ler_laser_central()' : 'readLaser()',
      'Distâncias em metros até paredes, obstáculos ou outros robôs. O raio central aponta para a frente.',
    ],
    [
      pt ? 'ler_contato()' : 'readBumper()',
      'Indica contato físico no estado observado.',
    ],
    [
      pt ? 'ler_odometria()' : 'readOdometry()',
      'Posição estimada x, y em metros e orientação theta em radianos.',
    ],
    [
      pt ? 'tempo_simulado()' : 'getInfo().time',
      'Segundos simulados. A contagem acompanha os ticks e congela na pausa.',
    ],
    [
      pt ? 'aleatorio()' : 'random()',
      'Sorteia um número maior ou igual a 0 e menor que 1 usando a semente da rodada.',
    ],
    [
      pt ? 'registrar(...) · escreva(...)' : 'log(...)',
      'Registra uma mensagem com o robô e o tick no painel Eventos.',
    ],
  ];
  if (sumo)
    rows.splice(
      1,
      0,
      [
        pt ? 'ler_borda("frente")' : 'readEdge()',
        pt
          ? 'Lê a faixa branca. Os lados são frente, traseira, esquerda e direita.'
          : 'Quatro indicadores da faixa branca: front, rear, left e right.',
      ],
      [
        pt ? 'largada_liberada()' : 'getInfo().startReleased',
        'Aguarde a liberação para mover o robô sem queimar a largada.',
      ],
    );
  if (pt)
    rows.push(
      [
        'iot_configurar_pino(2, "SAIDA")',
        'Configura a saída virtual do Maker.',
      ],
      [
        'iot_ligar(2) · iot_desligar(2)',
        'Ligar o pino 2 avança a 0,20 m/s. Desligar para o robô.',
      ],
    );
  else
    rows.push([
      'getInfo()',
      'Consulta o tick, passo de tempo, raio e limites de velocidade do próprio robô.',
    ]);
  function close() {
    if (dialog.current?.close) dialog.current.close();
    else dialog.current?.removeAttribute('open');
    trigger.current?.focus();
  }
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="command-help"
        aria-haspopup="dialog"
        aria-label={'Tutorial de comandos de ' + robot}
        onClick={() => {
          if (dialog.current?.showModal) dialog.current.showModal();
          else dialog.current?.setAttribute('open', '');
          dialog.current?.querySelector('button')?.focus();
        }}
      >
        <span aria-hidden="true">?</span> Comandos
      </button>
      <dialog
        ref={dialog}
        className="command-dialog"
        aria-labelledby={title}
        onClose={() => trigger.current?.focus()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            close();
          }
        }}
      >
        <div className="command-heading">
          <h2 id={title}>Tutorial de comandos</h2>
          <button type="button" onClick={close}>
            Fechar
          </button>
        </div>
        <p>
          <strong>
            {pt ? 'Portugol · meuPiá Maker' : 'JavaScript'} ·{' '}
            {sumo ? 'Sumô' : mode === 'maze' ? 'Labirinto' : 'Mundo livre'}
          </strong>
        </p>
        <p>
          {pt
            ? 'Declare usar "maker" e uma função decidir() sem parâmetros. A Arena chama decidir() a cada tick. Para inicializar, use inicio ou preparar().'
            : 'Declare loop() para decidir o movimento a cada tick. Use setup() se precisar inicializar uma vez.'}{' '}
          Aplique o código e use Avançar 1 tick para observar o resultado.
        </p>
        <dl>
          {rows.map(([command, description]) => (
            <div key={command}>
              <dt>
                <code>{command}</code>
              </dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
        <h3>Exemplo de estratégia</h3>
        <pre>
          <code>{example}</code>
        </pre>
      </dialog>
    </>
  );
}
