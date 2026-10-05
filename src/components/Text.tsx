"use client";

import { Typography } from "antd";

// Typography.Text cannot be reached through antd's client boundary from a server component (same as Title.tsx).
export const Text = Typography.Text;
