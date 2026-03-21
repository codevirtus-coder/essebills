import React, { useState } from 'react'
import { ArrowLeft, CheckCircle2, Search, Tag, Zap } from 'lucide-react'
import type { Product } from '../../../types/products'

interface ProductVariantPickerProps {
  categoryLabel: string
  variants: Product[]
  onSelect: (product: Product) => void
  onBack: () => void
  currencyCode?: string
}

const ProductVariantPicker: React.FC<ProductVariantPickerProps> = ({
  categoryLabel,
  variants,
  onSelect,
  onBack,
  currencyCode = 'USD',
}) => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)

  const filtered = variants.filter((v) =>
    !search || (v.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleConfirm = () => {
    if (selected) onSelect(selected)
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Services
      </button>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20 text-white shrink-0">
              <Tag size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{categoryLabel}</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                Select a plan or bundle
              </p>
            </div>
          </div>
        </div>

        {variants.length > 6 && (
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search plans…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 font-medium"
              />
            </div>
          </div>
        )}

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="col-span-full py-10 text-center text-sm text-slate-400 font-bold">No matching plans found.</div>
          )}
          {filtered.map((product) => {
            const isSelected = selected?.id === product.id
            const price = product.minimumPurchaseAmount
            return (
              <button
                key={product.id}
                onClick={() => setSelected(product)}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-lg shadow-emerald-600/10'
                    : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-sm font-black leading-snug ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  )}
                </div>
                {price != null && price > 0 && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <Zap size={12} className="text-emerald-500" />
                    <span className={`text-xs font-black ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {currencyCode} {price.toFixed(2)}
                    </span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/30">
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Continue with {selected?.name ?? 'selected plan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductVariantPicker
