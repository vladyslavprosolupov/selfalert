import type {
  AccessTokenPayload,
  AccessTokenService,
  UsersService,
} from '@selfalert/core'

export type ApiAppVariables = {
  accessTokenService: AccessTokenService
  authPayload?: AccessTokenPayload
  usersService: UsersService
}

export type ApiAppEnv<TBindings extends object = object> = {
  Bindings: TBindings
  Variables: ApiAppVariables
}
