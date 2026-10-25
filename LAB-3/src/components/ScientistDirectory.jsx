import { useId, useState } from 'react';
import { SMART_PEOPLE } from '../data/smartPeople.js';
import styles from './ScientistDirectory.module.css';

const SORTERS = {
  'iq-desc': (a, b) => b.iq - a.iq,
  'iq-asc': (a, b) => a.iq - b.iq,
  'age-asc': (a, b) => a.age - b.age,
  'age-desc': (a, b) => b.age - a.age,
};

export function ScientistDirectory({ initialData = SMART_PEOPLE }) {
  const queryId = useId();
  const iqId = useId();
  const sortId = useId();

  // Only raw, independent inputs live in state
  const [people, setPeople] = useState(initialData);
  const [query, setQuery] = useState('');
  const [minIq, setMinIq] = useState(160);
  const [sortBy, setSortBy] = useState('iq-desc');

  // DERIVED: computed during render, no useEffect, no extra state
  const normalizedQuery = query.trim().toLowerCase();
  const visiblePeople = people
    .filter((p) => p.name.toLowerCase().includes(normalizedQuery))
    .filter((p) => p.iq >= minIq)
    .toSorted(SORTERS[sortBy]);

  const handleIqChange = (e) => {
    const value = e.target.valueAsNumber; // a number, not the string '160'
    setMinIq(Number.isNaN(value) ? 0 : value); // empty box -> NaN -> 0
  };

  return (
    <section className={styles.directory} aria-labelledby="dir-title">
      <h3 id="dir-title">Pioneer Directory</h3>

      <form
        role="search"
        className={styles.controls}
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor={queryId}>Name</label>
        <input
          id={queryId}
          type="search"
          value={query}
          placeholder="e.g. Einstein"
          onChange={(e) => setQuery(e.target.value)}
        />

        <label htmlFor={iqId}>Min IQ</label>
        <input
          id={iqId}
          type="number"
          min="0"
          max="300"
          value={minIq}
          onChange={handleIqChange}
        />

        <label htmlFor={sortId}>Sort by</label>
        <select
          id={sortId}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="iq-desc">IQ (high → low)</option>
          <option value="iq-asc">IQ (low → high)</option>
          <option value="age-asc">Age (young → old)</option>
          <option value="age-desc">Age (old → young)</option>
        </select>
      </form>

      <ul className={styles.list}>
        {visiblePeople.map((p) => (
          <li key={p.id} className={styles.row}>
            <span className={styles.name}>{p.name}</span>
            <span className={styles.meta}>
              IQ {p.iq} · Age {p.age}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}