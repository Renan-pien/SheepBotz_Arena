import { useState, useSyncExternalStore } from 'react';
import { ArenaSession } from './arena/session';

export function App({ session: supplied }: { session?: ArenaSession } = {}) {
  const [session] = useState(() => supplied ?? new ArenaSession());
  const { world, snapshot } = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
  );

  return (
    <main className="arena-app">
      <header>
        <h1>SheepBotz Arena</h1>
        <p>
          {world.name} · Tick {snapshot.tick}
        </p>
      </header>
    </main>
  );
}
