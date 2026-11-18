import { useEffect, useState, useSyncExternalStore } from 'react';
import { speeds, startTicker, type PlaybackSpeed } from './arena/clock';
import { ArenaSession } from './arena/session';
import { ArenaView } from './scene/ArenaView';
import './arena.css';

const seconds = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function App({ session: supplied }: { session?: ArenaSession } = {}) {
  const [session] = useState(() => supplied ?? new ArenaSession());
  const { world, snapshot, status, speed, behind } = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
  );
  const running = status === 'executando';
  const stopped = status === 'finalizada';

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
      </header>
      <ArenaView world={world} snapshot={snapshot} />
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
          <span>{seconds.format(snapshot.time)} s</span>
          <span>{status}</span>
          {behind && <span role="status">abaixo do tempo real</span>}
        </div>
      </footer>
    </main>
  );
}
