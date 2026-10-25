import { useEffect, useState } from 'react';
import { fetchKraftonPubgTelemetry } from '../api/pubgTelemetry.js';
import styles from './PubgMatchTelemetry.module.css';

export function PubgMatchTelemetry({ squadId = 'te' }) {
  // One object = one state. No isLoading/isError boolean soup.
  const [view, setView] = useState({ status: 'IDLE', data: null, error: null });
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setView({ status: 'LOADING', data: null, error: null });

    fetchKraftonPubgTelemetry(squadId, { signal: controller.signal })
      .then((data) => setView({ status: 'SUCCESS', data, error: null }))
      .catch((err) => {
        if (err.name === 'AbortError') return; // we cancelled it, not a real error
        setView({ status: 'ERROR', data: null, error: err.message });
      });

    // Runs when squadId/retryTick changes OR on unmount: cancel the old request
    return () => controller.abort();
  }, [squadId, retryTick]);

  if (view.status === 'IDLE') {
    return <p className={styles.panel}>Radar idle.</p>;
  }

  if (view.status === 'LOADING') {
    return <p className={styles.panel} aria-busy="true">Syncing KRAFTON radar…</p>;
  }

  if (view.status === 'ERROR') {
    return (
      <p className={styles.panel}>
        Blue-Zone link lost: {view.error}
        <button type="button" onClick={() => setRetryTick((t) => t + 1)}>
          Reconnect Satellite
        </button>
      </p>
    );
  }

  const { data } = view;
  return (
    <article className={styles.panel} aria-labelledby="squad-title">
      <h3 id="squad-title">{data.name}</h3>
      <dl className={styles.stats}>
        <dt>Map</dt><dd>{data.map}</dd>
        <dt>Phase</dt><dd>{data.phase}</dd>
        <dt>Alive</dt><dd>{data.alive}/4</dd>
        <dt>Kills</dt><dd>{data.kills}</dd>
        <dt>WWCD chance</dt><dd>{data.wwcdProb}</dd>
        <dt>Status</dt><dd>{data.status}</dd>
      </dl>
    </article>
  );
}