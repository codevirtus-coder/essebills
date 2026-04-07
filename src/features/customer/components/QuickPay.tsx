import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowLeft, X, Zap, Clock, ChevronRight } from 'lucide-react';
import { Icon } from '../../../components/ui/Icon';
import { getProducts, getProductCategories, getProductVariants } from '../../../services/products.service';
import type { Product, ProductCategory } from '../../../types/products';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../../router/paths';
import type { BillerCard } from '../../shared/components/ServicesMarketplace';
import ProductVariantPicker from '../../landing/components/ProductVariantPicker';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY = 'esebills.quickpay.last';

const ICON_BG: Record<string, string> = {
  airtime:   'bg-blue-100 text-blue-800',
  internet:  'bg-violet-100 text-violet-800',
  education: 'bg-amber-100 text-amber-800',
  insurance: 'bg-rose-100 text-rose-800',
  fuel:      'bg-orange-100 text-orange-800',
  donations: 'bg-pink-100 text-pink-800',
  lottery:   'bg-purple-100 text-purple-800',
  utilities: 'bg-emerald-100 text-emerald-800',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function colorKey(label: string, key: string): string {
  const v = `${label} ${key}`.toLowerCase();
  if (/airtime|recharge/.test(v))         return 'airtime';
  if (/bundle|data|internet/.test(v))     return 'internet';
  if (/school|education|tuition/.test(v)) return 'education';
  if (/insurance|health|medical/.test(v)) return 'insurance';
  if (/fuel|petrol/.test(v))              return 'fuel';
  if (/donat/.test(v))                    return 'donations';
  if (/lottery|loto/.test(v))             return 'lottery';
  return 'utilities';
}

function catEmoji(label: string): string {
  const v = label.toLowerCase();
  if (/airtime|recharge/.test(v))         return '📱';
  if (/bundle|data|internet/.test(v))     return '🌐';
  if (/school|education|tuition/.test(v)) return '🎓';
  if (/insurance|health|medical/.test(v)) return '🛡️';
  if (/fuel|petrol/.test(v))              return '⛽';
  if (/donat/.test(v))                    return '❤️';
  if (/lottery|loto/.test(v))             return '🎰';
  return '⚡';
}

function isLikelyIconName(value: string): boolean {
  return /^[a-z0-9][a-z0-9_-]*$/i.test(value.trim());
}

function inferKey(name: string, code: string): string {
  const v = `${name} ${code}`.toLowerCase();
  if (/(airtime|recharge|evd|topup)/.test(v))                       return 'airtime';
  if (/(bundle|data)/.test(v))                                       return 'internet';
  if (/(school|tuition|fees|university|college|education)/.test(v)) return 'education';
  if (/(insurance|life|medical|health)/.test(v))                    return 'insurance';
  if (/(fuel|petrol|diesel|gas)/.test(v))                           return 'fuel';
  if (/(donat)/.test(v))                                             return 'donations';
  if (/(lottery|loto|jackpot)/.test(v))                             return 'lottery';
  return 'utilities';
}

// ─── localStorage ─────────────────────────────────────────────────────────────

interface LastSelection { productId: number; productName: string; }
function readLast(): LastSelection | null {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? 'null'); } catch { return null; }
}
function saveLast(s: LastSelection) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { /* noop */ }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'categories' | 'products' | 'variants';
type Cat  = { key: string; productCategoryId?: number; label: string; emoji: string };

// ─── Flat card sub-components ─────────────────────────────────────────────────

