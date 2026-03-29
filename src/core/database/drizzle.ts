import { drizzle } from 'drizzle-orm/d1'
import type { DrizzleD1Database } from 'drizzle-orm/d1'

export const createDrizzleDB = (
  d1: D1Database,
): DrizzleD1Database<Record<string, never>> => drizzle(d1)
