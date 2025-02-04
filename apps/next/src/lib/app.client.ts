import type { AppType } from "@repo/api/app";
import { hc } from "hono/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export const client = hc<AppType>(API_URL);
