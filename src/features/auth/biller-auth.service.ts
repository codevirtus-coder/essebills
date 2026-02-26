import { logoutPortal, refreshPortalSession } from './portal-auth.service'
export type { BillerRegisterRequest, PortalLoginResult as BillerLoginResult } from './portal-auth.service'
export {
  loginBiller,
  registerBiller,
  verifyBillerLoginOtp,
} from './portal-auth.service'

export async function refreshBillerSession() {
  return refreshPortalSession('BILLER')
}

export function logoutBiller() {
  logoutPortal()
}

