import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Icon } from "../../../components/ui/Icon";
import { useScrollDirection } from "../../../hooks/useScrollDirection";
import { ROUTE_PATHS } from "../../../router/paths";
import {
  getProducts,
  getProductCategories,
  getProductsByCategory,
  getCurrencies,
} from "../../../services/products.service";
import type { Product, ProductCategory, Currency } from "../../../types/products";

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoryTab = {
  key: string;
  label: string;
  icon: string;
};

type BillerCardProps = {
  id: string;
  productRawId?: number;
  icon: string;
  name: string;
  categoryKey: string;
  categoryLabel: string;
  currencyCode?: string;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    type?: "text" | "tel" | "number";
    prefix?: string;
  }>;
  minimumPurchaseAmount?: number;
  isDashed?: boolean;
};

type FieldProps = {
  label: string;
  children: ReactNode;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  airtime:    { bg: "bg-blue-50",   icon: "text-blue-500" },
  internet:   { bg: "bg-violet-50", icon: "text-violet-500" },
  education:  { bg: "bg-amber-50",  icon: "text-amber-500" },
  insurance:  { bg: "bg-rose-50",   icon: "text-rose-500" },
  fuel:       { bg: "bg-orange-50", icon: "text-orange-500" },
  donations:  { bg: "bg-pink-50",   icon: "text-pink-500" },
  lottery:    { bg: "bg-purple-50", icon: "text-purple-500" },
  utilities:  { bg: "bg-emerald-50",icon: "text-emerald-600" },
};

