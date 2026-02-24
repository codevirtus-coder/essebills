import { PortalRegister } from '../features/auth/components/PortalRegister'
import { ROUTE_PATHS } from '../router/paths'

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
    />
  )
}
