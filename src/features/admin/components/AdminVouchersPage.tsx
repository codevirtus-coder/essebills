import React from 'react'
import toast from 'react-hot-toast'
import { adminJsonFetch } from '../services'

type UnknownRecord = Record<string, unknown>
type VoucherRegion = 'zambia' | 'zim'

interface AdminVouchersPageProps {
  region: VoucherRegion
}

type VoucherProvider = {
  label: string
  slug: string
}

const ZAMBIA_PROVIDERS: VoucherProvider[] = [
  { label: 'Afribus', slug: 'afribus' },
  { label: 'Airtel', slug: 'airtel' },
  { label: 'GoTV', slug: 'gotv' },
  { label: 'DsTV', slug: 'dstv' },
  { label: 'Liquid Telecoms', slug: 'liquid-telecom' },
  { label: 'Madison Life', slug: 'madison-life' },
  { label: 'MTN', slug: 'mtn' },
  { label: 'Topstar', slug: 'top-star' },
  { label: 'Vodafone', slug: 'vodafone' },
  { label: 'Zamtel', slug: 'zamtel' },
  { label: 'ZESCO', slug: 'zesco' },
]

const ZIM_PROVIDERS: VoucherProvider[] = [{ label: 'ZESA', slug: 'zesa' }]

function toRows(payload: unknown): UnknownRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is UnknownRecord => typeof item === 'object' && item !== null)
  }
  if (payload && typeof payload === 'object') {
    const maybePage = payload as { content?: unknown[] }
    if (Array.isArray(maybePage.content)) {
      return maybePage.content.filter(
        (item): item is UnknownRecord => typeof item === 'object' && item !== null,
      )
    }
  }
  return []
}

const AdminVouchersPage: React.FC<AdminVouchersPageProps> = ({ region }) => {
  const providers = region === 'zambia' ? ZAMBIA_PROVIDERS : ZIM_PROVIDERS
  const [selectedProvider, setSelectedProvider] = React.useState<string>(providers[0].slug)
  const [rows, setRows] = React.useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const loadRows = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const payload = await adminJsonFetch<unknown>(`/v1/${selectedProvider}/vouchers/all`)
      setRows(toRows(payload))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load vouchers')
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedProvider])

  React.useEffect(() => {
    void loadRows()
  }, [loadRows])

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <section className="bg-white rounded-xl border border-neutral-light p-6 min-h-[112px]">
        <h2 className="text-4 leading-none font-medium text-dark-text dark:text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px]">sync_alt</span>
          vouchers
        </h2>
      </section>

      <section className="bg-white rounded-xl border border-neutral-light p-5">
        <div className="grid grid-cols-[220px_1fr] gap-8">
          <aside className="pt-4">
            <div className="space-y-2">
              {providers.map((provider) => (
                <button
                  key={provider.slug}
                  type="button"
                  onClick={() => setSelectedProvider(provider.slug)}
                  className={`w-full text-left px-3 py-2 rounded-none text-[30px] transition-colors ${
                    selectedProvider === provider.slug
                      ? 'bg-primary/15 border-l-4 border-primary text-dark-text'
                      : 'text-neutral-text hover:bg-neutral-light/40'
                  }`}
                >
                  {provider.label}
                </button>
              ))}
            </div>
          </aside>

          <div>
            <div className="flex items-center mb-4">
              <button
                type="button"
                onClick={() => void loadRows()}
                className="px-4 py-2 rounded border border-[#7E57C2] text-[#7E57C2] text-lg font-medium uppercase tracking-wide hover:bg-[#7E57C2]/5 transition-colors"
              >
                Refresh
              </button>
            </div>

            <div className="border border-neutral-light rounded overflow-hidden bg-white">
              <div className="bg-[#7E57C2] text-white border-b border-neutral-light">
                <div className="grid grid-cols-5">
                  <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Value</div>
                  <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Voucher Type</div>
                  <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Status</div>
                  <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Service Provider</div>
                  <div className="px-4 py-3 text-sm font-semibold">Created Date</div>
                </div>
              </div>
              <div className="min-h-[360px] bg-white">
                {isLoading ? (
                  <div className="p-8 text-center text-neutral-text">Loading...</div>
                ) : rows.length === 0 ? (
                  <div className="p-8 text-center text-neutral-text flex flex-col items-center justify-center min-h-[360px]">
                    <span className="material-symbols-outlined text-[48px] text-primary/40">filter_alt_off</span>
                  </div>
                ) : (
                  rows.map((row, index) => (
                    <div
                      key={String(row.id ?? `voucher-${index}`)}
                      className="grid grid-cols-5 border-t border-neutral-light hover:bg-neutral-light/40 transition-colors"
                    >
                      <div className="px-4 py-3 text-sm text-dark-text">{String(row.value ?? row.amount ?? '-')}</div>
                      <div className="px-4 py-3 text-sm text-dark-text">{String(row.voucherType ?? row.type ?? row.name ?? '-')}</div>
                      <div className="px-4 py-3 text-sm text-dark-text">
                        {String(row.status ?? (row.active === true ? 'ACTIVE' : row.active === false ? 'INACTIVE' : '-'))}
                      </div>
                      <div className="px-4 py-3 text-sm text-dark-text">{String(row.serviceProvider ?? row.provider ?? selectedProvider.toUpperCase())}</div>
                      <div className="px-4 py-3 text-sm text-dark-text">{String(row.createdDate ?? row.createdAt ?? '-')}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminVouchersPage
