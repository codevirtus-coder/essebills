import { PortalRegister, type PortalRegisterSubmitPayload } from '../components/PortalRegister'
import { registerCustomer } from '../portal-auth.service'
import { ROUTE_PATHS } from '../../../router/paths'

async function submitCustomerRegistration(payload: PortalRegisterSubmitPayload) {
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
      title="Create Account"
      subtitle="Join thousands of users and businesses."
      asideTitle="Join the"
      asideAccent="Ecosystem"
      asideDescription="Unlock instant payments, financial tracking, and rewarding commissions for your business."
      submitLabel="Create Account"
      loginPath={ROUTE_PATHS.login}
      registerNote="Customer account created. Continue to login."
      includePasswordFields
      registerAction={submitCustomerRegistration}
      bgImage="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2000&auto=format&fit=crop"
    />
  )
}
