import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Zap,
  Smartphone,
  Wifi,
  BookOpen,
  ShieldCheck,
  Droplets,
  Heart,
  Sparkles,
  ChevronRight,
  AlertCircle,
  DollarSign,
  X,
} from 'lucide-react';
import { ROUTE_PATHS } from '../../../router/paths';
import { getProducts, getProductCategories, getProductsByCategory, getCurrencies } from '../../../services/products.service';
import type { Product, ProductCategory, Currency } from '../../../types/products';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inferCategory(name: string, code: string): { key: string; label: string } {
  const v = `${name} ${code}`.toLowerCase();
  if (/(airtime|recharge|evd|topup)/.test(v)) return { key: 'airtime',   label: 'Airtime' };
  if (/(bundle|data)/.test(v))                return { key: 'internet',  label: 'Internet' };
  if (/(school|tuition|fees|university|college|education)/.test(v)) return { key: 'education', label: 'Education' };
  if (/(insurance|life|medical|health)/.test(v)) return { key: 'insurance', label: 'Insurance' };
  if (/(fuel|petrol|diesel|gas)/.test(v))     return { key: 'fuel',      label: 'Fuel' };
  if (/(donat)/.test(v))                       return { key: 'donations', label: 'Donations' };
  if (/(lottery|loto|jackpot)/.test(v))        return { key: 'lottery',   label: 'Lottery' };
  return { key: 'utilities', label: 'Utilities' };
}

function CategoryIcon({ label, className = 'w-5 h-5' }: { label: string; className?: string }) {
  switch (label.toLowerCase()) {
    case 'airtime':   return <Smartphone className={className} />;
    case 'internet':  return <Wifi className={className} />;
    case 'education': return <BookOpen className={className} />;
    case 'insurance': return <ShieldCheck className={className} />;
    case 'fuel':      return <Droplets className={className} />;
    case 'donations': return <Heart className={className} />;
    case 'lottery':   return <Sparkles className={className} />;
    default:          return <Zap className={className} />;
  }
}

const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  airtime:   { bg: 'bg-blue-50',    icon: 'text-blue-500' },
  internet:  { bg: 'bg-violet-50',  icon: 'text-violet-500' },
  education: { bg: 'bg-amber-50',   icon: 'text-amber-500' },
  insurance: { bg: 'bg-rose-50',    icon: 'text-rose-500' },
  fuel:      { bg: 'bg-orange-50',  icon: 'text-orange-500' },
  donations: { bg: 'bg-pink-50',    icon: 'text-pink-500' },
  lottery:   { bg: 'bg-purple-50',  icon: 'text-purple-500' },
  utilities: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
};

function getColor(key: string) {
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.utilities;
}

async function fetchData(params: { search?: string; categoryId?: string }): Promise<{ products: Product[]; categories: ProductCategory[] }> {
  const [productsPage, categories] = await Promise.all([
    params.categoryId && params.categoryId !== 'all'
      ? getProductsByCategory(params.categoryId, { size: 100, search: params.search })
      : getProducts({ size: 100, search: params.search }),
    getProductCategories(),
  ]);
  return {
    products: Array.isArray(productsPage?.content) ? productsPage.content : [],
    categories: Array.isArray(categories) ? categories : [],
  };
}

export type BillerCard = {
  id: string;
  productId: number;
  productCategoryId?: number;
  name: string;
  description?: string;
  categoryKey: string;
  categoryLabel: string;
  currencyCode?: string;
  currencyName?: string;
  minimumPurchaseAmount?: number;
};

type CategoryTab = { key: string; label: string };

interface ServicesMarketplaceProps {
  embedded?: boolean;
  onSelectProduct?: (product: BillerCard) => void;
}

