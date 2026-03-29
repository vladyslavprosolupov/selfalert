export type AccessTokenPayload = {
  id: string
}

export interface AccessTokenService {
  issueToken(userId: string): Promise<string>
  verifyToken(token: string): Promise<AccessTokenPayload>
}
