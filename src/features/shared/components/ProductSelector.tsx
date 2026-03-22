import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Search, ChevronDown, X, Check, AlertCircle, Loader2 } from 'lucide-react'
import { getProducts, getProductCategories, getProductLogoUrl } from '../../../services/products.service'
import type { Product, ProductCategory, Currency } from '../../../types/products'
import { cn } from '../../../lib/utils'

interface ProductSelectorProps {
  value: { productId: number; productCode: string; productName: string } | null
  onChange: (product: { productId: number; productCode: string; productName: string } | null) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
}

const CATEGORY_EMOJI: Record<string, string> = {
  airtime: '📱',
  internet: '🌐',
  education: '🎓',
  insurance: '🛡️',
  fuel: '⛽',
  donations: '❤️',
  lottery: '🎰',
  utilities: '⚡',
  default: '📦',
}

function getCategoryEmoji(label: string): string {
  const v = label.toLowerCase()
  if (/airtime|recharge/.test(v)) return CATEGORY_EMOJI.airtime
  if (/bundle|data|internet/.test(v)) return CATEGORY_EMOJI.internet
  if (/school|education|tuition/.test(v)) return CATEGORY_EMOJI.education
  if (/insurance|health|medical/.test(v)) return CATEGORY_EMOJI.insurance
  if (/fuel|petrol/.test(v)) return CATEGORY_EMOJI.fuel
  if (/donat/.test(v)) return CATEGORY_EMOJI.donations
  if (/lottery|loto/.test(v)) return CATEGORY_EMOJI.lottery
  if (/utility|water|electric|power/.test(v)) return CATEGORY_EMOJI.utilities
  return CATEGORY_EMOJI.default
}

interface ProductGroup {
  categoryId: number | string
  categoryName: string
  emoji: string
  products: Product[]
}

