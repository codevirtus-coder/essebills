import { PortalLogin } from "../../auth/components/PortalLogin";
import { ROUTE_PATHS } from "../../../router/paths";

export function AdminLoginPage() {
  return (
    <PortalLogin
      portalName="Admin Login"
      subtitle="System administration and oversight portal."
      asideTitle="Platform"
      asideAccent="Administration"
      asideDescription="Monitor platform health, manage users and permissions, and review audits from a secure admin workspace."
      usernameLabel="Admin Email"
      usernamePlaceholder="e.g. admin@esebills.com"
      submitLabel="Access Dashboard"
      secondaryPrompt="Need platform access approval?"
      secondaryCta="Request Admin Access"
      redirectTo={ROUTE_PATHS.admin}
    />
  );
}
