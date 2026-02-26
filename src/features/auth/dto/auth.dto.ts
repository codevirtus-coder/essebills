export type AuthProvider = 'FACEBOOK' | 'GOOGLE' | 'LOCAL'

export type PortalRole = 'BILLER' | 'AGENT' | 'ADMIN' | 'BUYER'
export type UserRole = PortalRole
export type UserGroup = 'BILLER' | 'AGENT' | 'ADMIN' | 'CUSTOMER'

export type UserProfileGroupDto = {
  id: number
  name: string
  createdBy?: string | null
  createdDate?: string | null
  lastModifiedBy?: string | null
  lastModifiedDate?: string | null
  deleted?: boolean
  version?: number
}

export type UserProfileDto = {
  id: number
  username: string
  email: string
  enabled: boolean
  accountNonExpired: boolean
  accountNonLocked: boolean
  credentialsNonExpired: boolean
  firstName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
  organisationName?: string | null
  shopName?: string | null
  shopLocation?: string | null
  emailVerified?: boolean
  otpEnabled?: boolean
  authorities?: string[]
  group?: UserProfileGroupDto | null
  createdDate?: string
  lastModifiedDate?: string
} & Record<string, unknown>

export type LoginRequestDto = {
  username: string
  password: string
}

export type LoginResponseDto = {
  authProvider?: AuthProvider
  jwtToken?: string
  refreshToken?: string
  otpRequired?: boolean
  tempToken?: string
  message?: string
}

export type RegisterRequestDto = {
  firstName: string
  lastName: string
  username: string
  email: string
  groupId: number
  phoneNumber?: string
  password?: string
  confirmPassword?: string
  organisationName?: string
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
  refreshToken?: string
  role: UserRole
  group: UserGroup
  profile?: UserProfileDto
  authProvider: AuthProvider
  issuedAt: number
  expiresAt: number
}

export type PendingOtpChallenge = {
  portalRole: UserRole
  username: string
  tempToken: string
  createdAt: number
}
