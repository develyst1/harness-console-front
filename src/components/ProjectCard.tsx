import Link from "next/link";
import { Card, Tag } from "antd";
import { GateLine } from "@/components/GateLine";
import { Text } from "@/components/Text";
import { reasonOf, type GateRun } from "@/lib/gate";
import { gateError, lastMoved } from "@/lib/text";

// SPEC-001 §1.5 "Card" (success) and §1.4 (error card, AC-6).
export function ProjectCard({ run }: { run: GateRun }) {
  if (!run.ok) {
    return (
      <Card title={run.project}>
        <Text type="danger">{gateError(reasonOf(run.error))}</Text>
      </Card>
    );
  }
  const d = run.data;
  return (
    <Link href={`/p/${encodeURIComponent(run.project)}`}>
      <Card hoverable title={run.project} extra={<Tag color={d.result === "PASS" ? "success" : "error"}>{d.result}</Tag>}>
        {d.checks.slice(0, 3).map((c, i) => (
          <GateLine key={i} check={c} />
        ))}
        <Text type="secondary">{lastMoved(d.newestLogDate)}</Text>
      </Card>
    </Link>
  );
}
