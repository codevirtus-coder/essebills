import { useMemo, useState } from 'react'
import { PortalRegister, type PortalRegisterSubmitPayload } from '../features/auth/components/PortalRegister'
import { registerAgent, registerBiller, registerCustomer } from '../features/auth/portal-auth.service'
import { ROUTE_PATHS } from '../router/paths'

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
      <div className="rounded-2xl bg-[#eef2f7] p-1 flex gap-1">
        {(Object.keys(REGISTER_CONFIGS) as RegisterPortal[]).map((key) => {
          const item = REGISTER_CONFIGS[key]
          const active = key === portal
          return (
            <button
              key={key}
              type="button"
              onClick={() => setPortal(key)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                active
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-neutral-text hover:bg-white/60'
              }`}
              aria-pressed={active}
            >
              {item.label}
            </button>
          )
        })}
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
    />
  )
}
