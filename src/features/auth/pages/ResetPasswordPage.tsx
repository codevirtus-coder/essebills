import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Loader2, ChevronRight } from 'lucide-react';
import { resetPassword } from '../auth.service';
import { ROUTE_PATHS } from '../../../router/paths';
import bg1 from '../../../assets/bg1.jpg';
import esebillsLogo from '../../../assets/esebills_logo.png';

type PortalKey = 'buyer' | 'agent' | 'biller' | 'admin';

type ResetConfig = {
  title: string;
  subtitle: string;
  asideTitle: string;
  asideAccent: string;
  asideDescription: string;
  loginPath: string;
  forgotPath: string;
};

const CONFIGS: Record<PortalKey, ResetConfig> = {
  buyer: {
    title: 'Reset Password',
    subtitle: 'Enter the reset token from your email and set a new password.',
    asideTitle: 'Your Wallet,',
    asideAccent: 'Simplified',
    asideDescription: 'Reset your customer account password using the reset token sent to your email.',
    loginPath: ROUTE_PATHS.buyer,
    forgotPath: ROUTE_PATHS.forgotPasswordBuyer,
  },
  agent: {
    title: 'Agent Reset Password',
    subtitle: 'Enter the reset token from your email and set a new password.',
    asideTitle: 'Agent',
    asideAccent: 'Operations',
    asideDescription: 'Reset your agent portal password securely using the reset token sent to your email.',
    loginPath: ROUTE_PATHS.loginAgent,
    forgotPath: ROUTE_PATHS.forgotPasswordAgent,
  },
  biller: {
    title: 'Biller Reset Password',
    subtitle: 'Enter the reset token from your email and set a new password.',
    asideTitle: 'Corporate',
    asideAccent: 'Collections',
    asideDescription: 'Reset your biller portal password using the reset token sent to your registered email.',
    loginPath: ROUTE_PATHS.loginBiller,
    forgotPath: ROUTE_PATHS.forgotPasswordBiller,
  },
  admin: {
    title: 'Admin Reset Password',
    subtitle: 'Enter the reset token from your email and set a new password.',
    asideTitle: 'Platform',
    asideAccent: 'Administration',
    asideDescription: 'Reset your admin password securely using the reset token sent to your email.',
    loginPath: ROUTE_PATHS.loginAdmin,
    forgotPath: ROUTE_PATHS.forgotPasswordAdmin,
  },
};

function resolvePortalKey(value?: string): PortalKey {
  if (value === 'buyer' || value === 'agent' || value === 'biller' || value === 'admin') return value;
  return 'buyer';
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { portal } = useParams<{ portal?: string }>();
  const [searchParams] = useSearchParams();
  const config = CONFIGS[resolvePortalKey(portal)];

  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) setResetToken(tokenFromUrl);
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resetToken.trim() || !password || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setIsSubmitting(true);
      await resetPassword({ resetToken: resetToken.trim(), password });
      toast.success('Password reset successful. Please log in.');
      navigate(ROUTE_PATHS.login, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 sm:text-sm transition-colors';

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={bg1}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/30 to-slate-950/60" />

        <Link
          to={ROUTE_PATHS.home}
          className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium text-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <img src={esebillsLogo} alt="EseBills" className="h-9 w-auto brightness-0 invert mb-8" />
          <h1 className="text-4xl font-bold text-white leading-snug">
            {config.asideTitle}<br />
            <span className="text-emerald-400">{config.asideAccent}</span>
          </h1>
          <p className="mt-4 text-base text-white/80 max-w-xs leading-relaxed">
            {config.asideDescription}
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white overflow-y-auto">
        <div className="lg:hidden flex justify-center mb-8">
          <img src={esebillsLogo} alt="EseBills" className="h-9 w-auto" />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{config.subtitle}</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
              <input
                type="text"
                placeholder="Enter token from email"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className={`${inputClass} font-mono`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  minLength={8}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Reset Password
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Didn't receive the email?{' '}
              <Link to={config.forgotPath} className="font-medium text-gray-700 hover:text-gray-900">
                Request Again
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-auto pt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} EseBills Payment Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
