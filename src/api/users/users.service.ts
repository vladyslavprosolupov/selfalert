import { eq } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { sign } from 'hono/jwt'
import { hashPassword, verifyPassword } from '../../core/security/password'
import { users } from '../../models/user.model'

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7

export class UsersService {
  constructor(
    private readonly db: DrizzleD1Database<Record<string, never>>,
    private readonly jwtSecret: string,
  ) {}

  public async emailExists(email: string) {
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get()

    return !!user
  }

  public async signUp(data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
  }) {
    const { email, password, firstName, lastName } = data

    const passwordHash = await hashPassword(password)

    const user = await this.db
      .insert(users)
      .values({ email, firstName, lastName, passwordHash })
      .returning({ id: users.id })
      .get()

    return user.id
  }

  public async signIn(data: { email: string; password: string }) {
    const { email, password } = data

    const user = await this.db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email))
      .get()

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const passwordVerification = await verifyPassword(
      password,
      user.passwordHash,
    )

    if (!passwordVerification.valid) {
      throw new Error('Invalid credentials')
    }

    if (passwordVerification.needsRehash) {
      await this.db
        .update(users)
        .set({ passwordHash: await hashPassword(password) })
        .where(eq(users.id, user.id))
    }

    const issuedAt = Math.floor(Date.now() / 1_000)
    const token = await sign(
      {
        id: user.id,
        sub: user.id,
        iat: issuedAt,
        exp: issuedAt + ACCESS_TOKEN_TTL_SECONDS,
      },
      this.jwtSecret,
    )

    return { token }
  }

  public async profile(id: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .get()

    if (!result) {
      throw new Error('User not found')
    }

    return {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      createdAt: result.createdAt,
    }
  }
}
