import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
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
  Building2,
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

// ─── Types ────────────────────────────────────────────────────────────────────

type BillerCard = {
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ServicesPage() {
  const navigate = useNavigate();

  // Raw search input (not debounced)
  const [search, setSearch]                     = useState('');
  // Debounced value used for API queries
  const [debouncedSearch, setDebouncedSearch]   = useState('');
  const [activeCategory, setActiveCategory]     = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState('');

  // Debounce search 300 ms — used for client-side filtering only, no API call
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ── Queries ────────────────────────────────────────────────────────────────

  // Fetch per category only — search is filtered client-side to avoid flicker
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['services-page-products', activeCategory],
    queryFn:  () => fetchData({ categoryId: activeCategory }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
  // True only on first load (no placeholder data yet)
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

  /** All active currencies from the API */
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
      // Currency filter: if product has no currency info, it matches everything
      const matchesCurrency = !selectedCurrency || !b.currencyCode || b.currencyCode === selectedCurrency;
      const matchesSearch   = !searchLower || b.name.toLowerCase().includes(searchLower) || (b.description ?? '').toLowerCase().includes(searchLower);
      return matchesCat && matchesCurrency && matchesSearch;
    });
  }, [billers, activeCategory, selectedCurrency, debouncedSearch]);

  const hasActiveFilters = !!selectedCurrency || !!debouncedSearch;

  const handlePay = (biller: BillerCard) => {
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero header ────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 pt-16 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <Link
            to={ROUTE_PATHS.home}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-all mb-10 group bg-white/5 px-4 py-1.5 rounded-full border border-white/10"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Services <span className="text-emerald-400">Marketplace</span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Quickly find and pay for utilities, airtime, fees, insurance, and more.
            All your bills in one secure place.
          </p>

          {/* Search bar */}
          <div className="relative max-w-3xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
            <div className="relative flex items-center bg-slate-800/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl">
              <Search size={20} className="ml-5 text-slate-400 pointer-events-none shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a biller, school, or service..."
                className="w-full pl-4 pr-4 py-5 bg-transparent text-white placeholder-slate-500 focus:outline-none text-base sm:text-lg"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="mr-4 text-slate-500 hover:text-white transition-colors shrink-0"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Currency switcher */}
          {availableCurrencies.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                <DollarSign size={12} />
                Currency:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCurrency('')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  !selectedCurrency
                    ? 'bg-white text-slate-900 border-white'
                    : 'border-white/20 text-slate-400 hover:text-white hover:border-white/40'
                }`}
              >
                All
              </button>
              {availableCurrencies.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCurrency(selectedCurrency === c.code ? '' : c.code)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    selectedCurrency === c.code
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'border-white/20 text-slate-400 hover:text-white hover:border-white/40'
                  }`}
                >
                  {c.code}
                  {c.name !== c.code && (
                    <span className="ml-1 opacity-70 hidden sm:inline">· {c.name}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Category tabs ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        {/* Thin progress bar when re-fetching (category switch) */}
        {isFetching && !isInitialLoading && (
          <div className="absolute top-0 left-0 h-0.5 bg-emerald-500 animate-pulse w-full" />
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-4 items-center">
            {isInitialLoading ? (
              <div className="flex gap-3 py-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-10 w-28 bg-slate-100 rounded-xl animate-pulse shrink-0" />
                ))}
              </div>
            ) : (
              categoryTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 border-2 active:scale-95 ${
                    activeCategory === tab.key
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200'
                      : 'border-slate-100 text-slate-500 hover:text-slate-800 hover:border-slate-300 bg-white'
                  }`}
                >
                  {tab.key !== 'all' && (
                    <span className={activeCategory === tab.key ? 'text-emerald-400' : 'text-slate-400'}>
                      <CategoryIcon label={tab.label} className="w-4 h-4" />
                    </span>
                  )}
                  {tab.label}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Products grid ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Active filters + result count */}
        {!isInitialLoading && !isError && (
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">
                {activeCategory === 'all'
                  ? 'All Available Services'
                  : categoryTabs.find((t) => t.key === activeCategory)?.label ?? 'Services'}
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X size={12} />
                  Clear filters
                </button>
              )}
            </div>
            <p className="text-sm text-slate-400 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              {filtered.length === 0
                ? 'No services'
                : `${filtered.length} service${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}

        {/* Loading skeleton — only on first load */}
        {isInitialLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 p-5 animate-pulse bg-slate-50/50">
                <div className="w-12 h-12 bg-slate-100 rounded-xl mb-4" />
                <div className="h-4 bg-slate-100 rounded-full mb-2 w-3/4" />
                <div className="h-3 bg-slate-100 rounded-full w-1/2 mb-5" />
                <div className="h-9 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-rose-50 rounded-3xl border border-rose-100">
            <AlertCircle size={44} className="text-rose-400 mb-4" />
            <p className="text-rose-900 font-bold text-lg mb-1">Could not load services</p>
            <p className="text-rose-600/70 text-sm max-w-xs mx-auto">Please check your connection and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 px-6 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isInitialLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-5">
              <Search size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-800 font-bold text-lg mb-1">No services found</p>
            <p className="text-slate-500 text-sm mb-6">
              {debouncedSearch ? `No results for "${debouncedSearch}".` : 'Try a different category or currency filter.'}
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Service cards */}
        {!isInitialLoading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filtered.map((biller) => {
              const color = getColor(biller.categoryKey);
              return (
                <div
                  key={biller.id}
                  className="group relative flex flex-col rounded-2xl border border-slate-100 bg-white p-5 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => handlePay(biller)}
                >
                  {/* Hover glow */}
                  <div className={`absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${color.bg}`} />

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${color.bg}`}>
                    <CategoryIcon label={biller.categoryLabel} className={`w-6 h-6 ${color.icon}`} />
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-extrabold text-slate-800 leading-tight line-clamp-2 mb-1 flex-1 group-hover:text-emerald-700 transition-colors">
                    {biller.name}
                  </h3>

                  {/* Category + currency */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">
                      {biller.categoryLabel}
                    </p>
                    {biller.currencyCode && (
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        {biller.currencyCode}
                      </span>
                    )}
                  </div>

                  {/* CTA button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handlePay(biller); }}
                    className="mt-auto w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold bg-slate-50 text-slate-700 border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-300"
                  >
                    Pay Bill
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative rounded-3xl bg-slate-900 px-8 py-12 md:px-16 md:py-14 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
          />
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <Building2 size={12} />
                For Billers &amp; Businesses
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Don't see your biller?</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                We're constantly onboarding new services. If you're a biller looking to reach
                thousands of customers, join our ecosystem today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to={ROUTE_PATHS.registerBiller}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors whitespace-nowrap"
              >
                Register as Biller
                <ChevronRight size={15} />
              </Link>
              <Link
                to={ROUTE_PATHS.register}
                className="inline-flex items-center justify-center bg-white/10 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/20 whitespace-nowrap"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
