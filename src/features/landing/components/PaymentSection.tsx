import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../../../components/ui/Icon";
import { useScrollDirection } from "../../../hooks/useScrollDirection";
import { ROUTE_PATHS } from "../../../router/paths";
import {
  getProducts,
  getProductCategories,
  getCurrencies,
} from "../../../services/products.service";
import type { Product, ProductCategory, Currency } from "../../../types/products";

// ─── Types ────────────────────────────────────────────────────────────────────

type DrillState = "categories" | "products" | "variants";

type CategoryTab = {
  key: string;
  label: string;
  icon: string;
};

type BillerItem = {
  id: string;
  productRawId?: number;
  icon: string;
  name: string;
  categoryKey: string;
  categoryLabel: string;
  currencyCode?: string;
  minimumPurchaseAmount?: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; icon: string; accent: string }> = {
  airtime:   { bg: "bg-blue-50",    icon: "text-blue-500",    accent: "border-blue-200 hover:border-blue-400" },
  internet:  { bg: "bg-violet-50",  icon: "text-violet-500",  accent: "border-violet-200 hover:border-violet-400" },
  education: { bg: "bg-amber-50",   icon: "text-amber-500",   accent: "border-amber-200 hover:border-amber-400" },
  insurance: { bg: "bg-rose-50",    icon: "text-rose-500",    accent: "border-rose-200 hover:border-rose-400" },
  fuel:      { bg: "bg-orange-50",  icon: "text-orange-500",  accent: "border-orange-200 hover:border-orange-400" },
  donations: { bg: "bg-pink-50",    icon: "text-pink-500",    accent: "border-pink-200 hover:border-pink-400" },
  lottery:   { bg: "bg-purple-50",  icon: "text-purple-500",  accent: "border-purple-200 hover:border-purple-400" },
  utilities: { bg: "bg-emerald-50", icon: "text-emerald-600", accent: "border-emerald-200 hover:border-emerald-400" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inferCategory(name: string, code: string): { key: string; label: string } {
  const value = `${name} ${code}`.toLowerCase();
  if (/(airtime|recharge|evd|topup)/.test(value)) return { key: "airtime",   label: "Airtime" };
  if (/(bundle|data)/.test(value))                return { key: "internet",  label: "Internet" };
  if (/(school|tuition|fees|university|college|education)/.test(value)) return { key: "education", label: "Education" };
  if (/(insurance|life|medical|health)/.test(value)) return { key: "insurance", label: "Insurance" };
  if (/(fuel|petrol|diesel|gas)/.test(value))     return { key: "fuel",      label: "Fuel" };
  if (/(donat)/.test(value))                       return { key: "donations", label: "Donations" };
  if (/(lottery|loto|jackpot)/.test(value))        return { key: "lottery",   label: "Lottery" };
  return { key: "utilities", label: "Utilities" };
}

function iconByCategory(category: string): string {
  switch (category) {
    case "Airtime":   return "settings_input_antenna";
    case "Internet":  return "wifi";
    case "Education": return "school";
    case "Insurance": return "health_and_safety";
    case "Fuel":      return "local_gas_station";
    case "Donations": return "volunteer_activism";
    case "Lottery":   return "casino";
    default:          return "electric_bolt";
  }
}

/** Resolve a color palette key from the category label/name */
function colorKey(categoryLabel: string): string {
  const v = categoryLabel.toLowerCase();
  if (/airtime|recharge/.test(v))  return "airtime";
  if (/bundle|data|internet/.test(v)) return "internet";
  if (/school|education|tuition/.test(v)) return "education";
  if (/insurance|health|medical/.test(v)) return "insurance";
  if (/fuel|petrol/.test(v))        return "fuel";
  if (/donat/.test(v))              return "donations";
  if (/lottery|loto/.test(v))       return "lottery";
  return "utilities";
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function CategoryCard({
  icon,
  label,
  categoryKey,
  count,
  onClick,
}: {
  icon: string;
  label: string;
  categoryKey: string;
  count?: number;
  onClick: () => void;
}) {
  const colors = CATEGORY_COLORS[colorKey(label)] ?? CATEGORY_COLORS.utilities;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-center gap-2 p-3 rounded-2xl border-2 bg-white cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 ${colors.accent}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${colors.bg}`}>
        <Icon name={icon} className={`text-xl ${colors.icon}`} />
      </div>
      <p className="text-[11px] font-bold text-center leading-tight text-slate-700 line-clamp-2">
        {label}
      </p>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] text-slate-400 font-medium">{count}</span>
      )}
    </button>
  );
}

function BillerCard({
  icon,
  name,
  categoryLabel,
  hasVariants,
  onSelect,
}: {
  icon: string;
  name: string;
  categoryLabel: string;
  hasVariants?: boolean;
  onSelect: () => void;
}) {
  const colors = CATEGORY_COLORS[colorKey(categoryLabel)] ?? CATEGORY_COLORS.utilities;
  return (
    <div
      className="group relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all duration-200 active:scale-95"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); }
      }}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${colors.bg}`}>
        <Icon name={icon} className={`text-xl ${colors.icon}`} />
      </div>
      <p className="text-[11px] font-bold text-center leading-tight line-clamp-2 text-slate-700">
        {name}
      </p>
      {hasVariants && (
        <span className="text-[9px] text-slate-400 font-medium flex items-center gap-0.5">
          Plans <Icon name="chevron_right" className="text-xs" />
        </span>
      )}
    </div>
  );
}

function VariantCard({
  name,
  price,
  currencyCode,
  categoryLabel,
  onSelect,
}: {
  name: string;
  price?: number;
  currencyCode?: string;
  categoryLabel: string;
  onSelect: () => void;
}) {
  const colors = CATEGORY_COLORS[colorKey(categoryLabel)] ?? CATEGORY_COLORS.utilities;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border-2 border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm text-left transition-all duration-150 active:scale-[0.98]`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
          <Icon name="check_circle" className={`text-sm ${colors.icon}`} />
        </div>
        <span className="text-[12px] font-semibold text-slate-700 truncate">{name}</span>
      </div>
      {price != null && price > 0 && (
        <span className={`text-[11px] font-bold shrink-0 ${colors.icon}`}>
          {currencyCode ?? "USD"} {price.toFixed(2)}
        </span>
      )}
    </button>
  );
}

// ─── Slide animation variants ─────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: `${dir * 100}%`, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: `${dir * -100}%`, opacity: 0 }),
};

const slideTransition = { type: "tween", duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as const };

// ─── Main Component ───────────────────────────────────────────────────────────

export function PaymentSection() {
  const headingWords = ["Select", "Biller", "to", "Pay"];
  const scrollDirection = useScrollDirection();
  const inViewVariant = scrollDirection === "down" ? "visible" : "visibleInstant";

  const [drillState, setDrillState] = useState<DrillState>("categories");
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const [activeCategory, setActiveCategory] = useState<CategoryTab | null>(null);
  const [activeBiller, setActiveBiller] = useState<BillerItem | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const [productsPage, categories] = await Promise.all([
        getProducts({ size: 100 }),
        getProductCategories(),
      ]);
      return {
        products: Array.isArray(productsPage?.content) ? productsPage.content : [] as Product[],
        categories: Array.isArray(categories) ? categories : [] as ProductCategory[],
      };
    },
  });

  const { data: currenciesData } = useQuery({
    queryKey: ["currencies", "all"],
    queryFn: getCurrencies,
  });

  // ── Derived state ──────────────────────────────────────────────────────────

  const categoryTabs: CategoryTab[] = useMemo(() => {
    const fromBackend = (productsData?.categories ?? [])
      .filter((c) => c.active !== false)
      .map((c) => {
        const key   = String(c.id ?? c.name ?? "").trim();
        const label = String(c.displayName ?? c.name ?? "Category");
        const icon  = String(c.emoji ?? "").trim() || iconByCategory(label);
        return { key, label, icon };
      })
      .filter((c) => c.key.length > 0);
    return fromBackend.length > 0
      ? fromBackend
      : [{ key: "utilities", label: "Utilities", icon: iconByCategory("Utilities") }];
  }, [productsData?.categories]);

  const allBillers: BillerItem[] = useMemo(
    () =>
      (productsData?.products ?? [])
        .filter((p) => p.status === "ACTIVE" && !p.deleted)
        .map((p) => {
          const productName  = String(p.name ?? "Unnamed Product");
          const productCode  = String(p.code ?? "");
          const backendCat   = p.category;
          const inferred     = inferCategory(productName, productCode);
          const catKey       = String(backendCat?.id ?? backendCat?.name ?? inferred.key);
          const catLabel     = String(backendCat?.displayName ?? backendCat?.name ?? inferred.label);
          const catIcon      = String(backendCat?.emoji ?? "").trim() || iconByCategory(catLabel);
          return {
            id:                    `api-${String(p.id ?? p.code ?? Math.random())}`,
            productRawId:          typeof p.id === "number" ? p.id : undefined,
            icon:                  catIcon,
            name:                  productName,
            categoryKey:           catKey,
            categoryLabel:         catLabel,
            currencyCode:          p.defaultCurrency?.code ?? undefined,
            minimumPurchaseAmount: Number(p.minimumPurchaseAmount ?? 0),
          };
        }),
    [productsData?.products],
  );

  /** Count per category for category cards */
  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of allBillers) counts[b.categoryKey] = (counts[b.categoryKey] ?? 0) + 1;
    return counts;
  }, [allBillers]);

  /** Products grouped by their exact category key (for variant detection) */
  const billersByCategory = useMemo(() => {
    const map: Record<string, BillerItem[]> = {};
    for (const b of allBillers) {
      if (!map[b.categoryKey]) map[b.categoryKey] = [];
      map[b.categoryKey].push(b);
    }
    return map;
  }, [allBillers]);

  /** All active currencies from the API */
  const availableCurrencies = useMemo<Array<{ code: string; name: string }>>(() => {
    const raw = currenciesData as { content?: Currency[] } | Currency[] | undefined;
    const list: Currency[] = Array.isArray(raw) ? raw : (raw as { content?: Currency[] })?.content ?? [];
    return list
      .filter((c) => c.code && c.active !== false)
      .map((c) => ({ code: c.code!, name: c.name ?? c.code! }));
  }, [currenciesData]);

  /** Products shown in the products panel, filtered by active category + currency */
  const filteredBillers = useMemo(() => {
    if (!activeCategory) return [];
    return allBillers.filter((b) => {
      if (b.categoryKey !== activeCategory.key) return false;
      if (selectedCurrency && b.currencyCode && b.currencyCode !== selectedCurrency) return false;
      return true;
    });
  }, [activeCategory, allBillers, selectedCurrency]);

  /** Variants for the active biller (other products in same sub-category) */
  const variants = useMemo<BillerItem[]>(() => {
    if (!activeBiller) return [];
    return billersByCategory[activeBiller.categoryKey] ?? [];
  }, [activeBiller, billersByCategory]);

  // ── Drill-down navigation ──────────────────────────────────────────────────

  function drillToProducts(cat: CategoryTab) {
    setSlideDir(1);
    setActiveCategory(cat);
    setDrillState("products");
  }

  function drillToVariants(biller: BillerItem) {
    setSlideDir(1);
    setActiveBiller(biller);
    setDrillState("variants");
  }

  function drillBack() {
    setSlideDir(-1);
    if (drillState === "variants") {
      setDrillState("products");
    } else {
      setActiveCategory(null);
      setDrillState("categories");
    }
  }

  // ── Navigate to checkout ───────────────────────────────────────────────────

  function goToCheckout(biller: BillerItem) {
    const query = new URLSearchParams({ biller: biller.name });
    if (biller.productRawId !== undefined) {
      query.set("productId", String(biller.productRawId));
    }
    window.location.assign(`${ROUTE_PATHS.checkout}?${query.toString()}`);
  }

  function handleBillerClick(biller: BillerItem) {
    const siblings = billersByCategory[biller.categoryKey] ?? [];
    if (siblings.length > 1) {
      // Multiple options in this sub-category → show variant picker inline
      drillToVariants(biller);
    } else {
      goToCheckout(biller);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const panelLabel =
    drillState === "variants"
      ? (activeBiller?.name ?? activeCategory?.label)
      : activeCategory?.label;

  return (
    <section className="payment" id="pay-now">
      <motion.h2
        className="payment-animated-title"
        initial="hidden"
        whileInView={inViewVariant}
        viewport={{ once: false, amount: 0.55 }}
        variants={{
          hidden: {},
          visible:        { transition: { delayChildren: 0.08, staggerChildren: 0.22 } },
          visibleInstant: { transition: { delayChildren: 0,    staggerChildren: 0 } },
        }}
      >
        {headingWords.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            className="payment-animated-word"
            variants={{
              hidden:        { opacity: 0.18, y: 20,   scale: 0.92, color: "#9ca3af" },
              visible:       { opacity: 1,    y: 0,    scale: 1,    color: "#0f172a" },
              visibleInstant:{ opacity: 1,    y: 0,    scale: 1,    color: "#0f172a", transition: { duration: 0 } },
            }}
            transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.75 }}
          >
            {word}
          </motion.span>
        ))}
      </motion.h2>

      <div className="container">
        <motion.div
          className="payment-card"
          initial="hidden"
          whileInView={inViewVariant}
          viewport={{ once: false, amount: 0.35 }}
          variants={{
            hidden:         { opacity: 0, y: 110, scale: 0.98 },
            visible:        { opacity: 1, y: 0,   scale: 1,   transition: { duration: 1.05, ease: [0.16, 1, 0.3, 1] as const } },
            visibleInstant: { opacity: 1, y: 0,   scale: 1,   transition: { duration: 0 } },
          }}
        >
          {/* Header row: back button + breadcrumb + currency filter */}
          <div className="flex items-center gap-2 mb-4 min-h-[2rem]">
            {drillState !== "categories" && (
              <button
                type="button"
                onClick={drillBack}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all shrink-0"
                aria-label="Back"
              >
                <Icon name="arrow_back" className="text-base" />
              </button>
            )}

            {drillState !== "categories" && (
              <span className="text-sm font-bold text-slate-700 truncate">{panelLabel}</span>
            )}

            {/* Currency filter pushed to the right */}
            {availableCurrencies.length > 0 && (
              <div className="flex items-center gap-1.5 ml-auto flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedCurrency("")}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                    !selectedCurrency
                      ? "bg-slate-900 text-white border-slate-900"
                      : "border-slate-200 text-slate-500 hover:border-slate-400"
                  }`}
                >
                  All
                </button>
                {availableCurrencies.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCurrency(c.code)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                      selectedCurrency === c.code
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "border-slate-200 text-slate-500 hover:border-slate-400"
                    }`}
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Drill-down panels */}
          <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
            <AnimatePresence custom={slideDir} mode="wait">

              {/* ── Panel 1: Categories ─────────────────────────────────── */}
              {drillState === "categories" && (
                <motion.div
                  key="categories"
                  custom={slideDir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTransition}
                >
                  {isLoading ? (
                    <p className="text-sm text-slate-400 py-8 text-center">Loading services…</p>
                  ) : isError ? (
                    <p className="text-sm text-slate-400 py-8 text-center">Could not load services.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {categoryTabs.map((cat) => (
                        <CategoryCard
                          key={cat.key}
                          icon={cat.icon}
                          label={cat.label}
                          categoryKey={cat.key}
                          count={productCountByCategory[cat.key]}
                          onClick={() => drillToProducts(cat)}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Panel 2: Products ───────────────────────────────────── */}
              {drillState === "products" && (
                <motion.div
                  key={`products-${activeCategory?.key}`}
                  custom={slideDir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTransition}
                >
                  {isLoading ? (
                    <p className="text-sm text-slate-400 py-8 text-center">Loading…</p>
                  ) : filteredBillers.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                      <span className="material-symbols-outlined text-3xl">inventory_2</span>
                      <p className="text-sm">No active services in {activeCategory?.label}.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {filteredBillers.map((biller) => {
                        const siblings = billersByCategory[biller.categoryKey] ?? [];
                        return (
                          <BillerCard
                            key={biller.id}
                            icon={biller.icon}
                            name={biller.name}
                            categoryLabel={biller.categoryLabel ?? activeCategory?.label ?? ""}
                            hasVariants={siblings.length > 1}
                            onSelect={() => handleBillerClick(biller)}
                          />
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Panel 3: Variants ───────────────────────────────────── */}
              {drillState === "variants" && (
                <motion.div
                  key={`variants-${activeBiller?.id}`}
                  custom={slideDir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTransition}
                >
                  {variants.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center">No options available.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {variants
                        .filter((v) => !selectedCurrency || !v.currencyCode || v.currencyCode === selectedCurrency)
                        .map((v) => (
                          <VariantCard
                            key={v.id}
                            name={v.name}
                            price={v.minimumPurchaseAmount}
                            currencyCode={v.currencyCode}
                            categoryLabel={v.categoryLabel ?? ""}
                            onSelect={() => goToCheckout(v)}
                          />
                        ))}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
