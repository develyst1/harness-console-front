// User-facing text — only strings from the REQ-001 wording table / SPEC-001 §1.4.

export const WORKSPACE_PATH_NOT_FOUND =
  "Workspace path not found — check HARNESS_WORKSPACE_PATH in .env.local";

export const listFailure = (reason: string) => `Could not list projects — ${reason}`;

/** HH:MM:SS on the server's local clock (the render time shown in the refresh hint). */
export function hhmmss(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export const gateError = (reason: string) => `Gate error — ${reason}`;

/** REQ-001 Q-8 (b): every empty value. */
export const EMPTY = "—";

/** REQ-001 wording table, Q-6: the gate's newestLogDate, or `—` when the gate gives none. */
export const lastMoved = (date: string | null) => `Last moved: ${date ?? EMPTY}`;

// Project page — REQ-001 wording table ("Project page sections") + Q-8 table (a)(b)(f).
export const SECTION_GATE = "Gate";
export const SECTION_FILE_HEALTH = "File health";
export const SECTION_BALL = "Ball";
export const FILE_HEALTH_COLUMNS = { file: "File", size: "Size", limit: "Limit", daysBehind: "Days behind" };
export const BALL_COLUMNS = { id: "Id", title: "Title", status: "Status", ball: "Ball" };
export const NO_GATE_LINES = "No lines from the gate.";
export const NO_BOARD_ROWS = "No board rows.";
export const FILE_NOT_FOUND = "not found";
export const exemptLimit = (exempt: string) => `exempt — ${exempt}`;

/** Copied from the gate (check-hygiene.mjs `const fmt`) — SPEC-001 §1.5, Q-8 assumption A. */
export const fmt = (n: number) => `${(n / 1024).toFixed(1)}KB`;
