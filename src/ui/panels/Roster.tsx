import { useId, useRef, useState } from 'react';
import { modelIds, robotModels, type RobotModel } from '../../core';
import type { ArenaSession, SessionView } from '../arena/session';
import { teamFor, teams, type Team } from '../arena/teams';

const categories = {
  light: 'Peso leve',
  medium: 'Peso médio',
  heavy: 'Peso pesado',
} as const;

type Picks = Partial<Record<Team, RobotModel>>;
const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export function Roster({
  session,
  view,
}: {
  session: ArenaSession;
  view: SessionView;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState<Team>('red');
  const [picks, setPicks] = useState<Picks>({});
  const other = active === 'red' ? 'blue' : 'red';

  function open() {
    const current: Picks = {};
    for (const robot of view.world.robots) {
      if (robot.model) current[teamFor(view.world, robot.id)] = robot.model;
    }
    setPicks(current);
    setActive('red');
    setEditing(true);
    if (dialog.current?.showModal) dialog.current.showModal();
    else dialog.current?.setAttribute('open', '');
  }
  function close() {
    if (dialog.current?.close) dialog.current.close();
    else dialog.current?.removeAttribute('open');
    setEditing(false);
    trigger.current?.focus();
  }
  function pick(model: RobotModel) {
    if (picks[other] === model) return;
    setPicks({ ...picks, [active]: model });
    if (!picks[other]) setActive(other);
  }
  function confirm() {
    if (picks.red && picks.blue && session.selectModels(picks.red, picks.blue))
      close();
  }
  return (
    <>
      <button
        className="roster-trigger"
        type="button"
        onClick={open}
        ref={trigger}
        disabled={view.mode === 'replay'}
        aria-haspopup="dialog"
      >
        Selecionar robôs
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={title}
        className="roster-dialog"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            close();
          }
        }}
      >
        {editing && (
          <>
            <div className="roster-heading">
              <h2 id={title}>Seleção de robôs</h2>
              <button
                className="roster-close"
                type="button"
                aria-label="Fechar seleção"
                onClick={close}
              >
                ×
              </button>
            </div>
            <div
              className="roster-teams"
              role="group"
              aria-label="Equipe que escolhe"
            >
              {(['red', 'blue'] as const).map((team) => (
                <button
                  className={'roster-team ' + team}
                  type="button"
                  key={team}
                  aria-pressed={team === active}
                  onClick={() => setActive(team)}
                >
                  <span>Equipe {teams[team].name}</span>{' '}
                  <strong>
                    {picks[team]
                      ? robotModels[picks[team]].name
                      : 'Escolher robô'}
                  </strong>
                </button>
              ))}
            </div>
            <p className="roster-prompt" aria-live="polite">
              Escolha para a equipe <strong>{teams[active].name}</strong>
            </p>
            {Object.entries(categories).map(([weightClass, label]) => (
              <section
                key={weightClass}
                className="roster-class"
                role="group"
                aria-labelledby={title + '-' + weightClass}
              >
                <h3 id={title + '-' + weightClass}>{label}</h3>
                <div className="roster-grid">
                  {modelIds
                    .filter((id) => robotModels[id].weightClass === weightClass)
                    .map((id) => {
                      const model = robotModels[id];
                      const owner =
                        picks.red === id
                          ? 'red'
                          : picks.blue === id
                            ? 'blue'
                            : undefined;
                      return (
                        <button
                          type="button"
                          key={id}
                          className={'roster-card ' + (owner ?? '')}
                          disabled={owner === other}
                          aria-pressed={picks[active] === id}
                          aria-describedby={title + '-' + id}
                          aria-label={
                            model.name +
                            (owner ? ' · Equipe ' + teams[owner].name : '')
                          }
                          onClick={() => pick(id)}
                        >
                          <span className="roster-portrait">
                            <img
                              alt=""
                              src={
                                import.meta.env.BASE_URL +
                                'robots/' +
                                id +
                                '.png'
                              }
                            />
                            {owner && (
                              <span className={'roster-reserved ' + owner}>
                                {teams[owner].name}
                              </span>
                            )}
                          </span>
                          <strong className="roster-name">{model.name}</strong>
                          <span className="roster-stats" id={title + '-' + id}>
                            <span>
                              Raio <b>{number.format(model.radius * 100)} cm</b>
                            </span>
                            <span>
                              Peso <b>{number.format(model.massKg * 1000)} g</b>
                            </span>
                            <span>
                              Força <b>{number.format(model.force)}/6</b>
                            </span>
                            <span>
                              Tração <b>{number.format(model.traction)}/6</b>
                            </span>
                          </span>
                        </button>
                      );
                    })}
                </div>
              </section>
            ))}
            {view.errors.length > 0 && (
              <p role="alert">
                {view.errors.map((error) => error.message).join(' ')}
              </p>
            )}
            <div className="roster-footer">
              <button type="button" onClick={close}>
                Cancelar
              </button>
              <button
                type="button"
                className="roster-confirm"
                disabled={!picks.red || !picks.blue}
                onClick={confirm}
              >
                Confirmar duelo
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
