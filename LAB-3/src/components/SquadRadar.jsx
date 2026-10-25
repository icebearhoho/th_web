import { useState } from 'react';
import { PUBG_VN_SQUADS } from '../api/pubgTelemetry.js';
import { PubgMatchTelemetry } from './PubgMatchTelemetry.jsx';
import styles from './PubgMatchTelemetry.module.css';

export function SquadRadar() {
  const [squadId, setSquadId] = useState('te');

  return (
    <section className={styles.radar} aria-labelledby="radar-title">
      <h3 id="radar-title">PVS Live Radar</h3>
      <ul className={styles.picker} aria-label="Choose squad">
        {PUBG_VN_SQUADS.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              aria-pressed={squadId === s.id}
              onClick={() => setSquadId(s.id)}
            >
              {s.name}
            </button>
          </li>
        ))}
      </ul>
      <PubgMatchTelemetry squadId={squadId} />
    </section>
  );
}