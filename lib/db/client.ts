import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import { env } from "@/lib/env";

const fallbackUrl = "postgres://localhost:5432/gbaruction";

export function createDb() {
  const sql = neon(env.DATABASE_URL ?? fallbackUrl);
  return drizzle(sql);
}
