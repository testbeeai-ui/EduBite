/**
 * Account deletion must finish after any save already sent to the server.
 * edubite_save_game_state upserts, so a write that commits after the delete
 * RPC recreates edubite_game_state.
 */
let suspended = false;
let inFlight = 0;
const waiters: Array<() => void> = [];

export function areProgressWritesSuspended(): boolean {
  return suspended;
}

export function suspendProgressWrites(): void {
  suspended = true;
}

export function resumeProgressWrites(): void {
  suspended = false;
}

/** False means the caller must not send a save. */
export function beginProgressWrite(): boolean {
  if (suspended) return false;
  inFlight += 1;
  return true;
}

export function endProgressWrite(): void {
  if (inFlight > 0) inFlight -= 1;
  if (inFlight > 0) return;
  const pending = waiters.splice(0);
  for (const wake of pending) wake();
}

/** Resolves once every save that started before the wait has settled. */
export async function drainProgressWrites(): Promise<void> {
  while (inFlight > 0) {
    await new Promise<void>((resolve) => {
      waiters.push(resolve);
    });
  }
}
