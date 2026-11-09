export class ApiError extends Error {
  constructor(kind, status, message, serverStock) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;          // 'conflict' | 'network' | 'not-live' | 'expired' | 'not-found'
    this.status = status;      // HTTP-like status code
    this.serverStock = serverStock;
  }
}

function createAbortError() {
  return new DOMException('The request was cancelled', 'AbortError');
}

// Abortable delay (same as Lab 2 hw3 realWait)
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(createAbortError());
    const onAbort = () => {
      clearTimeout(timer);
      reject(createAbortError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Fake KRAFTON drop server. It owns the REAL stock; the UI only shows a guess.
 * Other players ("rivals") claim at the same time, so 409s happen naturally.
 */
export function createArenaApi(drops, { now = () => Date.now(), rivalChance = 0.25 } = {}) {
  const stock = new Map(drops.map((d) => [d.id, d.remainingStock]));
  const windows = new Map(
    drops.map((d) => [d.id, { opens: d.dropEpochMs, closes: d.closesEpochMs }])
  );
  let rivalRushNext = false;
  let failNext = false;
  let requests = 0;

  return {
    get requestCount() {
      return requests;
    },
    /** Test tool: rivals empty the stock just before the next claim -> 409 */
    rivalRushNext() {
      rivalRushNext = true;
    },
    /** Test tool: the next claim fails with 503 */
    failNextRequest() {
      failNext = true;
    },

    async claim(dropId, { signal } = {}) {
      requests += 1;
      console.info(`[arena-server] claim request #${requests}: ${dropId}`);
      await wait(400 + Math.random() * 800, signal);

      if (failNext) {
        failNext = false;
        throw new ApiError('network', 503, 'Server busy, please retry');
      }

      const window = windows.get(dropId);
      if (!window) throw new ApiError('not-found', 404, 'Unknown airdrop');
      const t = now();
      if (t < window.opens) throw new ApiError('not-live', 425, 'Airdrop has not landed yet');
      if (t >= window.closes) throw new ApiError('expired', 410, 'Airdrop window closed');

      // Rivals claim at the same moment
      if (rivalRushNext) {
        rivalRushNext = false;
        stock.set(dropId, 0);
      } else if (Math.random() < rivalChance && stock.get(dropId) > 0) {
        stock.set(dropId, stock.get(dropId) - 1);
      }

      const left = stock.get(dropId);
      if (left <= 0) {
        throw new ApiError('conflict', 409, 'Looted out: another squad grabbed the last one', 0);
      }
      stock.set(dropId, left - 1);
      return { dropId, remainingStock: left - 1 };
    },
  };
}