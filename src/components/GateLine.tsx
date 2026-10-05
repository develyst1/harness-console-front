import { Tag } from "antd";
import type { GateJson } from "@/lib/gate";

type Check = GateJson["checks"][number];

// SPEC-001 §1.5 — a gate line: `FAIL` / `WARN` (= severity upper-cased) then the text verbatim, as plain text.
// Colour is a direct map of the gate's own severity, nothing the console decides.
export function GateLine({ check }: { check: Check }) {
  return (
    <div>
      <Tag color={check.severity === "fail" ? "error" : "warning"}>{check.severity.toUpperCase()}</Tag>
      {check.text}
    </div>
  );
}
