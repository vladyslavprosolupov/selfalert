import md5 from 'md5'

const PASSWORD_HASH_ALGORITHM = 'pbkdf2_sha256'
const PASSWORD_HASH_ITERATIONS = 600_000
const PASSWORD_HASH_SALT_BYTES = 16
const PASSWORD_HASH_KEY_BYTES = 32
const LEGACY_MD5_PATTERN = /^[a-f0-9]{32}$/i

const encoder = new TextEncoder()

type PasswordVerificationResult = {
  valid: boolean
  needsRehash: boolean
}

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')

const hexToBytes = (value: string) => {
  if (value.length % 2 !== 0) {
    throw new Error('Invalid hex value')
  }

  const bytes = new Uint8Array(value.length / 2)

  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16)
  }

  return bytes
}

const timingSafeEqual = (left: Uint8Array, right: Uint8Array) => {
  if (left.length !== right.length) {
    return false
  }

  let difference = 0

  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index]
  }

  return difference === 0
}

const derivePasswordHash = async (
  password: string,
  salt: Uint8Array,
  iterations: number,
) => {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt as BufferSource,
      iterations,
    },
    passwordKey,
    PASSWORD_HASH_KEY_BYTES * 8,
  )

  return new Uint8Array(derivedBits)
}

export const hashPassword = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(PASSWORD_HASH_SALT_BYTES))
  const hash = await derivePasswordHash(
    password,
    salt,
    PASSWORD_HASH_ITERATIONS,
  )

  return [
    PASSWORD_HASH_ALGORITHM,
    PASSWORD_HASH_ITERATIONS.toString(),
    bytesToHex(salt),
    bytesToHex(hash),
  ].join('$')
}

export const verifyPassword = async (
  password: string,
  storedPasswordHash: string,
): Promise<PasswordVerificationResult> => {
  if (storedPasswordHash.startsWith(`${PASSWORD_HASH_ALGORITHM}$`)) {
    const [, iterationsValue, saltValue, hashValue] =
      storedPasswordHash.split('$')

    if (!iterationsValue || !saltValue || !hashValue) {
      return { valid: false, needsRehash: false }
    }

    const iterations = Number.parseInt(iterationsValue, 10)

    if (!Number.isInteger(iterations) || iterations <= 0) {
      return { valid: false, needsRehash: false }
    }

    try {
      const salt = hexToBytes(saltValue)
      const expectedHash = hexToBytes(hashValue)
      const actualHash = await derivePasswordHash(password, salt, iterations)
      const valid = timingSafeEqual(actualHash, expectedHash)

      return {
        valid,
        needsRehash: valid && iterations < PASSWORD_HASH_ITERATIONS,
      }
    } catch {
      return { valid: false, needsRehash: false }
    }
  }

  if (!LEGACY_MD5_PATTERN.test(storedPasswordHash)) {
    return { valid: false, needsRehash: false }
  }

  const legacyHash = md5(password)

  const valid = timingSafeEqual(
    encoder.encode(legacyHash),
    encoder.encode(storedPasswordHash.toLowerCase()),
  )

  return { valid, needsRehash: valid }
}
