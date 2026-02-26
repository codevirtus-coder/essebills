import { PortalRegister, type PortalRegisterSubmitPayload } from '../features/auth/components/PortalRegister'
import { registerBiller } from '../features/auth/biller-auth.service'
import { ROUTE_PATHS } from '../router/paths'

async function submitBillerRegistration(payload: PortalRegisterSubmitPayload) {
  return registerBiller({
    firstName: payload.firstName,
    lastName: payload.lastName,
    username: payload.username,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    password: payload.password,
    confirmPassword: payload.confirmPassword,
    organisationName: payload.companyName ?? '',
  })
}

export function BillerRegisterPage() {
  return (
    <PortalRegister
      title="Biller Application"
      subtitle="Set up your organization portal and collection profile."
      asideTitle="Corporate"
      asideAccent="Collections"
      asideDescription="Apply as a biller to receive real-time collection reports and settlements through the EseBills platform."
      submitLabel="Submit Biller Application"
      loginPath={ROUTE_PATHS.loginBiller}
      registerNote="Biller application submitted. Continue to biller login."
      showCompanyField
      includePasswordFields
      registerAction={submitBillerRegistration}
    />
  )
}
