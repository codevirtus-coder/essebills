import { useMutation } from '@tanstack/react-query'
import { login, register } from './auth.service'
import type { LoginRequestDto, RegisterRequestDto } from './dto/auth.dto'

export function useLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginRequestDto) => login(payload),
  })
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterRequestDto) => register(payload),
  })
}
