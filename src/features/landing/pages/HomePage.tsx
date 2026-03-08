import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Zap,
  ShieldCheck,
  Headphones,
  CreditCard,
  BarChart3,
  Users,
  Store,
  Building2,
  ChevronRight,
  CheckCircle2,
  Smartphone,
  Wifi,
  BookOpen,
  Droplets,
  Heart,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ChatbotWidget } from '../components/ChatbotWidget';
import bg1 from '../../../assets/bg1.jpg';
import bg2 from '../../../assets/bg2.jpg';
import { ROUTE_PATHS } from '../../../router/paths';
import { getProducts, getProductCategories, getProductsByCategory } from '../../../services/products.service';
import type { Product, ProductCategory } from '../../../types/products';

// ─── Services helpers ──────────────────────────────────────────────────────────

type FormField = {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  prefix?: string;
};

type BillerItem = {
  id: string;
  productId: number;
  productCategoryId?: number;
  name: string;
  categoryKey: string;
  categoryLabel: string;
  fields: FormField[];
  minimumPurchaseAmount?: number;
};

type CategoryTab = {
  key: string;
  label: string;
};

function categoryIcon(label: string, cls = 'w-4 h-4') {
  switch (label.toLowerCase()) {
    case 'airtime':    return <Smartphone className={cls} />;
    case 'internet':   return <Wifi className={cls} />;
    case 'education':  return <BookOpen className={cls} />;
    case 'insurance':  return <ShieldCheck className={cls} />;
    case 'fuel':       return <Droplets className={cls} />;
    case 'donations':  return <Heart className={cls} />;
    case 'lottery':    return <Sparkles className={cls} />;
    default:           return <Zap className={cls} />;
  }
}

function inferCategory(name: string, code: string): { key: string; label: string } {
  const v = `${name} ${code}`.toLowerCase();
  if (/(airtime|recharge|evd|topup)/.test(v))                         return { key: 'airtime',    label: 'Airtime'    };
  if (/(bundle|data)/.test(v))                                         return { key: 'internet',   label: 'Internet'   };
  if (/(school|tuition|fees|university|college|education)/.test(v))   return { key: 'education',  label: 'Education'  };
  if (/(insurance|life|medical|health)/.test(v))                       return { key: 'insurance',  label: 'Insurance'  };
  if (/(fuel|petrol|diesel|gas)/.test(v))                              return { key: 'fuel',       label: 'Fuel'       };
  if (/(donat)/.test(v))                                               return { key: 'donations',  label: 'Donations'  };
  if (/(lottery|loto|jackpot)/.test(v))                                return { key: 'lottery',    label: 'Lottery'    };
  return { key: 'utilities', label: 'Utilities' };
}

const DEFAULT_FIELDS: FormField[] = [
  { key: 'accountNumber', label: 'Account Number',  placeholder: 'Enter account number' },
  { key: 'mobileNumber',  label: 'Mobile Number',   placeholder: '77*******',            type: 'tel' },
  { key: 'amount',        label: 'Amount',          placeholder: '0.00',                 type: 'number', prefix: '$' },
];

function fieldsByProduct(name: string, category: string): FormField[] {
  const n = name.toLowerCase();
  if (/(zesa|token|electric)/.test(n)) return [
    { key: 'accountNumber', label: 'Meter Number',   placeholder: 'Enter meter number' },
    { key: 'mobileNumber',  label: 'Mobile Number',  placeholder: '77*******',          type: 'tel' },
    { key: 'amount',        label: 'Amount',         placeholder: '0.00',               type: 'number', prefix: '$' },
  ];
  if (/(airtime|bundle|data)/.test(n) || category === 'Airtime') return [
    { key: 'mobileNumber', label: 'Mobile Number', placeholder: '77*******', type: 'tel' },
    { key: 'amount',       label: 'Amount',        placeholder: '0.00',      type: 'number', prefix: '$' },
  ];
  if (/(dstv|gotv|tv)/.test(n)) return [
    { key: 'accountNumber', label: 'Smart Card Number', placeholder: 'Enter smart card number' },
    { key: 'mobileNumber',  label: 'Mobile Number',     placeholder: '77*******',               type: 'tel' },
    { key: 'amount',        label: 'Amount',            placeholder: '0.00',                    type: 'number', prefix: '$' },
  ];
  if (category === 'Education') return [
    { key: 'accountNumber', label: 'Student Number', placeholder: 'Enter student number' },
    { key: 'mobileNumber',  label: 'Mobile Number',  placeholder: '77*******',             type: 'tel' },
    { key: 'amount',        label: 'Amount',         placeholder: '0.00',                  type: 'number', prefix: '$' },
  ];
  if (category === 'Insurance') return [
    { key: 'accountNumber', label: 'Policy Number', placeholder: 'Enter policy number' },
    { key: 'mobileNumber',  label: 'Mobile Number', placeholder: '77*******',            type: 'tel' },
    { key: 'amount',        label: 'Amount',        placeholder: '0.00',                 type: 'number', prefix: '$' },
  ];
  return DEFAULT_FIELDS;
}

