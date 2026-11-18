import { useEffect, useState, useSyncExternalStore } from 'react';
import { speeds, startTicker, type PlaybackSpeed } from './arena/clock';
import { ArenaSession } from './arena/session';
import { worldPresets, type WorldPreset } from './arena/catalog';
import { chosenFile, downloadText, LocalFiles } from './arena/files';
import { encodeRecording, recordingName } from './arena/recording';
import { Controllers } from './panels/Controllers';
import { Events } from './panels/Events';
import { formatNumber, Inspection, resultLabel } from './panels/Inspection';
import { ArenaView } from './scene/ArenaView';
import './arena.css';

const tabs = ['Controladores', 'Inspeção', 'Eventos'] as const;

export function App({ session: supplied }: { session?: ArenaSession } = {}) {
  const [session] = useState(() => supplied ?? new ArenaSession());
  const [files] = useState(() => new LocalFiles());
  const [presenting, setPresenting] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [tab, setTab] = useState<(typeof tabs)[number]>('Controladores');
  const view = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const { world, snapshot, status, speed, behind } = view;
  const running = status === 'executando';
  const replay = view.mode === 'replay';
  const stopped = status === 'finalizada' || view.replayLast === snapshot.tick;
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
      } else if (
        event.key === 'ArrowLeft' &&
        session.getSnapshot().mode === 'replay'
      ) {
        event.preventDefault();
        session.back();
      } else if (event.key.toLowerCase() === 'r') {
        session.reset();
      } else if (event.key.toLowerCase() === 'p') {
        setPresenting((value) => !value);
      } else if (event.key === 'Escape') {
        setPresenting(false);
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
    <main
      className={presenting ? 'arena-app is-presenting' : 'arena-app'}
      data-mode={view.mode}
    >
      <header className="arena-header">
        <div className="arena-heading">
          <h1>SheepBotz Arena</h1>
          <button
            type="button"
            aria-pressed={presenting}
            onClick={() => setPresenting(!presenting)}
          >
            {presenting ? 'Sair da apresentação' : 'Modo apresentação'}
          </button>
          {!presenting && (
            <button
              type="button"
              aria-controls="sidebar"
              aria-expanded={panelOpen}
              onClick={() => setPanelOpen(!panelOpen)}
            >
              {panelOpen ? 'Recolher painel' : 'Expandir painel'}
            </button>
          )}
        </div>
        <div className="world-actions">
          <label>
            Mundo{' '}
            <select
              value={view.preset}
              disabled={replay}
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
              disabled={replay}
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
          <label className="file-control">
            Abrir gravação
            <input
              type="file"
              aria-label="Abrir gravação"
              accept=".json,application/json"
              onChange={(event) => {
                const file = chosenFile(event);
                if (file)
                  void files.read(
                    file,
                    session.revision,
                    (text) => session.openRecording(text),
                    (fileName) =>
                      session.reportError({
                        code: 'GRAVACAO_INVALIDA',
                        path: '',
                        message: 'Não foi possível ler ' + fileName + '.',
                      }),
                  );
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              const recording = session.recording();
              downloadText(
                encodeRecording(recording),
                recordingName(world.name, recording.createdAt),
                'application/json',
              );
            }}
          >
            Exportar gravação
          </button>
          {replay && (
            <button type="button" onClick={() => session.exitReplay()}>
              Sair do replay
            </button>
          )}
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
      {presenting && (
        <section className="scoreboard" aria-label="Placar">
          <div className="scoreboard-robots">
            {world.robots.map(({ id, color }) => (
              <span key={id}>
                <i
                  aria-hidden="true"
                  className="robot-dot"
                  style={{ background: color }}
                />
                {id}
              </span>
            ))}
          </div>
          <strong>{formatNumber(snapshot.time, 2)} s</strong>
          {result && <strong className="scoreboard-result">{result}</strong>}
        </section>
      )}
      <div
        className={
          presenting || !panelOpen ? 'workspace only-scene' : 'workspace'
        }
      >
        <ArenaView world={world} snapshot={snapshot} />
        <aside
          className="side-panel"
          id="sidebar"
          hidden={presenting || !panelOpen}
        >
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
      {result && !presenting && (
        <section className="match-result" aria-label="Resultado">
          <strong>{result}</strong>
          {!replay && (
            <>
              <button
                type="button"
                aria-label="Reiniciar luta"
                onClick={() => session.reset()}
              >
                Reiniciar
              </button>
              <button type="button" onClick={() => session.enterReplay()}>
                Ver replay
              </button>
            </>
          )}
        </section>
      )}
      <footer className="transport" aria-label="Controles de tempo">
        {replay && (
          <label className="timeline">
            Linha do tempo
            <input
              type="range"
              aria-label="Linha do tempo"
              min={0}
              max={view.replayLast!}
              value={snapshot.tick}
              step={1}
              onChange={(event) => session.seek(Number(event.target.value))}
            />
            <span>
              {snapshot.tick} / {view.replayLast}
            </span>
          </label>
        )}
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
          {replay && (
            <button
              type="button"
              disabled={running || snapshot.tick === 0}
              onClick={() => session.back()}
            >
              Voltar 1 tick
            </button>
          )}
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
          {replay && <span>Replay</span>}
          {view.limitReached && (
            <span role="status">limite de gravação atingido</span>
          )}
          {behind && <span role="status">abaixo do tempo real</span>}
        </div>
      </footer>
    </main>
  );
}
