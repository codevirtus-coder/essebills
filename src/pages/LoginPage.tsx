import { PortalLogin } from "../features/auth/components/PortalLogin";
import {
  loginPortal,
  verifyPortalLoginOtp,
} from "../features/auth/portal-auth.service";
import { ROUTE_PATHS } from "../router/paths";

export function LoginPage() {
  return (
    <PortalLogin
      portalName="Welcome Back"
      subtitle="Log in to manage your bills and wallet."
      asideTitle="Your Wallet,"
      asideAccent="Simplified"
      asideDescription="Access your dashboard to pay bills, top up your wallet and track your payment history across all services instantly."
      usernameLabel="Email Address"
      usernamePlaceholder="name@example.com"
      submitLabel="Sign in to wallet"
      secondaryPrompt="Don't have an account yet?"
      secondaryCta="Create free account"
      registerTo={ROUTE_PATHS.register}
      forgotPasswordTo={ROUTE_PATHS.forgotPassword}
      role="BUYER"
      loginAction={loginPortal}
      verifyOtpAction={verifyPortalLoginOtp}
    />
  );
}
