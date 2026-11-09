import { useId } from 'react';
import { usePubgAirdropTimer } from './usePubgAirdropTimer.js';
import { formatCountdown } from './countdown.js';
import { vnd } from './arenaData.js';
import styles from './Arena.module.css';

const PHASE_LABEL = {
  WARMUP: 'Warm-up',
  AIRDROP_LIVE: 'Airdrop live',
  LOOTED_OUT: 'Looted out',
  EXPIRED: 'Expired',
};

/** DropPhase is DERIVED from time + stock, never stored. */
export function getDropPhase({ hasLanded, hasClosed, stock }) {
  if (!hasLanded) return 'WARMUP';
  if (hasClosed) return 'EXPIRED';
  if (stock <= 0) return 'LOOTED_OUT';
  return 'AIRDROP_LIVE';
}

export function AirdropCard({ drop, view, serverOffsetMs = 0, onClaim }) {
  const titleId = useId();
  const toDrop = usePubgAirdropTimer(drop.dropEpochMs, serverOffsetMs);
  const toClose = usePubgAirdropTimer(drop.closesEpochMs, serverOffsetMs);

  const phase = getDropPhase({
    hasLanded: toDrop.isLive,
    hasClosed: toClose.isLive,
    stock: view.stock,
  });
  const isClaiming = view.inFlightClaimId !== null;
  const canClaim = phase === 'AIRDROP_LIVE' && !isClaiming;

  const timerText =
    phase === 'WARMUP'
      ? `Lands in ${formatCountdown(toDrop.remainingMs)}`
      : phase === 'AIRDROP_LIVE'
        ? `Closes in ${formatCountdown(toClose.remainingMs)}`
        : phase === 'LOOTED_OUT'
          ? 'All claimed'
          : 'Window closed';

  return (
    <li>
      <article className={`${styles.card} ${styles[`phase_${phase}`]}`} aria-labelledby={titleId}>
        <header className={styles.cardHeader}>
          <h4 id={titleId}>{drop.title}</h4>
          <p className={styles.price}>{vnd.format(drop.priceVnd)}</p>
        </header>

        <dl className={styles.facts}>
          <dt>Phase</dt>
          <dd><span className={styles.badge}>{PHASE_LABEL[phase]}</span></dd>
          <dt>Stock</dt>
          <dd>{view.stock}</dd>
          <dt>Yours</dt>
          <dd>{view.mine}</dd>
        </dl>

        <p className={styles.timer} role="timer">{timerText}</p>

        <button
          type="button"
          className={styles.claim}
          disabled={!canClaim}
          aria-busy={isClaiming}
          onClick={() => onClaim(drop.id)}
        >
          {isClaiming ? 'Claiming…' : 'Claim'}
        </button>

        <output className={`${styles.message} ${styles[view.tone]}`} aria-live="polite">
          {view.message}
        </output>
      </article>
    </li>
  );
}