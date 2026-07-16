/**
 * Minimal typings for Node's experimental `node:sqlite` (DatabaseSync).
 * Present at runtime on Node 22.5+; @types/node may lag behind.
 */
declare module "node:sqlite" {
  export class StatementSync {
    run(...params: unknown[]): unknown;
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }

  export class DatabaseSync {
    constructor(path: string, options?: { timeout?: number });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
