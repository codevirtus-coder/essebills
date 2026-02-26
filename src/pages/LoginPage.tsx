import { PortalLogin } from '../features/auth/components/PortalLogin'
import { loginPortal, verifyPortalLoginOtp } from '../features/auth/portal-auth.service'
import { ROUTE_PATHS } from '../router/paths'

export function LoginPage() {
  return (
    <PortalLogin
      portalName="Welcome Back"
      subtitle="Use one account login. We will open the correct portal based on your profile."
      asideTitle="One"
      asideAccent="Login"
      asideDescription="Sign in once with your username or email. After login, EseBills checks your account group and redirects you to the correct dashboard automatically."
      usernameLabel="Username or Email"
      usernamePlaceholder="Enter username or email"
      submitLabel="Sign in"
      secondaryPrompt="Don't have an account yet?"
      secondaryCta="Create account"
      registerTo={ROUTE_PATHS.register}
      forgotPasswordTo={ROUTE_PATHS.forgotPassword}
      role="BUYER"
      loginAction={loginPortal}
      verifyOtpAction={verifyPortalLoginOtp}
    />
  )
}
