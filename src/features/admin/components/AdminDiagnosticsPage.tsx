import React, { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Bug, Mail, MessageSquareText, Search, SendHorizontal } from 'lucide-react'
import { cn } from '../../../lib/utils'
import CRUDLayout, { type CRUDColumn, type PageableState } from '../../shared/components/CRUDLayout'
import { getSmsLogs, sendTestEmail, getBankByCode, getCurrencyByCode } from '../../../services'

type UnknownRecord = Record<string, unknown>

export default function AdminDiagnosticsPage() {
  const [tab, setTab] = useState<'sms' | 'email' | 'lookups'>('sms')

  // SMS
  const [smsRows, setSmsRows] = useState<UnknownRecord[]>([])
  const [smsLoading, setSmsLoading] = useState(false)
  const [smsSearch, setSmsSearch] = useState('')
  const [smsPageable, setSmsPageable] = useState<PageableState>({ page: 1, size: 20, totalElements: 0, totalPages: 0 })

  // Test email
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('EseBills Test Email')
  const [emailBody, setEmailBody] = useState('This is a test email from EseBills.')
  const [emailSending, setEmailSending] = useState(false)

  // System lookups
  const [bankCode, setBankCode] = useState('')
  const [currencyCode, setCurrencyCode] = useState('')
  const [bankResult, setBankResult] = useState<UnknownRecord | null>(null)
  const [currencyResult, setCurrencyResult] = useState<UnknownRecord | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)

  const loadSms = useCallback(async (pageIndex = 0, size = 20, q = '') => {
    try {
      setSmsLoading(true)
      const page: any = await getSmsLogs({ page: pageIndex, size, search: q || undefined })
      const content = Array.isArray(page?.content) ? page.content : []
      setSmsRows(content)
      setSmsPageable({
        page: (page?.number ?? 0) + 1,
        size: page?.size ?? size,
        totalElements: page?.totalElements ?? content.length,
        totalPages: page?.totalPages ?? 1,
      })
    } catch (err: any) {
      setSmsRows([])
      toast.error(err?.message ?? 'Failed to load SMS logs')
    } finally {
      setSmsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab !== 'sms') return
    void loadSms(smsPageable.page - 1, smsPageable.size, smsSearch)
  }, [tab, loadSms, smsPageable.page, smsPageable.size])

  const smsColumns: CRUDColumn<UnknownRecord>[] = useMemo(
    () => [
      {
        key: 'destination',
        header: 'To',
        render: (r) => <span className="font-mono text-xs text-emerald-700">{String((r as any).destination ?? '—')}</span>,
      },
      {
        key: 'messageText',
        header: 'Message',
        render: (r) => (
          <span className="text-sm text-slate-700 dark:text-slate-300 truncate block max-w-[420px]">
            {String((r as any).messageText ?? '—')}
          </span>
        ),
      },
      {
        key: 'deliveryStatus',
        header: 'Status',
        className: 'text-center',
        render: (r) => (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
            {String((r as any).deliveryStatus ?? '—')}
          </span>
        ),
      },
      {
        key: 'messageDate',
        header: 'Date',
        render: (r) => <span className="text-xs text-slate-500">{String((r as any).messageDate ?? (r as any).createdDate ?? '—')}</span>,
      },
    ],
    [],
  )

  const runEmail = async () => {
    if (!emailTo.trim()) return toast.error('Recipient (to) is required')
    try {
      setEmailSending(true)
      await sendTestEmail({ to: emailTo.trim(), subject: emailSubject.trim() || undefined, body: emailBody.trim() || undefined })
      toast.success('Test email triggered')
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to send test email')
    } finally {
      setEmailSending(false)
    }
  }

  const runLookups = async () => {
    const b = bankCode.trim()
    const c = currencyCode.trim()
    if (!b && !c) return toast.error('Enter a bank code and/or currency code')
    try {
      setLookupLoading(true)
      const [bank, currency] = await Promise.all([
        b ? getBankByCode(b) : Promise.resolve(null),
        c ? getCurrencyByCode(c) : Promise.resolve(null),
      ])
      setBankResult(bank as any)
      setCurrencyResult(currency as any)
      toast.success('Lookup complete')
    } catch (err: any) {
      toast.error(err?.message ?? 'Lookup failed')
    } finally {
      setLookupLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <Bug className="text-emerald-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Diagnostics</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">SMS logs, test email, and system by-code lookups.</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(
            [
              { id: 'sms', label: 'SMS', icon: MessageSquareText },
              { id: 'email', label: 'Test Email', icon: Mail },
              { id: 'lookups', label: 'Lookups', icon: Search },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-colors inline-flex items-center gap-2',
                tab === t.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
              )}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'sms' && (
        <CRUDLayout
          title="SMS Logs"
          columns={smsColumns}
          data={smsRows}
          loading={smsLoading}
          pageable={smsPageable}
          onPageChange={(p) => setSmsPageable((prev) => ({ ...prev, page: p }))}
          onSizeChange={(s) => setSmsPageable((prev) => ({ ...prev, size: s, page: 1 }))}
          onSearch={(q) => {
            setSmsSearch(q)
            setSmsPageable((prev) => ({ ...prev, page: 1 }))
            void loadSms(0, smsPageable.size, q)
          }}
          onRefresh={() => void loadSms(smsPageable.page - 1, smsPageable.size, smsSearch)}
        />
      )}

      {tab === 'email' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">To</label>
              <input
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Subject</label>
              <input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Body</label>
            <textarea
              rows={4}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void runEmail()}
              disabled={emailSending}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
            >
              <SendHorizontal size={16} />
              {emailSending ? 'Sending…' : 'Send Test Email'}
            </button>
          </div>
        </div>
      )}

      {tab === 'lookups' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900">Bank by Code</h3>
            <input
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              placeholder="bankCode (e.g. CBZ)"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
            />
            {bankResult && (
              <pre className="text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto">
                {JSON.stringify(bankResult, null, 2)}
              </pre>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900">Currency by Code</h3>
            <input
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              placeholder="currencyCode (e.g. USD)"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
            />
            {currencyResult && (
              <pre className="text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto">
                {JSON.stringify(currencyResult, null, 2)}
              </pre>
            )}
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={() => void runLookups()}
              disabled={lookupLoading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
            >
              <Search size={16} />
              {lookupLoading ? 'Looking…' : 'Run Lookups'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
