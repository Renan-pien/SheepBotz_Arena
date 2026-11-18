import { useCallback } from 'react';
import type { RobotConfig } from '../../core';
import { controllerPresets, type ControllerPreset } from '../arena/catalog';
import { chosenFile, downloadText, type LocalFiles } from '../arena/files';
import type { ArenaSession, SessionView } from '../arena/session';
import { CodeEditor } from './CodeEditor';

interface PanelProps {
  readonly session: ArenaSession;
  readonly view: SessionView;
  readonly files: LocalFiles;
}

function Card({
  session,
  view,
  files,
  robot,
}: PanelProps & { robot: RobotConfig }) {
  const { id, color } = robot;
  const draft = view.drafts[id]!;
  const change = useCallback(
    (value: string) => session.editSource(id, value),
    [id, session],
  );
  const failure = view.snapshot.events.find(
    (event) => event.robotId === id && event.type === 'erro_controlador',
  );
  const readonly = view.mode === 'replay';
  const dirty = draft.source !== view.controllers[id];

  return (
    <article className="robot-card" aria-label={'Controlador de ' + id}>
      <h3>
        <span className="robot-dot" style={{ background: color }} />
        {id}
      </h3>
      {failure && (
        <p className="controller-error">desativado · {failure.message}</p>
      )}
      <label className="example-option">
        Exemplo
        <select
          aria-label={'Exemplo de ' + id}
          disabled={readonly}
          value={draft.example}
          onChange={(event) =>
            session.selectExample(id, event.target.value as ControllerPreset)
          }
        >
          {Object.entries(controllerPresets).map(([key, example]) => (
            <option key={key} value={key}>
              {example.name}
            </option>
          ))}
        </select>
      </label>
      <CodeEditor
        readOnly={readonly}
        label={'Código de ' + id}
        value={draft.source}
        onChange={change}
      />
      {dirty && <p className="draft-warning">alterações não aplicadas</p>}
      <div className="card-actions">
        <button
          type="button"
          aria-label={'Aplicar ' + id}
          disabled={readonly}
          onClick={() => session.apply(id)}
        >
          Aplicar
        </button>
        <button
          type="button"
          aria-label={'Restaurar exemplo de ' + id}
          disabled={readonly}
          onClick={() => session.restoreExample(id)}
        >
          Restaurar exemplo
        </button>
        <label className="file-control">
          Abrir código{' '}
          <input
            aria-label={'Abrir código de ' + id}
            disabled={readonly}
            type="file"
            accept=".js"
            onChange={(event) => {
              const file = chosenFile(event);
              if (file)
                void files.read(file, session.revision, change, (fileName) =>
                  session.reportError({
                    code: 'ARQUIVO_INVALIDO',
                    path: 'controllers.' + id,
                    message: 'Não foi possível ler ' + fileName + '.',
                  }),
                );
            }}
          />
        </label>
        <button
          type="button"
          aria-label={'Salvar código de ' + id}
          onClick={() =>
            downloadText(draft.source, id + '.js', 'text/javascript')
          }
        >
          Salvar código
        </button>
      </div>
    </article>
  );
}

export function Controllers(props: PanelProps) {
  return (
    <section aria-label="Controladores" className="panel-cards">
      {props.view.world.robots.map((robot) => (
        <Card key={robot.id} {...props} robot={robot} />
      ))}
    </section>
  );
}
