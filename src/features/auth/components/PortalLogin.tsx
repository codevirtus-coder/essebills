import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useLoginMutation } from '../auth.hooks';
import type { PortalLoginResult } from '../portal-auth.service';
import { finalizePortalSession } from '../portal-auth.service';
import {
  buildAuthSession,
  clearPendingOtpChallenge,
  getAuthSession,
  saveAuthSession,
  savePendingOtpChallenge,
} from '../auth.storage';
import {
  getDashboardRouteByGroup,
  getDashboardRouteByRole,
  getForgotPasswordRouteByRole,
  ROUTE_PATHS,
} from '../../../router/paths';
import type { UserRole } from '../dto/auth.dto';
import bg1 from '../../../assets/bg1.jpg';
import esebillsLogo from '../../../assets/esebills_logo.png';

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
    authProvider?: 'LOCAL' | 'GOOGLE' | 'FACEBOOK';
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
  role,
  mockLogin = false,
  forgotPasswordTo = getForgotPasswordRouteByRole(role),
  loginAction,
  verifyOtpAction,
  headerExtra,
}: PortalLoginProps) {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTempToken, setOtpTempToken] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    const existingSession = getAuthSession();
    if (existingSession) {
      navigate(getDashboardRouteByGroup(existingSession.group), { replace: true });
    }
  }, [navigate]);

  const finishLogin = async (
    jwtToken: string,
    refreshToken?: string | null,
    authProvider?: 'LOCAL' | 'GOOGLE' | 'FACEBOOK',
  ) => {
    const session = await finalizePortalSession({ jwtToken, portalRole: role, refreshToken, authProvider });
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
          toast.error('OTP code is required');
          return;
        }
        setIsVerifyingOtp(true);
        const otpResponse = await verifyOtpAction({ tempToken: otpTempToken, code: otpCode.trim() });
        if (!otpResponse.jwtToken) throw new Error('OTP verification did not return an access token');
        clearPendingOtpChallenge();
        await finishLogin(otpResponse.jwtToken, otpResponse.refreshToken, otpResponse.authProvider);
        return;
      }

      if (loginAction) {
        const response = await loginAction({ username, password });
        if (response.kind === 'otp_required') {
          setOtpTempToken(response.tempToken);
          setOtpCode('');
          savePendingOtpChallenge({ portalRole: role, username, tempToken: response.tempToken, createdAt: Date.now() });
          toast.success(response.message ?? 'OTP verification required');
          return;
        }
        await finishLogin(response.jwtToken, response.refreshToken, response.authProvider);
        return;
      }

      const data = await loginMutation.mutateAsync({ username, password });
      if (!data.jwtToken) throw new Error('Login response did not return jwtToken');
      await finishLogin(data.jwtToken, data.refreshToken, data.authProvider);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Login failed. Check your username/password.',
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const isLoading = !mockLogin && (loginMutation.isPending || isVerifyingOtp);

  return (
    <div className="min-h-screen flex">
      {/* Left panel — image + tagline */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={bg1}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/30 to-slate-950/60" />

        <Link
          to={ROUTE_PATHS.home}
          className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium text-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <img src={esebillsLogo} alt="EseBills" className="h-9 w-auto brightness-0 invert mb-8" />
          <h1 className="text-4xl font-bold text-white leading-snug">
            {asideTitle}<br />
            <span className="text-emerald-400">{asideAccent}</span>
          </h1>
          <p className="mt-4 text-base text-white/70 max-w-xs leading-relaxed">
            {asideDescription}
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex justify-center mb-8">
          <img src={esebillsLogo} alt="EseBills" className="h-9 w-auto" />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{portalName}</h2>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            {headerExtra && <div className="mt-5">{headerExtra}</div>}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {otpTempToken ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 text-sm text-emerald-700">
                  We've sent a 6-digit code to your registered device. Enter it below to continue.
                </div>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    OTP Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 sm:text-sm transition-colors text-center tracking-widest font-bold text-lg"
                    autoFocus
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    {usernameLabel}
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder={usernamePlaceholder}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 sm:text-sm transition-colors"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link
                      to={forgotPasswordTo}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 sm:text-sm transition-colors pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : otpTempToken ? (
                'Complete Verification'
              ) : (
                submitLabel
              )}
            </button>

            {otpTempToken && (
              <button
                type="button"
                onClick={() => { setOtpTempToken(null); setOtpCode(''); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                Use a different account
              </button>
            )}
          </form>

          {!otpTempToken && (
            <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-2">
              <p className="text-sm text-gray-500">
                {secondaryPrompt}{' '}
                <Link to={registerTo} className="font-medium text-gray-700 hover:text-gray-900">
                  {secondaryCta}
                </Link>
              </p>
            </div>
          )}
        </div>

        <p className="mt-auto pt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} EseBills Payment Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
