// Created once at module level: formatting is fast and the object is stable.
export const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

/** Drops are timed relative to "now", so every page load shows all 4 phases. */
export function createDrops(now = Date.now()) {
  return [
    {
      id: 'gcoin-crate',
      title: 'G-Coin Contraband Crate',
      priceVnd: 99_000,
      remainingStock: 20,
      dropEpochMs: now - 1_000,          // already live
      closesEpochMs: now + 3 * 60_000,
    },
    {
      id: 'vip-pass',
      title: 'PVS Finals VIP Pass + 5,000 G-Coin',
      priceVnd: 1_490_000,
      remainingStock: 3,
      dropEpochMs: now + 15_000,         // lands in 15 s
      closesEpochMs: now + 5 * 60_000,
    },
    {
      id: 'standard-ticket',
      title: 'PVS Grand Finals Standard Ticket',
      priceVnd: 390_000,
      remainingStock: 2,
      dropEpochMs: now + 30_000,         // lands in 30 s
      closesEpochMs: now + 5 * 60_000,
    },
    {
      id: 'early-bird',
      title: 'Early-Bird Pass (Phase 1)',
      priceVnd: 290_000,
      remainingStock: 10,
      dropEpochMs: now - 10 * 60_000,
      closesEpochMs: now - 60_000,       // already expired
    },
  ];
}

// Demo standings (illustrative numbers, not official PVS results)
export const SQUAD_STANDINGS = [
  { squadId: 'te',  squadName: 'The Expendables',  wwcdCount: 4, placementPts: 62, killPts: 78 },
  { squadId: 'ces', squadName: 'Cerberus Esports', wwcdCount: 3, placementPts: 58, killPts: 71 },
  { squadId: 'ge',  squadName: 'Genius Esports',   wwcdCount: 2, placementPts: 49, killPts: 66 },
  { squadId: 'agg', squadName: 'AGG',              wwcdCount: 2, placementPts: 44, killPts: 59 },
  { squadId: 'roy', squadName: 'Roy Esports',      wwcdCount: 1, placementPts: 41, killPts: 63 },
];