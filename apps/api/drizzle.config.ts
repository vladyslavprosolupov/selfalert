import type { Config } from 'drizzle-kit'

export default {
  driver: 'd1-http',
  schema: '../../packages/core/src/database/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
} satisfies Config
