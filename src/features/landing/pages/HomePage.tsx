import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "framer-motion";
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
  Mouse,
} from "lucide-react";
import { ChatbotWidget } from "../components/ChatbotWidget";
import bg1 from "../../../assets/bg1.jpg";
import ecocashBadge from "../../../assets/ecocash-badge.svg";
import innbucksBadge from "../../../assets/innbucks-badge.svg";
import mastercardBadge from "../../../assets/mastercard-badge.svg";
import omariBadge from "../../../assets/omari-badge.svg";
import onemoneyBadge from "../../../assets/onemoney-badge.svg";
import telecashBadge from "../../../assets/telecash-badge.svg";
import zimswitchBadge from "../../../assets/zimswitch-badge.svg";
import visaBadge from "../../../assets/visa-badge.svg";
import { ROUTE_PATHS } from "../../../router/paths";
import {
  getProducts,
  getProductCategories,
  getProductsByCategory,
} from "../../../services/products.service";
import type { Product, ProductCategory } from "../../../types/products";

// --- Services helpers ----------------------------------------------------------

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

function categoryIcon(label: string, cls = "w-4 h-4") {
  switch (label.toLowerCase()) {
    case "airtime":
      return <Smartphone className={cls} />;
    case "internet":
      return <Wifi className={cls} />;
    case "education":
      return <BookOpen className={cls} />;
    case "insurance":
      return <ShieldCheck className={cls} />;
    case "fuel":
      return <Droplets className={cls} />;
    case "donations":
      return <Heart className={cls} />;
    case "lottery":
      return <Sparkles className={cls} />;
    default:
      return <Zap className={cls} />;
  }
}

function inferCategory(
  name: string,
  code: string,
): { key: string; label: string } {
  const v = `${name} ${code}`.toLowerCase();
  if (/(airtime|recharge|evd|topup)/.test(v))
    return { key: "airtime", label: "Airtime" };
  if (/(bundle|data)/.test(v)) return { key: "internet", label: "Internet" };
  if (/(school|tuition|fees|university|college|education)/.test(v))
    return { key: "education", label: "Education" };
  if (/(insurance|life|medical|health)/.test(v))
    return { key: "insurance", label: "Insurance" };
  if (/(fuel|petrol|diesel|gas)/.test(v)) return { key: "fuel", label: "Fuel" };
  if (/(donat)/.test(v)) return { key: "donations", label: "Donations" };
  if (/(lottery|loto|jackpot)/.test(v))
    return { key: "lottery", label: "Lottery" };
  return { key: "utilities", label: "Utilities" };
}

const DEFAULT_FIELDS: FormField[] = [
  {
    key: "accountNumber",
    label: "Account Number",
    placeholder: "Enter account number",
  },
  {
    key: "mobileNumber",
    label: "Mobile Number",
    placeholder: "77*******",
    type: "tel",
  },
  {
    key: "amount",
    label: "Amount",
    placeholder: "0.00",
    type: "number",
    prefix: "$",
  },
];

function fieldsByProduct(name: string, category: string): FormField[] {
  const n = name.toLowerCase();
  if (/(zesa|token|electric)/.test(n))
    return [
      {
        key: "accountNumber",
        label: "Meter Number",
        placeholder: "Enter meter number",
      },
      {
        key: "mobileNumber",
        label: "Mobile Number",
        placeholder: "77*******",
        type: "tel",
      },
      {
        key: "amount",
        label: "Amount",
        placeholder: "0.00",
        type: "number",
        prefix: "$",
      },
    ];
  if (/(airtime|bundle|data)/.test(n) || category === "Airtime")
    return [
      {
        key: "mobileNumber",
        label: "Mobile Number",
        placeholder: "77*******",
        type: "tel",
      },
      {
        key: "amount",
        label: "Amount",
        placeholder: "0.00",
        type: "number",
        prefix: "$",
      },
    ];
  if (/(dstv|gotv|tv)/.test(n))
    return [
      {
        key: "accountNumber",
        label: "Smart Card Number",
        placeholder: "Enter smart card number",
      },
      {
        key: "mobileNumber",
        label: "Mobile Number",
        placeholder: "77*******",
        type: "tel",
      },
      {
        key: "amount",
        label: "Amount",
        placeholder: "0.00",
        type: "number",
        prefix: "$",
      },
    ];
  if (category === "Education")
    return [
      {
        key: "accountNumber",
        label: "Student Number",
        placeholder: "Enter student number",
      },
      {
        key: "mobileNumber",
        label: "Mobile Number",
        placeholder: "77*******",
        type: "tel",
      },
      {
        key: "amount",
        label: "Amount",
        placeholder: "0.00",
        type: "number",
        prefix: "$",
      },
    ];
  if (category === "Insurance")
    return [
      {
        key: "accountNumber",
        label: "Policy Number",
        placeholder: "Enter policy number",
      },
      {
        key: "mobileNumber",
        label: "Mobile Number",
        placeholder: "77*******",
        type: "tel",
      },
      {
        key: "amount",
        label: "Amount",
        placeholder: "0.00",
        type: "number",
        prefix: "$",
      },
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
    products: Array.isArray(productsPage?.content)
      ? productsPage.content
      : ([] as Product[]),
    categories: Array.isArray(categories)
      ? categories
      : ([] as ProductCategory[]),
  };
}

