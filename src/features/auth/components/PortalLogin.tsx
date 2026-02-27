import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../auth.hooks";
import type { PortalLoginResult } from "../portal-auth.service";
import { finalizePortalSession } from "../portal-auth.service";
import {
  buildAuthSession,
  clearPendingOtpChallenge,
  getAuthSession,
  saveAuthSession,
  savePendingOtpChallenge,
} from "../auth.storage";
import {
  getDashboardRouteByGroup,
  getDashboardRouteByRole,
  getForgotPasswordRouteByRole,
  ROUTE_PATHS,
} from "../../../router/paths";
import type { UserRole } from "../dto/auth.dto";
import "../styles/portal-login.css";

type PortalLoginProps = {
  portalName: string;
  subtitle: string;
  asideTitle: string;
  asideAccent: string;
  asideDescription: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  submitLabel: string;
  secondaryPrompt: string;
  secondaryCta: string;
  registerTo?: string;
  redirectTo?: string;
  role: UserRole;
  mockLogin?: boolean;
  forgotPasswordTo?: string;
  loginAction?: (payload: {
    username: string;
    password: string;
  }) => Promise<PortalLoginResult>;
  verifyOtpAction?: (payload: { tempToken: string; code: string }) => Promise<{
    jwtToken?: string;
    refreshToken?: string;
    authProvider?: "LOCAL" | "GOOGLE" | "FACEBOOK";
  }>;
  headerExtra?: ReactNode;
};

export function PortalLogin({
  portalName,
  subtitle,
  asideTitle,
  asideAccent,
  asideDescription,
  usernameLabel,
  usernamePlaceholder,
  submitLabel,
  secondaryPrompt,
  secondaryCta,
  registerTo = ROUTE_PATHS.register,
  redirectTo,
  role,
  mockLogin = false,
  forgotPasswordTo = getForgotPasswordRouteByRole(role),
  loginAction,
  verifyOtpAction,
  headerExtra,
}: PortalLoginProps) {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpTempToken, setOtpTempToken] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    const existingSession = getAuthSession();
    if (existingSession) {
      navigate(getDashboardRouteByGroup(existingSession.group), {
        replace: true,
      });
    }
  }, [navigate]);

  const finishLogin = async (
    jwtToken: string,
    refreshToken?: string | null,
    authProvider?: "LOCAL" | "GOOGLE" | "FACEBOOK",
  ) => {
    const session = await finalizePortalSession({
      jwtToken,
      portalRole: role,
      refreshToken,
      authProvider,
    });

    navigate(getDashboardRouteByGroup(session.group), { replace: true });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mockLogin) {
      saveAuthSession(buildAuthSession(`mock-${role}-${Date.now()}`, role));
      navigate(getDashboardRouteByRole(role), { replace: true });
      return;
    }

    try {
      if (otpTempToken && verifyOtpAction) {
        if (!otpCode.trim()) {
          toast.error("OTP code is required");
          return;
        }

        setIsVerifyingOtp(true);
        const otpResponse = await verifyOtpAction({
          tempToken: otpTempToken,
          code: otpCode.trim(),
        });
        if (!otpResponse.jwtToken) {
          throw new Error("OTP verification did not return an access token");
        }

        clearPendingOtpChallenge();
        await finishLogin(
          otpResponse.jwtToken,
          otpResponse.refreshToken,
          otpResponse.authProvider,
        );
        return;
      }

      if (loginAction) {
        const response = await loginAction({ username, password });

        if (response.kind === "otp_required") {
          setOtpTempToken(response.tempToken);
          setOtpCode("");
          savePendingOtpChallenge({
            portalRole: role,
            username,
            tempToken: response.tempToken,
            createdAt: Date.now(),
          });
          toast.success(response.message ?? "OTP verification required");
          return;
        }

        await finishLogin(
          response.jwtToken,
          response.refreshToken,
          response.authProvider,
        );
        return;
      }

      const data = await loginMutation.mutateAsync({ username, password });
      if (!data.jwtToken) {
        throw new Error("Login response did not return jwtToken");
      }
      await finishLogin(data.jwtToken, data.refreshToken, data.authProvider);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Login failed. Check your username/password.",
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <section className="login-shell mt-[2rem]">
      <div className="container">
        <div className="login-card">
          <aside className="login-aside">
            <div>
              <p className="login-brand">EseBills</p>
              <h1 className="login-aside-title">
                {asideTitle}
                <span>{asideAccent}</span>
              </h1>
              <p className="type-body">{asideDescription}</p>
            </div>
            <Link to={ROUTE_PATHS.home} className="login-back-link">
              Back to Home
            </Link>
          </aside>

          <div className="login-pane">
            <h2 className="type-section-title">{portalName}</h2>
            <p className="type-body text-muted">{subtitle}</p>
            {headerExtra ? <div className="mt-4">{headerExtra}</div> : null}

            <form onSubmit={handleSubmit} className="login-form">
              <label className="type-label login-label">{usernameLabel}</label>
              <div className="login-input-with-icon">
                <span className="material-symbols-outlined icon-sm">mail</span>
                <input
                  type="text"
                  placeholder={usernamePlaceholder}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>

              <div className="login-password-header">
                <label className="type-label login-label">Password</label>
                <Link to={forgotPasswordTo} className="login-forgot">
                  Forgot?
                </Link>
              </div>
              <div className="login-password-field login-input-with-icon">
                <span className="material-symbols-outlined icon-sm">lock</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  <span className="material-symbols-outlined icon-sm">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>

              {otpTempToken ? (
                <>
                  <label className="type-label login-label">OTP Code</label>
                  <div className="login-input-with-icon">
                    <span className="material-symbols-outlined icon-sm">
                      pin
                    </span>
                    <input
                      type="text"
                      placeholder="Enter OTP code"
                      value={otpCode}
                      onChange={(event) => setOtpCode(event.target.value)}
                      required
                    />
                  </div>
                  <p className="type-body text-muted">
                    Two-factor verification is enabled for this account.
                  </p>
                </>
              ) : null}

              <button
                type="submit"
                className="button button-primary login-submit"
                disabled={
                  !mockLogin && (loginMutation.isPending || isVerifyingOtp)
                }
              >
                {!mockLogin && (loginMutation.isPending || isVerifyingOtp)
                  ? otpTempToken
                    ? "Verifying..."
                    : "Signing in..."
                  : otpTempToken
                    ? "Verify OTP"
                    : submitLabel}
              </button>
            </form>
            <div className="login-register-wrap">
              <p className="type-body text-muted">{secondaryPrompt}</p>
              <Link
                to={registerTo}
                className="button button-outline login-register-button"
              >
                {secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
