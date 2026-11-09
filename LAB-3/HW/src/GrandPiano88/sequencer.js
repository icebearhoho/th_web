function createAbortError() {
  return new DOMException('Playback stopped', 'AbortError');
}

// Abortable delay (same pattern as Lab 2 hw3 realWait)
export function wait(ms, signal) {
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
 * Raw notes { midi, freqHz, startMs, durationMs } -> FIFO queue ordered by
 * start time, where deltaMs = time since the previous note started.
 */
export function buildSequence(rawNotes) {
  const ordered = rawNotes.toSorted((a, b) => a.startMs - b.startMs);
  let prevStart = 0;
  return ordered.map((n) => {
    const start = Math.round(n.startMs);
    const event = {
      id: n.id,
      midi: n.midi,
      freqHz: n.freqHz,
      durationMs: Math.max(30, Math.round(n.durationMs)),
      deltaMs: start - prevStart,
    };
    prevStart = start;
    return event;
  });
}

/** Plays the queue in FIFO order. Rejects with AbortError when signal aborts. */
export async function playSequence(sequence, { speed = 1, signal, noteOn, noteOff }) {
  if (signal?.aborted) throw createAbortError();

  const timers = new Set();
  const sounding = new Set();
  const stopAll = () => {
    timers.forEach((id) => clearTimeout(id));
    timers.clear();
    sounding.forEach((midi) => noteOff(midi));
    sounding.clear();
  };
  signal?.addEventListener('abort', stopAll, { once: true });

  try {
    let clock = 0; // ms since playback start (in recorded time)
    let end = 0;   // when the last note finishes
    for (const ev of sequence) {
      await wait(ev.deltaMs / speed, signal);
      clock += ev.deltaMs;
      end = Math.max(end, clock + ev.durationMs);

      noteOn(ev.midi);
      sounding.add(ev.midi);
      const id = setTimeout(() => {
        timers.delete(id);
        sounding.delete(ev.midi);
        noteOff(ev.midi);
      }, ev.durationMs / speed);
      timers.add(id);
    }
    await wait((end - clock) / speed, signal); // let the last notes ring out
  } finally {
    signal?.removeEventListener('abort', stopAll);
  }
}