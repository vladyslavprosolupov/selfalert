import { users } from '@selfalert/core'
import type {
  CreateUserInput,
  UserCredentialsRecord,
  UserProfileRecord,
  UsersRepository,
} from '@selfalert/core'
import { eq } from 'drizzle-orm'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'

export class NodeUsersRepository implements UsersRepository {
  constructor(private readonly db: LibSQLDatabase<Record<string, never>>) {}

  public async findByEmail(
    email: string,
  ): Promise<UserCredentialsRecord | null> {
    const result = await this.db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email))
      .get()

    return result ?? null
  }

  public async emailExists(email: string) {
    const result = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .get()

    return !!result
  }

  public async create(input: CreateUserInput) {
    const result = await this.db
      .insert(users)
      .values(input)
      .returning({ id: users.id })
      .get()

    return result.id
  }

  public async updatePasswordHash(userId: string, passwordHash: string) {
    await this.db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId))
  }

  public async findProfileById(id: string): Promise<UserProfileRecord | null> {
    const result = await this.db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .get()

    return result ?? null
  }
}
