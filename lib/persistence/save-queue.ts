/**
 * Latest-wins save queue with retry. Never marks a payload as saved until
 * the async writer resolves successfully.
 */
export type SaveResult = { ok: true } | { ok: false; error: string };

export function createSaveQueue<T>(
  write: (value: T) => Promise<SaveResult>,
  options?: { debounceMs?: number },
) {
  const debounceMs = options?.debounceMs ?? 1500;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: T | null = null;
  let inFlight = false;
  let generation = 0;
  let lastSavedJson = "";

  const flush = async (): Promise<SaveResult> => {
    if (inFlight || pending === null) return { ok: true };
    const value = pending;
    pending = null;
    const serialized = JSON.stringify(value);
    if (serialized === lastSavedJson) return { ok: true };

    inFlight = true;
    const myGen = generation;
    let result: SaveResult = { ok: true };
    try {
      result = await write(value);
      if (result.ok && myGen === generation) {
        lastSavedJson = serialized;
      } else if (!result.ok) {
        // Re-queue latest if nothing newer arrived
        if (pending === null && myGen === generation) {
          pending = value;
        }
      }
    } finally {
      inFlight = false;
      if (result.ok && pending !== null) {
        void flush();
      }
    }
    return result;
  };

  return {
    setBaseline(value: T) {
      lastSavedJson = JSON.stringify(value);
      pending = null;
    },
    enqueue(value: T) {
      pending = value;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void flush();
      }, debounceMs);
    },
    /** Immediate write (e.g. session complete / page hide). */
    async flushNow(value?: T): Promise<SaveResult> {
      if (value !== undefined) pending = value;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      while (inFlight) {
        await new Promise((r) => setTimeout(r, 20));
      }
      if (pending !== null) {
        return flush();
      }
      return { ok: true };
    },
    invalidate() {
      generation += 1;
      pending = null;
      lastSavedJson = "";
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
    get lastSaved() {
      return lastSavedJson;
    },
  };
}