/** Category grid tile — centred icon + label, flat, pale bg on focus, square */
function CatCard({ cat, count, focused, onClick, itemRef }: {
  cat: Cat; count: number; focused: boolean;
  onClick: () => void; itemRef?: React.Ref<HTMLButtonElement>;
}) {
  const showLucide = isLikelyIconName(cat.emoji);
  return (
    <button
      ref={itemRef}
      type="button"
      onClick={onClick}
      aria-selected={focused}
      className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl outline-none aspect-square w-full min-w-[70px] max-w-[100px]
        transition-all duration-150 active:scale-95 cursor-pointer hover:-translate-y-0.5
        ${focused ? 'bg-emerald-50 border border-emerald-200/70 ring-2 ring-emerald-400/60 ring-inset shadow-[0_4px_20px_rgb(16,185,129,0.15)]' : 'bg-slate-50 hover:bg-white hover:shadow-md border border-slate-200/50 hover:border-slate-200'}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ICON_BG[colorKey(cat.label, cat.key)] ?? ICON_BG.utilities}`}>
        {showLucide ? (
          <Icon name={cat.emoji} size={18} className="text-current" aria-hidden="true" />
        ) : (
          <span className="text-lg sm:text-xl leading-none drop-shadow-sm">{cat.emoji}</span>
        )}
      </div>
      <p className={`text-[9px] sm:text-[10px] font-semibold text-center leading-tight line-clamp-2 w-full px-0.5 transition-colors ${focused ? 'text-emerald-800' : 'text-slate-600'}`}>
        {cat.label}
      </p>
      {count > 0 && <span className="text-[8px] sm:text-[9px] text-slate-400 font-medium">{count}</span>}
    </button>
  );
}

/** Product card — flat, pale emerald bg on focus/selected, square */
function ProductCard({ biller, glyph, focused, onClick, itemRef }: {
  biller: BillerCard; glyph?: string; focused: boolean;
  onClick: () => void; itemRef?: React.Ref<HTMLButtonElement>;
}) {
  const ck = colorKey(biller.categoryLabel, biller.categoryKey);
  const shownGlyph = (glyph ?? '').trim() || catEmoji(biller.categoryLabel);
  const showLucide = isLikelyIconName(shownGlyph);
  return (
    <button
      ref={itemRef}
      type="button"
      onClick={onClick}
      aria-selected={focused}
      className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl text-center outline-none aspect-square w-full min-w-[70px] max-w-[100px]
        transition-all duration-150 active:scale-[0.98] cursor-pointer hover:-translate-y-0.5
        ${focused ? 'bg-emerald-50 border border-emerald-200/70 ring-2 ring-emerald-400/60 ring-inset shadow-[0_4px_20px_rgb(16,185,129,0.15)]' : 'bg-slate-50 hover:bg-white hover:shadow-md border border-slate-200/50 hover:border-slate-200'}`}
    >
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${ICON_BG[ck] ?? ICON_BG.utilities}`}>
        {showLucide ? (
          <Icon name={shownGlyph} size={18} className="text-current" aria-hidden="true" />
        ) : (
          <span className="text-base sm:text-lg leading-none drop-shadow-sm">{shownGlyph}</span>
        )}
      </div>
      <div className="flex flex-col items-center min-w-0">
        <p className={`text-[9px] sm:text-[10px] font-semibold text-center leading-tight line-clamp-2 transition-colors ${focused ? 'text-emerald-800' : 'text-slate-700'}`}>
          {biller.name}
        </p>
        {biller.currencyCode && (
          <span className="text-[8px] sm:text-[9px] font-bold text-slate-400">{biller.currencyCode}</span>
        )}
      </div>
    </button>
  );
}



// ─── Shared data + logic hook ─────────────────────────────────────────────────

export function useQuickPayData() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['quickpay-data'],
    queryFn: async () => {
      const [page, cats] = await Promise.all([getProducts({ size: 500 }), getProductCategories()]);
      return { products: page.content ?? [], categories: cats };
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const categories = useMemo<Cat[]>(() => (
    (data?.categories ?? [] as ProductCategory[])
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((c) => ({
        key:               String(c.id ?? '').trim(),
        productCategoryId: typeof c.id === 'number' ? c.id : undefined,
        label:             String(c.displayName ?? c.name ?? 'Category'),
        emoji:             String(c.emoji ?? '').trim() || catEmoji(String(c.displayName ?? c.name ?? '')),
      }))
      .filter((c) => c.key.length > 0)
  ), [data?.categories]);

  const allProducts = useMemo<BillerCard[]>(() => (
    (data?.products ?? [])
      .filter((p) => p.status === 'ACTIVE' && !p.deleted && typeof p.id === 'number')
      .map((p) => {
        const name = String(p.name ?? 'Unnamed');
        const code = String(p.code ?? '');
        const cat  = p.category;
        const ik   = inferKey(name, code);
        const catId = typeof cat?.id === 'number' ? String(cat.id) : undefined;
        return {
          id:                    `p-${p.id}`,
          productId:             p.id as number,
          productCategoryId:     typeof cat?.id === 'number' ? cat.id : undefined,
          name,
          description:           p.description ?? undefined,
          categoryKey:           catId ?? String(cat?.name ?? ik),
          categoryLabel:         String(cat?.displayName ?? cat?.name ?? ik),
          currencyCode:          p.defaultCurrency?.code ?? undefined,
          minimumPurchaseAmount: Number(p.minimumPurchaseAmount ?? 0) || undefined,
        } satisfies BillerCard;
      })
  ), [data?.products]);

  const countByCategory = useMemo(() => {
    const m: Record<string, number> = {};
    for (const b of allProducts) m[b.categoryKey] = (m[b.categoryKey] ?? 0) + 1;
    return m;
  }, [allProducts]);

  return { categories, allProducts, countByCategory, isLoading, isError };
}

// ─── Shared selector panel (used by both QuickPay and QuickPayWide) ───────────

interface SelectorProps {
  /** Called with the final chosen biller (after variants if any). */
  onPick: (b: BillerCard) => void;
  /** Grid columns for the category panel (default 3). */
  catCols?: 3 | 4;
  /** Grid columns for the products / variants panel (default 2). */
  itemCols?: 2 | 3;
}

export function QuickPaySelector({ onPick, catCols = 3, itemCols = 2 }: SelectorProps) {
  const { categories, allProducts, countByCategory, isLoading } = useQuickPayData();
  const categoryGlyphByKey = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of categories) m[c.key] = c.emoji;
    return m;
  }, [categories]);

  const [step, setStep]           = useState<Step>('categories');
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [selectedBase, setSelectedBase] = useState<BillerCard | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs  = useRef<(HTMLButtonElement | null)[]>([]);
  const lastSel   = useMemo(() => readLast(), []);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 50);

  const { data: variants = [], isLoading: isVariantsLoading } = useQuery({
    queryKey: ['quickpay-variants', selectedBase?.productId],
    queryFn: () => getProductVariants(selectedBase!.productId),
    enabled: step === 'variants' && !!selectedBase?.productId,
    staleTime: 60_000,
  });

  const visibleProducts = useMemo<BillerCard[]>(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (q) return allProducts.filter((b) => b.name.toLowerCase().includes(q) || (b.description ?? '').toLowerCase().includes(q));
    if (selectedCat) return allProducts.filter((b) => b.categoryKey === selectedCat.key);
    return allProducts;
  }, [allProducts, debouncedSearch, selectedCat]);

  const resetFocus = useCallback(() => { setFocusedIdx(0); scrollRef.current?.scrollTo({ top: 0 }); }, []);

  function goToProducts(cat: Cat) { setSelectedCat(cat); setStep('products'); resetFocus(); }

  function pickProduct(b: BillerCard) {
    // Navigate directly to checkout — ProductPaymentCheckout handles variant selection
    // when a specific productId is given (hasValidProductId = true on that page).
    onPick(b);
  }

  function openVariants(b: BillerCard) {
    setSelectedBase(b);
    setStep('variants');
    resetFocus();
  }

  function pickVariant(variant: Product) {
    if (!selectedBase) return;
    const name = String(variant.name ?? selectedBase.name ?? 'Product');
    const cat = variant.category as any;
    pickProduct({
      id:                    `p-${String(variant.id ?? selectedBase.productId)}`,
      productId:             Number(variant.id ?? selectedBase.productId),
      productCategoryId:     typeof cat?.id === 'number' ? cat.id : selectedBase.productCategoryId,
      name,
      description:           variant.description ?? selectedBase.description,
      categoryKey:           selectedBase.categoryKey,
      categoryLabel:         selectedBase.categoryLabel,
      currencyCode:          (variant as any).defaultCurrency?.code ?? selectedBase.currencyCode,
      minimumPurchaseAmount: Number((variant as any).minimumPurchaseAmount ?? selectedBase.minimumPurchaseAmount ?? 0) || undefined,
      isDonationCampaign:    selectedBase.isDonationCampaign,
    });
  }

  function goBack() {
    if (step === 'variants') {
      setSelectedBase(null);
      setStep('products');
      resetFocus();
      return;
    }
    if (searchInput) { setSearchInput(''); setSelectedCat(null); }
    setStep('categories');
    resetFocus();
  }

  function onSearch(v: string) {
    setSearchInput(v);
    if (v.trim()) { setSelectedCat(null); setStep('products'); }
    else if (step === 'products' && !selectedCat) setStep('categories');
    resetFocus();
  }

  const itemCount = step === 'categories'
    ? categories.length
    : step === 'products'
      ? visibleProducts.length
      : 0;

  useEffect(() => { setFocusedIdx(0); }, [step]);
  useEffect(() => { itemRefs.current[focusedIdx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [focusedIdx]);
  useEffect(() => { if (step !== 'variants') searchRef.current?.focus(); }, [step]);

  const breadcrumb = step === 'products'
    ? (searchInput ? `"${searchInput}"` : (selectedCat?.label ?? 'Products'))
    : step === 'variants'
      ? (selectedBase?.name ?? 'Plans')
      : null;

  const catColClass  = catCols  === 4 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-3 sm:grid-cols-3 lg:grid-cols-4';
  const itemColClass = itemCols === 3 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3';
  const cols = step === 'categories' ? catCols : itemCols;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (step === 'variants') {
      if (e.key === 'Escape') { e.preventDefault(); goBack(); }
      return;
    }
    if (itemCount === 0) return;
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); setFocusedIdx((i) => Math.min(i + 1, itemCount - 1)); break;
      case 'ArrowLeft':  e.preventDefault(); setFocusedIdx((i) => Math.max(i - 1, 0)); break;
      case 'ArrowDown':  e.preventDefault(); setFocusedIdx((i) => Math.min(i + cols, itemCount - 1)); break;
      case 'ArrowUp':    e.preventDefault(); setFocusedIdx((i) => Math.max(i - cols, 0)); break;
      case 'Home':       e.preventDefault(); setFocusedIdx(0); break;
      case 'End':        e.preventDefault(); setFocusedIdx(itemCount - 1); break;
      case 'Enter': e.preventDefault();
        if (step === 'categories') { const c = categories[focusedIdx]; if (c) goToProducts(c); }
        else if (step === 'products') { const p = visibleProducts[focusedIdx]; if (p) openVariants(p); }
        break;
      case 'Escape': e.preventDefault(); if (step !== 'categories') goBack(); break;
    }
  }

  return (
    <div className="flex flex-col h-full outline-none p-3" onKeyDown={handleKeyDown} tabIndex={-1} role="application" aria-label="Quick Pay service selector">
      {/* Fixed header */}
      <div className="shrink-0 space-y-2 pb-3">
        {step !== 'variants' && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchInput}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search services…"
            aria-label="Search services"
            className="w-full pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 transition-all shadow-sm"
          />
          {searchInput && (
            <button type="button" onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Clear search">
              <X size={13} />
            </button>
          )}
        </div>
        )}

        {step !== 'categories' && step !== 'variants' && (
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={goBack}
              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 transition-colors"
              aria-label="Back">
              <ArrowLeft size={13} />
            </button>
            <span className="text-xs font-semibold text-slate-600 truncate flex-1">{breadcrumb}</span>
            {step === 'products' && (
              <span className="text-[9px] text-slate-400 shrink-0">{visibleProducts.length}</span>
            )}
          </div>
        )}
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">

        {step === 'categories' && (
          <div className="space-y-2">
            {lastSel && (
              <button type="button" onClick={() => { const b = allProducts.find((x) => x.productId === lastSel.productId); if (b) openVariants(b); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors text-left">
                <div className="w-7 h-7 rounded-lg bg-emerald-200 flex items-center justify-center shrink-0">
                  <Clock size={13} className="text-emerald-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-0.5">Last used</p>
                  <p className="text-xs font-semibold text-slate-700 truncate">{lastSel.productName}</p>
                </div>
                <ChevronRight size={11} className="text-emerald-400 shrink-0" />
              </button>
            )}

            {isLoading ? (
              <div className={`grid ${catColClass} gap-4`}>
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl animate-pulse bg-slate-100 flex flex-col items-center justify-center gap-1.5 p-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-200" />
                    <div className="w-16 h-2 rounded bg-slate-200" />
                    <div className="w-8 h-1.5 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-300">
                <Zap size={22} /><p className="text-xs">No services available.</p>
              </div>
            ) : (
              <div className={`grid ${catColClass} gap-4`}>
                {categories.map((cat, i) => (
                  <CatCard key={cat.key} cat={cat} count={countByCategory[cat.key] ?? 0}
                    focused={focusedIdx === i} onClick={() => goToProducts(cat)}
                    itemRef={(el) => { itemRefs.current[i] = el; }} />
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'products' && (
          isLoading ? (
            <div className={`grid ${itemColClass} gap-4`}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl animate-pulse bg-slate-100 flex flex-col items-center justify-center gap-1.5 p-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-200" />
                  <div className="w-14 h-2 rounded bg-slate-200" />
                  <div className="w-8 h-1.5 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-slate-300">
              <Search size={22} /><p className="text-xs">No services found.</p>
            </div>
          ) : (
            <div className={`grid ${itemColClass} gap-4`}>
              {visibleProducts.map((b, i) => (
                <ProductCard
                  key={b.id}
                  biller={b}
                  glyph={
                    categoryGlyphByKey[b.categoryKey] ??
                    (b.productCategoryId != null ? categoryGlyphByKey[String(b.productCategoryId)] : undefined)
                  }
                  focused={focusedIdx === i}
                  onClick={() => openVariants(b)} itemRef={(el) => { itemRefs.current[i] = el; }} />
              ))}
            </div>
          )
        )}

        {step === 'variants' && selectedBase && (
          isVariantsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-300">
              <Zap size={22} />
              <p className="text-xs mt-2">Loading plans...</p>
            </div>
          ) : variants.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
              <p className="text-xs font-semibold text-slate-500">No plans found for this service.</p>
              <button
                type="button"
                onClick={() => pickProduct(selectedBase)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-emerald-500 transition-colors"
              >
                Continue with {selectedBase.name}
              </button>
            </div>
          ) : (
            <div className="px-1">
              <ProductVariantPicker
                categoryLabel={selectedBase.name}
                variants={variants}
                onSelect={pickVariant}
                onBack={goBack}
                currencyCode={selectedBase.currencyCode ?? 'USD'}
                compact={true}
              />
            </div>
          )
        )}

      </div>

      <p className="shrink-0 pt-1 text-[9px] text-slate-300 text-right hidden sm:block">↑↓ ←→ · Enter · Esc · Home · End</p>
    </div>
  );
}

// ─── Compact fixed-height widget (dashboard / hero) ───────────────────────────

export function QuickPay() {
  const navigate = useNavigate();

  function handlePick(b: BillerCard) {
    saveLast({ productId: b.productId, productName: b.name });
    const q = new URLSearchParams({ biller: b.name, productId: String(b.productId) });
    if (b.productCategoryId != null) q.set('productCategoryId', String(b.productCategoryId));
    navigate(`${ROUTE_PATHS.checkout}?${q.toString()}`);
  }

  return (
    <div className="h-[420px]">
      <QuickPaySelector onPick={handlePick} catCols={3} itemCols={2} />
    </div>
  );
}
