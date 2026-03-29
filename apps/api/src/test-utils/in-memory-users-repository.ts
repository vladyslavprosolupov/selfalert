import type {
  CreateUserInput,
  UserCredentialsRecord,
  UserProfileRecord,
  UsersRepository,
} from '@selfalert/core'

type StoredUser = UserProfileRecord & {
  passwordHash: string
}

export class InMemoryUsersRepository implements UsersRepository {
  private readonly usersByEmail = new Map<string, StoredUser>()
  private readonly usersById = new Map<string, StoredUser>()

  public async findByEmail(
    email: string,
  ): Promise<UserCredentialsRecord | null> {
    const user = this.usersByEmail.get(email)

    if (!user) {
      return null
    }

    return {
      id: user.id,
      passwordHash: user.passwordHash,
    }
  }

  public async emailExists(email: string) {
    return this.usersByEmail.has(email)
  }

  public async create(input: CreateUserInput) {
    const id = crypto.randomUUID()
    const user: StoredUser = {
      id,
      email: input.email,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      createdAt: new Date(),
      passwordHash: input.passwordHash,
    }

    this.usersByEmail.set(user.email, user)
    this.usersById.set(user.id, user)

    return id
  }

  public async updatePasswordHash(userId: string, passwordHash: string) {
    const user = this.usersById.get(userId)

    if (!user) {
      return
    }

    const updatedUser = { ...user, passwordHash }

    this.usersById.set(userId, updatedUser)
    this.usersByEmail.set(updatedUser.email, updatedUser)
  }

  public async findProfileById(id: string): Promise<UserProfileRecord | null> {
    const user = this.usersById.get(id)

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    }
  }
}
