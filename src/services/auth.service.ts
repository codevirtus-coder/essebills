// ============================================================================
// Authentication Service - Based on API spec
// ============================================================================

import { apiFetch } from '../api/client'
import { API_ENDPOINTS } from '../api/endpoints'
import type {
  AuthenticationRequest,
  AuthenticationResponse,
  RefreshTokenRequest,
  OtpVerifyRequest,
  ForgotPasswordContext,
  ResetPasswordContext,
  UpdatePasswordContext,
  CustomerRegistrationCommand,
  BillerRegistrationCommand,
  AgentRegistrationCommand,
  User,
} from '../types'

// --------------------------------------------------------------------------
// Authentication
// --------------------------------------------------------------------------

/** Authenticate user with username and password */
export async function authenticate(
  credentials: AuthenticationRequest
): Promise<AuthenticationResponse> {
  return apiFetch<AuthenticationResponse>(API_ENDPOINTS.auth.authenticate, {
    method: 'POST',
    body: credentials,
  })
}

/** Verify OTP */
export async function verifyOtp(request: OtpVerifyRequest): Promise<AuthenticationResponse> {
  return apiFetch<AuthenticationResponse>(API_ENDPOINTS.auth.verifyOtp, {
    method: 'POST',
    body: request,
  })
}

/** Refresh access token */
export async function refreshToken(request: RefreshTokenRequest): Promise<AuthenticationResponse> {
  return apiFetch<AuthenticationResponse>(API_ENDPOINTS.auth.refreshToken, {
    method: 'POST',
    body: request,
  })
}

// --------------------------------------------------------------------------
// Password Management
// --------------------------------------------------------------------------

/** Request password reset */
export async function forgotPassword(context: ForgotPasswordContext): Promise<void> {
  return apiFetch(API_ENDPOINTS.users.forgotPassword, {
    method: 'POST',
    body: context,
  })
}

/** Reset password with token */
export async function resetPassword(context: ResetPasswordContext): Promise<void> {
  return apiFetch(API_ENDPOINTS.users.resetPassword, {
    method: 'POST',
    body: context,
  })
}

/** Update password (requires old password) */
export async function updatePassword(context: UpdatePasswordContext): Promise<void> {
  return apiFetch(API_ENDPOINTS.users.updatePassword, {
    method: 'POST',
    body: context,
  })
}

// --------------------------------------------------------------------------
// User Profile
// --------------------------------------------------------------------------

/** Get current user profile */
export async function getUserProfile(): Promise<User> {
  return apiFetch<User>(API_ENDPOINTS.users.profile)
}

/** Update current user profile */
export async function updateMyAccount(user: Partial<User>): Promise<User> {
  return apiFetch<User>(API_ENDPOINTS.users.myAccount, {
    method: 'POST',
    body: user,
  })
}

// --------------------------------------------------------------------------
// Registration
// --------------------------------------------------------------------------

/** Register a new customer */
export async function registerCustomer(
  command: CustomerRegistrationCommand
): Promise<{ id: number }> {
  return apiFetch(API_ENDPOINTS.register.customer, {
    method: 'POST',
    body: command,
  })
}

/** Register a new biller */
export async function registerBiller(
  command: BillerRegistrationCommand
): Promise<{ id: number }> {
  return apiFetch(API_ENDPOINTS.register.biller, {
    method: 'POST',
    body: command,
  })
}

/** Register a new agent */
export async function registerAgent(
  command: AgentRegistrationCommand
): Promise<{ id: number }> {
  return apiFetch(API_ENDPOINTS.register.agent, {
    method: 'POST',
    body: command,
  })
}

// --------------------------------------------------------------------------
// OTP
// --------------------------------------------------------------------------

/** Verify OTP */
export async function verifyOtpCode(payload: { username: string; code: string }): Promise<void> {
  return apiFetch(API_ENDPOINTS.otp.verify, {
    method: 'POST',
    body: payload,
  })
}

// --------------------------------------------------------------------------
// Customer Details
// --------------------------------------------------------------------------

/** Fetch customer details by meter number */
export async function fetchCustomerDetails(
  meterNumber: string
): Promise<{ name?: string; address?: string; accountNumber?: string }> {
  return apiFetch(`${API_ENDPOINTS.customerDetails.fetch}?meterNumber=${encodeURIComponent(meterNumber)}`)
}
