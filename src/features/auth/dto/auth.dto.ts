export type AuthProvider = 'FACEBOOK' | 'GOOGLE' | 'LOCAL'

export type UserRole = 'BILLER' | 'AGENT' | 'ADMIN' | 'BUYER'

export type LoginRequestDto = {
  username: string
  password: string
}

export type LoginResponseDto = {
  authProvider: AuthProvider
  jwtToken: string
}

export type RegisterRequestDto = {
  firstName: string
  lastName: string
  username: string
  email: string
  groupId: number
  phoneNumber?: string
}

export type RegisterResponseDto = {
  id: number
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber?: string
}

export type AuthSession = {
  accessToken: string
  role: UserRole
  authProvider: AuthProvider
  issuedAt: number
  expiresAt: number
}
