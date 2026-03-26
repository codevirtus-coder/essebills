import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ChevronRight, User, Mail, Phone, Lock, Building2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRegisterMutation } from '../auth.hooks';
import { getAuthSession } from '../auth.storage';
import { getDashboardRouteByGroup, ROUTE_PATHS } from '../../../router/paths';
import bg1 from '../../../assets/bg1.jpg';
import esebillsLogo from '../../../assets/esebills_logo.png';

export type PortalRegisterSubmitPayload = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  companyName?: string;
  password?: string;
  confirmPassword?: string;
};

type PortalRegisterProps = {
  title: string;
  subtitle: string;
  asideTitle: string;
  asideAccent: string;
  asideDescription: string;
  submitLabel: string;
  loginPath: string;
  registerNote?: string;
  showCompanyField?: boolean;
  includePasswordFields?: boolean;
  companyFieldPlaceholder?: string;
  registerAction?: (payload: PortalRegisterSubmitPayload) => Promise<unknown>;
  headerExtra?: ReactNode;
  bgImage?: string;
};

export function PortalRegister({
  title,
  subtitle,
  asideTitle,
  asideAccent,
  asideDescription,
  submitLabel,
  loginPath,
  registerNote,
  showCompanyField = false,
  includePasswordFields = false,
  companyFieldPlaceholder = 'Organization name',
  registerAction,
  headerExtra,
  bgImage,
}: PortalRegisterProps) {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const existingSession = getAuthSession();
    if (existingSession) {
      navigate(getDashboardRouteByGroup(existingSession.group), { replace: true });
    }
  }, [navigate]);

  const validateStep = (s: number) => {
    if (s === 1) {
      if (!firstName || !lastName) {
        toast.error('First and last name are required');
        return false;
      }
      if (showCompanyField && !companyName) {
        toast.error('Company name is required');
        return false;
      }
    }
    if (s === 2) {
      if (!username || !email || !phoneNumber) {
        toast.error('All fields are required');
        return false;
      }
      if (!email.includes('@')) {
        toast.error('Invalid email address');
        return false;
      }
    }
    return true;
  };

  const steps = includePasswordFields
    ? [
        { id: 1, label: 'Profile' },
        { id: 2, label: 'Contact' },
        { id: 3, label: 'Security' },
      ]
    : [
        { id: 1, label: 'Profile' },
        { id: 2, label: 'Contact' },
      ];

  const totalSteps = steps.length;
  const currentStepMeta = steps.find((s) => s.id === step) ?? steps[0];

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((current) => Math.min(current + 1, totalSteps));
    }
  };

  const prevStep = () => setStep((current) => Math.max(current - 1, 1));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (includePasswordFields) {
      if (!password || !confirmPassword) {
        toast.error('Password and confirm password are required');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    const payload: PortalRegisterSubmitPayload = {
      firstName,
      lastName,
      username,
      email,
      phoneNumber: phoneNumber || undefined,
      companyName: companyName || undefined,
      password: password || undefined,
      confirmPassword: confirmPassword || undefined,
    };

    try {
      setIsSubmitting(true);
      if (registerAction) {
        await registerAction(payload);
      } else {
        await registerMutation.mutateAsync({
          firstName,
          lastName,
          username,
          email,
          groupId: 2,
          phoneNumber: phoneNumber || undefined,
        });
      }
      toast.success(registerNote ?? 'Account created. Please log in.');
      navigate(loginPath, { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Registration failed. Check your details and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium transition-all';

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left panel — Branding */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <img
          src={bgImage ?? bg1}
          alt=""
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-20"
        />
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.1)_0%,transparent_50%)]" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <Link
            to={ROUTE_PATHS.home}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-all font-bold text-xs uppercase tracking-[0.2em] group self-start bg-white/5 px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div>
            <img src={esebillsLogo} alt="EseBills" className="h-24 w-auto brightness-0 invert mb-12" />
            <h1 className="text-5xl font-black text-white leading-tight tracking-tighter">
              {asideTitle}<br />
              <span className="text-emerald-400">{asideAccent}</span>
            </h1>
            <p className="mt-6 text-lg text-white/75 max-w-sm leading-relaxed font-medium">
              {asideDescription}
            </p>
          </div>

          <div className="flex items-center gap-4 py-6 border-t border-white/5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-sm text-white/70 font-bold tracking-tight">
              Trusted by 10,000+ businesses nationwide.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — Stepper form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 bg-white">
        <div className="lg:hidden flex justify-center mb-12">
          <img src={esebillsLogo} alt="EseBills" className="h-20 w-auto" />
        </div>

        <div className="mx-auto w-full max-w-lg">
          {headerExtra ? <div className="mb-8">{headerExtra}</div> : null}

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
            <p className="mt-2 text-slate-500 font-medium">{subtitle}</p>
          </div>

          {/* Stepper Progress */}
          <div className="mb-10">
            <div className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>{currentStepMeta.label}</span>
              <span>Step {step} of {totalSteps}</span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="min-h-[340px] flex flex-col">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                        <input
                          type="text"
                          placeholder="Tendai"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                        <input
                          type="text"
                          placeholder="Katsande"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {showCompanyField && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company / Shop Name</label>
                      <div className="relative group">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                        <input
                          type="text"
                          placeholder={companyFieldPlaceholder}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                      <input
                        type="text"
                        placeholder="choose_username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                      <input
                        type="tel"
                        placeholder="+263..."
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {includePasswordFields && step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                        minLength={8}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                      By creating an account, you agree to our <Link to="#" className="underline font-bold">Terms of Service</Link> and <Link to="#" className="underline font-bold">Privacy Policy</Link>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-12 flex items-center gap-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-4 px-6 rounded-2xl text-sm font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-widest"
                >
                  Back
                </button>
              )}
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-[2] py-4 px-6 rounded-2xl text-sm font-black text-white bg-slate-900 hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || (!registerAction && registerMutation.isPending)}
                  className="flex-[2] py-4 px-6 rounded-2xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {isSubmitting || (!registerAction && registerMutation.isPending) ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      {submitLabel}
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to={loginPath} className="font-black text-slate-900 hover:text-emerald-600 transition-colors uppercase text-xs tracking-widest">
                Log In
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-auto pt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          © {new Date().getFullYear()} EseBills Gateway. Secured with AES-256.
        </p>
      </div>
    </div>
  );
}
