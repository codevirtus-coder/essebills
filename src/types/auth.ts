// ============================================================================
// Authentication & Authorization Types - Derived from API spec
// ============================================================================

import type { BaseEntity } from './common'

// --------------------------------------------------------------------------
// Auth Types
// --------------------------------------------------------------------------

/** Authentication request */
export interface AuthenticationRequest {
  username: string
  password: string
}

/** Authentication response */
export interface AuthenticationResponse {
  jwtToken?: string
  refreshToken?: string
}

/** Refresh token request */
export interface RefreshTokenRequest {
  refreshToken: string
}

/** OTP verification request */
export interface OtpVerifyRequest {
  tempToken: string
  code: string
}

/** OTP verification command */
export interface OtpVerificationCommand {
  username: string
  code: string
}

/** Forgot password request */
export interface ForgotPasswordContext {
  email?: string
}

/** Reset password request */
export interface ResetPasswordContext {
  resetToken: string
  password: string
}

/** Update password context (requires old password) */
export interface UpdatePasswordContext {
  oldPassword: string
  password: string
  confirmPassword: string
}

// --------------------------------------------------------------------------
// User Types
// --------------------------------------------------------------------------

/** Granted authority */
export interface GrantedAuthority {
  authority?: string
}

/** User group */
export interface Group extends BaseEntity {
  name?: string
}

/** User entity */
export interface User extends BaseEntity {
  username?: string
  enabled?: boolean
  group?: Group
  firstName?: string
  lastName?: string
  initials?: string
  title?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  email?: string
  phoneNumber?: string
  authorities?: GrantedAuthority[]
  nationalIdentificationNumber?: string
  passportNumber?: string
  driverLicenseNumber?: string
  dateOfBirth?: string
  nationality?: string
  emailVerified?: boolean
  otpEnabled?: boolean
  failedLoginAttempts?: number
  lockedUntil?: string
  organisationName?: string
  shopName?: string
  shopLocation?: string
  accountNonExpired?: boolean
  credentialsNonExpired?: boolean
  accountNonLocked?: boolean
}

/** Create user command */
export interface CreateUserCommand {
  firstName: string
  lastName: string
  initials?: string
  title?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  username: string
  email: string
  groupId?: number
  nationalIdentificationNumber?: string
  passportNumber?: string
  driverLicenseNumber?: string
  dateOfBirth?: string
  phoneNumber?: string
}

/** Update user command */
export interface UpdateUserCommand {
  firstName: string
  lastName: string
  initials?: string
  title?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  email: string
  nationalIdentificationNumber?: string
  passportNumber?: string
  driverLicenseNumber?: string
  dateOfBirth?: string
  phoneNumber?: string
  nationality?: string
}

// --------------------------------------------------------------------------
// Registration Types
// --------------------------------------------------------------------------

/** Customer registration command */
export interface CustomerRegistrationCommand {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber?: string
  password: string
  confirmPassword: string
}

/** Biller registration command */
export interface BillerRegistrationCommand {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber?: string
  password: string
  confirmPassword: string
  organisationName: string
}

/** Agent registration command */
export interface AgentRegistrationCommand {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber?: string
  password: string
  confirmPassword: string
  shopName: string
  shopLocation?: string
}

// --------------------------------------------------------------------------
// Access Control Types
// --------------------------------------------------------------------------

/** Authority */
export interface Authority extends BaseEntity {
  name?: string
  description?: string
}

/** User authority */
export interface UserAuthority extends BaseEntity {
  user?: User
  authority?: Authority
}

/** Group authority */
export interface GroupAuthority extends BaseEntity {
  group?: Group
  authority?: Authority
}

/** Create user authority command */
export interface CreateUserAuthorityCommand {
  userId: number
  authorityId?: number
  authorityIds?: number[]
}

/** Create group authority command */
export interface CreateGroupAuthorityCommand {
  authorityIds?: number[]
  groupId: number
  authorityId?: number
}