const DEFAULT_FIELDS: BillerCardProps["fields"] = [
  { key: "accountNumber", label: "Account / Card Number", placeholder: "Enter biller account", type: "text" },
  { key: "mobileNumber",  label: "Mobile Number",         placeholder: "77*******",            type: "tel" },
  { key: "amount",        label: "Amount",                placeholder: "0.00",                 type: "number", prefix: "$" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inferCategory(name: string, code: string): { key: string; label: string } {
  const value = `${name} ${code}`.toLowerCase();
  if (/(airtime|recharge|evd|topup)/.test(value)) return { key: "airtime",    label: "Airtime" };
  if (/(bundle|data)/.test(value))                 return { key: "internet",  label: "Internet" };
  if (/(school|tuition|fees|university|college|education)/.test(value)) return { key: "education", label: "Education" };
  if (/(insurance|life|medical|health)/.test(value)) return { key: "insurance", label: "Insurance" };
  if (/(fuel|petrol|diesel|gas)/.test(value))      return { key: "fuel",      label: "Fuel" };
  if (/(donat)/.test(value))                        return { key: "donations", label: "Donations" };
  if (/(lottery|loto|jackpot)/.test(value))         return { key: "lottery",   label: "Lottery" };
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

function fieldsByProduct(name: string, category: string): BillerCardProps["fields"] {
  const n = name.toLowerCase();
  if (/(zesa|zesco|token|electric)/.test(n)) return [
    { key: "accountNumber", label: "Meter Number",  placeholder: "Enter meter number", type: "text" },
    { key: "mobileNumber",  label: "Mobile Number", placeholder: "77*******",          type: "tel" },
    { key: "amount",        label: "Amount",        placeholder: "0.00",               type: "number", prefix: "$" },
  ];
  if (/(airtime|bundle|data)/.test(n) || category === "Airtime") return [
    { key: "mobileNumber", label: "Mobile Number", placeholder: "77*******", type: "tel" },
    { key: "amount",       label: "Amount",        placeholder: "0.00",      type: "number", prefix: "$" },
  ];
  if (/(dstv|gotv|tv)/.test(n)) return [
    { key: "accountNumber", label: "Smart Card Number", placeholder: "Enter smart card number", type: "text" },
    { key: "mobileNumber",  label: "Mobile Number",     placeholder: "77*******",               type: "tel" },
    { key: "amount",        label: "Amount",            placeholder: "0.00",                    type: "number", prefix: "$" },
  ];
  if (category === "Education") return [
    { key: "accountNumber", label: "Student Number", placeholder: "Enter student number", type: "text" },
    { key: "mobileNumber",  label: "Mobile Number",  placeholder: "77*******",            type: "tel" },
    { key: "amount",        label: "Amount",         placeholder: "0.00",                 type: "number", prefix: "$" },
  ];
  if (category === "Insurance") return [
    { key: "accountNumber", label: "Policy Number", placeholder: "Enter policy number", type: "text" },
    { key: "mobileNumber",  label: "Mobile Number", placeholder: "77*******",           type: "tel" },
    { key: "amount",        label: "Amount",        placeholder: "0.00",                type: "number", prefix: "$" },
  ];
  return DEFAULT_FIELDS;
}

async function fetchProductsAndCategories(categoryId?: string): Promise<{
  products: Product[];
  categories: ProductCategory[];
}> {
  const [productsPage, categories] = await Promise.all([
    categoryId
      ? getProductsByCategory(categoryId, { size: 50 })
      : getProducts({ size: 50 }),
    getProductCategories(),
  ]);
  return {
    products: Array.isArray(productsPage?.content) ? productsPage.content : [],
    categories: Array.isArray(categories) ? categories : [],
  };
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function CategoryPill({
  icon,
  label,
  active = false,
  onClick,
}: { icon: string; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`category-pill ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <Icon name={icon} className="icon-sm" />
      {label}
    </button>
  );
}

function BillerCard({
  id,
  icon,
  name,
  categoryKey,
  isSelected = false,
  onSelect,
}: BillerCardProps & { isSelected?: boolean; onSelect: (id: string) => void }) {
  const colors = CATEGORY_COLORS[categoryKey] ?? CATEGORY_COLORS.utilities;
  return (
    <div
      className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100"
          : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(id); }
      }}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${colors.bg}`}>
        <Icon name={icon} className={`text-xl ${colors.icon}`} />
      </div>
      <p className={`text-[11px] font-bold text-center leading-tight line-clamp-2 ${isSelected ? "text-emerald-700" : "text-slate-700"}`}>
        {name}
      </p>
      {isSelected && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
          <svg width="8" height="6" fill="none" viewBox="0 0 8 6">
            <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
    </div>
  );
}

function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label className="field-label type-label">{label}</label>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PaymentSection() {
  const headingWords = ["Select", "Biller", "to", "Pay"];
  const scrollDirection = useScrollDirection();
  const inViewVariant = scrollDirection === "down" ? "visible" : "visibleInstant";

  const [activeCategory, setActiveCategory]       = useState<string>("");
  const [selectedBillerId, setSelectedBillerId]   = useState<string>("");
  const [selectedCurrency, setSelectedCurrency]   = useState<string>("");
  const [formValues, setFormValues]               = useState<Record<string, string>>({});

  // ── Data fetching ──────────────────────────────────────────────────────────

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", "categories", activeCategory],
    queryFn: () => fetchProductsAndCategories(activeCategory),
  });

  const { data: currenciesData } = useQuery({
    queryKey: ["currencies", "all"],
    queryFn: getCurrencies,
  });

  // ── Derived state ──────────────────────────────────────────────────────────

  const categoryTabs: CategoryTab[] = useMemo(() => {
    const fromBackend = (data?.categories ?? [])
      .filter((c) => c.active !== false)
      .map((c) => {
        const key   = String(c.id ?? c.name ?? "").trim();
        const label = String(c.displayName ?? c.name ?? "Category");
        const icon  = String(c.emoji ?? "").trim() || iconByCategory(label);
        return { key, label, icon };
      })
      .filter((c) => c.key.length > 0);
    return fromBackend.length > 0 ? fromBackend : [{ key: "utilities", label: "Utilities", icon: iconByCategory("Utilities") }];
  }, [data?.categories]);

  const allDisplayBillers: BillerCardProps[] = useMemo(
    () =>
      (data?.products ?? [])
        .filter((p) => p.status === "ACTIVE" && !p.deleted)
        .map((p) => {
          const productName  = String(p.name ?? "Unnamed Product");
          const productCode  = String(p.code ?? "");
          const backendCat   = p.category;
          const inferred     = inferCategory(productName, productCode);
          const categoryKey  = String(backendCat?.id ?? backendCat?.name ?? inferred.key);
          const categoryLabel = String(backendCat?.displayName ?? backendCat?.name ?? inferred.label);
          const categoryIcon = String(backendCat?.emoji ?? "").trim() || iconByCategory(categoryLabel);
          return {
            id:                    `api-${String(p.id ?? p.code ?? Math.random())}`,
            productRawId:          typeof p.id === "number" ? p.id : undefined,
            icon:                  categoryIcon,
            name:                  productName,
            categoryKey,
            categoryLabel,
            currencyCode:          p.defaultCurrency?.code ?? undefined,
            fields:                fieldsByProduct(productName, categoryLabel),
            minimumPurchaseAmount: Number(p.minimumPurchaseAmount ?? 0),
          };
        }),
    [data?.products],
  );

  /** All active currencies from the API */
  const availableCurrencies = useMemo<Array<{ code: string; name: string }>>(() => {
    const raw = currenciesData as { content?: Currency[] } | Currency[] | undefined;
    const list: Currency[] = Array.isArray(raw) ? raw : (raw as { content?: Currency[] })?.content ?? [];
    return list
      .filter((c) => c.code && c.active !== false)
      .map((c) => ({ code: c.code!, name: c.name ?? c.code! }));
  }, [currenciesData]);

  const displayBillers: BillerCardProps[] = useMemo(() => {
    if (!selectedCurrency) return allDisplayBillers;
    // Products without a currency code are shown in all currency views
    return allDisplayBillers.filter((b) => !b.currencyCode || b.currencyCode === selectedCurrency);
  }, [allDisplayBillers, selectedCurrency]);

  // ── Sync active category ───────────────────────────────────────────────────

  useEffect(() => {
    if (!categoryTabs.length) return;
    if (!activeCategory || !categoryTabs.some((c) => c.key === activeCategory)) {
      setActiveCategory(categoryTabs[0].key);
    }
  }, [categoryTabs, activeCategory]);

  const filteredBillers = useMemo(() => {
    if (!activeCategory) return [];
    return displayBillers.filter((b) => b.categoryKey === activeCategory && !b.isDashed);
  }, [activeCategory, displayBillers]);

  const selectedBiller = useMemo(
    () => filteredBillers.find((b) => b.id === selectedBillerId) ?? filteredBillers[0] ?? null,
    [filteredBillers, selectedBillerId],
  );

  useEffect(() => {
    if (filteredBillers.length === 0) { setSelectedBillerId(""); return; }
    if (!filteredBillers.some((b) => b.id === selectedBillerId)) {
      setSelectedBillerId(filteredBillers[0].id);
    }
  }, [filteredBillers, selectedBillerId]);

  useEffect(() => {
    if (!selectedBiller) return;
    const nextValues: Record<string, string> = {};
    selectedBiller.fields.forEach((f) => {
      if (f.key === "amount" && selectedBiller.minimumPurchaseAmount && selectedBiller.minimumPurchaseAmount > 0) {
        nextValues[f.key] = String(selectedBiller.minimumPurchaseAmount);
        return;
      }
      nextValues[f.key] = formValues[f.key] ?? "";
    });
    setFormValues(nextValues);
  }, [selectedBiller]);

  // ── Derived form values ────────────────────────────────────────────────────

  const accountValue = useMemo(() => {
    if (formValues.accountNumber) return formValues.accountNumber;
    if (formValues.mobileNumber)  return formValues.mobileNumber;
    const fallbackKey = Object.keys(formValues).find((k) => k !== "amount");
    return fallbackKey ? formValues[fallbackKey] : "";
  }, [formValues]);

  const amountValue = formValues.amount ?? "";

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleContinue = () => {
    if (!selectedBiller) return;
    const query = new URLSearchParams({
      biller:  selectedBiller.name,
      account: accountValue,
      amount:  amountValue || "0",
    });
    if (selectedBiller.productRawId !== undefined) {
      query.set("productId", String(selectedBiller.productRawId));
    }
    window.location.assign(`${ROUTE_PATHS.checkout}?${query.toString()}`);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

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
          {/* Currency filter */}
          {availableCurrencies.length > 0 && (
            <div className="flex items-center gap-2 mb-3 px-1 flex-wrap">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Currency:</span>
              <button
                type="button"
                onClick={() => setSelectedCurrency("")}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
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
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
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

          {/* Category tabs */}
          <div>
            <div className="categories-row">
              {categoryTabs.map((c) => (
                <CategoryPill
                  key={c.key}
                  icon={c.icon}
                  label={c.label}
                  active={c.key === activeCategory}
                  onClick={() => setActiveCategory(c.key)}
                />
              ))}
            </div>
          </div>

          {/* Biller grid – now with Tailwind cards */}
          <div className="billers-grid">
            {isLoading && <p className="type-body text-muted">Loading products...</p>}
            {isError   && <p className="type-body text-muted">Could not load products.</p>}
            {!isLoading && filteredBillers.length === 0 ? (
              <div className="billers-empty-state" role="status" aria-live="polite">
                <span className="material-symbols-outlined">inventory_2</span>
                <p>
                  No active products under{" "}
                  {categoryTabs.find((c) => c.key === activeCategory)?.label ?? "this category"}.
                </p>
              </div>
            ) : (
              filteredBillers.map((biller) => (
                <BillerCard
                  key={biller.id}
                  {...biller}
                  isSelected={selectedBiller?.id === biller.id}
                  onSelect={setSelectedBillerId}
                />
              ))
            )}
          </div>

          {/* Payment form */}
          <div className="payment-form">
            {(selectedBiller?.fields ?? []).map((field) => (
              <Field key={field.key} label={field.label}>
                {field.prefix ? (
                  <div className="amount-field">
                    <span>{field.prefix}</span>
                    <input
                      type={field.type ?? "text"}
                      placeholder={field.placeholder}
                      value={formValues[field.key] ?? ""}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    />
                  </div>
                ) : (
                  <input
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    value={formValues[field.key] ?? ""}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  />
                )}
              </Field>
            ))}

            <button
              type="button"
              onClick={handleContinue}
              className="button button-primary button-primary-cta submit-button"
              disabled={!selectedBiller}
            >
              CONTINUE
              <Icon name="arrow_forward" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