export function ServicesMarketplace({ embedded = false, onSelectProduct }: ServicesMarketplaceProps) {
  const navigate = useNavigate();

  // Raw search input (not debounced)
  const [search, setSearch]                     = useState('');
  // Debounced value used for API queries
  const [debouncedSearch, setDebouncedSearch]   = useState('');
  const [activeCategory, setActiveCategory]     = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState('');

  // Debounce search 300 ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['services-marketplace-products', activeCategory],
    queryFn:  () => fetchData({ categoryId: activeCategory }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
  
  const isInitialLoading = isLoading && !data;

  const { data: currenciesData } = useQuery({
    queryKey: ['currencies', 'all'],
    queryFn:  getCurrencies,
    staleTime: 60 * 60 * 1000,
  });

  // ── Derived state ──────────────────────────────────────────────────────────

  const categoryTabs: CategoryTab[] = useMemo(() => {
    const fromApi = (data?.categories ?? [])
      .filter((c) => c.active !== false)
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((c) => ({
        key:   String(c.id ?? c.name ?? '').trim(),
        label: String(c.displayName ?? c.name ?? 'Category'),
      }))
      .filter((c) => c.key.length > 0);
    return [{ key: 'all', label: 'All Services' }, ...fromApi];
  }, [data?.categories]);

  const billers: BillerCard[] = useMemo(() =>
    (data?.products ?? [])
      .filter((p): p is Product & { id: number } => p.status === 'ACTIVE' && !p.deleted && typeof p.id === 'number')
      .map((p) => {
        const name    = String(p.name ?? 'Unnamed');
        const code    = String(p.code ?? '');
        const inferred = inferCategory(name, code);
        const cat      = p.category;
        return {
          id:                    `p-${String(p.id)}`,
          productId:             p.id,
          productCategoryId:     typeof cat?.id === 'number' ? cat.id : undefined,
          name,
          description:           p.description ?? undefined,
          categoryKey:           String(cat?.id ?? cat?.name ?? inferred.key),
          categoryLabel:         String(cat?.displayName ?? cat?.name ?? inferred.label),
          currencyCode:          p.defaultCurrency?.code ?? undefined,
          currencyName:          p.defaultCurrency?.name ?? p.defaultCurrency?.code ?? undefined,
          minimumPurchaseAmount: Number(p.minimumPurchaseAmount ?? 0) || undefined,
        };
      }),
  [data?.products]);

  const availableCurrencies = useMemo<Array<{ code: string; name: string }>>(() => {
    const raw = currenciesData as { content?: Currency[] } | Currency[] | undefined;
    const list: Currency[] = Array.isArray(raw) ? raw : (raw as { content?: Currency[] })?.content ?? [];
    return list
      .filter((c) => c.code && c.active !== false)
      .map((c) => ({ code: c.code!, name: c.name ?? c.code! }));
  }, [currenciesData]);

  const filtered = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    return billers.filter((b) => {
      const matchesCat      = activeCategory === 'all' || b.categoryKey === activeCategory;
      const matchesCurrency = !selectedCurrency || !b.currencyCode || b.currencyCode === selectedCurrency;
      const matchesSearch   = !searchLower || b.name.toLowerCase().includes(searchLower) || (b.description ?? '').toLowerCase().includes(searchLower);
      return matchesCat && matchesCurrency && matchesSearch;
    });
  }, [billers, activeCategory, selectedCurrency, debouncedSearch]);

  const hasActiveFilters = !!selectedCurrency || !!debouncedSearch;

  const handlePay = (biller: BillerCard) => {
    if (onSelectProduct) {
      onSelectProduct(biller);
      return;
    }
    const query = new URLSearchParams({
      biller:    biller.name,
      account:   '',
      amount:    '0',
      productId: String(biller.productId),
    });
    if (biller.productCategoryId !== undefined) {
      query.set('productCategoryId', String(biller.productCategoryId));
    }
    navigate(`${ROUTE_PATHS.checkout}?${query.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setActiveCategory('all');
    setSelectedCurrency('');
  };

  return (
    <div className={`space-y-8 ${embedded ? '' : 'min-h-screen bg-white'}`}>
      {/* Search & Currency Section */}
      <div className={`${embedded ? 'p-0' : 'bg-slate-900 pt-16 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden'}`}>
        {!embedded && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        )}

        <div className={`mx-auto relative z-10 ${embedded ? '' : 'max-w-5xl text-center'}`}>
          {!embedded && (
             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
               Services <span className="text-emerald-400">Marketplace</span>
             </h1>
          )}
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className={`relative flex-1 group ${embedded ? 'w-full' : 'max-w-3xl mx-auto'}`}>
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-10 group-hover:opacity-25 transition-opacity" />
              <div className={`relative flex items-center border rounded-2xl shadow-sm backdrop-blur-xl transition-all ${embedded ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800' : 'bg-slate-800/80 border-white/10'}`}>
                <Search size={18} className={`ml-4 ${embedded ? 'text-slate-400' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for a biller, school, or service..."
                  className={`w-full pl-3 pr-4 py-4 bg-transparent focus:outline-none text-sm font-medium ${embedded ? 'text-slate-900 dark:text-white placeholder-slate-400' : 'text-white placeholder-slate-500'}`}
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="mr-4 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {availableCurrencies.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <DollarSign size={10} /> Currency:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    !selectedCurrency
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  ALL
                </button>
                {availableCurrencies.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCurrency(selectedCurrency === c.code ? '' : c.code)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                      selectedCurrency === c.code
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className={`sticky ${embedded ? 'top-[-2rem]' : 'top-0'} z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 -mx-4 px-4`}>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-4 items-center">
          {isInitialLoading ? (
            <div className="flex gap-3 py-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse shrink-0" />
              ))}
            </div>
          ) : (
            categoryTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`inline-flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 border-2 active:scale-95 ${
                  activeCategory === tab.key
                    ? 'bg-slate-900 dark:bg-slate-700 border-slate-900 dark:border-slate-700 text-white shadow-lg'
                    : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                }`}
              >
                {tab.key !== 'all' && (
                  <span className={activeCategory === tab.key ? 'text-emerald-400' : 'text-slate-400'}>
                    <CategoryIcon label={tab.label} className="w-3.5 h-3.5" />
                  </span>
                )}
                {tab.label}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        {!isInitialLoading && !isError && (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeCategory === 'all'
                ? 'All Services'
                : categoryTabs.find((t) => t.key === activeCategory)?.label ?? 'Services'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">
              {filtered.length} Results
            </p>
          </div>
        )}

        {isInitialLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse bg-slate-50/50 dark:bg-slate-900/50">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-2 w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2 mb-5" />
                <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-800/50">
            <AlertCircle size={40} className="text-red-400 mb-4" />
            <p className="text-red-900 dark:text-red-400 font-bold">Could not load services</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 border-dashed">
            <Search size={32} className="text-slate-300 mb-4" />
            <p className="text-slate-800 dark:text-slate-200 font-bold">No services found</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-4 text-emerald-600 font-bold text-xs uppercase tracking-widest hover:underline">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filtered.map((biller) => {
              const color = getColor(biller.categoryKey);
              return (
                <div
                  key={biller.id}
                  className="group relative flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => handlePay(biller)}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${color.bg} dark:bg-opacity-10`}>
                    <CategoryIcon label={biller.categoryLabel} className={`w-6 h-6 ${color.icon}`} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 mb-1 flex-1 group-hover:text-emerald-600 transition-colors">
                    {biller.name}
                  </h3>

                  <div className="flex items-center justify-between mb-4 flex-wrap gap-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {biller.categoryLabel}
                    </p>
                    {biller.currencyCode && (
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800/50">
                        {biller.currencyCode}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handlePay(biller); }}
                    className="mt-auto w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-300 uppercase tracking-widest"
                  >
                    Pay Now
                    <ChevronRight size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