export function ProductSelector({
  value,
  onChange,
  placeholder = 'Search and select a product...',
  error,
  disabled = false,
  className,
}: ProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | string | null>(null)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          getProducts({ size: 500 }),
          getProductCategories(),
        ])
        setProducts(productsRes.content ?? [])
        setCategories(categoriesRes)
      } catch (err) {
        console.error('Failed to load products:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => p.status === 'ACTIVE' && p.code && p.id)

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    }

    if (selectedCategory != null) {
      filtered = filtered.filter((p) => p.category?.id === selectedCategory)
    }

    return filtered
  }, [products, search, selectedCategory])

  const groupedProducts = useMemo<ProductGroup[]>(() => {
    const groups: Record<string, ProductGroup> = {}

    for (const product of filteredProducts) {
      const catId = product.category?.id ?? product.category?.name ?? 'uncategorized'
      const catName = product.category?.displayName ?? product.category?.name ?? 'Other'
      const emoji = getCategoryEmoji(catName)

      if (!groups[catId]) {
        groups[catId] = {
          categoryId: catId,
          categoryName: catName,
          emoji,
          products: [],
        }
      }
      groups[catId].products.push(product)
    }

    return Object.values(groups).sort((a, b) => a.categoryName.localeCompare(b.categoryName))
  }, [filteredProducts])

  const handleSelect = (product: Product) => {
    onChange({
      productId: product.id as number,
      productCode: product.code ?? '',
      productName: product.name ?? '',
    })
    setIsOpen(false)
    setSearch('')
    setSelectedCategory(null)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
  }

  const activeCategories = useMemo(() => {
    const cats = new Set<number | string>()
    for (const p of products) {
      if (p.status === 'ACTIVE' && p.id && p.category?.id != null) {
        cats.add(p.category.id)
      }
    }
    return cats
  }, [products])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-left transition-all',
          'bg-white dark:bg-slate-900',
          error
            ? 'border-red-300 dark:border-red-700 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/20',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:border-slate-300 dark:hover:border-slate-600'
        )}
      >
        {value ? (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-lg">{getCategoryEmoji(value.productName)}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {value.productName}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">{value.productCode}</p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-slate-400">{placeholder}</span>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={cn(
              'text-slate-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors',
                  selectedCategory === null
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                All
              </button>
              {categories
                .filter((c) => c.id != null && activeCategories.has(c.id))
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id!)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors',
                      selectedCategory === cat.id
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    )}
                  >
                    {cat.emoji} {cat.displayName ?? cat.name}
                  </button>
                ))}
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-slate-400" size={24} />
              </div>
            ) : groupedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Search size={24} />
                <p className="mt-2 text-sm">No products found</p>
              </div>
            ) : (
              groupedProducts.map((group) => (
                <div key={group.categoryId}>
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 sticky top-0">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {group.emoji} {group.categoryName}
                    </p>
                  </div>
                  {group.products.map((product) => {
                    const isSelected = value?.productId === product.id
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelect(product)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-900/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        )}
                      >
                        {product.productLogoFileName ? (
                          <img
                            src={getProductLogoUrl(product.id as number)}
                            alt=""
                            className="w-8 h-8 rounded-lg object-contain bg-white"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm">
                            {getCategoryEmoji(group.categoryName)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm font-semibold truncate',
                              isSelected
                                ? 'text-emerald-800 dark:text-emerald-200'
                                : 'text-slate-900 dark:text-white'
                            )}
                          >
                            {product.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {product.code}
                            {product.defaultCurrency?.code && ` · ${product.defaultCurrency.code}`}
                            {product.minimumPurchaseAmount != null && product.minimumPurchaseAmount > 0 && (
                              <span className="ml-1">· Min: {product.defaultCurrency?.code ?? '$'}{product.minimumPurchaseAmount.toFixed(2)}</span>
                            )}
                          </p>
                        </div>
                        {isSelected && <Check size={16} className="text-emerald-500 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface RecipientRowProps {
  index: number
  item: {
    productId?: number
    productCode: string
    productName?: string
    recipientIdentifier: string
    amount: number
    currencyCode: string
    recipientName?: string
  }
  products: Product[]
  currencies: Currency[]
  onChange: (field: string, value: unknown) => void
  onRemove: () => void
  error?: string
}

export function RecipientRow({
  index,
  item,
  products,
  currencies,
  onChange,
  onRemove,
  error,
}: RecipientRowProps) {
  return (
    <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-end group">
      <div className="w-12 text-center">
        <span className="text-xs font-black text-slate-400">#{index + 1}</span>
      </div>
      <div className="flex-1 min-w-[180px] space-y-1">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product</label>
        <select
          value={item.productId ?? ''}
          onChange={(e) => {
            const prod = products.find((p) => p.id === Number(e.target.value))
            if (prod) {
              onChange('productId', prod.id)
              onChange('productCode', prod.code ?? '')
              onChange('productName', prod.name ?? '')
              if (prod.defaultCurrency?.code) {
                onChange('currencyCode', prod.defaultCurrency.code)
              }
            }
          }}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium"
        >
          <option value="">Select product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.code})
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[120px] space-y-1">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account / Phone</label>
        <input
          value={item.recipientIdentifier}
          onChange={(e) => onChange('recipientIdentifier', e.target.value)}
          placeholder="0771000000"
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
        />
      </div>
      <div className="w-24 space-y-1">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount</label>
        <input
          type="number"
          value={item.amount}
          onChange={(e) => onChange('amount', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black text-emerald-600"
        />
      </div>
      <div className="w-20 space-y-1">
        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Currency</label>
        <select
          value={item.currencyCode}
          onChange={(e) => onChange('currencyCode', e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium"
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
        title="Remove recipient"
      >
        <X size={16} />
      </button>
      {error && (
        <div className="w-full text-[10px] text-red-500 flex items-center gap-1 pl-1">
          <AlertCircle size={10} />
          {error}
        </div>
      )}
    </div>
  )
}
