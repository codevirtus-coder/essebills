import type {
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
} from '../dto/admin-api.dto'
import { adminJsonFetch } from './adminApi.client'
import { ADMIN_ENDPOINTS } from './admin.endpoints'

export async function forgotPassword(payload: ForgotPasswordRequestDto) {
  return adminJsonFetch<void>(ADMIN_ENDPOINTS.auth.forgotPassword, {
    method: 'POST',
    body: payload,
  })
}

export async function resetPassword(payload: ResetPasswordRequestDto) {
  return adminJsonFetch<void>(ADMIN_ENDPOINTS.auth.resetPassword, {
    method: 'POST',
    body: payload,
  })
}
