export type SignInInput = {
  email: string
  password: string
}

export type SignInResponse = {
  token: string
}

export type SignUpInput = {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export type SignUpResponse = {
  id: string
}

export type UserProfile = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  createdAt: string
}

export type ProfileResponse = {
  user: UserProfile
}
