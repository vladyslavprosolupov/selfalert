export type UserCredentialsRecord = {
  id: string
  passwordHash: string
}

export type UserProfileRecord = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  createdAt: Date
}

export type CreateUserInput = {
  email: string
  passwordHash: string
  firstName?: string
  lastName?: string
}

export interface UsersRepository {
  findByEmail(email: string): Promise<UserCredentialsRecord | null>
  emailExists(email: string): Promise<boolean>
  create(input: CreateUserInput): Promise<string>
  updatePasswordHash(userId: string, passwordHash: string): Promise<void>
  findProfileById(id: string): Promise<UserProfileRecord | null>
}
