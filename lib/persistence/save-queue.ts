/**
 * Latest-wins save queue with retry. Never marks a payload as saved until
 * the async writer resolves successfully.
 *
 * Each job is bound to the userId captured at enqueue time. If the signed-in
 * user changes mid-flight, the write is aborted so User A's progress cannot
 * land in User B's row.
 */
export type SaveResult = { ok: true } | { ok: false; error: string };

type BoundJob<T> = { value: T; userId: string };

export function createSaveQueue<T>(
  write: (value: T, userId: string) => Promise<SaveResult>,
  getUserId: () => string | null,
  options?: { debounceMs?: number },
) {
  const debounceMs = options?.debounceMs ?? 1500;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: BoundJob<T> | null = null;
  let inFlight = false;
  let generation = 0;
  let lastSavedJson = "";

  const flush = async (): Promise<SaveResult> => {
    if (inFlight || pending === null) return { ok: true };
    const job = pending;
    pending = null;

    const liveUserId = getUserId();
    if (!liveUserId || liveUserId !== job.userId) {
      return { ok: false, error: "User switched — save aborted" };
    }

    const serialized = JSON.stringify(job.value);
    if (serialized === lastSavedJson) return { ok: true };

    inFlight = true;
    const myGen = generation;
    let result: SaveResult = { ok: true };
    try {
      result = await write(job.value, job.userId);
      // Drop success if account changed while the request was in flight.
      if (
        myGen !== generation ||
        getUserId() !== job.userId
      ) {
        return { ok: false, error: "User switched — save discarded" };
      }
      if (result.ok) {
        lastSavedJson = serialized;
      } else if (pending === null && myGen === generation) {
        pending = job;
      }
    } finally {
      inFlight = false;
    }
    if (result.ok && pending !== null && getUserId() === pending.userId) {
      void flush();
    }
    return result;
  };

  return {
    setBaseline(value: T) {
      const userId = getUserId();
      lastSavedJson = JSON.stringify(value);
      pending = null;
      if (!userId) lastSavedJson = "";
    },
    enqueue(value: T) {
      const userId = getUserId();
      if (!userId) return;
      pending = { value, userId };
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void flush();
      }, debounceMs);
    },
    /** Immediate write (e.g. session complete / page hide). */
    async flushNow(value?: T): Promise<SaveResult> {
      const userId = getUserId();
      if (!userId) {
        pending = null;
        return { ok: false, error: "Not signed in" };
      }
      if (value !== undefined) pending = { value, userId };
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
