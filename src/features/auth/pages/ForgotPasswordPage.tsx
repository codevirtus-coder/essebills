import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, ChevronRight } from 'lucide-react';
import { requestPasswordReset } from '../auth.service';
import { ROUTE_PATHS } from '../../../router/paths';
import bg1 from '../../../assets/bg1.jpg';
import esebillsLogo from '../../../assets/esebills_logo.png';

type PortalKey = 'buyer' | 'agent' | 'biller' | 'admin';

type ForgotConfig = {
  title: string;
  subtitle: string;
  asideTitle: string;
  asideAccent: string;
  asideDescription: string;
  loginPath: string;
  submitLabel: string;
  successMessage: string;
};

const CONFIGS: Record<PortalKey, ForgotConfig> = {
  buyer: {
    title: 'Forgot Password',
    subtitle: 'Enter your email address to reset your password.',
    asideTitle: 'Your Wallet,',
    asideAccent: 'Simplified',
    asideDescription: 'Recover your customer account access securely and continue paying bills with confidence.',
    loginPath: ROUTE_PATHS.login,
    submitLabel: 'Send reset email',
    successMessage: 'Password reset link sent. Check your email.',
  },
  agent: {
    title: 'Agent Forgot Password',
    subtitle: 'Enter your agent email to reset your password.',
    asideTitle: 'Agent',
    asideAccent: 'Operations',
    asideDescription: 'Recover access to your field and retail agent portal securely.',
    loginPath: ROUTE_PATHS.loginAgent,
    submitLabel: 'Send reset email',
    successMessage: 'Password reset link sent. Check your email.',
  },
  biller: {
    title: 'Biller Forgot Password',
    subtitle: 'Enter your biller admin email to reset your password.',
    asideTitle: 'Corporate',
    asideAccent: 'Collections',
    asideDescription: 'Recover access to your biller portal and continue managing collections.',
    loginPath: ROUTE_PATHS.loginBiller,
    submitLabel: 'Send reset email',
    successMessage: 'Password reset link sent. Check your email.',
  },
  admin: {
    title: 'Admin Forgot Password',
    subtitle: 'Enter your admin email to reset your password.',
    asideTitle: 'Platform',
    asideAccent: 'Administration',
    asideDescription: 'Recover your secure admin portal access using your registered email.',
    loginPath: ROUTE_PATHS.loginAdmin,
    submitLabel: 'Send reset email',
    successMessage: 'Password reset link sent. Check your email.',
  },
};

function resolvePortalKey(value?: string): PortalKey {
  if (value === 'agent' || value === 'biller' || value === 'admin' || value === 'buyer') return value;
  return 'buyer';
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { portal } = useParams<{ portal?: string }>();
  const config = CONFIGS[resolvePortalKey(portal)];
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      await requestPasswordReset(email.trim());
      toast.success(config.successMessage);
      navigate(config.loginPath, { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to request password reset',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white">
        <div className="lg:hidden flex justify-center mb-8">
          <img src={esebillsLogo} alt="EseBills" className="h-9 w-auto" />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{config.subtitle}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 sm:text-sm transition-colors"
                required
              />
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
                  {config.submitLabel}
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Remembered your password?{' '}
              <Link to={config.loginPath} className="font-medium text-gray-700 hover:text-gray-900">
                Back to Login
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
