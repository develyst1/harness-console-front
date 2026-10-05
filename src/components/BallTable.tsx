"use client";

import { Table } from "antd";
import type { GateJson } from "@/lib/gate";
import { BALL_COLUMNS, EMPTY } from "@/lib/text";

type BoardRow = GateJson["boardRows"][number];

// SPEC-001 §1.5 "Ball": every board row the gate returns, gate order, verbatim plain text.
// `ballColumn` is not shown. No pagination — every row is visible (smart-scheduler has 147).
export function BallTable({ rows }: { rows: GateJson["boardRows"] }) {
  return (
    <Table
      size="small"
      pagination={false}
      rowKey="_k"
      dataSource={rows.map((r, i) => ({ ...r, _k: i }))}
      columns={[
        { title: BALL_COLUMNS.id, key: "id", render: (_, r: BoardRow) => r.id },
        { title: BALL_COLUMNS.title, key: "title", render: (_, r: BoardRow) => r.title ?? EMPTY },
        { title: BALL_COLUMNS.status, key: "status", render: (_, r: BoardRow) => r.status ?? EMPTY },
        { title: BALL_COLUMNS.ball, key: "ball", render: (_, r: BoardRow) => r.ball ?? EMPTY },
      ]}
    />
  );
}
