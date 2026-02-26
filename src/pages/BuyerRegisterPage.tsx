import {
  PortalRegister,
  type PortalRegisterSubmitPayload,
} from '../features/auth/components/PortalRegister'
import { registerCustomer } from '../features/auth/portal-auth.service'
import { ROUTE_PATHS } from '../router/paths'

async function submitBuyerRegistration(payload: PortalRegisterSubmitPayload) {
  return registerCustomer({
    firstName: payload.firstName,
    lastName: payload.lastName,
    username: payload.username,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    password: payload.password,
    confirmPassword: payload.confirmPassword,
  })
}

export function BuyerRegisterPage() {
  return (
    <PortalRegister
      title="Create Buyer Account"
      subtitle="Create your customer wallet account to pay bills and track transactions."
      asideTitle="Your Wallet,"
      asideAccent="Simplified"
      asideDescription="Register as a customer to pay bills instantly, manage your wallet, and track payment history across services."
      submitLabel="Create Account"
      loginPath={ROUTE_PATHS.buyer}
      registerNote="Buyer account created. Continue to login."
      includePasswordFields
      registerAction={submitBuyerRegistration}
    />
  )
}

