import { useMemo, useState } from 'react';
import type { SimEvent, SimState, World } from '../../core';

const typeLabels: Record<SimEvent['type'], string> = {
  log: 'Log',
  erro_controlador: 'Erro de controlador',
  limite_de_logs: 'Limite de logs',
  fim_da_luta: 'Fim da luta',
};
const eventLimit = 500;

export function Events({
  world,
  snapshot,
}: {
  world: World;
  snapshot: SimState;
}) {
  const [robot, setRobot] = useState('');
  const [type, setType] = useState('');
  const { visible, hidden } = useMemo(() => {
    const matches = snapshot.events.filter(
      (event) =>
        (!robot || (event.robotId ?? '@partida') === robot) &&
        (!type || event.type === type),
    );
    return {
      visible: matches.slice(-eventLimit),
      hidden: Math.max(0, matches.length - eventLimit),
    };
  }, [snapshot.events, robot, type]);

  return (
    <section aria-label="Eventos" data-tick={snapshot.tick}>
      <div className="event-filters">
        <label>
          Robô
          <select
            value={robot}
            aria-label="Robô do evento"
            onChange={(event) => setRobot(event.target.value)}
          >
            <option value="">Todos</option>
            <option value="@partida">Partida</option>
            {world.robots.map(({ id }) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo
          <select
            value={type}
            aria-label="Tipo de evento"
            onChange={(event) => setType(event.target.value)}
          >
            <option value="">Todos</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {hidden > 0 && (
        <p className="muted">
          {hidden} {hidden === 1 ? 'evento oculto' : 'eventos ocultos'}
        </p>
      )}
      {visible.length === 0 ? (
        <p className="muted">Nenhum evento para os filtros selecionados.</p>
      ) : (
        <ol className="event-list">
          {visible.map((event, index) => (
            <li
              key={index}
              className={
                event.type === 'erro_controlador'
                  ? 'controller-error'
                  : undefined
              }
            >
              <span>Tick {event.tick}</span>{' '}
              <strong>{event.robotId ?? 'Partida'}</strong> ·{' '}
              {typeLabels[event.type]}
              <p>{event.message}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
