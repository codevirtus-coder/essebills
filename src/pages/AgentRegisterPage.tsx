import { PortalRegister, type PortalRegisterSubmitPayload } from '../features/auth/components/PortalRegister'
import { registerAgent } from '../features/auth/portal-auth.service'
import { ROUTE_PATHS } from '../router/paths'

async function submitAgentRegistration(payload: PortalRegisterSubmitPayload) {
  return registerAgent({
    firstName: payload.firstName,
    lastName: payload.lastName,
    username: payload.username,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    password: payload.password,
    confirmPassword: payload.confirmPassword,
    shopName: payload.companyName ?? '',
  })
}

export function AgentRegisterPage() {
  return (
    <PortalRegister
      title="Agent Registration"
      subtitle="Create your partner account and start processing payments."
      asideTitle="Agent"
      asideAccent="Onboarding"
      asideDescription="Join the EseBills agency network to sell services, earn commissions, and grow your business."
      submitLabel="Create Agent Account"
      loginPath={ROUTE_PATHS.loginAgent}
      registerNote="Agent account submitted. Continue to agent login."
      showCompanyField
      companyFieldPlaceholder="Shop name"
      includePasswordFields
      registerAction={submitAgentRegistration}
    />
  )
}