// --- Hero ----------------------------------------------------------------------

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section
      ref={ref}
      className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-x-hidden"
    >
      {/* Pattern background */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundColor: "#10B981",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1500'%3E%3Cdefs%3E%3Crect stroke='%2310B981' stroke-width='0.2' width='1' height='1' id='s'/%3E%3Cpattern id='a' width='3' height='3' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cuse fill='%2327bb85' href='%23s' y='2'/%3E%3Cuse fill='%2327bb85' href='%23s' x='1' y='2'/%3E%3Cuse fill='%2335bc88' href='%23s' x='2' y='2'/%3E%3Cuse fill='%2335bc88' href='%23s'/%3E%3Cuse fill='%2340be8c' href='%23s' x='2'/%3E%3Cuse fill='%2340be8c' href='%23s' x='1' y='1'/%3E%3C/pattern%3E%3Cpattern id='b' width='7' height='11' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%234ac08f'%3E%3Cuse href='%23s'/%3E%3Cuse href='%23s' y='5' /%3E%3Cuse href='%23s' x='1' y='10'/%3E%3Cuse href='%23s' x='2' y='1'/%3E%3Cuse href='%23s' x='2' y='4'/%3E%3Cuse href='%23s' x='3' y='8'/%3E%3Cuse href='%23s' x='4' y='3'/%3E%3Cuse href='%23s' x='4' y='7'/%3E%3Cuse href='%23s' x='5' y='2'/%3E%3Cuse href='%23s' x='5' y='6'/%3E%3Cuse href='%23s' x='6' y='9'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='h' width='5' height='13' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%234ac08f'%3E%3Cuse href='%23s' y='5'/%3E%3Cuse href='%23s' y='8'/%3E%3Cuse href='%23s' x='1' y='1'/%3E%3Cuse href='%23s' x='1' y='9'/%3E%3Cuse href='%23s' x='1' y='12'/%3E%3Cuse href='%23s' x='2'/%3E%3Cuse href='%23s' x='2' y='4'/%3E%3Cuse href='%23s' x='3' y='2'/%3E%3Cuse href='%23s' x='3' y='6'/%3E%3Cuse href='%23s' x='3' y='11'/%3E%3Cuse href='%23s' x='4' y='3'/%3E%3Cuse href='%23s' x='4' y='7'/%3E%3Cuse href='%23s' x='4' y='10'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='c' width='17' height='13' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%2352c193'%3E%3Cuse href='%23s' y='11'/%3E%3Cuse href='%23s' x='2' y='9'/%3E%3Cuse href='%23s' x='5' y='12'/%3E%3Cuse href='%23s' x='9' y='4'/%3E%3Cuse href='%23s' x='12' y='1'/%3E%3Cuse href='%23s' x='16' y='6'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='d' width='19' height='17' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%2310B981'%3E%3Cuse href='%23s' y='9'/%3E%3Cuse href='%23s' x='16' y='5'/%3E%3Cuse href='%23s' x='14' y='2'/%3E%3Cuse href='%23s' x='11' y='11'/%3E%3Cuse href='%23s' x='6' y='14'/%3E%3C/g%3E%3Cg fill='%235ac396'%3E%3Cuse href='%23s' x='3' y='13'/%3E%3Cuse href='%23s' x='9' y='7'/%3E%3Cuse href='%23s' x='13' y='10'/%3E%3Cuse href='%23s' x='15' y='4'/%3E%3Cuse href='%23s' x='18' y='1'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='e' width='47' height='53' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%2310B981'%3E%3Cuse href='%23s' x='2' y='5'/%3E%3Cuse href='%23s' x='16' y='38'/%3E%3Cuse href='%23s' x='46' y='42'/%3E%3Cuse href='%23s' x='29' y='20'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='f' width='59' height='71' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%2310B981'%3E%3Cuse href='%23s' x='33' y='13'/%3E%3Cuse href='%23s' x='27' y='54'/%3E%3Cuse href='%23s' x='55' y='55'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='g' width='139' height='97' patternUnits='userSpaceOnUse' patternTransform='scale(26.55) translate(-962.34 -721.75)'%3E%3Cg fill='%2310B981'%3E%3Cuse href='%23s' x='11' y='8'/%3E%3Cuse href='%23s' x='51' y='13'/%3E%3Cuse href='%23s' x='17' y='73'/%3E%3Cuse href='%23s' x='99' y='57'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23a)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23b)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23h)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23c)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23d)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23e)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23f)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23g)' width='100%25' height='100%25'/%3E%3C/svg%3E\")",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          y: bgY,
        }}
      />
      {/* Ambient glows */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 md:pt-16 md:pb-6 w-full"
      >
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="max-w-4xl mx-auto lg:mx-0 text-center lg:text-left flex flex-col">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[0.74] tracking-tighter mb-5"
            >
              Pay any bill.
              <br />
              <span className="text-white">Instantly.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="text-base sm:text-lg lg:text-xl text-white leading-relaxed mb-7 max-w-2xl mx-auto lg:mx-0"
            >
              Say goodbye to long queues and late fees. Pay utility, mobile,
              education, and insurance bills instantly from anywhere, anytime.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <a
                href="#pay-now"
                className="group inline-flex items-center justify-center gap-2 bg-white text-[#10B981] font-extrabold text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 rounded-2xl hover:bg-white/90 transition-all shadow-2xl hover:-translate-y-1 active:translate-y-0"
              >
                Pay a Bill Now
                <ChevronRight
                  size={22}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
              <Link
                to={ROUTE_PATHS.login}
                className="inline-flex items-center justify-center gap-2 bg-white text-[#10B981] font-bold text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 rounded-2xl border border-white/80 hover:bg-white/90 transition-all"
              >
                Sign In
              </Link>
            </motion.div>
          </div>

          {/* Hero quick-pay preview */}
          <div className="w-full max-w-lg mx-auto lg:mx-0">
            <QuickPayPanel compact showTabs maxCards={6} />
          </div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-2.5"
        >
          {[
            { icon: visaBadge, label: "Visa" },
            { icon: mastercardBadge, label: "Mastercard" },
            { icon: onemoneyBadge, label: "OneMoney" },
            { icon: ecocashBadge, label: "EcoCash" },
            { icon: innbucksBadge, label: "InnBucks" },
            { icon: omariBadge, label: "Omari" },
            { icon: telecashBadge, label: "Telecash" },
            { icon: zimswitchBadge, label: "ZimSwitch" },
          ].map(({ icon, label }) => (
            <img
              key={label}
              src={icon}
              alt={`${label} badge`}
              className="h-10 w-auto max-w-[120px] object-contain rounded-lg border border-white/10 bg-white/5 shadow-sm backdrop-blur-sm"
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        onClick={() =>
          document
            .getElementById("pay-now")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-white/50 hover:text-white/90 text-xs font-medium tracking-[0.25em] uppercase transition-colors z-20 group"
        aria-label="Scroll to services"
      >
        <div className="flex items-center gap-2">
          <Mouse className="w-4 h-4" />
          <span>Scroll</span>
        </div>
        <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent group-hover:h-14 transition-all duration-500" />
      </motion.button>
    </section>
  );
}

// --- Services -----------------------------------------------------------------

function Services() {
  return (
    <section
      id="pay-now"
      className="bg-slate-50/50 py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-[#10B981] text-sm font-black uppercase tracking-[0.2em] mb-4">
              Direct Payments
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
              Select a biller to <span className="text-[#10B981]">pay now</span>
            </h2>
          </div>
          <Link
            to={ROUTE_PATHS.services}
            className="inline-flex items-center gap-2 text-base font-bold text-[#10B981] hover:text-[#10B981] transition-all hover:translate-x-1"
          >
            Explore all services
            <ArrowRight size={20} />
          </Link>
        </div>

        <QuickPayPanel />
      </div>
    </section>
  );
}

type QuickPayPanelProps = {
  compact?: boolean;
  showTabs?: boolean;
  maxCards?: number;
};

function QuickPayPanel({
  compact = false,
  showTabs = true,
  maxCards,
}: QuickPayPanelProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-products-categories", activeCategory],
    queryFn: () =>
      fetchProductsAndCategories(
        activeCategory === "all" ? undefined : activeCategory,
      ),
    staleTime: 5 * 60 * 1000,
  });

  const categoryTabs: CategoryTab[] = useMemo(() => {
    const fromApi = (data?.categories ?? [])
      .filter((c) => c.active !== false)
      .map((c) => ({
        key: String(c.id ?? c.name ?? "").trim(),
        label: String(c.displayName ?? c.name ?? "Category"),
      }))
      .filter((c) => c.key.length > 0);

    if (fromApi.length > 0) {
      return [{ key: "all", label: "All Services" }, ...fromApi];
    }

    const seen = new Set<string>();
    const fromProducts = (data?.products ?? [])
      .filter((p) => p.status === "ACTIVE" && !p.deleted)
      .map((p) => {
        const name = String(p.name ?? "Unnamed");
        const code = String(p.code ?? "");
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

    const base =
      fromProducts.length > 0
        ? fromProducts
        : [{ key: "utilities", label: "Utilities" }];
    return [{ key: "all", label: "All Services" }, ...base];
  }, [data?.categories, data?.products]);

  const billers: BillerItem[] = useMemo(
    () =>
      (data?.products ?? []).flatMap((p) => {
        if (p.status !== "ACTIVE" || p.deleted || typeof p.id !== "number") {
          return [];
        }

        const name = String(p.name ?? "Unnamed");
        const code = String(p.code ?? "");
        const inferred = inferCategory(name, code);
        const cat = p.category;
        const productCategoryId =
          typeof cat?.id === "number" ? cat.id : undefined;
        const categoryKey = String(cat?.id ?? cat?.name ?? inferred.key);
        const categoryLabel = String(
          cat?.displayName ?? cat?.name ?? inferred.label,
        );
        return [
          {
            id: `p-${String(p.id)}`,
            productId: p.id,
            productCategoryId,
            name,
            categoryKey,
            categoryLabel,
            fields: fieldsByProduct(name, categoryLabel),
            minimumPurchaseAmount: Number(p.minimumPurchaseAmount ?? 0),
          },
        ];
      }),
    [data?.products],
  );

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? billers
        : billers.filter((b) => b.categoryKey === activeCategory),
    [billers, activeCategory],
  );

  const selected = useMemo(
    () => filtered.find((b) => b.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId],
  );

  const displayBillers = useMemo(
    () =>
      typeof maxCards === "number" ? filtered.slice(0, maxCards) : filtered,
    [filtered, maxCards],
  );

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId("");
      return;
    }
    if (!filtered.some((b) => b.id === selectedId))
      setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  useEffect(() => {
    if (!selected) return;
    const next: Record<string, string> = {};
    selected.fields.forEach((f) => {
      if (
        f.key === "amount" &&
        selected.minimumPurchaseAmount &&
        selected.minimumPurchaseAmount > 0
      ) {
        next[f.key] = String(selected.minimumPurchaseAmount);
      } else {
        next[f.key] = formValues[f.key] ?? "";
      }
    });
    setFormValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const handleContinue = () => {
    if (!selected) return;
    const account = formValues.accountNumber || formValues.mobileNumber || "";
    const query = new URLSearchParams({
      biller: selected.name,
      account,
      amount: formValues.amount || "0",
      productId: String(selected.productId),
    });
    if (selected.productCategoryId !== undefined) {
      query.set("productCategoryId", String(selected.productCategoryId));
    }
    window.location.assign(`${ROUTE_PATHS.checkout}?${query.toString()}`);
  };

  const containerClasses = compact
    ? "bg-white/95 rounded-[2rem] border border-white/20 shadow-2xl  overflow-hidden backdrop-blur-md min-h-[480px]"
    : "bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden";
  const tabsClasses = compact
    ? "flex gap-2 overflow-x-auto px-5 py-3.5 bg-white border-b border-slate-100 scrollbar-hide min-h-[64px] items-center"
    : "flex gap-3 overflow-x-auto px-8 py-6 bg-slate-50/30 border-b border-slate-100 scrollbar-hide min-h-[84px] items-center";
  const tabBtnClasses = (active: boolean) =>
    compact
      ? `group inline-flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 border ${
          active
            ? "bg-[#10B981] border-[#10B981] text-white shadow-xl shadow-[#10B981]/20"
            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"
        }`
      : `group inline-flex items-center gap-3 whitespace-nowrap px-8 py-3.5 rounded-[1.25rem] text-sm font-black transition-all shrink-0 border-2 active:scale-95 hover:-translate-y-0.5 ${
          active
            ? "bg-[#10B981] border-[#10B981] text-white shadow-xl shadow-[#10B981]/20"
            : "bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-800"
        }`;
  const contentGrid = compact
    ? "grid sm:grid-cols-2 min-h-[480px]"
    : "grid lg:grid-cols-[1fr_380px]";
  const leftPad = compact ? "p-5 sm:p-6" : "p-8";
  const cardGrid = compact
    ? "grid grid-cols-2 gap-2"
    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4";
  const cardBtn = (active: boolean) =>
    compact
      ? `group flex flex-col items-center gap-2 p-3.5 rounded-[1.4rem] border transition-all duration-300 ${
          active
            ? "border-[#10B981] bg-[#10B981]/10 shadow-xl shadow-[#10B981]/15"
            : "border-slate-200 bg-white"
        }`
      : `group flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all duration-300 ${
          active
            ? "border-[#10B981] bg-[#10B981]/10 shadow-xl shadow-[#10B981]/15"
            : "border-slate-200 bg-white"
        }`;
  const iconBox = (active: boolean) =>
    compact
      ? `w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          active
            ? "bg-[#10B981] text-white scale-105 rotate-2 shadow-md shadow-[#10B981]/25"
            : "bg-white text-slate-400 border border-slate-100"
        }`
      : `w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          active
            ? "bg-[#10B981] text-white scale-110 rotate-3 shadow-md shadow-[#10B981]/25"
            : "bg-white text-slate-400 border border-slate-100"
        }`;

  return (
    <div className={containerClasses}>
      {showTabs && (
        <div className={tabsClasses}>
          {isLoading ? (
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`${compact ? "h-9 w-20" : "h-12 w-32"} bg-slate-200 rounded-2xl animate-pulse shrink-0`}
                />
              ))}
            </div>
          ) : (
            categoryTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={tabBtnClasses(activeCategory === tab.key)}
              >
                {tab.key !== "all" && (
                  <div
                    className={`transition-colors ${activeCategory === tab.key ? "text-[#10B981]" : "text-slate-400 group-hover:text-slate-600"}`}
                  >
                    {categoryIcon(tab.label, compact ? "w-4 h-4" : "w-5 h-5")}
                  </div>
                )}
                {tab.label}
              </button>
            ))
          )}
        </div>
      )}

      <div className={contentGrid}>
        <div
          className={`${leftPad} ${compact ? "" : "lg:border-r"} border-slate-100 bg-white min-h-[280px] h-full`}
        >
          {isLoading && (
            <div className={cardGrid}>
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`${compact ? "h-24" : "h-28"} bg-slate-50 rounded-2xl animate-pulse`}
                />
              ))}
            </div>
          )}

          {isError && (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-bold">
                Could not load products. Please try again later.
              </p>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-bold">
                No active products in this category.
              </p>
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className={cardGrid}>
              {displayBillers.map((biller) => {
                const isActive = selected?.id === biller.id;
                return (
                  <button
                    key={biller.id}
                    onClick={() => setSelectedId(biller.id)}
                    className={cardBtn(isActive)}
                  >
                    <div className={iconBox(isActive)}>
                      {categoryIcon(
                        biller.categoryLabel,
                        compact ? "w-5 h-5" : "w-7 h-7",
                      )}
                    </div>
                    <span
                      className={`${compact ? "text-[11px]" : "text-sm"} font-bold leading-tight line-clamp-2 text-slate-900`}
                    >
                      {biller.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div
          className={`${leftPad} ${compact ? "border-t sm:border-t-0 sm:border-l" : ""} border-slate-100 bg-slate-50/30 h-full`}
        >
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center py-10 text-slate-400 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Zap size={24} className="text-slate-200" />
              </div>
              <p className={`${compact ? "text-xs" : "text-sm"} font-bold`}>
                Select a biller to
                <br />
                see payment details
              </p>
            </div>
          ) : (
            <div className={compact ? "space-y-4" : "space-y-6"}>
              <div>
                <span
                  className={`inline-block ${compact ? "text-[9px]" : "text-[10px]"} font-black text-[#10B981] uppercase tracking-[0.2em] mb-1`}
                >
                  Paying to
                </span>
                <h3
                  className={`${compact ? "text-base" : "text-xl"} font-black text-slate-900 leading-tight`}
                >
                  {selected.name}
                </h3>
              </div>

              <div className={compact ? "space-y-3" : "space-y-4"}>
                {selected.fields.map((field) => (
                  <div key={field.key}>
                    <label
                      className={`block ${compact ? "text-[10px]" : "text-xs"} font-black text-slate-500 uppercase tracking-widest mb-2 ml-1`}
                    >
                      {field.label}
                    </label>
                    {field.prefix ? (
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-[#10B981] transition-colors">
                          {field.prefix}
                        </span>
                        <input
                          type={field.type ?? "text"}
                          placeholder={field.placeholder}
                          value={formValues[field.key] ?? ""}
                          onChange={(e) =>
                            setFormValues((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          className={`block w-full ${compact ? "pl-8 pr-3 py-3 text-sm" : "pl-8 pr-4 py-4 text-base"} border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#10B981]/10 focus:border-[#10B981] font-bold transition-all bg-white shadow-sm`}
                        />
                      </div>
                    ) : (
                      <input
                        type={field.type ?? "text"}
                        placeholder={field.placeholder}
                        value={formValues[field.key] ?? ""}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className={`block w-full ${compact ? "px-3 py-3 text-sm" : "px-4 py-4 text-base"} border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#10B981]/10 focus:border-[#10B981] font-bold transition-all bg-white shadow-sm`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={!selected}
                className={`w-full flex justify-center items-center gap-3 ${compact ? "py-3 text-sm" : "py-5 text-base"} px-6 rounded-2xl font-black text-white bg-[#10B981] hover:bg-[#10B981] shadow-xl  disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1 mt-4`}
              >
                Continue to Payment
                <ArrowRight size={compact ? 18 : 20} />
              </button>

              <div className="flex items-center gap-2 justify-center text-xs text-slate-400 font-medium">
                <ShieldCheck size={14} className="text-[#10B981]" />
                Secure checkout via EseBills
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Overview -----------------------------------------------------------------

function Overview() {
  const cards = [
    {
      icon: Zap,
      title: "Instant Settlement",
      desc: "Payments processed in real-time. Instant validation and confirmation on every transaction.",
      stat: "< 3s",
      statLabel: "avg. settlement",
    },
    {
      icon: ShieldCheck,
      title: "Bank-level Security",
      desc: "Your transactions are encrypted end-to-end with OTP verification on every login.",
      stat: "256-bit",
      statLabel: "encryption",
    },
    {
      icon: Users,
      title: "Built for Everyone",
      desc: "Customers, agents, and billers — one unified platform for the full payment ecosystem.",
      stat: "3",
      statLabel: "user types",
    },
  ];

  return (
    <section
      id="overview"
      className="bg-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-xl"
          >
            <p className="text-[#10B981] text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-3">
              The Platform
            </p>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
              One platform.
              <br />
              Pay anything.
            </h2>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
              EseBills connects customers, agents, and businesses on a single
              payment platform — eliminating queues, delays, and cash handling.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {cards.map(({ icon: Icon, title, desc, stat, statLabel }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                className={`group relative p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-xl transition-all duration-300 overflow-hidden bg-white ${
                  i === 2 ? "sm:col-span-2" : ""
                }`}
              >
                <div className="absolute top-0 right-0 pr-6 pt-5 text-right">
                  <p className="text-2xl font-black text-[#10B981]">{stat}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#10B981]">
                    {statLabel}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#10B981] flex items-center justify-center mb-5 transition-all duration-300">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Who It's For -------------------------------------------------------------

function ForWho() {
  const audiences = [
    {
      icon: Users,
      title: "Customers",
      tag: "Personal",
      featured: true,
      description:
        "Pay your utility, mobile, education, and insurance bills instantly from one secure dashboard.",
      perks: [
        "Electricity & water bills",
        "Airtime & data bundles",
        "School & university fees",
        "Full payment history",
      ],
      cta: "Create Free Account",
      href: ROUTE_PATHS.registerBuyer,
      loginHref: ROUTE_PATHS.login,
      loginLabel: "Already a customer? Sign in",
    },
    {
      icon: Store,
      title: "EseAgents & Corporates",
      tag: "Business & Scale",
      featured: false,
      description:
        "Join our agency network or manage company payouts. Execute bulk payments for employees and recurring bills.",
      perks: [
        "Bulk & Recurring Payments",
        "Competitive commissions",
        "Float management",
        "Real-time reports",
      ],
      cta: "Join the Network",
      href: ROUTE_PATHS.registerAgent,
      loginHref: ROUTE_PATHS.loginAgent,
      loginLabel: "Business login",
    },
    {
      icon: Building2,
      title: "Billers",
      tag: "Corporate",
      featured: false,
      description:
        "Digitize your collections. Reach more customers and receive real-time settlements.",
      perks: [
        "Digital collection portal",
        "Real-time settlements",
        "Reconciliation reports",
        "API integration",
      ],
      cta: "Register as Biller",
      href: ROUTE_PATHS.registerBiller,
      loginHref: ROUTE_PATHS.loginBiller,
      loginLabel: "Biller login",
    },
  ];

  return (
    <section
      id="audience"
      className="bg-slate-50/60 py-20 sm:py-28 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl mb-12 sm:mb-16"
        >
          <p className="text-[#10B981] text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-3">
            Who It's For
          </p>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            Built for the full
            <br />
            payment ecosystem.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {audiences.map(
            (
              {
                icon: Icon,
                title,
                tag,
                featured,
                description,
                perks,
                cta,
                href,
                loginHref,
                loginLabel,
              },
              i,
            ) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                className={`relative rounded-3xl p-7 sm:p-8 flex flex-col overflow-hidden ${
                  featured
                    ? "bg-[#10B981]/10 border border-[#10B981]/40 shadow-xl shadow-[#10B981]/20"
                    : "bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all"
                }`}
              >
                {featured && (
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#10B981]/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                )}
                <div
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-5 self-start ${
                    featured
                      ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon size={12} />
                  {tag}
                </div>
                <h3
                  className={`text-lg sm:text-xl font-bold mb-3 ${featured ? "text-slate-900" : "text-slate-900"}`}
                >
                  {title}
                </h3>
                <p
                  className={`text-sm leading-relaxed mb-5 ${featured ? "text-slate-700" : "text-slate-500"}`}
                >
                  {description}
                </p>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {perks.map((perk) => (
                    <li
                      key={perk}
                      className={`flex items-center gap-2.5 text-sm ${featured ? "text-slate-700" : "text-slate-600"}`}
                    >
                      <CheckCircle2
                        size={14}
                        className={
                          featured
                            ? "text-[#10B981] shrink-0"
                            : "text-[#10B981] shrink-0"
                        }
                      />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  to={href}
                  className={`inline-flex items-center justify-center gap-2 font-bold text-sm px-5 py-3.5 rounded-2xl transition-all ${
                    featured
                      ? "bg-[#10B981] text-white hover:bg-[#10B981] shadow-lg "
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {cta}
                  <ChevronRight size={16} />
                </Link>
                <Link
                  to={loginHref}
                  className={`mt-3 text-center text-xs transition-colors font-medium ${featured ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {loginLabel}
                </Link>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

// --- Features -----------------------------------------------------------------

function Features() {
  const features = [
    {
      icon: Zap,
      title: "Instant Settlement",
      desc: "Real-time payment processing with instant validation and confirmation.",
    },
    {
      icon: ShieldCheck,
      title: "No Hidden Fees",
      desc: "What you see is what you pay. Transparent pricing, always.",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      desc: "Our team is available around the clock to assist with any issues.",
    },
    {
      icon: CreditCard,
      title: "Multiple Channels",
      desc: "Pay via card, mobile money, or bank transfer — your choice.",
    },
    {
      icon: BarChart3,
      title: "Real-time Reports",
      desc: "Full transaction history and analytics at your fingertips.",
    },
    {
      icon: Store,
      title: "Agent Network",
      desc: "Thousands of agents nationwide for cash-in and assisted payments.",
    },
    {
      icon: Building2,
      title: "Biller Integration",
      desc: "Connected to ZESA, ZINWA, TelOne, Econet, NetOne, and more.",
    },
    {
      icon: Users,
      title: "Secure & Compliant",
      desc: "Bank-level encryption, OTP verification, and full audit trails.",
    },
  ];

  return (
    <section
      id="features"
      className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-10 sm:mb-16">
          <p className="text-[#10B981] text-xs sm:text-sm font-bold uppercase tracking-widest mb-3">
            Platform Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            Everything you need.
            <br />
            Nothing you don't.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mt-4">
            EseBills covers the full bill payment workflow — purpose-built for
            the African market.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white to-[#10B981]/[0.04] border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#10B981]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 w-10 h-10 rounded-xl bg-[#10B981]/12 ring-1 ring-[#10B981]/20 flex items-center justify-center mb-4 group-hover:bg-[#10B981]/20 transition-colors">
                <Icon size={18} className="text-[#10B981]" />
              </div>
              <h3 className="relative z-10 text-slate-900 font-semibold text-sm mb-2">{title}</h3>
              <p className="relative z-10 text-slate-600 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Banner Break -------------------------------------------------------------

function BannerBreak() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div ref={ref} className="relative h-52 sm:h-64 overflow-hidden">
      <motion.div
        className="absolute inset-0 scale-125"
        style={{
          backgroundImage: `url(${bg1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          y: bgY,
        }}
      />
      <div className="absolute inset-0 bg-slate-950/70" />
      <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6">
        <p className="text-white text-xl sm:text-2xl lg:text-4xl font-bold text-center max-w-3xl leading-tight">
          Paying bills should be{" "}
          <span className="text-[#10B981]">simple, fast, and free.</span>
        </p>
      </div>
    </div>
  );
}

// --- How It Works -------------------------------------------------------------

function HowItWorks() {
  const [active, setActive] = useState<"customer" | "agent">("customer");

  const steps = {
    customer: [
      {
        n: "01",
        title: "Create an account",
        desc: "Register in minutes with your email and phone number.",
      },
      {
        n: "02",
        title: "Fund your wallet",
        desc: "Top up via card, mobile money, or bank transfer.",
      },
      {
        n: "03",
        title: "Choose a biller",
        desc: "Select from electricity, water, airtime, internet, and more.",
      },
      {
        n: "04",
        title: "Pay instantly",
        desc: "Your payment is confirmed in seconds. No queues, no hassle.",
      },
    ],
    agent: [
      {
        n: "01",
        title: "Apply to join",
        desc: "Submit your agent application with basic business details.",
      },
      {
        n: "02",
        title: "Get approved",
        desc: "Our team reviews your application within 24 hours.",
      },
      {
        n: "03",
        title: "Buy float",
        desc: "Load your float balance to start processing transactions.",
      },
      {
        n: "04",
        title: "Start selling",
        desc: "Sell airtime, tokens, and bills. Earn commissions daily.",
      },
    ],
  };

  return (
    <section
      id="how-it-works"
      className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-8 sm:mb-12">
          <p className="text-[#10B981] text-xs sm:text-sm font-bold uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            Up and running
            <br />
            in minutes.
          </h2>
        </div>

        <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl mb-12 sm:mb-16">
          {(["customer", "agent"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`relative px-8 py-3.5 rounded-xl text-xs sm:text-sm font-black transition-all uppercase tracking-widest ${
                active === tab
                  ? "text-white shadow-xl shadow-slate-900/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {active === tab && (
                <motion.div
                  layoutId="active-tab-bg"
                  className="absolute inset-0 bg-[#10B981] rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">
                {tab === "customer" ? "For Customers" : "For Agents"}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps[active].map(({ n, title, desc }, i) => (
            <div key={n} className="relative">
              {i < steps[active].length - 1 && (
                <div
                  className="hidden lg:block absolute top-6 h-px bg-gradient-to-r from-[#10B981] via-slate-200 to-slate-200 z-0"
                  style={{ left: "48px", width: "calc(100% - 24px)" }}
                />
              )}
              <div className="relative z-10">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#10B981] text-white font-bold text-sm flex items-center justify-center mb-4 sm:mb-5">
                  {n}
                </div>
                <h3 className="text-slate-900 font-bold text-sm sm:text-base mb-2">
                  {title}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Final CTA ----------------------------------------------------------------

function FinalCTA() {
  return (
    <section className="bg-[#10B981]/10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <p className="text-[#10B981] text-xs sm:text-sm font-bold uppercase tracking-widest mb-4">
          Get Started
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-5 sm:mb-6">
          Ready to simplify
          <br />
          your bill payments?
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto">
          Join thousands of customers and agents already using EseBills to pay
          bills instantly, earn commissions, and manage payments digitally.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            to={ROUTE_PATHS.register}
            className="group inline-flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold text-sm sm:text-base px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl hover:bg-[#10B981] transition-all shadow-lg "
          >
            Create Account
            <ChevronRight
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
          <Link
            to={ROUTE_PATHS.loginAgent}
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold text-sm sm:text-base px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-slate-200 hover:bg-white/90 transition-all"
          >
            <Store size={16} />
            Agent Portal
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- Page ---------------------------------------------------------------------

export function HomePage() {
  const location = useLocation();

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!scrollTo) return;
    const attempt = (retries: number) => {
      const el = document.getElementById(scrollTo);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
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
