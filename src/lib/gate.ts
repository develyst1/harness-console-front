import "server-only";
import { execFile } from "node:child_process";
import path from "node:path";
import { GATE_SCRIPT, getWorkspacePath } from "@/lib/config";

// SPEC-001 §1.2 — the console's only data source: check-hygiene.mjs --json, run as a child process.

export type RunError =
  | { kind: "gate"; code: string; message: string } // gate printed { ok:false, error }
  | { kind: "timeout" } // killed at 15 s
  | { kind: "not-json" } // stdout did not JSON.parse
  | { kind: "schema"; schema: unknown } // schema !== 1
  | { kind: "spawn"; message: string }; // process could not start

export type ListRun =
  | { ok: true; projects: string[]; ranAt: string }
  | { ok: false; error: RunError; ranAt: string };

export type GateRun =
  | { ok: true; project: string; data: GateJson; ranAt: string }
  | { ok: false; project: string; error: RunError; ranAt: string }; // ranAt = ISO-8601, server clock

// SPEC-001 §2.3 — only these fields are read; every other field is ignored.
export type GateJson = {
  schema: 1;
  ok: true;
  project: string;
  result: "PASS" | "FAIL";
  counts: { fail: number; warn: number };
  checks: { severity: "fail" | "warn"; text: string }[];
  files: {
    name: string;
    bytes: number;
    limitBytes: number | null;
    warnBytes?: number;
    exists?: boolean;
    exempt?: string;
  }[];
  resumeBehindDays: number | null;
  newestLogDate: string | null;
  boardRows: {
    id: string;
    title: string | null; // observed null on 32 smart-scheduler rows (2026-10-05) — SPEC-001 §2.3 says string
    status: string | null;
    ball: string | null;
    ballColumn: string | null;
  }[];
};

const TIMEOUT_MS = 15000;
const MAX_PARALLEL = 4;

type Parsed = { ok: true; json: Record<string, unknown> } | { ok: false; error: RunError };

/** Run the gate with args; decide on the JSON (never the exit code). No retry, no cache. */
function run(args: string[]): Promise<Parsed> {
  // Pages check the config first (AC-7) and never call the runner when it is invalid.
  const ws = getWorkspacePath();
  if (ws === null) throw new Error("HARNESS_WORKSPACE_PATH invalid");
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [path.join(ws, GATE_SCRIPT), ...args],
      { cwd: ws, timeout: TIMEOUT_MS, windowsHide: true, maxBuffer: 8 * 1024 * 1024 },
      (err, stdout) => {
        // execFile rejects on exit 1 and 2 — stdout is still the answer.
        const e = err as (NodeJS.ErrnoException & { killed?: boolean }) | null;
        if (e?.killed) return resolve({ ok: false, error: { kind: "timeout" } });
        if (e && typeof e.code === "string") {
          return resolve({ ok: false, error: { kind: "spawn", message: e.message } });
        }
        let json: Record<string, unknown>;
        try {
          json = JSON.parse(stdout);
        } catch {
          return resolve({ ok: false, error: { kind: "not-json" } });
        }
        if (json === null || typeof json !== "object") {
          return resolve({ ok: false, error: { kind: "not-json" } });
        }
        if (json.schema !== 1) {
          return resolve({ ok: false, error: { kind: "schema", schema: json.schema } });
        }
        if (json.ok === false) {
          const ge = (json.error ?? {}) as { code?: string; message?: string };
          return resolve({
            ok: false,
            error: { kind: "gate", code: String(ge.code), message: String(ge.message) },
          });
        }
        resolve({ ok: true, json });
      },
    );
  });
}

export async function listProjects(): Promise<ListRun> {
  const ranAt = new Date().toISOString();
  const r = await run(["--list", "--json"]);
  if (!r.ok) return { ok: false, error: r.error, ranAt };
  return { ok: true, projects: r.json.projects as string[], ranAt };
}

export async function runGate(project: string): Promise<GateRun> {
  const ranAt = new Date().toISOString();
  const r = await run([project, "--json"]);
  if (!r.ok) return { ok: false, project, error: r.error, ranAt };
  return { ok: true, project, data: r.json as unknown as GateJson, ranAt };
}

/** runGate for every project, at most 4 at a time; results in the given order. */
export async function runGates(projects: string[]): Promise<GateRun[]> {
  const out: GateRun[] = new Array(projects.length);
  let next = 0;
  const worker = async () => {
    while (next < projects.length) {
      const i = next++;
      out[i] = await runGate(projects[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(MAX_PARALLEL, projects.length) }, worker));
  return out;
}

/** SPEC-001 §1.4 — the one map from a RunError to its <reason>. */
export function reasonOf(error: RunError): string {
  switch (error.kind) {
    case "gate":
      return error.message;
    case "timeout":
      return "no answer after 15 s";
    case "not-json":
      return "output was not JSON";
    case "schema":
      return "gate version not supported";
    case "spawn":
      return "could not start the gate";
  }
}