async function fetchProductsAndCategories(categoryId?: string) {
  const [productsPage, categories] = await Promise.all([
    categoryId
      ? getProductsByCategory(categoryId, { size: 50 })
      : getProducts({ size: 50 }),
    getProductCategories(),
  ]);
  return {
    products: Array.isArray(productsPage?.content) ? productsPage.content : [] as Product[],
    categories: Array.isArray(categories) ? categories : [] as ProductCategory[],
  };
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  return (
    <section ref={ref} className="relative h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 scale-110"
        style={{ backgroundImage: `url(${bg2})`, backgroundSize: 'cover', backgroundPosition: 'center top', y: bgY }}
      />
      {/* Layered overlays — lighter to show photo, darker at bottom */}
      <div className="absolute inset-0 bg-slate-950/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-950/95" />
      {/* Ambient glows */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div style={{ y: contentY }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6 w-full text-center lg:text-left">
        <div className="max-w-4xl mx-auto lg:mx-0">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold px-5 py-2 rounded-full mb-5 uppercase tracking-widest backdrop-blur-sm"
          >
            <Zap size={14} />
            Fast &amp; Secure Digital Payments
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[0.93] tracking-tighter mb-5"
          >
            Pay any bill.<br />
            <span className="text-emerald-400">Instantly.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed mb-7 max-w-2xl mx-auto lg:mx-0"
          >
            Say goodbye to long queues and late fees. Pay utility, mobile, education,
            and insurance bills instantly from anywhere, anytime.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <a
              href="#pay-now"
              className="group inline-flex items-center justify-center gap-2 bg-emerald-500 text-white font-extrabold text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 rounded-2xl hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-900/40 hover:-translate-y-1 active:translate-y-0"
            >
              Pay a Bill Now
              <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <Link
              to={ROUTE_PATHS.login}
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 rounded-2xl border border-white/25 hover:bg-white/20 hover:border-white/40 transition-all backdrop-blur-sm"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 sm:mt-10 flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-3"
          >
            {[
              { icon: CheckCircle2, label: 'Instant processing' },
              { icon: ShieldCheck, label: 'Bank-level security' },
              { icon: Headphones, label: '24/7 support' },
              { icon: Sparkles, label: 'Zero hidden fees' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-slate-300 text-sm font-medium">
                <Icon size={16} className="text-emerald-400 shrink-0" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        onClick={() => document.getElementById('pay-now')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-white/50 hover:text-white/90 text-xs font-medium tracking-[0.25em] uppercase transition-colors z-20 group"
        aria-label="Scroll to services"
      >
        <span>Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent group-hover:h-14 transition-all duration-500" />
      </motion.button>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────

function Services() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedId, setSelectedId] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-products-categories', activeCategory],
    queryFn: () => fetchProductsAndCategories(activeCategory === 'all' ? undefined : activeCategory),
    staleTime: 5 * 60 * 1000,
  });

  // Build category tabs — from API, then inferred from products, then fallback.
  const categoryTabs: CategoryTab[] = useMemo(() => {
    const fromApi = (data?.categories ?? [])
      .filter((c) => c.active !== false)
      .map((c) => ({
        key: String(c.id ?? c.name ?? '').trim(),
        label: String(c.displayName ?? c.name ?? 'Category'),
      }))
      .filter((c) => c.key.length > 0);

    if (fromApi.length > 0) {
      return [{ key: 'all', label: 'All Services' }, ...fromApi];
    }

    const seen = new Set<string>();
    const fromProducts = (data?.products ?? [])
      .filter((p) => p.status === 'ACTIVE' && !p.deleted)
      .map((p) => {
        const name = String(p.name ?? 'Unnamed');
        const code = String(p.code ?? '');
        const inferred = inferCategory(name, code);
        const cat = p.category;
        const key = String(cat?.id ?? cat?.name ?? inferred.key).trim();
        const label = String(cat?.displayName ?? cat?.name ?? inferred.label);
        return { key, label };
      })
      .filter((c) => c.key.length > 0)
      .filter((c) => {
        if (seen.has(c.key)) return false;
        seen.add(c.key);
        return true;
      });

    const base = fromProducts.length > 0 ? fromProducts : [{ key: 'utilities', label: 'Utilities' }];
    return [{ key: 'all', label: 'All Services' }, ...base];
  }, [data?.categories, data?.products]);

  // Build biller items from active products
  const billers: BillerItem[] = useMemo(() =>
    (data?.products ?? [])
      .flatMap((p) => {
        if (p.status !== 'ACTIVE' || p.deleted || typeof p.id !== 'number') {
          return [];
        }

        const name = String(p.name ?? 'Unnamed');
        const code = String(p.code ?? '');
        const inferred = inferCategory(name, code);
        const cat = p.category;
        const productCategoryId = typeof cat?.id === 'number' ? cat.id : undefined;
        const categoryKey   = String(cat?.id ?? cat?.name ?? inferred.key);
        const categoryLabel = String(cat?.displayName ?? cat?.name ?? inferred.label);
        return [{
          id: `p-${String(p.id)}`,
          productId: p.id,
          productCategoryId,
          name,
          categoryKey,
          categoryLabel,
          fields: fieldsByProduct(name, categoryLabel),
          minimumPurchaseAmount: Number(p.minimumPurchaseAmount ?? 0),
        }];
      }),
  [data?.products]);

  const filtered = useMemo(
    () => activeCategory === 'all' ? billers : billers.filter((b) => b.categoryKey === activeCategory),
    [billers, activeCategory],
  );

  const selected = useMemo(
    () => filtered.find((b) => b.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId],
  );

  // Sync selected biller when category changes
  useEffect(() => {
    if (!filtered.length) { setSelectedId(''); return; }
    if (!filtered.some((b) => b.id === selectedId)) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  // Sync form values when selected biller changes
  useEffect(() => {
    if (!selected) return;
    const next: Record<string, string> = {};
    selected.fields.forEach((f) => {
      if (f.key === 'amount' && selected.minimumPurchaseAmount && selected.minimumPurchaseAmount > 0) {
        next[f.key] = String(selected.minimumPurchaseAmount);
      } else {
        next[f.key] = formValues[f.key] ?? '';
      }
    });
    setFormValues(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const handleContinue = () => {
    if (!selected) return;
    const account = formValues.accountNumber || formValues.mobileNumber || '';
    const query = new URLSearchParams({
      biller:  selected.name,
      account,
      amount:  formValues.amount || '0',
      productId: String(selected.productId),
    });
    if (selected.productCategoryId !== undefined) {
      query.set('productCategoryId', String(selected.productCategoryId));
    }
    window.location.assign(`${ROUTE_PATHS.checkout}?${query.toString()}`);
  };

  return (
    <section id="pay-now" className="bg-slate-50/50 py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-emerald-600 text-sm font-black uppercase tracking-[0.2em] mb-4">
              Direct Payments
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
              Select a biller to <span className="text-emerald-600">pay now</span>
            </h2>
          </div>
          <Link
            to={ROUTE_PATHS.services}
            className="inline-flex items-center gap-2 text-base font-bold text-emerald-600 hover:text-emerald-700 transition-all hover:translate-x-1"
          >
            Explore all services
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
          {/* Category tabs */}
          <div className="flex gap-3 overflow-x-auto px-8 py-6 bg-slate-50/30 border-b border-slate-100 scrollbar-hide min-h-[84px] items-center">
            {isLoading ? (
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 w-32 bg-slate-200 rounded-2xl animate-pulse shrink-0" />
                ))}
              </div>
            ) : (
              categoryTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`group inline-flex items-center gap-3 whitespace-nowrap px-8 py-3.5 rounded-[1.25rem] text-sm font-black transition-all shrink-0 border-2 active:scale-95 hover:-translate-y-0.5 ${
                    activeCategory === tab.key
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                  }`}
                >
                  {tab.key !== 'all' && (
                    <div className={`transition-colors ${activeCategory === tab.key ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {categoryIcon(tab.label, 'w-5 h-5')}
                    </div>
                  )}
                  {tab.label}
                </button>
              ))
            )}
          </div>

          {/* Content: biller grid + form */}
          <div className="grid lg:grid-cols-[1fr_380px]">
            {/* Biller cards */}
            <div className="p-8 lg:border-r border-slate-100 bg-white min-h-[360px]">
              {isLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="h-28 bg-slate-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              )}

              {isError && (
                <div className="py-20 text-center">
                  <p className="text-slate-400 font-bold">Could not load products. Please try again later.</p>
                </div>
              )}

              {!isLoading && !isError && filtered.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-slate-400 font-bold">No active products in this category.</p>
                </div>
              )}

              {!isLoading && filtered.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filtered.map((biller) => {
                    const isActive = selected?.id === biller.id;
                    return (
                      <button
                        key={biller.id}
                        onClick={() => setSelectedId(biller.id)}
                        className={`group flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all duration-300 ${
                          isActive
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-xl shadow-emerald-500/10'
                            : 'border-slate-50 bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isActive ? 'bg-emerald-500 text-white scale-110 rotate-3' : 'bg-white text-slate-400 group-hover:text-emerald-500'
                        } shadow-sm`}>
                          {categoryIcon(biller.categoryLabel, 'w-7 h-7')}
                        </div>
                        <span className={`text-sm font-bold leading-tight line-clamp-2 ${
                          isActive ? 'text-emerald-900' : 'text-slate-600'
                        }`}>
                          {biller.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment form */}
            <div className="p-8 bg-slate-50/30">
              {!selected ? (
                <div className="h-full flex flex-col items-center justify-center py-10 text-slate-400 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Zap size={24} className="text-slate-200" />
                  </div>
                  <p className="text-sm font-bold">Select a biller to<br />see payment details</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <span className="inline-block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">
                      Paying to
                    </span>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                      {selected.name}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {selected.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                          {field.label}
                        </label>
                        {field.prefix ? (
                          <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                              {field.prefix}
                            </span>
                            <input
                              type={field.type ?? 'text'}
                              placeholder={field.placeholder}
                              value={formValues[field.key] ?? ''}
                              onChange={(e) =>
                                setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                              }
                              className="block w-full pl-8 pr-4 py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold transition-all bg-white shadow-sm"
                            />
                          </div>
                        ) : (
                          <input
                            type={field.type ?? 'text'}
                            placeholder={field.placeholder}
                            value={formValues[field.key] ?? ''}
                            onChange={(e) =>
                              setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            className="block w-full px-4 py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold transition-all bg-white shadow-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!selected}
                    className="w-full flex justify-center items-center gap-3 py-5 px-6 rounded-2xl text-base font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1 mt-4"
                  >
                    Continue to Payment
                    <ArrowRight size={20} />
                  </button>

                  <div className="flex items-center gap-2 justify-center text-xs text-slate-400 font-medium">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Secure checkout via EseBills
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function Overview() {
  const cards = [
    {
      icon: Zap,
      title: 'Instant Settlement',
      desc: 'Payments processed in real-time. Instant validation and confirmation on every transaction.',
      stat: '< 3s',
      statLabel: 'avg. settlement',
    },
    {
      icon: ShieldCheck,
      title: 'Bank-level Security',
      desc: 'Your transactions are encrypted end-to-end with OTP verification on every login.',
      stat: '256-bit',
      statLabel: 'encryption',
    },
    {
      icon: Users,
      title: 'Built for Everyone',
      desc: 'Customers, agents, and billers — one unified platform for the full payment ecosystem.',
      stat: '3',
      statLabel: 'user types',
    },
  ];

  return (
    <section id="overview" className="bg-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-2xl mb-12 sm:mb-20"
        >
          <p className="text-emerald-600 text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-3">
            The Platform
          </p>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
            One platform.<br />Pay anything.
          </h2>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
            EseBills connects customers, agents, and businesses on a single payment platform —
            eliminating queues, delays, and cash handling.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {cards.map(({ icon: Icon, title, desc, stat, statLabel }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.1 }}
              className="group relative p-7 sm:p-8 rounded-3xl border border-slate-100 hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 pr-6 pt-5 text-right">
                <p className="text-2xl font-black text-slate-100 group-hover:text-emerald-100 transition-colors">{stat}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 group-hover:text-emerald-200 transition-colors">{statLabel}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5 group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300">
                <Icon size={22} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Who It's For ─────────────────────────────────────────────────────────────

function ForWho() {
  const audiences = [
    {
      icon: Users,
      title: 'Customers',
      tag: 'Personal',
      featured: true,
      description:
        'Pay your utility, mobile, education, and insurance bills instantly from one secure dashboard.',
      perks: ['Electricity & water bills', 'Airtime & data bundles', 'School & university fees', 'Full payment history'],
      cta: 'Create Free Account',
      href: ROUTE_PATHS.registerBuyer,
      loginHref: ROUTE_PATHS.login,
      loginLabel: 'Already a customer? Sign in',
    },
    {
      icon: Store,
      title: 'EseAgents & Corporates',
      tag: 'Business & Scale',
      featured: false,
      description:
        'Join our agency network or manage company payouts. Execute bulk payments for employees and recurring bills.',
      perks: ['Bulk & Recurring Payments', 'Competitive commissions', 'Float management', 'Real-time reports'],
      cta: 'Join the Network',
      href: ROUTE_PATHS.registerAgent,
      loginHref: ROUTE_PATHS.loginAgent,
      loginLabel: 'Business login',
    },
    {
      icon: Building2,
      title: 'Billers',
      tag: 'Corporate',
      featured: false,
      description:
        'Digitize your collections. Reach more customers and receive real-time settlements.',
      perks: ['Digital collection portal', 'Real-time settlements', 'Reconciliation reports', 'API integration'],
      cta: 'Register as Biller',
      href: ROUTE_PATHS.registerBiller,
      loginHref: ROUTE_PATHS.loginBiller,
      loginLabel: 'Biller login',
    },
  ];

  return (
    <section id="audience" className="bg-slate-50/60 py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-2xl mb-12 sm:mb-16"
        >
          <p className="text-emerald-600 text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-3">
            Who It's For
          </p>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            Built for the full<br />payment ecosystem.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {audiences.map(({ icon: Icon, title, tag, featured, description, perks, cta, href, loginHref, loginLabel }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.1 }}
              className={`relative rounded-3xl p-7 sm:p-8 flex flex-col overflow-hidden ${
                featured
                  ? 'bg-slate-900 border border-slate-800 shadow-2xl shadow-slate-900/20'
                  : 'bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all'
              }`}
            >
              {featured && (
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              )}
              <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-5 self-start ${
                featured ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-slate-100 text-slate-600'
              }`}>
                <Icon size={12} />
                {tag}
              </div>
              <h3 className={`text-lg sm:text-xl font-bold mb-3 ${featured ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
              <p className={`text-sm leading-relaxed mb-5 ${featured ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
              <ul className="space-y-2.5 mb-7 flex-1">
                {perks.map((perk) => (
                  <li key={perk} className={`flex items-center gap-2.5 text-sm ${featured ? 'text-slate-300' : 'text-slate-600'}`}>
                    <CheckCircle2 size={14} className={featured ? 'text-emerald-400 shrink-0' : 'text-emerald-500 shrink-0'} />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link
                to={href}
                className={`inline-flex items-center justify-center gap-2 font-bold text-sm px-5 py-3.5 rounded-2xl transition-all ${
                  featured
                    ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-900/30'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {cta}
                <ChevronRight size={16} />
              </Link>
              <Link
                to={loginHref}
                className={`mt-3 text-center text-xs transition-colors font-medium ${featured ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {loginLabel}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    { icon: Zap,        title: 'Instant Settlement',   desc: 'Real-time payment processing with instant validation and confirmation.' },
    { icon: ShieldCheck, title: 'No Hidden Fees',      desc: 'What you see is what you pay. Transparent pricing, always.' },
    { icon: Headphones, title: '24/7 Support',         desc: 'Our team is available around the clock to assist with any issues.' },
    { icon: CreditCard, title: 'Multiple Channels',    desc: 'Pay via card, mobile money, or bank transfer — your choice.' },
    { icon: BarChart3,  title: 'Real-time Reports',    desc: 'Full transaction history and analytics at your fingertips.' },
    { icon: Store,      title: 'Agent Network',        desc: 'Thousands of agents nationwide for cash-in and assisted payments.' },
    { icon: Building2,  title: 'Biller Integration',  desc: 'Connected to ZESA, ZINWA, TelOne, Econet, NetOne, and more.' },
    { icon: Users,      title: 'Secure & Compliant',  desc: 'Bank-level encryption, OTP verification, and full audit trails.' },
  ];

  return (
    <section id="features" className="bg-slate-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-10 sm:mb-16">
          <p className="text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-3">
            Platform Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Everything you need.<br />Nothing you don't.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed mt-4">
            EseBills covers the full bill payment workflow — purpose-built for the African market.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-emerald-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <Icon size={18} className="text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">{title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Banner Break ─────────────────────────────────────────────────────────────

function BannerBreak() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);

  return (
    <div ref={ref} className="relative h-52 sm:h-64 overflow-hidden">
      <motion.div
        className="absolute inset-0 scale-125"
        style={{ backgroundImage: `url(${bg1})`, backgroundSize: 'cover', backgroundPosition: 'center', y: bgY }}
      />
      <div className="absolute inset-0 bg-slate-950/70" />
      <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6">
        <p className="text-white text-xl sm:text-2xl lg:text-4xl font-bold text-center max-w-3xl leading-tight">
          Paying bills should be{' '}
          <span className="text-emerald-400">simple, fast, and free.</span>
        </p>
      </div>
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const [active, setActive] = useState<'customer' | 'agent'>('customer');

  const steps = {
    customer: [
      { n: '01', title: 'Create an account', desc: 'Register in minutes with your email and phone number.' },
      { n: '02', title: 'Fund your wallet',  desc: 'Top up via card, mobile money, or bank transfer.' },
      { n: '03', title: 'Choose a biller',   desc: 'Select from electricity, water, airtime, internet, and more.' },
      { n: '04', title: 'Pay instantly',     desc: 'Your payment is confirmed in seconds. No queues, no hassle.' },
    ],
    agent: [
      { n: '01', title: 'Apply to join',    desc: 'Submit your agent application with basic business details.' },
      { n: '02', title: 'Get approved',     desc: 'Our team reviews your application within 24 hours.' },
      { n: '03', title: 'Buy float',        desc: 'Load your float balance to start processing transactions.' },
      { n: '04', title: 'Start selling',    desc: 'Sell airtime, tokens, and bills. Earn commissions daily.' },
    ],
  };

  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-8 sm:mb-12">
          <p className="text-emerald-600 text-xs sm:text-sm font-bold uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            Up and running<br />in minutes.
          </h2>
        </div>

        <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl mb-12 sm:mb-16">
          {(['customer', 'agent'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`relative px-8 py-3.5 rounded-xl text-xs sm:text-sm font-black transition-all uppercase tracking-widest ${
                active === tab ? 'text-white shadow-xl shadow-slate-900/20' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {active === tab && (
                <motion.div
                  layoutId="active-tab-bg"
                      className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-700 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">
                {tab === 'customer' ? 'For Customers' : 'For Agents'}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps[active].map(({ n, title, desc }, i) => (
            <div key={n} className="relative">
              {i < steps[active].length - 1 && (
                <div
                  className="hidden lg:block absolute top-6 h-px bg-gradient-to-r from-emerald-200 via-slate-200 to-slate-200 z-0"
                  style={{ left: '48px', width: 'calc(100% - 24px)' }}
                />
              )}
              <div className="relative z-10">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center mb-4 sm:mb-5">
                  {n}
                </div>
                <h3 className="text-slate-900 font-bold text-sm sm:text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="bg-slate-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <p className="text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
          Get Started
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5 sm:mb-6">
          Ready to simplify<br />your bill payments?
        </h2>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto">
          Join thousands of customers and agents already using EseBills to pay bills instantly,
          earn commissions, and manage payments digitally.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            to={ROUTE_PATHS.register}
            className="group inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold text-sm sm:text-base px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/30"
          >
            Create Account
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to={ROUTE_PATHS.loginAgent}
            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold text-sm sm:text-base px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-white/20 hover:bg-white/15 transition-all"
          >
            <Store size={16} />
            Agent Portal
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HomePage() {
  const location = useLocation();

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!scrollTo) return;
    const attempt = (retries: number) => {
      const el = document.getElementById(scrollTo);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (retries > 0) {
        setTimeout(() => attempt(retries - 1), 150);
      }
    };
    attempt(5);
  }, [location.state]);

  return (
    <div className="bg-white">
      <Hero />
      <Services />
      <Overview />
      <ForWho />
      <Features />
      <BannerBreak />
      <HowItWorks />
      <FinalCTA />
      <ChatbotWidget />
    </div>
  );
}
