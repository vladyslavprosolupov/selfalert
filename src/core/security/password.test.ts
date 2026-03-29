import { describe, expect, it } from 'vitest'
import { md5 } from 'hono/utils/crypto'

import { hashPassword, verifyPassword } from './password'

describe('password hashing', () => {
  it('hashes and verifies passwords with the current format', async () => {
    const password = 'correct horse battery staple'
    const passwordHash = await hashPassword(password)

    expect(passwordHash).toContain('pbkdf2_sha256$')
    await expect(verifyPassword(password, passwordHash)).resolves.toEqual({
      valid: true,
      needsRehash: false,
    })
    await expect(
      verifyPassword('not-the-right-password', passwordHash),
    ).resolves.toEqual({
      valid: false,
      needsRehash: false,
    })
  })

  it('generates distinct hashes for the same password', async () => {
    const password = 'correct horse battery staple'
    const firstHash = await hashPassword(password)
    const secondHash = await hashPassword(password)

    expect(firstHash).not.toBe(secondHash)
  })

  it('accepts legacy md5 hashes and marks them for rehashing', async () => {
    const password = 'legacy-password'
    const legacyHash = await md5(password)

    expect(legacyHash).toBeTruthy()
    await expect(verifyPassword(password, legacyHash!)).resolves.toEqual({
      valid: true,
      needsRehash: true,
    })
  })
})
