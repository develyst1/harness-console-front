"use client";

import { Table } from "antd";
import type { GateJson } from "@/lib/gate";
import { EMPTY, exemptLimit, FILE_HEALTH_COLUMNS, FILE_NOT_FOUND, fmt } from "@/lib/text";

type FileRow = GateJson["files"][number];

// SPEC-001 §Non-functional: the one allowed literal — used only to find the row that
// carries `resumeBehindDays` (equality test against the gate's JSON; it opens nothing).
const RESUME_FILE_NAME = "RESUME-HERE.md";

// SPEC-001 §1.5 "File health": name · size · limit (+ days behind on one row). No verdict,
// no colour, no size-vs-limit comparison — the verdicts are the gate's lines (Q-7 ก).
const size = (f: FileRow) => (f.exists === false ? FILE_NOT_FOUND : fmt(f.bytes));
const limit = (f: FileRow) =>
  f.exempt !== undefined ? exemptLimit(f.exempt) : f.limitBytes === null ? EMPTY : fmt(f.limitBytes);

export function FileHealthTable({ files, resumeBehindDays }: { files: GateJson["files"]; resumeBehindDays: number | null }) {
  const daysBehind = (f: FileRow) =>
    f.name === RESUME_FILE_NAME ? (resumeBehindDays === null ? EMPTY : String(resumeBehindDays)) : "";
  return (
    <Table
      size="small"
      pagination={false}
      // No approved text for an empty files[]; antd's own "No data" would be invented copy (D-12).
      locale={{ emptyText: EMPTY }}
      rowKey="_k"
      dataSource={files.map((f, i) => ({ ...f, _k: i }))}
      columns={[
        { title: FILE_HEALTH_COLUMNS.file, key: "file", render: (_, f: FileRow) => f.name },
        { title: FILE_HEALTH_COLUMNS.size, key: "size", render: (_, f: FileRow) => size(f) },
        { title: FILE_HEALTH_COLUMNS.limit, key: "limit", render: (_, f: FileRow) => limit(f) },
        { title: FILE_HEALTH_COLUMNS.daysBehind, key: "days", render: (_, f: FileRow) => daysBehind(f) },
      ]}
    />
  );
}
