// PUBG Vietnam Series (PVS) squad telemetry: fake server
export const PUBG_VN_SQUADS = [
  { id: 'ces', name: 'Cerberus Esports', map: 'Erangel', phase: 'Phase 6',
    alive: 4, kills: 14, wwcdProb: '68%', status: 'In Safe Zone' },
  { id: 'te', name: 'The Expendables', map: 'Miramar', phase: 'Phase 7',
    alive: 4, kills: 18, wwcdProb: '82%', status: 'Holding High Ground' },
  { id: 'ge', name: 'Genius Esports', map: 'Taego', phase: 'Phase 5',
    alive: 3, kills: 9, wwcdProb: '41%', status: 'Rotating Blue Zone' },
];

const PACKET_LOSS_RATE = 0.35; // 35% satellite packet loss

function createAbortError() {
  return new DOMException('Request aborted', 'AbortError');
}

// Reused from Lab 2 hw3-flash-sale/mockApi.ts (realWait)
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

export async function fetchKraftonPubgTelemetry(squadId, { signal } = {}) {
  const latency = 600 + Math.random() * 1200; // 0.6s – 1.8s
  await wait(latency, signal);

  if (Math.random() < PACKET_LOSS_RATE) {
    throw new Error('Satellite packet loss over Erangel/Miramar');
  }

  const squad = PUBG_VN_SQUADS.find((s) => s.id === squadId);
  if (!squad) throw new Error(`Unknown squad: ${squadId}`);
  return { ...squad }; // return a copy, never the shared object
}