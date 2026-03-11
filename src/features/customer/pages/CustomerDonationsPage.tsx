import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Heart, HandHeart } from 'lucide-react'
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout'
import { ProductPaymentCheckout } from '../../landing/components/ProductPaymentCheckout'
import {
  getDonationCampaignsV1,
  getDonationSummaryV1,
  type DonationCampaignV1,
} from '../../../services'

export default function CustomerDonationsPage() {
  const [loading, setLoading] = useState(false)
  const [campaigns, setCampaigns] = useState<DonationCampaignV1[]>([])
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [checkoutCampaign, setCheckoutCampaign] = useState<DonationCampaignV1 | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      const [camps, sum] = await Promise.all([getDonationCampaignsV1(), getDonationSummaryV1().catch(() => null)])
      setCampaigns(Array.isArray(camps) ? camps : [])
      setSummary(sum)
    } catch (e) {
      toast.error('Failed to load donations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const filtered = term
      ? campaigns.filter((c) => (c.name ?? '').toLowerCase().includes(term) || (c.product?.name ?? '').toLowerCase().includes(term))
      : campaigns
    return filtered.map((c) => ({ ...c, uid: String(c.id) }))
  }, [campaigns, searchTerm])

  const columns: CRUDColumn<DonationCampaignV1 & { uid: string }>[] = [
    {
      key: 'name',
      header: 'Campaign',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <Heart size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.name}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c.product?.name ?? 'Donation'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'targetAmount',
      header: 'Target',
      className: 'text-right',
      render: (c) => <span className="text-sm font-bold text-slate-900 dark:text-slate-100">${(Number(c.targetAmount) || 0).toFixed(2)}</span>,
    },
    {
      key: 'active',
      header: 'Status',
      className: 'text-center',
      render: (c) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
            c.active === false
              ? 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700'
              : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40'
          }`}
        >
          {c.active === false ? 'Inactive' : 'Active'}
        </span>
      ),
    },
    {
      key: 'donate',
      header: '',
      className: 'text-right',
      render: (c) => (
        <button
          onClick={() => setCheckoutCampaign(c)}
          disabled={!c.product?.id || !c.product?.category?.id}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-pink-900/20 hover:bg-pink-700 transition-colors disabled:opacity-50"
        >
          <HandHeart size={14} />
          Donate
        </button>
      ),
    },
  ]

  const summaryAmount = Number((summary as any)?.totalAmount ?? (summary as any)?.amount ?? 0) || 0
  const summaryCount = Number((summary as any)?.totalDonations ?? (summary as any)?.count ?? 0) || 0

  if (checkoutCampaign?.product?.id && checkoutCampaign.product.category?.id) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Donate</h2>
            <p className="text-slate-500 mt-2">{checkoutCampaign.name}</p>
          </div>
          <button
            onClick={() => setCheckoutCampaign(null)}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Back
          </button>
        </div>

        <div className="glass-card p-8 md:p-10 border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px]">
          <ProductPaymentCheckout
            productId={checkoutCampaign.product.id}
            billerName={checkoutCampaign.product.name ?? checkoutCampaign.name}
            productCategoryId={checkoutCampaign.product.category.id}
            embedded={true}
            onBack={() => setCheckoutCampaign(null)}
            onSuccess={() => {
              setCheckoutCampaign(null)
              void refresh()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Donations Raised</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">${summaryAmount.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-2">Across all campaigns</p>
        </div>
        <div className="glass-card p-8 border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Donations</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{summaryCount}</p>
          <p className="text-xs text-slate-500 mt-2">Successful and pending</p>
        </div>
        <div className="bg-pink-600 p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Support</p>
          <p className="text-xl font-black mt-2">Donate to verified campaigns</p>
          <p className="text-xs text-white/80 mt-2">Choose a campaign and complete your donation securely.</p>
        </div>
      </div>

      <CRUDLayout
        title="Donation Campaigns"
        columns={columns}
        data={rows}
        loading={loading}
        pageable={{ page: 1, size: 20, totalElements: rows.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onRefresh={refresh}
        onSearch={setSearchTerm}
      />
    </div>
  )
}

