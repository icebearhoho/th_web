import { useId, useState } from 'react';
import styles from './Arena.module.css';

const SORTS = {
  total: { label: 'Total points', fn: (a, b) => b.totalPts - a.totalPts || b.wwcdCount - a.wwcdCount },
  wwcd: { label: 'WWCD', fn: (a, b) => b.wwcdCount - a.wwcdCount || b.totalPts - a.totalPts },
  placement: { label: 'Placement points', fn: (a, b) => b.placementPts - a.placementPts },
  kills: { label: 'Kill points', fn: (a, b) => b.killPts - a.killPts },
};

export function Leaderboard({ standings }) {
  const queryId = useId();
  const wwcdId = useId();
  const sortId = useId();

  // Only raw inputs live in state
  const [query, setQuery] = useState('');
  const [minWwcd, setMinWwcd] = useState(0);
  const [sortBy, setSortBy] = useState('total');

  // DERIVED during render: no useEffect, no extra state (Lab 3 Ex2 pattern)
  const q = query.trim().toLowerCase();
  const rows = standings
    .map((s) => ({ ...s, totalPts: s.placementPts + s.killPts }))
    .filter((s) => s.squadName.toLowerCase().includes(q) || s.squadId.includes(q))
    .filter((s) => s.wwcdCount >= minWwcd)
    .toSorted(SORTS[sortBy].fn);

  const ariaSort = (key) => (sortBy === key ? 'descending' : 'none');

  return (
    <section className={styles.leaderboard} aria-labelledby="lb-title">
      <h3 id="lb-title">PVS Leaderboard</h3>

      <form role="search" className={styles.filters} onSubmit={(e) => e.preventDefault()}>
        <label htmlFor={queryId}>Squad</label>
        <input
          id={queryId}
          type="search"
          value={query}
          placeholder="e.g. Expendables"
          onChange={(e) => setQuery(e.target.value)}
        />

        <label htmlFor={wwcdId}>Min WWCD</label>
        <input
          id={wwcdId}
          type="number"
          min="0"
          max="20"
          value={minWwcd}
          onChange={(e) => {
            const v = e.target.valueAsNumber;
            setMinWwcd(Number.isNaN(v) ? 0 : v);
          }}
        />

        <label htmlFor={sortId}>Sort by</label>
        <select id={sortId} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {Object.entries(SORTS).map(([key, s]) => (
            <option key={key} value={key}>{s.label}</option>
          ))}
        </select>
      </form>

      <output aria-live="polite">
        Showing {rows.length} of {standings.length} squads
      </output>

      <section
        className={styles.tableScroll}
        tabIndex={0}
        aria-label="Leaderboard table, scroll horizontally"
      >
        <table className={styles.table}>
          <caption>Sorted by {SORTS[sortBy].label} (highest first)</caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Squad</th>
              <th scope="col" aria-sort={ariaSort('wwcd')}>WWCD</th>
              <th scope="col" aria-sort={ariaSort('placement')}>Placement</th>
              <th scope="col" aria-sort={ariaSort('kills')}>Kills</th>
              <th scope="col" aria-sort={ariaSort('total')}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => (
              <tr key={s.squadId}>
                <td>{i + 1}</td>
                <th scope="row">{s.squadName}</th>
                <td>{s.wwcdCount}</td>
                <td>{s.placementPts}</td>
                <td>{s.killPts}</td>
                <td>{s.totalPts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {rows.length === 0 && <p>No squads match your filters.</p>}
    </section>
  );
}