import { useMemo, useState } from 'react'
import { PortalRegister, type PortalRegisterSubmitPayload } from '../components/PortalRegister'
import { registerAgent, registerBiller, registerCustomer } from '../portal-auth.service'
import { ROUTE_PATHS } from '../../../router/paths'
import { cn } from '../../../lib/utils'

type RegisterPortal = 'customer' | 'agent' | 'biller'

type RegisterPortalConfig = {
  label: string
  title: string
  subtitle: string
  asideTitle: string
  asideAccent: string
  asideDescription: string
  submitLabel: string
  loginPath: string
  registerNote: string
  showCompanyField: boolean
  companyFieldPlaceholder?: string
  bgImage: string
}

const REGISTER_CONFIGS: Record<RegisterPortal, RegisterPortalConfig> = {
  customer: {
    label: 'Customer',
    title: 'Create Account',
    subtitle: 'Join thousands of users and businesses.',
    asideTitle: 'Join the',
    asideAccent: 'Ecosystem',
    asideDescription:
      'Unlock instant payments, financial tracking, and rewarding commissions for your business.',
    submitLabel: 'Create Account',
    loginPath: ROUTE_PATHS.login,
    registerNote: 'Customer account created. Continue to login.',
    showCompanyField: false,
    bgImage: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2000&auto=format&fit=crop"
  },
  agent: {
    label: 'Agent',
    title: 'Create Agent Account',
    subtitle: 'Create your partner account and start processing payments.',
    asideTitle: 'Agent',
    asideAccent: 'Onboarding',
    asideDescription:
      'Join the EseBills agency network to sell services, earn commissions, and grow your business.',
    submitLabel: 'Create Agent Account',
    loginPath: ROUTE_PATHS.loginAgent,
    registerNote: 'Agent account submitted. Continue to agent login.',
    showCompanyField: true,
    companyFieldPlaceholder: 'Shop name',
    bgImage: "https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=2000&auto=format&fit=crop"
  },
  biller: {
    label: 'Biller',
    title: 'Biller Application',
    subtitle: 'Set up your organization portal and collection profile.',
    asideTitle: 'Corporate',
    asideAccent: 'Collections',
    asideDescription:
      'Apply as a biller to receive real-time collection reports and settlements through the EseBills platform.',
    submitLabel: 'Submit Biller Application',
    loginPath: ROUTE_PATHS.loginBiller,
    registerNote: 'Biller application submitted. Continue to biller login.',
    showCompanyField: true,
    companyFieldPlaceholder: 'Organization name',
    bgImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop"
  },
}

async function submitByPortal(portal: RegisterPortal, payload: PortalRegisterSubmitPayload) {
  if (portal === 'agent') {
    return registerAgent({
      firstName: payload.firstName,
      lastName: payload.lastName,
      username: payload.username,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      shopName: payload.companyName ?? '',
    })
  }

  if (portal === 'biller') {
    return registerBiller({
      firstName: payload.firstName,
      lastName: payload.lastName,
      username: payload.username,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      organisationName: payload.companyName ?? '',
    })
  }

  return registerCustomer({
    firstName: payload.firstName,
    lastName: payload.lastName,
    username: payload.username,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    password: payload.password,
    confirmPassword: payload.confirmPassword,
  })
}

export function RegisterPage() {
  const [portal, setPortal] = useState<RegisterPortal>('customer')
  const config = REGISTER_CONFIGS[portal]

  const headerExtra = useMemo(
    () => (
      <div className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Register As
        </p>
        <div className="grid grid-cols-3 gap-1">
        {(Object.keys(REGISTER_CONFIGS) as RegisterPortal[]).map((key) => {
          const item = REGISTER_CONFIGS[key]
          const active = key === portal
          return (
            <button
              key={key}
              type="button"
              onClick={() => setPortal(key)}
              className={cn(
                "rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all",
                active
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
              aria-pressed={active}
            >
              {item.label}
            </button>
          )
        })}
        </div>
      </div>
    ),
    [portal],
  )

  return (
    <PortalRegister
      key={portal}
      title={config.title}
      subtitle={config.subtitle}
      asideTitle={config.asideTitle}
      asideAccent={config.asideAccent}
      asideDescription={config.asideDescription}
      submitLabel={config.submitLabel}
      loginPath={config.loginPath}
      registerNote={config.registerNote}
      showCompanyField={config.showCompanyField}
      companyFieldPlaceholder={config.companyFieldPlaceholder}
      includePasswordFields
      registerAction={(payload) => submitByPortal(portal, payload)}
      headerExtra={headerExtra}
      bgImage={config.bgImage}
    />
  )
}
