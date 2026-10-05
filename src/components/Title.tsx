"use client";

import { Typography } from "antd";

// Typography.Title cannot be reached through antd's client boundary from a server page.
export const Title = Typography.Title;
