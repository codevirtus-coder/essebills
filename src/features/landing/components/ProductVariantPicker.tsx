import React, { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, Search, Tag, Zap } from 'lucide-react'
import type { Product } from '../../../types/products'

interface ProductVariantPickerProps {
  categoryLabel: string
  variants: Product[]
  onSelect: (product: Product) => void
  onBack: () => void
  currencyCode?: string
  compact?: boolean
}

const ProductVariantPicker: React.FC<ProductVariantPickerProps> = ({
  categoryLabel,
  variants,
  onSelect,
  onBack,
  currencyCode = 'USD',
  compact = false,
}) => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)

  const filtered = useMemo(
    () =>
      variants.filter(
        (v) => !search || (v.name ?? '').toLowerCase().includes(search.toLowerCase()),
      ),
    [variants, search],
  )

  const handleConfirm = () => {
    if (selected) onSelect(selected)
  }

  const titleClass = compact ? 'text-sm' : 'text-xl'
  const subtitleClass = compact ? 'text-[10px]' : 'text-xs'
  const backClass = compact ? 'text-xs' : 'text-sm'
  const searchInputClass = compact ? 'text-xs py-2' : 'text-sm py-2.5'
  const footerButtonClass = compact ? 'py-3 text-xs' : 'py-4 text-sm'

  const panelClass = compact
    ? 'rounded-2xl border border-slate-200 shadow-sm'
    : 'rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50'

  const headerPadding = compact ? 'p-4' : 'p-6'
  const searchPadding = compact ? 'px-4 py-3' : 'px-6 py-4'
  const footerPadding = compact ? 'p-4' : 'p-6'

  const gridWrapClass = compact ? 'p-3 max-h-[44vh]' : 'p-4 max-h-[50vh]'
  const gridClass = compact
    ? 'grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-4 justify-items-start'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'

  const compactCardClass = (isSelected: boolean) =>
    `flex flex-col items-center justify-center gap-2 p-3 rounded-2xl text-center outline-none aspect-square w-full min-w-[110px] max-w-[140px] justify-self-start
      transition-all duration-150 active:scale-[0.98] cursor-pointer hover:-translate-y-0.5 relative
      ${
        isSelected
          ? 'bg-emerald-50 border border-emerald-200/70 ring-2 ring-emerald-400/60 ring-inset shadow-[0_6px_26px_rgba(16,185,129,0.16)]'
          : 'bg-white hover:bg-white hover:shadow-md border border-slate-200/60 hover:border-slate-300'
      }`

  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 ${backClass} font-bold text-slate-500 hover:text-slate-900 transition-all group`}
      >
        <ArrowLeft size={compact ? 16 : 18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Services
      </button>

      <div className={`bg-white overflow-hidden ${panelClass}`}>
        <div className={`${headerPadding} border-b border-slate-100 bg-slate-50/50`}>
          <div className="flex items-center gap-3">
            <div
              className={`bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-600/20 ${
                compact ? 'w-10 h-10 rounded-xl' : 'w-12 h-12 rounded-2xl'
              }`}
            >
              <Tag size={compact ? 18 : 22} />
            </div>
            <div>
              <h2 className={`${titleClass} font-black text-slate-900`}>{categoryLabel}</h2>
              <p className={`${subtitleClass} text-slate-400 font-bold uppercase tracking-widest mt-0.5`}>
                Select a plan or bundle
              </p>
            </div>
          </div>
        </div>

        {variants.length > 6 && (
          <div className={`${searchPadding} border-b border-slate-100`}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search plans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-8 pr-4 ${searchInputClass} border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 font-medium`}
              />
            </div>
          </div>
        )}

        <div className={`overflow-y-auto ${gridWrapClass}`}>
          <div className={gridClass}>
            {filtered.length === 0 && (
              <div className="col-span-full py-10 text-center text-sm text-slate-400 font-bold">
                No matching plans found.
              </div>
            )}

            {filtered.map((product) => {
              const isSelected = selected?.id === product.id
              const price = product.minimumPurchaseAmount
              return (
                <button
                  key={product.id}
                  onClick={() => setSelected(product)}
                  className={
                    compact
                      ? compactCardClass(isSelected)
                      : `p-4 rounded-2xl border-2 text-left transition-all relative ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 shadow-lg shadow-emerald-600/10'
                            : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`
                  }
                >
                  {compact ? (
                    <>
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-800">
                        <Zap size={20} />
                      </div>
                      <div className="flex flex-col items-center min-w-0">
                        <p
                          className={`text-[10px] sm:text-[11px] font-semibold text-center leading-tight line-clamp-2 transition-colors ${
                            isSelected ? 'text-emerald-800' : 'text-slate-700'
                          }`}
                        >
                          {product.name}
                        </p>
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">
                          {currencyCode}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={16} className="absolute top-2 right-2 text-emerald-600" />
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-black leading-snug ${
                              isSelected ? 'text-emerald-900' : 'text-slate-900'
                            }`}
                          >
                            {product.name}
                          </p>
                          {product.description && (
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                        )}
                      </div>
                      {price != null && price > 0 && (
                        <div className="mt-3 flex items-center gap-1.5">
                          <Zap size={12} className="text-emerald-500" />
                          <span
                            className={`text-xs font-black ${
                              isSelected ? 'text-emerald-700' : 'text-slate-700'
                            }`}
                          >
                            {currencyCode} {price.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className={`${footerPadding} border-t border-slate-100 bg-slate-50/30`}>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className={`${compact ? 'mx-auto w-fit px-10 sm:px-12 max-w-full' : 'w-full'} bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all ${footerButtonClass}`}
          >
            Continue with {selected?.name ?? 'selected plan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductVariantPicker
