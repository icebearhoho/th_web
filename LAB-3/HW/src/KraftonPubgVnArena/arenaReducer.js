/** One view per drop: what the UI shows (an optimistic guess until the server answers). */
export function createArenaState(drops) {
  return Object.fromEntries(
    drops.map((d) => [
      d.id,
      { stock: d.remainingStock, mine: 0, inFlightClaimId: null, message: '', tone: 'info' },
    ])
  );
}

function patch(state, dropId, changes) {
  return { ...state, [dropId]: { ...state[dropId], ...changes } };
}

/**
 * Pure reducer. Anything not allowed returns the SAME state (no render).
 *   claimStart    -> optimistic: stock - 1, lock the drop with this claimId
 *   claimSuccess  -> accept the server's real stock, +1 to "mine", unlock
 *   claimRollback -> undo the -1 (or take the server's stock), show why, unlock
 * Only the claim that holds the lock may finish it (stale-response guard, like Lab 2 requestId).
 */
export function arenaReducer(state, action) {
  const view = state[action.dropId];
  if (!view) return state;

  switch (action.type) {
    case 'claimStart':
      if (view.inFlightClaimId !== null || view.stock <= 0) return state;
      return patch(state, action.dropId, {
        stock: view.stock - 1,
        inFlightClaimId: action.claimId,
        message: 'Claiming…',
        tone: 'info',
      });

    case 'claimSuccess':
      if (view.inFlightClaimId !== action.claimId) return state;
      return patch(state, action.dropId, {
        stock: action.serverStock,
        mine: view.mine + 1,
        inFlightClaimId: null,
        message: 'Claimed! Added to your inventory.',
        tone: 'success',
      });

    case 'claimRollback':
      if (view.inFlightClaimId !== action.claimId) return state;
      return patch(state, action.dropId, {
        stock: action.serverStock ?? view.stock + 1,
        inFlightClaimId: null,
        message: action.message,
        tone: 'error',
      });

    default:
      return state;
  }
}