"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Typography } from "antd";

const REFRESH_MS = 60000;

interface RefreshHintProps {
  /** Server render time, HH:MM:SS on the server's local clock. */
  updatedAt: string;
}

/** SPEC-001 §1.3 (AC-5) — router.refresh() every 60 s; no API route, no polling endpoint. */
export default function RefreshHint({ updatedAt }: RefreshHintProps) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(id);
  }, [router]);

  return <Typography.Text type="secondary">{`Updated ${updatedAt} · refreshes every 60 s`}</Typography.Text>;
}
