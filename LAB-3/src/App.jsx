import { DeveloperCard } from './components/DeveloperCard.jsx';
import { ScientistDirectory } from './components/ScientistDirectory.jsx';

export function App() {
  return (
    <main>
      <h1>Lab 3 — React 19</h1>

      <section aria-labelledby="ex1-title">
        <h2 id="ex1-title">Exercise 1 — Developer Card</h2>
        <DeveloperCard />
      </section>

      <section aria-labelledby="ex2-title">
        <h2 id="ex2-title">Exercise 2 — Scientist Directory</h2>
        <ScientistDirectory />
      </section>
    </main>
  );
}