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
    return (
      <section
        className={`${styles.panel} ${styles.skeleton}`}
        aria-busy="true"
        aria-label="Syncing KRAFTON radar"
      >
        <span className={styles.bar} style={{ width: '55%' }} />
        <span className={styles.bar} style={{ width: '80%' }} />
        <span className={styles.bar} style={{ width: '70%' }} />
        <span className={styles.bar} style={{ width: '60%' }} />
        <span className={styles.bar} style={{ width: '75%' }} />
      </section>
    );
  }

  if (view.status === 'ERROR') {
    return (
      <section className={`${styles.panel} ${styles.error}`} role="alert">
        <h3>Blue-Zone link lost</h3>
        <p>{view.error}</p>
        <button
          type="button"
          className={styles.retry}
          onClick={() => setRetryTick((t) => t + 1)}
        >
          Reconnect Satellite (Retry)
        </button>
      </section>
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