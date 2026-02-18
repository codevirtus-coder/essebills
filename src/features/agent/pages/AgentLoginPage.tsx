import { PortalLogin } from "../../auth/components/PortalLogin";
import { ROUTE_PATHS } from "../../../router/paths";

export function AgentLoginPage() {
  return (
    <PortalLogin
      portalName="Agent Login"
      subtitle="Retail and field agent payment portal."
      asideTitle="Agent"
      asideAccent="Operations"
      asideDescription="Process customer payments quickly, monitor commissions, and manage your daily wallet activity."
      usernameLabel="Agent ID / Email"
      usernamePlaceholder="e.g. AGT-902"
      submitLabel="Access Dashboard"
      secondaryPrompt="Need an agent account?"
      secondaryCta="Apply as Agent"
      redirectTo={ROUTE_PATHS.agent}
    />
  );
}
