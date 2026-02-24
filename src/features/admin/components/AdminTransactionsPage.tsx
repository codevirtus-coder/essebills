import React from 'react'
import toast from 'react-hot-toast'
import { adminJsonFetch, getEconetTransactionsReport, getEsolutionsTransactionsReport, getNetoneTransactionsReport, getZesaTransactionsReport } from '../services'

type UnknownRecord = Record<string, unknown>
type Region = 'zambia' | 'zim'

interface AdminTransactionsPageProps {
  region: Region
}

type ZambiaProvider = {
  label: string
  slug: string
}

type ZimProvider = {
  label: string
  listPaths: string[]
  report?: (payload: { startDate: string; endDate: string; format: string }) => Promise<Blob>
}

const ZAMBIA_PROVIDERS: ZambiaProvider[] = [
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

const ZIM_PROVIDERS: ZimProvider[] = [
  {
    label: 'Econet',
    listPaths: ['/v1/econet-airtime/transactions/all', '/v1/econet-airtime/transactions'],
    report: getEconetTransactionsReport,
  },
  {
    label: 'Netone',
    listPaths: ['/v1/netone-airtime/transactions/all', '/v1/netone-airtime/transactions'],
    report: getNetoneTransactionsReport,
  },
  {
    label: 'Esolutions Airtime',
    listPaths: ['/v1/esolutions-airtime/transactions/all', '/v1/esolutions-airtime/transactions'],
    report: getEsolutionsTransactionsReport,
  },
  {
    label: 'Zesa',
    listPaths: ['/v1/zesa/transactions/all', '/v1/zesa/transactions'],
    report: getZesaTransactionsReport,
  },
]

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

async function fetchFirstWorking(paths: string[]): Promise<UnknownRecord[]> {
  for (const path of paths) {
    try {
      const payload = await adminJsonFetch<unknown>(path)
      return toRows(payload)
    } catch {
      // try next candidate path
    }
  }
  throw new Error('Failed to load transactions from configured endpoints')
}

function formatDateValue(row: UnknownRecord): string {
  return String(row.createdDate ?? row.transactionDate ?? row.createdAt ?? row.date ?? '-')
}

const AdminTransactionsPage: React.FC<AdminTransactionsPageProps> = ({ region }) => {
  const [rows, setRows] = React.useState<UnknownRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedZambiaProvider, setSelectedZambiaProvider] = React.useState<string>('afribus')
  const [selectedZimProvider, setSelectedZimProvider] = React.useState<string>('Econet')

  const activeZimProvider = React.useMemo(
    () => ZIM_PROVIDERS.find((provider) => provider.label === selectedZimProvider) ?? ZIM_PROVIDERS[0],
    [selectedZimProvider],
  )

  const loadRows = React.useCallback(async () => {
    try {
      setIsLoading(true)
      if (region === 'zambia') {
        const provider = selectedZambiaProvider
        const data = await fetchFirstWorking([`/v1/${provider}/transactions/all`, `/v1/${provider}/transactions`])
        setRows(data)
      } else {
        const data = await fetchFirstWorking(activeZimProvider.listPaths)
        setRows(data)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load transactions')
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }, [activeZimProvider.listPaths, region, selectedZambiaProvider])

  React.useEffect(() => {
    void loadRows()
  }, [loadRows])

  const handleGetReport = async () => {
    if (!activeZimProvider.report) {
      toast('No report endpoint configured for this provider')
      return
    }

    try {
      const now = new Date()
      const start = new Date()
      start.setDate(now.getDate() - 30)

      const blob = await activeZimProvider.report({
        startDate: start.toISOString().slice(0, 10),
        endDate: now.toISOString().slice(0, 10),
        format: 'csv',
      })

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${activeZimProvider.label.toLowerCase().replace(/\s+/g, '-')}-transactions.csv`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download report')
    }
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <section className="bg-white rounded-xl border border-neutral-light p-6 min-h-[112px]">
        <h2 className="text-4 leading-none font-medium text-dark-text dark:text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px]">sync_alt</span>
          Transactions
        </h2>
      </section>

      <section className="bg-white rounded-xl border border-neutral-light p-5">
        {region === 'zambia' ? (
          <div className="grid grid-cols-[220px_1fr] gap-8">
            <aside className="pt-4">
              <div className="space-y-2">
                {ZAMBIA_PROVIDERS.map((provider) => (
                <button
                  key={provider.slug}
                  type="button"
                  onClick={() => setSelectedZambiaProvider(provider.slug)}
                  className={`w-full text-left px-3 py-2 rounded-none text-sm transition-colors ${
                    selectedZambiaProvider === provider.slug
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
                  <div className="grid grid-cols-4">
                    <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Amount</div>
                    <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Reference Number</div>
                    <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Transaction Status</div>
                    <div className="px-4 py-3 text-sm font-semibold">Date</div>
                  </div>
                </div>
                <div className="min-h-[360px] bg-white">
                  {isLoading ? (
                    <div className="p-8 text-center text-neutral-text">Loading...</div>
                  ) : rows.length === 0 ? (
                    <div className="p-8 text-center text-neutral-text flex flex-col items-center justify-center min-h-[360px]">
                      <span className="material-symbols-outlined text-[48px] text-primary/40">filter_alt_off</span>
                      <p className="mt-4 text-xl text-neutral-text/70">No Transactions to display!</p>
                    </div>
                  ) : (
                    rows.map((row, index) => (
                      <div
                        key={String(row.id ?? `txn-${index}`)}
                        className="grid grid-cols-4 border-t border-neutral-light hover:bg-neutral-light/40 transition-colors"
                      >
                        <div className="px-4 py-3 text-sm text-dark-text">{String(row.amount ?? row.value ?? '-')}</div>
                        <div className="px-4 py-3 text-sm text-dark-text">
                          {String(row.referenceNumber ?? row.paymentReferenceNumber ?? '-')}
                        </div>
                        <div className="px-4 py-3 text-sm text-dark-text">{String(row.status ?? row.transactionStatus ?? '-')}</div>
                        <div className="px-4 py-3 text-sm text-dark-text">{formatDateValue(row)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-end gap-8 border-b border-neutral-light mb-6">
              {ZIM_PROVIDERS.map((provider) => (
                <button
                  key={provider.label}
                  type="button"
                  onClick={() => setSelectedZimProvider(provider.label)}
                  className={`pb-2 text-sm transition-colors border-b-4 ${
                    selectedZimProvider === provider.label
                      ? 'text-dark-text border-primary'
                      : 'text-neutral-text border-transparent'
                  }`}
                >
                  {provider.label}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <h3 className="text-2xl font-semibold text-dark-text mb-4">{activeZimProvider.label} Balance :</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void loadRows()}
                  className="px-4 py-2 rounded border border-[#7E57C2] text-[#7E57C2] text-lg font-medium uppercase tracking-wide hover:bg-[#7E57C2]/5 transition-colors"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => void handleGetReport()}
                  className="px-4 py-2 rounded bg-[#7E57C2] text-white text-lg font-medium uppercase tracking-wide hover:opacity-90 transition-colors"
                >
                  Get Report
                </button>
              </div>
            </div>

            <div className="border border-neutral-light rounded overflow-hidden bg-white">
              <div className="bg-[#7E57C2] text-white border-b border-neutral-light">
                <div className="grid grid-cols-6">
                  <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Amount</div>
                  <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Payment Reference Number</div>
                  <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Reference Number</div>
                  <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Transaction Category</div>
                  <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Transaction Status</div>
                  <div className="px-4 py-3 text-sm font-semibold">Date</div>
                </div>
              </div>
              <div className="min-h-[360px] bg-white">
                {isLoading ? (
                  <div className="p-8 text-center text-neutral-text">Loading...</div>
                ) : rows.length === 0 ? (
                  <div className="p-8 text-center text-neutral-text flex flex-col items-center justify-center min-h-[360px]">
                    <span className="material-symbols-outlined text-[48px] text-primary/40">filter_alt_off</span>
                    <p className="mt-4 text-2xl text-neutral-text/70">{activeZimProvider.label} Transactions</p>
                  </div>
                ) : (
                  rows.map((row, index) => (
                    <div
                      key={String(row.id ?? `txn-zim-${index}`)}
                      className="grid grid-cols-6 border-t border-neutral-light hover:bg-neutral-light/40 transition-colors"
                    >
                      <div className="px-4 py-3 text-sm text-dark-text">{String(row.amount ?? row.value ?? '-')}</div>
                      <div className="px-4 py-3 text-sm text-dark-text">
                        {String(row.paymentReferenceNumber ?? row.paymentReference ?? '-')}
                      </div>
                      <div className="px-4 py-3 text-sm text-dark-text">{String(row.referenceNumber ?? '-')}</div>
                      <div className="px-4 py-3 text-sm text-dark-text">
                        {String(row.transactionCategory ?? row.category ?? '-')}
                      </div>
                      <div className="px-4 py-3 text-sm text-dark-text">{String(row.status ?? row.transactionStatus ?? '-')}</div>
                      <div className="px-4 py-3 text-sm text-dark-text">{formatDateValue(row)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminTransactionsPage
