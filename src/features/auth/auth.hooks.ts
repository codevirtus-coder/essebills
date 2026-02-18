import { useMutation } from '@tanstack/react-query'
import { login, register } from './auth.service'
import { saveAuthToken } from './auth.storage'
import type { LoginRequestDto, RegisterRequestDto } from './dto/auth.dto'

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginRequestDto) => login(payload),
    onSuccess: (data) => {
      saveAuthToken(data.jwtToken)
    },
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterRequestDto) => register(payload),
  })
}
