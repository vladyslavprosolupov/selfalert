import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { v7 as uuid } from 'uuid'

export const users = sqliteTable('users', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$default(() => uuid()),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .$default(() => new Date()),
})
