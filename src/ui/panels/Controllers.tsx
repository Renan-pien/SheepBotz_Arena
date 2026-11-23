import { useCallback } from 'react';
import type { RobotConfig } from '../../core';
import { controllerPresets, type ControllerPreset } from '../arena/catalog';
import { chosenFile, downloadText, type LocalFiles } from '../arena/files';
import type { ArenaSession, SessionView } from '../arena/session';
import { makerExample, type Language } from '../arena/languages';
import { CommandHelp } from './CommandHelp';
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
  const pt = draft.language === 'portugol';
  const dirty =
    draft.source !== view.controllers[id] ||
    draft.language !== view.languages[id];

  return (
    <article className="robot-card" aria-label={'Controlador de ' + id}>
      <div className="robot-card-heading">
        <h3>
          <span className="robot-dot" style={{ background: color }} />
          {id}
        </h3>
        <CommandHelp
          language={draft.language}
          mode={view.world.match.mode}
          robot={id}
        />
      </div>
      <label className="example-option">
        Linguagem
        <select
          aria-label={'Linguagem de ' + id}
          value={draft.language}
          disabled={readonly}
          onChange={(e) =>
            session.chooseLanguage(id, e.target.value as Language)
          }
        >
          <option value="javascript">JavaScript</option>
          <option value="portugol">Portugol (meuPiá Maker)</option>
        </select>
      </label>
      {failure && (
        <p className="controller-error">desativado · {failure.message}</p>
      )}
      <label className="example-option">
        Exemplo
        <select
          aria-label={'Exemplo de ' + id}
          disabled={readonly}
          value={pt ? 'portugol' : draft.example}
          onChange={(event) =>
            session.selectExample(id, event.target.value as ControllerPreset)
          }
        >
          {pt ? (
            <option value="portugol">
              {makerExample(view.world.match.mode).name}
            </option>
          ) : (
            Object.entries(controllerPresets).map(([key, example]) => (
              <option key={key} value={key}>
                {example.name}
              </option>
            ))
          )}
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
          disabled={readonly || view.loading !== null}
          onClick={() => void session.apply(id)}
        >
          {view.loading === id ? 'Carregando Portugol…' : 'Aplicar'}
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
            accept=".js,.por"
            onChange={(event) => {
              const file = chosenFile(event);
              if (file)
                void files.read(
                  file,
                  session.revision,
                  (text) => {
                    session.chooseLanguage(
                      id,
                      file.name.toLowerCase().endsWith('.por')
                        ? 'portugol'
                        : 'javascript',
                    );
                    change(text);
                  },
                  (fileName) =>
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
            downloadText(
              draft.source,
              id + (pt ? '.por' : '.js'),
              pt ? 'text/plain' : 'text/javascript',
            )
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
