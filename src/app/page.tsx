import { Alert, Col, Row } from "antd";
import { ProjectCard } from "@/components/ProjectCard";
import RefreshHint from "@/components/RefreshHint";
import { Title } from "@/components/Title";
import { getWorkspacePath } from "@/lib/config";
import { listProjects, reasonOf, runGates } from "@/lib/gate";
import { hhmmss, listFailure, WORKSPACE_PATH_NOT_FOUND } from "@/lib/text";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  // SPEC-001 §1.3: the refresh hint is on every render state (AC-7, list failure, success) — TASK-003 step 7.
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
  const runs = await runGates(list.projects);
  return (
    <>
      <Title level={2}>Workspace</Title>
      {hint}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {runs.map((run) => (
          <Col key={run.project} xs={24} md={12} xl={8}>
            <ProjectCard run={run} />
          </Col>
        ))}
      </Row>
    </>
  );
}
