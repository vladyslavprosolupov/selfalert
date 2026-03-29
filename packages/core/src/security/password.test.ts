import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password helpers', () => {
  it('hashes and verifies passwords', async () => {
    const passwordHash = await hashPassword('supersecret')
    const result = await verifyPassword('supersecret', passwordHash)

    expect(result).toEqual({ valid: true, needsRehash: false })
  })

  it('rejects invalid passwords', async () => {
    const passwordHash = await hashPassword('supersecret')
    const result = await verifyPassword('wrong-password', passwordHash)

    expect(result).toEqual({ valid: false, needsRehash: false })
  })

  it('marks legacy hashes for rehash when the password matches', async () => {
    const result = await verifyPassword(
      'password',
      '5f4dcc3b5aa765d61d8327deb882cf99',
    )

    expect(result).toEqual({ valid: true, needsRehash: true })
  })
})
