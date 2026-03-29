import type { AccessTokenService } from '../auth/access-token'
import type {
  SignInInput,
  SignInResponse,
  SignUpInput,
  SignUpResponse,
  UserProfile,
} from '../contracts/users'
import { hashPassword, verifyPassword } from '../security/password'
import type { UsersRepository } from './users.repository'

export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly accessTokenService: AccessTokenService,
  ) {}

  public emailExists(email: string) {
    return this.usersRepository.emailExists(email)
  }

  public async signUp(data: SignUpInput): Promise<SignUpResponse> {
    const passwordHash = await hashPassword(data.password)

    const id = await this.usersRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
    })

    return { id }
  }

  public async signIn(data: SignInInput): Promise<SignInResponse> {
    const user = await this.usersRepository.findByEmail(data.email)

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const passwordVerification = await verifyPassword(
      data.password,
      user.passwordHash,
    )

    if (!passwordVerification.valid) {
      throw new Error('Invalid credentials')
    }

    if (passwordVerification.needsRehash) {
      await this.usersRepository.updatePasswordHash(
        user.id,
        await hashPassword(data.password),
      )
    }

    return {
      token: await this.accessTokenService.issueToken(user.id),
    }
  }

  public async profile(id: string): Promise<UserProfile> {
    const user = await this.usersRepository.findProfileById(id)

    if (!user) {
      throw new Error('User not found')
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      createdAt: user.createdAt.toISOString(),
    }
  }
}
