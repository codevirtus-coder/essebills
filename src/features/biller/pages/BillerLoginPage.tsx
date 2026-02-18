import { PortalLogin } from "../../auth/components/PortalLogin";
import { ROUTE_PATHS } from "../../../router/paths";

export function BillerLoginPage() {
  return (
    <PortalLogin
      portalName="Biller Login"
      subtitle="Internal organization collection portal."
      asideTitle="Corporate"
      asideAccent="Collections"
      asideDescription="Access real-time collection reports, manage customer accounts, and request settlements from your dedicated biller portal."
      usernameLabel="Biller ID / Admin Email"
      usernamePlaceholder="e.g. ZESA-001"
      submitLabel="Access Dashboard"
      secondaryPrompt="Interested in digitizing your payments?"
      secondaryCta="Apply as Biller"
      redirectTo={ROUTE_PATHS.biller}
      mockLogin
    />
  );
}
