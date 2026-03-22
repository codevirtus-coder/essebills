import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowLeft, X, Zap, Clock, ChevronRight } from 'lucide-react';
import { getProducts, getProductCategories } from '../../../services/products.service';
import type { ProductCategory } from '../../../types/products';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../../router/paths';
import type { BillerCard } from '../../shared/components/ServicesMarketplace';

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY = 'esebills.quickpay.last';

const ICON_BG: Record<string, string> = {
  airtime:   'bg-blue-100 text-blue-600',
  internet:  'bg-violet-100 text-violet-600',
  education: 'bg-amber-100 text-amber-600',
  insurance: 'bg-rose-100 text-rose-600',
  fuel:      'bg-orange-100 text-orange-600',
  donations: 'bg-pink-100 text-pink-600',
  lottery:   'bg-purple-100 text-purple-600',
  utilities: 'bg-emerald-100 text-emerald-700',
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

type Step = 'categories' | 'products';
type Cat  = { key: string; label: string; emoji: string };

// ─── Flat card sub-components ─────────────────────────────────────────────────

/** Category grid tile — centred icon + label, flat, pale bg on focus */
function CatCard({ cat, count, focused, onClick, itemRef }: {
  cat: Cat; count: number; focused: boolean;
  onClick: () => void; itemRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={itemRef}
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl outline-none
        transition-all duration-150 active:scale-95 cursor-pointer hover:-translate-y-0.5
        ${focused ? 'bg-emerald-50 shadow-md shadow-emerald-100 ring-1 ring-emerald-200' : 'bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100'}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ICON_BG[colorKey(cat.label, cat.key)] ?? ICON_BG.utilities}`}>
        <span className="text-lg leading-none">{cat.emoji}</span>
      </div>
      <p className={`text-[10px] font-semibold text-center leading-tight line-clamp-2 w-full px-0.5 transition-colors ${focused ? 'text-emerald-700' : 'text-slate-600'}`}>
        {cat.label}
      </p>
      {count > 0 && <span className="text-[9px] text-slate-400">{count}</span>}
    </button>
  );
}

/** Product card — flat, pale emerald bg on focus/selected */
function ProductCard({ biller, focused, onClick, itemRef }: {
  biller: BillerCard; focused: boolean;
  onClick: () => void; itemRef?: React.Ref<HTMLButtonElement>;
}) {
  const ck = colorKey(biller.categoryLabel, biller.categoryKey);
  return (
    <button
      ref={itemRef}
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 p-3 rounded-xl text-left outline-none
        transition-all duration-150 active:scale-[0.98] cursor-pointer w-full hover:-translate-y-0.5
        ${focused ? 'bg-emerald-50 shadow-md shadow-emerald-100 ring-1 ring-emerald-200' : 'bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100'}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${ICON_BG[ck] ?? ICON_BG.utilities}`}>
        {catEmoji(biller.categoryLabel)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate leading-tight transition-colors ${focused ? 'text-emerald-800' : 'text-slate-700'}`}>
          {biller.name}
        </p>
        {biller.currencyCode && (
          <span className="text-[9px] font-bold text-slate-400">{biller.currencyCode}</span>
        )}
      </div>
      <ChevronRight size={12} className={`shrink-0 transition-colors ${focused ? 'text-emerald-400' : 'text-slate-300'}`} />
    </button>
  );
}

/** Variant card — flat, 2-col grid tile */
function VariantCard({ biller, focused, onClick, itemRef }: {
  biller: BillerCard; focused: boolean;
  onClick: () => void; itemRef?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={itemRef}
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-0.5 p-3 rounded-xl text-left outline-none
        transition-all duration-150 active:scale-[0.98] cursor-pointer w-full hover:-translate-y-0.5
        ${focused ? 'bg-emerald-50 shadow-md shadow-emerald-100 ring-1 ring-emerald-200' : 'bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100'}`}
    >
      <p className={`text-xs font-semibold line-clamp-2 leading-tight transition-colors ${focused ? 'text-emerald-800' : 'text-slate-700'}`}>
        {biller.name}
      </p>
      {biller.minimumPurchaseAmount != null && biller.minimumPurchaseAmount > 0 && (
        <p className="text-[10px] font-bold text-emerald-600">
          {biller.currencyCode ?? 'USD'} {biller.minimumPurchaseAmount.toFixed(2)}
        </p>
      )}
    </button>
  );
}

// ─── Shared data + logic hook ─────────────────────────────────────────────────

