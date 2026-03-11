import { useEffect, useMemo, useState } from 'react'
import { Heart, Loader2, HandHeart, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout'
import CRUDModal from '../../shared/components/CRUDModal'
import { ProductPaymentCheckout } from '../../landing/components/ProductPaymentCheckout'
import {
  getDonationCampaignsV1,
  getDonationsByCampaignV1,
  getDonationSummaryV1,
  createDonationCampaignV1,
  getProducts,
  type DonationCampaignV1,
  type DonationV1,
} from '../../../services'
import type { Product } from '../../../types'

export default function AgentDonationsPage() {
  const [loading, setLoading] = useState(false)
  const [campaigns, setCampaigns] = useState<DonationCampaignV1[]>([])
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedCampaign, setSelectedCampaign] = useState<DonationCampaignV1 | null>(null)
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    targetAmount: '',
    productId: '',
  })

  const [donationsLoading, setDonationsLoading] = useState(false)
  const [donations, setDonations] = useState<DonationV1[]>([])
  const [donationsPage, setDonationsPage] = useState(0)
  const [donationsTotal, setDonationsTotal] = useState(0)

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

  const openCampaign = async (c: DonationCampaignV1) => {
    setSelectedCampaign(c)
    setIsCampaignModalOpen(true)
    setDonationsPage(0)
  }

  const loadDonations = async (campaignId: number, page = 0) => {
    setDonationsLoading(true)
    try {
      const res = await getDonationsByCampaignV1(campaignId, page, 10)
      setDonations(Array.isArray(res?.content) ? res.content : [])
      setDonationsTotal(Number(res?.totalElements) || 0)
    } catch (e) {
      toast.error('Failed to load campaign donations')
    } finally {
      setDonationsLoading(false)
    }
  }

  useEffect(() => {
    if (!isCampaignModalOpen || !selectedCampaign?.id) return
    void loadDonations(selectedCampaign.id, donationsPage)
  }, [isCampaignModalOpen, selectedCampaign?.id, donationsPage])

  const openCreate = async () => {
    setIsCreateModalOpen(true)
    if (products.length > 0) return
    setProductsLoading(true)
    try {
      const res = await getProducts({ page: 0, size: 200 })
      const list = Array.isArray(res?.content) ? res.content : []
      // Agents should only create donation campaigns against donation-type products.
      const donationProducts = list.filter((p) => {
        const name = String((p as any)?.name ?? '').toLowerCase()
        const code = String((p as any)?.code ?? '').toLowerCase()
        const catName = String((p as any)?.category?.name ?? (p as any)?.category?.displayName ?? '').toLowerCase()
        return name.includes('donat') || code.includes('donat') || catName.includes('donat')
      })
      setProducts(donationProducts)
      if (donationProducts.length === 0) {
        toast.error('No donation products found. Ask admin to create/enable a Donations product category.')
      }
    } catch (e) {
      toast.error('Failed to load products')
    } finally {
      setProductsLoading(false)
    }
  }

  const handleCreate = async () => {
    const name = createForm.name.trim()
    const description = createForm.description.trim()
    const productId = Number(createForm.productId)
    const targetAmount = createForm.targetAmount.trim() ? Number(createForm.targetAmount) : undefined

    if (!name) {
      toast.error('Campaign name is required')
      return
    }
    if (!productId || Number.isNaN(productId)) {
      toast.error('Product is required')
      return
    }
    if (targetAmount !== undefined && (!Number.isFinite(targetAmount) || targetAmount < 0)) {
      toast.error('Target amount must be a valid number')
      return
    }

    setIsCreating(true)
    try {
      await createDonationCampaignV1({
        name,
        description: description || undefined,
        targetAmount,
        productId,
      })
      toast.success('Campaign created')
      setIsCreateModalOpen(false)
      setCreateForm({ name: '', description: '', targetAmount: '', productId: '' })
      await refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create campaign')
    } finally {
      setIsCreating(false)
    }
  }

  const campaignRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const filtered = term
      ? campaigns.filter((c) => (c.name ?? '').toLowerCase().includes(term) || (c.product?.name ?? '').toLowerCase().includes(term))
      : campaigns
    return filtered.map((c) => ({ ...c, uid: String(c.id) }))
  }, [campaigns, searchTerm])

  const campaignColumns: CRUDColumn<DonationCampaignV1 & { uid: string }>[] = [
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
  ]

  const donationColumns: CRUDColumn<DonationV1 & { uid: string }>[] = [
    {
      key: 'donorName',
      header: 'Donor',
      render: (d) => (
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{d.donorName || 'Anonymous'}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{d.donorEmail || d.donorPhoneNumber || ''}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (d) => (
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
          {d.currencyCode ?? 'USD'} {(Number(d.amount) || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'createdDate',
      header: 'Date',
      render: (d) => {
        const raw = String(d.createdDate ?? '')
        const t = Date.parse(raw)
        const label = Number.isFinite(t) ? new Date(t).toLocaleString() : raw || '—'
        return <span className="text-xs text-slate-500">{label}</span>
      },
    },
  ]

  const summaryAmount = Number((summary as any)?.totalAmount ?? (summary as any)?.amount ?? 0) || 0
  const summaryCount = Number((summary as any)?.totalDonations ?? (summary as any)?.count ?? 0) || 0

  if (checkoutCampaign?.product?.id && checkoutCampaign.product.category?.id) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Collect Donation</h2>
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Agent Tip</p>
          <p className="text-xl font-black mt-2">Use donations to support local causes</p>
          <p className="text-xs text-white/80 mt-2">Pick a campaign and collect a donation like any other sale.</p>
        </div>
      </div>

      <CRUDLayout
        title="Donation Campaigns"
        columns={campaignColumns}
        data={campaignRows}
        loading={loading}
        pageable={{ page: 1, size: 20, totalElements: campaignRows.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onRefresh={refresh}
        onAdd={openCreate}
        addButtonText="Create Campaign"
        searchable={true}
        onSearch={setSearchTerm}
        actions={{
          onView: (c) => openCampaign(c),
          onEdit: (c) => setCheckoutCampaign(c),
          canEdit: (c) => Boolean(c.product?.id && c.product?.category?.id),
        }}
      />

      <CRUDModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Donation Campaign"
        size="lg"
        onSubmit={handleCreate}
        isSubmitting={isCreating}
        submitLabel="Create Campaign"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Campaign Name</label>
              <input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. School Fees Drive"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Product</label>
              <select
                value={createForm.productId}
                onChange={(e) => setCreateForm({ ...createForm, productId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none"
                disabled={productsLoading}
              >
                <option value="">{productsLoading ? 'Loading products…' : 'Select product…'}</option>
                {products.map((p) => (
                  <option key={String(p.id)} value={String(p.id)}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 ml-1">Campaigns must be linked to a product (from the API spec).</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Target Amount (optional)</label>
              <input
                value={createForm.targetAmount}
                onChange={(e) => setCreateForm({ ...createForm, targetAmount: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. 5000"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Status</label>
              <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                Active by default
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Description (optional)</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-24"
                placeholder="Short description shown to users"
              />
            </div>
          </div>
        </div>
      </CRUDModal>

      <CRUDModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        title={selectedCampaign?.name ? `Campaign: ${selectedCampaign.name}` : 'Campaign'}
        size="xl"
        showActions={false}
      >
        {selectedCampaign && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-500">{selectedCampaign.description || '—'}</p>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold">
                    Product: {selectedCampaign.product?.name ?? 'Donation'}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold">
                    Target: ${(Number(selectedCampaign.targetAmount) || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCheckoutCampaign(selectedCampaign)}
                disabled={!selectedCampaign.product?.id || !selectedCampaign.product?.category?.id}
                className="flex items-center gap-2 px-5 py-2.5 bg-pink-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-pink-900/20 hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                <HandHeart size={16} />
                Collect Donation
              </button>
            </div>

            <CRUDLayout
              title="Recent Donations"
              columns={donationColumns}
              data={donations.map((d) => ({ ...d, uid: String(d.id) }))}
              loading={donationsLoading}
              pageable={{
                page: donationsPage + 1,
                size: 10,
                totalElements: donationsTotal,
                totalPages: Math.max(1, Math.ceil(donationsTotal / 10)),
              }}
              onPageChange={(p) => setDonationsPage(p - 1)}
              onSizeChange={() => {}}
              searchable={false}
              onRefresh={() => {
                if (selectedCampaign?.id) void loadDonations(selectedCampaign.id, donationsPage)
              }}
              actions={{
                onView: () => {},
              }}
            />
          </div>
        )}
      </CRUDModal>
    </div>
  )
}
