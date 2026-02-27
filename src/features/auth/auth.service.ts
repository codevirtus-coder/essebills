import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  UserProfileDto,
} from './dto/auth.dto'
import { apiFetch } from '../../api/apiClient'
import { getAccessToken } from './auth.storage'

export async function login(payload: LoginRequestDto): Promise<LoginResponseDto> {
  return apiFetch<LoginResponseDto>('/authenticate', {
    method: 'POST',
    body: payload,
  })
}

export async function register(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
  return apiFetch<RegisterResponseDto>('/opn/v1/users/sign-up', {
    method: 'POST',
    body: payload,
  })
}

export async function requestPasswordReset(email: string): Promise<void> {
  return apiFetch('/v1/users/forgot-password', { method: 'POST', body: { email } })
}

export async function resetPassword(payload: {
  resetToken: string
  password: string
}): Promise<void> {
  return apiFetch('/v1/users/reset-password', { method: 'POST', body: payload })
}

export async function getCurrentUserProfile(): Promise<UserProfileDto> {
  return apiFetch<UserProfileDto>('/v1/users/profile', {
    requiresAuth: true,
  })
}

export { apiFetch }
