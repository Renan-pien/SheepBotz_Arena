import { useEffect, useState, useSyncExternalStore } from 'react';
import { speeds, startTicker, type PlaybackSpeed } from './arena/clock';
import { ArenaSession } from './arena/session';
import { worldPresets, type WorldPreset } from './arena/catalog';
import { chosenFile, LocalFiles } from './arena/files';
import { Controllers } from './panels/Controllers';
import { Events } from './panels/Events';
import { formatNumber, Inspection, resultLabel } from './panels/Inspection';
import { ArenaView } from './scene/ArenaView';
import './arena.css';

const tabs = ['Controladores', 'Inspeção', 'Eventos'] as const;

export function App({ session: supplied }: { session?: ArenaSession } = {}) {
  const [session] = useState(() => supplied ?? new ArenaSession());
  const [files] = useState(() => new LocalFiles());
  const [tab, setTab] = useState<(typeof tabs)[number]>('Controladores');
  const view = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const { world, snapshot, status, speed, behind } = view;
  const running = status === 'executando';
  const stopped = status === 'finalizada';
  const result = resultLabel(snapshot);

  useEffect(() => {
    if (running) return startTicker((elapsed) => session.pulse(elapsed));
  }, [running, session]);

  useEffect(() => {
    function visibility() {
      if (document.hidden) session.pause();
    }
    function shortcuts(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable]')) return;
      if (event.key === ' ' && !target?.closest('button, a')) {
        event.preventDefault();
        if (session.getSnapshot().status === 'executando') session.pause();
        else session.play();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        session.step();
      } else if (event.key.toLowerCase() === 'r') {
        session.reset();
      }
    }
    document.addEventListener('keydown', shortcuts);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('keydown', shortcuts);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [session]);

  return (
    <main className="arena-app">
      <header>
        <h1>SheepBotz Arena</h1>
        <p>{world.name}</p>
        <div className="world-actions">
          <label>
            Mundo{' '}
            <select
              value={view.preset}
              onChange={(event) =>
                session.chooseWorld(event.target.value as WorldPreset)
              }
            >
              {Object.entries(worldPresets).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.name}
                </option>
              ))}
              {view.preset === '' && (
                <option value="" disabled>
                  {world.name}
                </option>
              )}
            </select>
          </label>
          <label className="file-control">
            Abrir mundo{' '}
            <input
              type="file"
              accept=".json,application/json"
              aria-label="Abrir mundo"
              onChange={(event) => {
                const file = chosenFile(event);
                if (file)
                  void files.read(
                    file,
                    session.revision,
                    (text) => session.openWorld(text),
                    (fileName) =>
                      session.reportError({
                        code: 'ARQUIVO_INVALIDO',
                        path: '',
                        message: 'Não foi possível ler ' + fileName + '.',
                      }),
                  );
              }}
            />
          </label>
        </div>
      </header>
      {view.errors.length > 0 && (
        <div role="alert" className="issues">
          <strong>Falha ao carregar</strong>
          <ul>
            {view.errors.map((error, index) => (
              <li key={index}>
                <code>{error.code}</code>
                {error.path && (
                  <>
                    {' '}
                    · <code>{error.path}</code>
                  </>
                )}{' '}
                · {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="workspace">
        <ArenaView world={world} snapshot={snapshot} />
        <aside className="side-panel">
          <div
            role="tablist"
            className="panel-tabs"
            aria-label="Painéis da simulação"
          >
            {tabs.map((item, index) => (
              <button
                type="button"
                key={item}
                role="tab"
                id={'arena-tab-' + index}
                aria-selected={tab === item}
                aria-controls="arena-panel"
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div
            id="arena-panel"
            role="tabpanel"
            aria-labelledby={'arena-tab-' + tabs.indexOf(tab)}
          >
            {tab === 'Controladores' && (
              <Controllers session={session} view={view} files={files} />
            )}
            {tab === 'Inspeção' && (
              <Inspection world={world} snapshot={snapshot} />
            )}
            {tab === 'Eventos' && (
              <Events key={view.worldText} world={world} snapshot={snapshot} />
            )}
          </div>
        </aside>
      </div>
      {result && (
        <section className="match-result" aria-label="Resultado">
          <strong>{result}</strong>
          <button
            type="button"
            aria-label="Reiniciar luta"
            onClick={() => session.reset()}
          >
            Reiniciar
          </button>
          <button type="button" disabled>
            Ver replay
          </button>
        </section>
      )}
      <footer className="transport" aria-label="Controles de tempo">
        <div className="transport-actions">
          <button
            type="button"
            className="primary"
            disabled={running || stopped}
            onClick={() => session.play()}
          >
            Executar
          </button>
          <button
            type="button"
            disabled={!running}
            onClick={() => session.pause()}
          >
            Pausar
          </button>
          <button
            type="button"
            disabled={running || stopped}
            onClick={() => session.step()}
          >
            Avançar 1 tick
          </button>
          <button type="button" onClick={() => session.reset()}>
            Reiniciar
          </button>
          <label>
            Velocidade{' '}
            <select
              value={speed}
              onChange={(event) =>
                session.setSpeed(Number(event.target.value) as PlaybackSpeed)
              }
            >
              {speeds.map((option) => (
                <option key={option} value={option}>
                  {option.toLocaleString('pt-BR')}×
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="transport-state">
          <span data-testid="current-tick">Tick {snapshot.tick}</span>
          <span>{formatNumber(snapshot.time, 2)} s</span>
          <span>{status}</span>
          {behind && <span role="status">abaixo do tempo real</span>}
        </div>
      </footer>
    </main>
  );
}
