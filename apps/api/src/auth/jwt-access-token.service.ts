import type { AccessTokenPayload, AccessTokenService } from '@selfalert/core'
import { sign, verify } from 'hono/jwt'

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7

export class JwtAccessTokenService implements AccessTokenService {
  constructor(private readonly secret: string) {}

  public async issueToken(userId: string) {
    const issuedAt = Math.floor(Date.now() / 1_000)

    return sign(
      {
        id: userId,
        sub: userId,
        iat: issuedAt,
        exp: issuedAt + ACCESS_TOKEN_TTL_SECONDS,
      },
      this.secret,
    )
  }

  public async verifyToken(token: string): Promise<AccessTokenPayload> {
    const payload = await verify(token, this.secret, 'HS256')

    if (typeof payload.id !== 'string') {
      throw new Error('Unauthorized')
    }

    return { id: payload.id }
  }
}
