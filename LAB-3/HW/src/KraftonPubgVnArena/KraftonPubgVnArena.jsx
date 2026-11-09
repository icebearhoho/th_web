import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { createDrops, SQUAD_STANDINGS } from './arenaData.js';
import { ApiError, createArenaApi } from './arenaApi.js';
import { arenaReducer, createArenaState } from './arenaReducer.js';
import { AirdropCard } from './AirdropCard.jsx';
import { Leaderboard } from './Leaderboard.jsx';
import styles from './Arena.module.css';

// Measured server-minus-client clock difference. 0 in this mock.
const SERVER_OFFSET_MS = 0;

export function KraftonPubgVnArena() {
  // Created once per mount (lazy initializers), never re-created on render
  const [drops] = useState(() => createDrops());
  const [api] = useState(() => createArenaApi(drops));
  const [views, dispatch] = useReducer(arenaReducer, drops, createArenaState);

  const inFlightRef = useRef(new Set());    // synchronous lock: blocks double clicks instantly
  const controllersRef = useRef(new Set()); // pending requests, aborted on unmount

  useEffect(() => {
    const controllers = controllersRef.current;
    return () => {
      controllers.forEach((c) => c.abort());
      controllers.clear();
    };
  }, []);

  const claim = useCallback(
    async (dropId) => {
      if (inFlightRef.current.has(dropId)) return; // 2nd click before re-render
      inFlightRef.current.add(dropId);

      const claimId = crypto.randomUUID();
      const controller = new AbortController();
      controllersRef.current.add(controller);
      dispatch({ type: 'claimStart', dropId, claimId }); // optimistic -1

      try {
        const result = await api.claim(dropId, { signal: controller.signal });
        dispatch({ type: 'claimSuccess', dropId, claimId, serverStock: result.remainingStock });
      } catch (err) {
        if (err.name === 'AbortError') return;
        dispatch({
          type: 'claimRollback',
          dropId,
          claimId,
          serverStock: err.serverStock,
          message:
            err instanceof ApiError ? `${err.status} — ${err.message}` : 'Something went wrong',
        });
      } finally {
        inFlightRef.current.delete(dropId);
        controllersRef.current.delete(controller);
      }
    },
    [api]
  );

  return (
    <section className={styles.arena} aria-labelledby="arena-title">
      <header className={styles.header}>
        <h2 id="arena-title">KRAFTON × PUBG Vietnam Arena</h2>
        <p>PVS Finals tickets &amp; G-Coin crate airdrops</p>
      </header>

      <section aria-labelledby="drops-title" className={styles.dropsSection}>
        <h3 id="drops-title">Airdrops</h3>

        <form className={styles.testTools} onSubmit={(e) => e.preventDefault()}>
          <span>Test tools:</span>
          <button type="button" onClick={() => api.rivalRushNext()}>
            Rival rush (next claim → 409)
          </button>
          <button type="button" onClick={() => api.failNextRequest()}>
            Server error (next claim → 503)
          </button>
        </form>

        <ul className={styles.drops}>
          {drops.map((drop) => (
            <AirdropCard
              key={drop.id}
              drop={drop}
              view={views[drop.id]}
              serverOffsetMs={SERVER_OFFSET_MS}
              onClaim={claim}
            />
          ))}
        </ul>
      </section>

      <Leaderboard standings={SQUAD_STANDINGS} />
    </section>
  );
}