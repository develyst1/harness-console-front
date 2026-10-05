import { notFound } from "next/navigation";
import { Alert, Tag } from "antd";
import { BallTable } from "@/components/BallTable";
import { FileHealthTable } from "@/components/FileHealthTable";
import { GateLine } from "@/components/GateLine";
import RefreshHint from "@/components/RefreshHint";
import { Text } from "@/components/Text";
import { Title } from "@/components/Title";
import { getWorkspacePath } from "@/lib/config";
import { listProjects, reasonOf, runGate } from "@/lib/gate";
import {
  gateError,
  hhmmss,
  listFailure,
  NO_BOARD_ROWS,
  NO_GATE_LINES,
  SECTION_BALL,
  SECTION_FILE_HEALTH,
  SECTION_GATE,
  WORKSPACE_PATH_NOT_FOUND,
} from "@/lib/text";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ project: string }> }) {
  // Next hands the segment over still percent-encoded (`did-api-center-c%23` for `…c#`).
  const raw = (await params).project;
  let project: string;
  try {
    project = decodeURIComponent(raw);
  } catch {
    notFound(); // malformed escape — cannot be a listed project
  }
  // SPEC-001 §1.3: the refresh hint is on every render state (AC-7, list failure, gate error, success).
  const hint = <RefreshHint updatedAt={hhmmss(new Date())} />;
  if (getWorkspacePath() === null) {
    return (
      <>
        <Alert type="error" title={WORKSPACE_PATH_NOT_FOUND} />
        {hint}
      </>
    );
  }
  const list = await listProjects();
  if (!list.ok) {
    return (
      <>
        <Alert type="error" title={listFailure(reasonOf(list.error))} />
        {hint}
      </>
    );
  }
  // Check the name against the gate's own list first; unknown → 404, no gate run.
  if (!list.projects.includes(project)) notFound();

  const run = await runGate(project);
  if (!run.ok) {
    // SPEC-001 §1.4: `Gate error — <reason>` replaces the three sections (Q-9 b).
    return (
      <>
        <Title level={2}>{project}</Title>
        {hint}
        <div style={{ marginTop: 16 }}>
          <Text type="danger">{gateError(reasonOf(run.error))}</Text>
        </div>
      </>
    );
  }

  const d = run.data;
  return (
    <>
      <Title level={2}>
        {d.project} <Tag color={d.result === "PASS" ? "success" : "error"}>{d.result}</Tag>
      </Title>
      {hint}

      <Title level={4}>{SECTION_GATE}</Title>
      {d.checks.length === 0 ? <Text>{NO_GATE_LINES}</Text> : d.checks.map((c, i) => <GateLine key={i} check={c} />)}

      <Title level={4}>{SECTION_FILE_HEALTH}</Title>
      <FileHealthTable files={d.files} resumeBehindDays={d.resumeBehindDays} />

      <Title level={4}>{SECTION_BALL}</Title>
      {d.boardRows.length === 0 ? <Text>{NO_BOARD_ROWS}</Text> : <BallTable rows={d.boardRows} />}
    </>
  );
}
