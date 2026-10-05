import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

export const GATE_SCRIPT = "check-hygiene.mjs";

/**
 * SPEC-001 §1.1 — read at request time, no default.
 * Valid only if set, non-empty, the folder exists, and the gate script exists in it.
 * Returns the workspace path, or null when invalid (the page then shows the AC-7 text).
 */
export function getWorkspacePath(): string | null {
  const ws = process.env.HARNESS_WORKSPACE_PATH;
  if (!ws) return null;
  if (!existsSync(ws)) return null;
  if (!existsSync(path.join(ws, GATE_SCRIPT))) return null;
  return ws;
}
