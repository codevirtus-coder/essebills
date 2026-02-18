import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../auth.hooks";
import { isAuthenticated, saveAuthToken } from "../auth.storage";
import { ROUTE_PATHS } from "../../../router/paths";
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
  redirectTo: string;
  mockLogin?: boolean;
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
  redirectTo,
  mockLogin = false,
}: PortalLoginProps) {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mockLogin) {
      saveAuthToken(`mock-${portalName.toLowerCase().replace(/\s+/g, "-")}`);
      navigate(redirectTo, { replace: true });
      return;
    }

    try {
      await loginMutation.mutateAsync({ username, password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Login failed. Check your username/password.",
      );
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

            <form onSubmit={handleSubmit} className="login-form">
              <label className="type-label login-label">{usernameLabel}</label>
              <div className="login-input-with-icon">
                <span className="material-symbols-outlined icon-sm">badge</span>
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
                <button type="button" className="login-forgot">
                  Forgot?
                </button>
              </div>
              <div className="login-password-field">
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

              <button
                type="submit"
                className="button button-primary login-submit"
                disabled={!mockLogin && loginMutation.isPending}
              >
                {!mockLogin && loginMutation.isPending
                  ? "Signing in..."
                  : submitLabel}
              </button>
            </form>
            <div className="login-register-wrap">
              <p className="type-body text-muted">{secondaryPrompt}</p>
              <Link
                to={ROUTE_PATHS.register}
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
