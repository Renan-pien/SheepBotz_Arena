import { Fragment } from 'react';
import { readEdge } from '../../core';
import type {
  EdgeReading,
  Pose,
  RobotConfig,
  RobotState,
  SimState,
  World,
} from '../../core';
import { rayAngle } from '../scene/projection';

const formats = [1, 2, 3].map(
  (digits) =>
    new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }),
);
const edgeSides = [
  ['front', 'Frente'],
  ['rear', 'Traseira'],
  ['left', 'Esquerda'],
  ['right', 'Direita'],
] as const;

const degreesPerRadian = 180 / Math.PI;

export function formatNumber(value: number, digits: 1 | 2 | 3): string {
  return formats[digits - 1]!.format(value === 0 ? 0 : value).replace('-', '−');
}

const reason = {
  saida_da_arena: 'saída da arena',
  ambos_sairam: 'os dois saíram da arena',
  falta_de_progresso: 'falta de progresso',
  tempo_esgotado: 'tempo esgotado',
};

export function resultLabel(state: SimState, lastLevel = false): string | null {
  const result = state.resultado;
  if (!result) return null;
  if (result.motivo === 'saida_alcancada')
    return (
      (lastLevel ? 'Labirinto concluído' : 'Nível concluído') +
      ' em ' +
      formatNumber(state.time, 2) +
      ' s · tick ' +
      result.tick
    );
  if (result.motivo === 'queima_dupla')
    return (
      'Queima de largada dos dois robôs — empate sem pontos · tick ' +
      result.tick
    );
  if (result.motivo === 'queima_da_largada')
    return (
      'Queima de largada de ' +
      state.falseStarters![0] +
      ' — vitória de ' +
      result.vencedor +
      ' (+1 ponto) · tick ' +
      result.tick
    );
  const title = result.vencedor ? 'Vitória de ' + result.vencedor : 'Empate';
  return (
    title +
    ' — ' +
    reason[result.motivo] +
    ' · tick ' +
    result.tick +
    ' · ' +
    formatNumber(state.time, 2) +
    ' s'
  );
}

function poseLabel(pose: Pose) {
  return (
    'x ' +
    formatNumber(pose.x, 3) +
    ' m · y ' +
    formatNumber(pose.y, 3) +
    ' m · θ ' +
    formatNumber(pose.theta * degreesPerRadian, 1) +
    '°'
  );
}

function SensorCard({
  robot,
  config,
  edge,
  maze,
}: {
  edge: EdgeReading | null;
  maze: boolean;
  robot: RobotState;
  config: RobotConfig;
}) {
  const { id, pose, odometry, command, situacao, bumper } = robot;
  const distance = Math.hypot(pose.x - odometry.x, pose.y - odometry.y);
  const laser = config.laser;
  return (
    <article className="robot-card" aria-label={'Inspeção de ' + id}>
      <h3>
        <span className="robot-dot" style={{ background: config.color }} />
        {id}
      </h3>
      <dl className="sensor-values">
        <dt>Situação</dt>
        <dd>{situacao}</dd>
        <dt>Pose real</dt>
        <dd>{poseLabel(pose)}</dd>
        <dt>Odometria</dt>
        <dd>{poseLabel(odometry)}</dd>
        <dt>Diferença</dt>
        <dd>{formatNumber(distance, 3)} m</dd>
        <dt>Comando</dt>
        <dd>
          {formatNumber(command.v, 2)} m/s · {formatNumber(command.w, 2)} rad/s
        </dd>
        <dt>Bumper</dt>
        <dd>
          <span aria-hidden="true">{bumper ? '◆' : '◇'} </span>
          {bumper ? 'ativo' : 'inativo'}
        </dd>
      </dl>
      <section aria-label="Sensor de borda">
        <strong>Sensor de borda</strong>
        {edge ? (
          <dl className="sensor-values">
            {edgeSides.map(([key, label]) => (
              <Fragment key={key}>
                <dt>{label}</dt>
                <dd>{edge[key] ? 'Na borda' : 'Interior'}</dd>
              </Fragment>
            ))}
          </dl>
        ) : (
          <p className="muted">
            {maze ? 'Indisponível no labirinto' : 'Indisponível no modo livre'}
          </p>
        )}
      </section>
      {laser ? (
        <table className="laser-table">
          <caption>Laser</caption>
          <thead>
            <tr>
              <th scope="col">Raio</th>
              <th scope="col">Ângulo</th>
              <th scope="col">Distância</th>
            </tr>
          </thead>
          <tbody>
            {robot.laser.map((value, index) => (
              <tr key={index}>
                <td>{index}</td>
                <td>
                  {formatNumber(rayAngle(laser, index) * degreesPerRadian, 1)}°
                </td>
                <td>
                  <span>{formatNumber(value, 3)} m</span>
                  <meter
                    min={0}
                    max={laser.maxRange}
                    value={value}
                    aria-label={'Distância do raio ' + index}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted">Sem laser</p>
      )}
    </article>
  );
}

export function Inspection({
  world,
  snapshot,
}: {
  world: World;
  snapshot: SimState;
}) {
  return (
    <section
      className="panel-cards"
      aria-label="Inspeção"
      data-tick={snapshot.tick}
    >
      {snapshot.robots.map((robot, index) => (
        <SensorCard
          key={robot.id}
          robot={robot}
          config={world.robots[index]!}
          maze={world.match.mode === 'maze'}
          edge={readEdge(world, robot.pose, world.robots[index]!.radius)}
        />
      ))}
    </section>
  );
}
