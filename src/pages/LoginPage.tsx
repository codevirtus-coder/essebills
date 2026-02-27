import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { PortalLogin } from "../features/auth/components/PortalLogin";
import {
  loginPortal,
  loginAgent,
  loginBiller,
  loginAdmin,
  verifyPortalLoginOtp,
  verifyAgentLoginOtp,
  verifyBillerLoginOtp,
  verifyAdminLoginOtp,
  verifyCustomerLoginOtp,
} from "../features/auth/portal-auth.service";
import { ROUTE_PATHS } from "../router/paths";

export function LoginPage() {
  const { pathname } = useLocation();

  const cfg = useMemo(() => {
    // Determine role from path. Defaults to BUYER.
    if (pathname.includes("/login/biller") || pathname.includes("/biller")) {
      return {
        role: "BILLER",
        portalName: "Biller Login",
        subtitle: "Internal organization collection portal.",
        asideTitle: "Corporate",
        asideAccent: "Collections",
        asideDescription:
          "Access real-time collection reports, manage customer accounts, and request settlements from your dedicated biller portal.",
        usernameLabel: "Biller ID / Admin Email",
        usernamePlaceholder: "e.g. ZESA-001",
        submitLabel: "Access Dashboard",
        secondaryPrompt: "Interested in digitizing your payments?",
        secondaryCta: "Apply as Biller",
        registerTo: ROUTE_PATHS.registerBiller,
        redirectTo: ROUTE_PATHS.biller,
        loginAction: loginBiller,
        verifyOtpAction: verifyBillerLoginOtp,
      } as const;
    }

    if (pathname.includes("/login/agent") || pathname.includes("/agent")) {
      return {
        role: "AGENT",
        portalName: "Agent Login",
        subtitle: "Retail and field agent payment portal.",
        asideTitle: "Agent",
        asideAccent: "Operations",
        asideDescription:
          "Process customer payments quickly, monitor commissions, and manage your daily wallet activity.",
        usernameLabel: "Agent ID / Email",
        usernamePlaceholder: "e.g. AGT-902",
        submitLabel: "Access Dashboard",
        secondaryPrompt: "Need an agent account?",
        secondaryCta: "Apply as Agent",
        registerTo: ROUTE_PATHS.registerAgent,
        redirectTo: ROUTE_PATHS.agent,
        loginAction: loginAgent,
        verifyOtpAction: verifyAgentLoginOtp,
      } as const;
    }

    if (pathname.includes("/login/admin") || pathname.includes("/admin")) {
      return {
        role: "ADMIN",
        portalName: "Admin Login",
        subtitle: "System administration and oversight portal.",
        asideTitle: "Platform",
        asideAccent: "Administration",
        asideDescription:
          "Monitor platform health, manage users and permissions, and review audits from a secure admin workspace.",
        usernameLabel: "Admin Email",
        usernamePlaceholder: "e.g. admin@esebills.com",
        submitLabel: "Access Dashboard",
        secondaryPrompt: "Need platform access approval?",
        secondaryCta: "Request Admin Access",
        registerTo: ROUTE_PATHS.registerAdmin,
        redirectTo: ROUTE_PATHS.admin,
        loginAction: loginAdmin,
        verifyOtpAction: verifyAdminLoginOtp,
      } as const;
    }

    // Default: buyer / portal login
    return {
      role: "BUYER",
      portalName: "Welcome Back",
      subtitle: "Log in to manage your bills and wallet.",
      asideTitle: "Your Wallet,",
      asideAccent: "Simplified",
      asideDescription:
        "Access your dashboard to pay bills, top up your wallet and track your payment history across all services instantly.",
      usernameLabel: "Email Address",
      usernamePlaceholder: "name@example.com",
      submitLabel: "Sign in to wallet",
      secondaryPrompt: "Don't have an account yet?",
      secondaryCta: "Create free account",
      registerTo: ROUTE_PATHS.register,
      forgotPasswordTo: ROUTE_PATHS.forgotPassword,
      loginAction: loginPortal,
      verifyOtpAction: verifyCustomerLoginOtp || verifyPortalLoginOtp,
    } as const;
  }, [pathname]);

  return (
    <PortalLogin
      portalName={cfg.portalName}
      subtitle={cfg.subtitle}
      asideTitle={cfg.asideTitle}
      asideAccent={cfg.asideAccent}
      asideDescription={cfg.asideDescription}
      usernameLabel={cfg.usernameLabel}
      usernamePlaceholder={cfg.usernamePlaceholder}
      submitLabel={cfg.submitLabel}
      secondaryPrompt={cfg.secondaryPrompt}
      secondaryCta={cfg.secondaryCta}
      registerTo={cfg.registerTo}
      forgotPasswordTo={cfg.forgotPasswordTo}
      redirectTo={(cfg as any).redirectTo}
      role={(cfg as any).role}
      loginAction={(cfg as any).loginAction}
      verifyOtpAction={(cfg as any).verifyOtpAction}
    />
  );
}