export function useQuickPayData() {
  const { data, isLoading } = useQuery({
    queryKey: ['quickpay-data'],
    queryFn: async () => {
      const [page, cats] = await Promise.all([getProducts({ size: 100 }), getProductCategories()]);
      return { products: page.content ?? [], categories: cats };
    },
    staleTime: 5 * 60 * 1000,
  });

  const categories = useMemo<Cat[]>(() => (
    (data?.categories ?? [] as ProductCategory[])
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((c) => ({
        key:   String(c.id ?? c.name ?? '').trim(),
        label: String(c.displayName ?? c.name ?? 'Category'),
        emoji: String(c.emoji ?? '').trim() || catEmoji(String(c.displayName ?? c.name ?? '')),
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
        return {
          id:                    `p-${p.id}`,
          productId:             p.id as number,
          productCategoryId:     typeof cat?.id === 'number' ? cat.id : undefined,
          name,
          description:           p.description ?? undefined,
          categoryKey:           String(cat?.id ?? cat?.name ?? ik),
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

  return { categories, allProducts, countByCategory, isLoading };
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

  const [step, setStep]           = useState<Step>('categories');
  const [search, setSearch]       = useState('');
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [focusedIdx, setFocusedIdx] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs  = useRef<(HTMLButtonElement | null)[]>([]);
  const lastSel   = useMemo(() => readLast(), []);

  const visibleProducts = useMemo<BillerCard[]>(() => {
    const q = search.trim().toLowerCase();
    if (q) return allProducts.filter((b) => b.name.toLowerCase().includes(q) || (b.description ?? '').toLowerCase().includes(q));
    if (selectedCat) return allProducts.filter((b) => b.categoryKey === selectedCat.key);
    return allProducts;
  }, [allProducts, search, selectedCat]);

  const resetFocus = useCallback(() => { setFocusedIdx(0); scrollRef.current?.scrollTo({ top: 0 }); }, []);

  function goToProducts(cat: Cat) { setSelectedCat(cat); setStep('products'); resetFocus(); }

  function pickProduct(b: BillerCard) {
    // Navigate directly to checkout — ProductPaymentCheckout handles variant selection
    // when a specific productId is given (hasValidProductId = true on that page).
    onPick(b);
  }

  function goBack() {
    if (step === 'variants') setStep('products');
    else if (step === 'products') { if (search) { setSearch(''); setSelectedCat(null); } setStep('categories'); }
    resetFocus();
  }

  function onSearch(v: string) {
    setSearch(v);
    if (v.trim()) { setSelectedCat(null); setStep('products'); }
    else if (step === 'products' && !selectedCat) setStep('categories');
    resetFocus();
  }

  const itemCount = step === 'categories' ? categories.length : visibleProducts.length;

  useEffect(() => { setFocusedIdx(0); }, [step]);
  useEffect(() => { itemRefs.current[focusedIdx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [focusedIdx]);
  useEffect(() => { searchRef.current?.focus(); }, [step]);

  const breadcrumb = step === 'products'
    ? (search ? `"${search}"` : (selectedCat?.label ?? 'Products'))
    : null;

  const catColClass  = catCols  === 4 ? 'grid-cols-4' : 'grid-cols-3';
  const itemColClass = itemCols === 3 ? 'grid-cols-3' : 'grid-cols-2';

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':  case 'ArrowRight': e.preventDefault(); setFocusedIdx((i) => Math.min(i + 1, itemCount - 1)); break;
      case 'ArrowUp':    case 'ArrowLeft':  e.preventDefault(); setFocusedIdx((i) => Math.max(i - 1, 0)); break;
      case 'Enter': e.preventDefault();
        if (step === 'categories') { const c = categories[focusedIdx]; if (c) goToProducts(c); }
        else if (step === 'products') { const p = visibleProducts[focusedIdx]; if (p) pickProduct(p); }
        break;
      case 'Escape': e.preventDefault(); if (step !== 'categories') goBack(); break;
    }
  }

  return (
    <div className="flex flex-col h-full outline-none" onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* Fixed header */}
      <div className="shrink-0 space-y-2 pb-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search services…"
            className="w-full pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 transition-all shadow-sm"
          />
          {search && (
            <button type="button" onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>

        {step !== 'categories' && (
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
              <button type="button" onClick={() => { const b = allProducts.find((x) => x.productId === lastSel.productId); if (b) onPick(b); }}
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
              <div className={`grid ${catColClass} gap-1.5`}>
                {Array(9).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                <Zap size={22} /><p className="text-xs">No services available.</p>
              </div>
            ) : (
              <div className={`grid ${catColClass} gap-1.5`}>
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
            <div className={`grid ${itemColClass} gap-1.5`}>
              {Array(6).fill(0).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
              <Search size={22} /><p className="text-xs">No services found.</p>
            </div>
          ) : (
            <div className={`grid ${itemColClass} gap-1.5`}>
              {visibleProducts.map((b, i) => (
                <ProductCard key={b.id} biller={b} focused={focusedIdx === i}
                  onClick={() => pickProduct(b)} itemRef={(el) => { itemRefs.current[i] = el; }} />
              ))}
            </div>
          )
        )}

      </div>

      <p className="shrink-0 pt-1 text-[10px] text-slate-300 text-right hidden sm:block">↑↓←→ · Enter · Esc</p>
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
