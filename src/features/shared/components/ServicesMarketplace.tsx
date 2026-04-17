import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Droplets,
  Grid2x2,
  Heart,
  ShieldCheck,
  Search,
  Smartphone,
  Sparkles,
  Tv,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { ROUTE_PATHS } from "../../../router/paths";
import ProductVariantPicker from "../../landing/components/ProductVariantPicker";
import {
  getActiveCampaigns,
  type DonationCampaign,
} from "../../../services/donations.service";
import {
  getDonationCampaignsV1,
  type DonationCampaignV1,
} from "../../../services/donationsV1.service";
import {
  getCurrencies,
  getProductCategories,
  getProducts,
  getProductsByCategory,
  getProductVariants,
} from "../../../services/products.service";
import type {
  Currency,
  Product,
  ProductCategory,
} from "../../../types/products";

function inferCategory(
  name: string,
  code: string,
): { key: string; label: string } {
  const v = `${name} ${code}`.toLowerCase();
  if (/(airtime|recharge|evd|topup|bundle)/.test(v))
    return { key: "airtime", label: "Airtime & Bundles" };
  if (/(internet|data)/.test(v))
    return { key: "internet", label: "Internet & Data" };
  if (/(school|tuition|fees|university|college|education)/.test(v))
    return { key: "education", label: "Education" };
  if (/(insurance|life|medical|health)/.test(v))
    return { key: "insurance", label: "Insurance" };
  if (/(fuel|petrol|diesel|gas)/.test(v)) return { key: "fuel", label: "Fuel" };
  if (/(entertainment|tv|dstv|showmax|netflix|music)/.test(v))
    return { key: "entertainment", label: "Entertainment" };
  if (/(donat)/.test(v)) return { key: "donations", label: "Donations" };
  if (/(esolution|solution|service desk|support|digital)/.test(v))
    return { key: "esolutions", label: "eSolutions" };
  if (/(other service|other services|other)/.test(v))
    return { key: "other", label: "Other Services" };
  if (/(lottery|loto|jackpot)/.test(v))
    return { key: "lottery", label: "Lottery" };
  return { key: "utilities", label: "Utilities" };
}

function CategoryIcon({
  categoryKey,
  className = "w-5 h-5",
}: {
  categoryKey: string;
  className?: string;
}) {
  switch (categoryKey.toLowerCase()) {
    case "airtime":
      return <Smartphone className={className} />;
    case "internet":
      return <Wifi className={className} />;
    case "education":
      return <BookOpen className={className} />;
    case "insurance":
      return <ShieldCheck className={className} />;
    case "fuel":
      return <Droplets className={className} />;
    case "entertainment":
      return <Tv className={className} />;
    case "donations":
      return <Heart className={className} />;
    case "esolutions":
    case "other":
      return <Grid2x2 className={className} />;
    case "lottery":
      return <Sparkles className={className} />;
    default:
      return <Zap className={className} />;
  }
}

const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  airtime: { bg: "bg-blue-50", icon: "text-blue-500" },
  internet: { bg: "bg-violet-50", icon: "text-violet-500" },
  education: { bg: "bg-amber-50", icon: "text-amber-500" },
  insurance: { bg: "bg-rose-50", icon: "text-rose-500" },
  fuel: { bg: "bg-orange-50", icon: "text-orange-500" },
  entertainment: { bg: "bg-sky-50", icon: "text-sky-600" },
  donations: { bg: "bg-pink-50", icon: "text-pink-500" },
  esolutions: { bg: "bg-indigo-50", icon: "text-indigo-600" },
  other: { bg: "bg-slate-50", icon: "text-slate-600" },
  lottery: { bg: "bg-purple-50", icon: "text-purple-500" },
  utilities: { bg: "bg-emerald-50", icon: "text-emerald-600" },
};

function getColor(key: string) {
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.utilities;
}

async function fetchData(params: {
  search?: string;
  categoryId?: string | number;
}): Promise<{ products: Product[]; categories: ProductCategory[] }> {
  const isDonationsOnly = params.categoryId === "donations";
  const [productsPage, categories] = await Promise.all([
    params.categoryId && params.categoryId !== "all" && !isDonationsOnly
      ? getProductsByCategory(params.categoryId, {
          size: 100,
          search: params.search,
        })
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
  isDonationCampaign?: boolean;
};

type CategoryTab = { key: string; label: string };

interface ServicesMarketplaceProps {
  embedded?: boolean;
  /** Slightly smaller typography for tight/embedded layouts (eg: Home "Direct Payments" section). */
  compact?: boolean;
  /** Category selector layout. Defaults to tab pills. */
  categoryUi?: "tabs" | "cards";
  /** When true, hides the products grid until the user selects a category or searches. */
  hideProductsUntilCategory?: boolean;
  /** Controls border-radius for inputs/cards/buttons in this instance. */
  radius?: "default" | "sm";
  /** When set, the products grid is collapsed to this many rows by default and can be expanded via "View all". */
  previewRows?: number;
  showTitle?: boolean;
  liftSearch?: boolean;
  headerPortalId?: string;
  tabsPortalId?: string;
  onSelectProduct?: (product: BillerCard) => void;
}

export function ServicesMarketplace({
  embedded = false,
  compact = false,
  categoryUi = "tabs",
  hideProductsUntilCategory = false,
  radius = "default",
  previewRows,
  showTitle = true,
  liftSearch = false,
  headerPortalId,
  tabsPortalId,
  onSelectProduct,
}: ServicesMarketplaceProps) {
  const navigate = useNavigate();
  const isCompact = compact;
  const effectivePreviewRows =
    previewRows ?? (!onSelectProduct ? 2 : undefined);

  const radiusControl = radius === "sm" ? "rounded-sm" : "rounded-2xl";
  const radiusCard = radius === "sm" ? "rounded-sm" : "rounded-2xl";
  const radiusButton = radius === "sm" ? "rounded-sm" : "rounded-xl";
  const radiusChip = radius === "sm" ? "rounded-sm" : "rounded-lg";
  const radiusIcon = radius === "sm" ? "rounded-sm" : "rounded-full";
  const radiusPanel =
    radius === "sm" ? "rounded-sm" : "rounded-2xl sm:rounded-3xl";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(() =>
    hideProductsUntilCategory && categoryUi === "cards" ? "" : "all",
  );
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedBaseProduct, setSelectedBaseProduct] =
    useState<BillerCard | null>(null);
  const [isGridExpanded, setIsGridExpanded] = useState(false);
  const [collapsedGridHeight, setCollapsedGridHeight] = useState<number | null>(
    null,
  );
  const [canExpandGrid, setCanExpandGrid] = useState(false);
  const gridViewportRef = useRef<HTMLDivElement | null>(null);
  const firstCardMeasureRef = useRef<HTMLDivElement | null>(null);
  const [headerHostEl, setHeaderHostEl] = useState<HTMLElement | null>(null);
  const [tabsHostEl, setTabsHostEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setHeaderHostEl(
      headerPortalId
        ? (document.getElementById(headerPortalId) as HTMLElement | null)
        : null,
    );
    setTabsHostEl(
      tabsPortalId
        ? (document.getElementById(tabsPortalId) as HTMLElement | null)
        : null,
    );
  }, [headerPortalId, tabsPortalId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Keep the preview collapsed by default when filters change.
  useEffect(() => {
    if (!effectivePreviewRows) return;
    setIsGridExpanded(false);
  }, [effectivePreviewRows, activeCategory, debouncedSearch, selectedCurrency]);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [
      "services-marketplace-products",
      activeCategory,
      debouncedSearch,
    ],
    queryFn: () =>
      fetchData({
        categoryId: activeCategory,
        search: debouncedSearch || undefined,
      }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const { data: donationCampaignsData } = useQuery({
    queryKey: ["donations-campaigns-unified"],
    queryFn: async () => {
      const [v1, pub] = await Promise.allSettled([
        getDonationCampaignsV1(),
        getActiveCampaigns(),
      ]);
      return {
        v1:
          v1.status === "fulfilled" && Array.isArray(v1.value) ? v1.value : [],
        pub:
          pub.status === "fulfilled" && Array.isArray(pub.value)
            ? pub.value
            : [],
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: currenciesData } = useQuery({
    queryKey: ["currencies", "all"],
    queryFn: getCurrencies,
    staleTime: 10 * 60 * 1000,
  });

  const selectedBaseId = selectedBaseProduct?.productId;
  const {
    data: selectedBaseVariants = [],
    isLoading: isLoadingSelectedBaseVariants,
    isFetching: isFetchingSelectedBaseVariants,
  } = useQuery({
    queryKey: ["services-marketplace-variants", selectedBaseId],
    queryFn: () => getProductVariants(selectedBaseId!),
    enabled: typeof selectedBaseId === "number" && selectedBaseId > 0,
    staleTime: 60_000,
  });

  const isInitialLoading = isLoading && !data;
  const isBusy = isFetching || isInitialLoading;

  const categoryTabs = useMemo<CategoryTab[]>(() => {
    const fromBackend = (data?.categories ?? [])
      .filter((c) => c.active !== false)
      .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
      .map((c) => ({
        key: String(c.id ?? c.name ?? ""),
        label: String(c.displayName ?? c.name ?? "Services"),
      }))
      .filter((t) => t.key.trim().length > 0);

    const tabs: CategoryTab[] = [
      { key: "all", label: "All Services" },
      ...fromBackend,
    ];

    // Only show Donations tab when we have at least one campaign available.
    const donationsCount =
      (donationCampaignsData?.v1?.length ?? 0) +
      (donationCampaignsData?.pub?.length ?? 0);
    if (donationsCount > 0) tabs.push({ key: "donations", label: "Donations" });

    // De-dup by key (backend sometimes returns duplicates across envs)
    const seen = new Set<string>();
    return tabs.filter((t) => {
      if (seen.has(t.key)) return false;
      seen.add(t.key);
      return true;
    });
  }, [
    data?.categories,
    donationCampaignsData?.v1?.length,
    donationCampaignsData?.pub?.length,
  ]);

  const billers = useMemo<BillerCard[]>(() => {
    const products = (data?.products ?? [])
      .filter((p) => p.deleted !== true)
      .filter((p) => !p.status || p.status === "ACTIVE")
      .map((p) => {
        const categoryLabel = String(
          p.category?.displayName ?? p.category?.name ?? "",
        );
        const inferred = inferCategory(
          categoryLabel || String(p.name ?? ""),
          String(p.code ?? ""),
        );
        const currencyCode = p.defaultCurrency?.code ?? undefined;
        const currencyName = p.defaultCurrency?.name ?? undefined;

        return {
          id: `product-${String(p.id ?? "")}`,
          productId: Number(p.id ?? 0),
          productCategoryId: p.category?.id ?? undefined,
          name: String(p.name ?? "Service"),
          description: p.description ?? undefined,
          categoryKey: inferred.key,
          categoryLabel: categoryLabel || inferred.label,
          currencyCode,
          currencyName,
          minimumPurchaseAmount: p.minimumPurchaseAmount ?? undefined,
        } satisfies BillerCard;
      })
      .filter((b) => b.productId > 0);

    const donationCards: BillerCard[] = [
      ...(donationCampaignsData?.v1 ?? []),
      ...(donationCampaignsData?.pub ?? []),
    ].map((c) => {
      const name = String(
        (c as DonationCampaignV1).name ??
          (c as DonationCampaign).name ??
          "Donation",
      );
      const description =
        (c as DonationCampaignV1).description ??
        (c as DonationCampaign).description ??
        undefined;
      const currencyCode =
        "currencyCode" in c ? (c as DonationCampaign).currencyCode : undefined;

      return {
        id: `donation-${String((c as DonationCampaignV1).id ?? (c as DonationCampaign).id ?? name)}`,
        productId: 0,
        name,
        description,
        categoryKey: "donations",
        categoryLabel: "Donations",
        currencyCode,
        minimumPurchaseAmount:
          Number(
            (c as DonationCampaignV1).targetAmount ??
              (c as DonationCampaign).targetAmount ??
              0,
          ) || undefined,
        isDonationCampaign: true,
      };
    });

    return [...products, ...donationCards];
  }, [data?.products, donationCampaignsData]);

  const availableCurrencies = useMemo<
    Array<{ code: string; name: string }>
  >(() => {
    const raw = currenciesData as
      | { content?: Currency[] }
      | Currency[]
      | undefined;
    const list: Currency[] = Array.isArray(raw)
      ? raw
      : ((raw as { content?: Currency[] })?.content ?? []);
    return list
      .filter((c) => c.code && c.active !== false)
      .map((c) => ({ code: c.code!, name: c.name ?? c.code! }));
  }, [currenciesData]);

  const filtered = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    return billers.filter((b) => {
      const matchesCat =
        activeCategory === "all" ||
        (activeCategory === "donations"
          ? !!b.isDonationCampaign
          : String(b.productCategoryId ?? "") === activeCategory);
      const matchesCurrency =
        !selectedCurrency ||
        !b.currencyCode ||
        b.currencyCode === selectedCurrency;
      const matchesSearch =
        !searchLower ||
        b.name.toLowerCase().includes(searchLower) ||
        (b.description ?? "").toLowerCase().includes(searchLower);
      return matchesCat && matchesCurrency && matchesSearch;
    });
  }, [billers, activeCategory, selectedCurrency, debouncedSearch]);

  const hasActiveFilters = !!selectedCurrency || !!debouncedSearch;

  useEffect(() => {
    if (!effectivePreviewRows || effectivePreviewRows <= 0) {
      setCollapsedGridHeight(null);
      setCanExpandGrid(false);
      return;
    }
    if (isGridExpanded || selectedBaseProduct) return;

    const viewport = gridViewportRef.current;
    const firstCard = firstCardMeasureRef.current;
    if (!viewport || !firstCard) {
      setCollapsedGridHeight(null);
      setCanExpandGrid(false);
      return;
    }

    const gapPx = 16; // gap-4
    const bottomPadPx = 16; // pb-4

    const update = () => {
      const cardH = firstCard.getBoundingClientRect().height || 0;
      if (cardH <= 0) return;
      const h = Math.round(
        cardH * effectivePreviewRows +
          gapPx * (effectivePreviewRows - 1) +
          bottomPadPx,
      );
      setCollapsedGridHeight(h);

      // Whether the full content would overflow this collapsed height.
      // Use rAF to let layout settle (esp. after font loads).
      requestAnimationFrame(() => {
        const host = gridViewportRef.current;
        if (!host) return;
        setCanExpandGrid(host.scrollHeight > h + 2);
      });
    };

    update();

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (ro) {
      ro.observe(firstCard);
      ro.observe(viewport);
    } else {
      window.addEventListener("resize", update);
    }

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [
    effectivePreviewRows,
    filtered.length,
    isGridExpanded,
    selectedBaseProduct,
  ]);

  const proceedToCheckout = useCallback(
    (biller: BillerCard) => {
      if (onSelectProduct) {
        onSelectProduct(biller);
        return;
      }
      if (
        biller.isDonationCampaign &&
        (!biller.productId || biller.productId <= 0)
      ) {
        navigate(`${ROUTE_PATHS.portalCustomer}/donations`);
        return;
      }

      const query = new URLSearchParams({
        biller: biller.name,
        account: "",
        amount: "0",
        productId: String(biller.productId),
      });
      if (biller.productCategoryId !== undefined) {
        query.set("productCategoryId", String(biller.productCategoryId));
      }
      navigate(`${ROUTE_PATHS.checkout}?${query.toString()}`);
    },
    [navigate, onSelectProduct],
  );

  // When a base product has variants (plans/bundles), we show the picker in-place (inside the marketplace)
  // instead of immediately navigating away to the /checkout page.
  const openProduct = useCallback(
    (biller: BillerCard) => {
      if (biller.isDonationCampaign) {
        proceedToCheckout(biller);
        return;
      }
      if (!biller.productId || biller.productId <= 0) {
        proceedToCheckout(biller);
        return;
      }
      setSelectedBaseProduct(biller);
    },
    [proceedToCheckout],
  );

  const showVariantPicker =
    !!selectedBaseProduct && selectedBaseVariants.length > 0;
  const isSelectedBaseVariantsBusy =
    isLoadingSelectedBaseVariants || isFetchingSelectedBaseVariants;

  useEffect(() => {
    if (!selectedBaseProduct) return;
    // Wait until the variants query has completed
    if (isLoadingSelectedBaseVariants || isFetchingSelectedBaseVariants) return;

    // No variants for this product: fall back to the normal checkout flow.
    if (selectedBaseVariants.length === 0) {
      const biller = selectedBaseProduct;
      setSelectedBaseProduct(null);
      proceedToCheckout(biller);
    }
  }, [
    selectedBaseProduct,
    isLoadingSelectedBaseVariants,
    isFetchingSelectedBaseVariants,
    selectedBaseVariants.length,
    proceedToCheckout,
  ]);

  const handleSelectVariant = useCallback(
    (variant: Product) => {
      if (!selectedBaseProduct) return;

      const name = String(variant.name ?? selectedBaseProduct.name);
      const code = String(variant.code ?? "");
      const inferred = inferCategory(name, code);

      const variantBiller: BillerCard = {
        id: `product-${String(variant.id ?? name)}`,
        productId: Number(variant.id ?? 0),
        productCategoryId:
          variant.category?.id ?? selectedBaseProduct.productCategoryId,
        name,
        description: variant.description ?? selectedBaseProduct.description,
        categoryKey: inferred.key || selectedBaseProduct.categoryKey,
        categoryLabel: selectedBaseProduct.categoryLabel,
        currencyCode:
          variant.defaultCurrency?.code ?? selectedBaseProduct.currencyCode,
        currencyName:
          variant.defaultCurrency?.name ?? selectedBaseProduct.currencyName,
        minimumPurchaseAmount:
          variant.minimumPurchaseAmount ??
          selectedBaseProduct.minimumPurchaseAmount,
      };

      setSelectedBaseProduct(null);
      proceedToCheckout(variantBiller);
    },
    [proceedToCheckout, selectedBaseProduct],
  );

  const clearFilters = () => {
    setSearch("");
    setActiveCategory(
      hideProductsUntilCategory && categoryUi === "cards" ? "" : "all",
    );
    setSelectedCurrency("");
  };

  const headerContent = (
    <>
      {!embedded && showTitle && (
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
          Services <span className="text-emerald-400">Marketplace</span>
        </h1>
      )}

      <div
        className={`flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${liftSearch ? "mb-2" : "mb-6"}`}
      >
        {availableCurrencies.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1 ${isCompact ? "text-[9px]" : "text-[10px]"}`}
            >
              <DollarSign size={10} /> Currency:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCurrency("")}
              className={`px-3 py-1.5 ${radiusChip} font-bold border transition-all ${isCompact ? "text-[9px]" : "text-[10px]"} ${
                !selectedCurrency
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
              }`}
            >
              ALL
            </button>
            {availableCurrencies.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() =>
                  setSelectedCurrency(selectedCurrency === c.code ? "" : c.code)
                }
                className={`px-3 py-1.5 ${radiusChip} font-bold border transition-all ${isCompact ? "text-[9px]" : "text-[10px]"} ${
                  selectedCurrency === c.code
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                }`}
              >
                {c.code}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const headerSection = (
    <div
      className={`${embedded ? "p-0" : `bg-slate-900 ${liftSearch ? "pt-8 pb-14" : "pt-16 pb-28"} px-4 sm:px-6 lg:px-8 relative overflow-hidden`}`}
    >
      {!embedded && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      )}
      <div
        className={`mx-auto relative z-10 ${embedded ? "" : "max-w-5xl text-center"}`}
      >
        {headerContent}
      </div>
    </div>
  );

  const portalHeaderSection = (
    <div
      className={`relative z-10 ${embedded ? "" : "max-w-5xl mx-auto text-center"}`}
    >
      {headerContent}
    </div>
  );

  const headerNode = headerPortalId
    ? headerHostEl
      ? createPortal(portalHeaderSection, headerHostEl)
      : null
    : headerSection;

  const categoriesContent =
    categoryUi === "cards" ? (
      <div
        className={`${liftSearch && !embedded ? "-mx-8 -mt-6 px-8 pb-3" : "-mx-4 px-4"} ${
          embedded ? "" : "pt-2"
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          {/* <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            Browse by category
          </p> */}
          {/* <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Pick one
          </p> */}
        </div>

        {isInitialLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`${radiusCard} animate-pulse bg-slate-100 dark:bg-slate-800 overflow-hidden`}
              >
                <div className="aspect-[19/10] bg-slate-200 dark:bg-slate-700" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3" />
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {categoryTabs.map((tab) => {
              const iconKey =
                tab.key === "all"
                  ? "other"
                  : tab.key === "donations"
                    ? "donations"
                    : inferCategory(tab.label, tab.label).key;
              const color = getColor(iconKey);
              return (
                <div
                  key={tab.key}
                  className={`group ${radiusCard} bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_rgba(2,6,23,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-[0_18px_45px_rgba(2,6,23,0.12)] dark:hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden`}
                  onClick={() => setActiveCategory(tab.key)}
                >
                  <div className="relative aspect-[19/10] w-full overflow-hidden bg-white dark:bg-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />

                    <div className="absolute left-1/2 top-[58%] sm:top-[70%] -translate-x-1/2 -translate-y-1/2">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center bg-white/45 dark:bg-slate-700/25 shadow-sm ring-1 ring-white/50 dark:ring-white/10 relative overflow-hidden">
                        <CategoryIcon
                          categoryKey={iconKey}
                          className={`w-8 h-8 ${color.icon}`}
                        />
                      </div>
                    </div>

                  </div>

                  <div className="flex flex-col flex-1 p-4 pt-3 pb-6">
                    <h3
                      className={`${isCompact ? "text-[13px]" : "text-sm"} font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 mb-1 flex-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors`}
                    >
                      {tab.label}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ) : (
      <div
        className={`sticky ${embedded ? "top-[-2rem]" : "top-0"} z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 ${
          liftSearch && !embedded
            ? "-mx-8 -mt-8 px-8 pt-3 pb-3 sm:pt-4 sm:pb-3 rounded-t-[2.5rem]"
            : "-mx-4 px-4"
        }`}
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3 items-center">
          {isInitialLoading ? (
            <div className="flex gap-3 py-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse shrink-0"
                />
              ))}
            </div>
          ) : (
            categoryTabs.map((tab) => {
              const iconKey =
                tab.key === "donations"
                  ? "donations"
                  : inferCategory(tab.label, tab.label).key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl font-bold transition-all shrink-0 border-2 active:scale-95 ${isCompact ? "px-4 py-2 text-[11px]" : "px-5 py-2.5 text-xs"} ${
                    activeCategory === tab.key
                      ? "bg-slate-900 dark:bg-slate-700 border-slate-900 dark:border-slate-700 text-white shadow-lg"
                      : "border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900"
                  }`}
                >
                  {tab.key !== "all" && (
                    <span
                      className={
                        activeCategory === tab.key
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }
                    >
                      <CategoryIcon
                        categoryKey={iconKey}
                        className={isCompact ? "w-3 h-3" : "w-3.5 h-3.5"}
                      />
                    </span>
                  )}
                  {tab.label}
                </button>
              );
            })
          )}
        </div>
      </div>
    );

  const shouldShowCategoryCards =
    categoryUi === "cards" && !debouncedSearch && activeCategory === "";

  const tabsNode = tabsPortalId
    ? tabsHostEl
      ? createPortal(
          categoryUi === "cards"
            ? shouldShowCategoryCards
              ? categoriesContent
              : null
            : categoriesContent,
          tabsHostEl,
        )
      : null
    : categoryUi === "cards"
      ? shouldShowCategoryCards
        ? categoriesContent
        : null
      : categoriesContent;

  const activeCategoryLabel =
    activeCategory === "" || activeCategory === "all"
      ? "All Services"
      : activeCategory === "donations"
        ? "Donations"
        : (categoryTabs.find((t) => t.key === activeCategory)?.label ??
          "Services");

  const shouldHideGrid =
    hideProductsUntilCategory &&
    categoryUi === "cards" &&
    !debouncedSearch &&
    activeCategory === "";

  return (
    <div className={`space-y-8 ${embedded ? "" : "min-h-screen bg-white"}`}>
      {headerNode}
      {tabsNode}

      <div className="space-y-6">
        {selectedBaseProduct && (
          <div className="pt-2">
            {isSelectedBaseVariantsBusy ? (
              <div className="h-[240px] sm:h-[320px] flex items-center justify-center text-sm text-slate-400 font-semibold">
                Loading plans...
              </div>
            ) : showVariantPicker ? (
              <ProductVariantPicker
                categoryLabel={selectedBaseProduct.name}
                variants={selectedBaseVariants}
                onSelect={handleSelectVariant}
                onBack={() => setSelectedBaseProduct(null)}
                currencyCode={selectedBaseProduct.currencyCode ?? "USD"}
                compact={true}
              />
            ) : (
              <div className="h-[240px] sm:h-[320px] flex items-center justify-center text-sm text-slate-400 font-semibold">
                Opening checkout...
              </div>
            )}
          </div>
        )}

        {!selectedBaseProduct &&
          !isInitialLoading &&
          !isError &&
          !shouldHideGrid && (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2
                className={`${isCompact ? "text-base" : "text-lg"} font-bold text-slate-900 dark:text-white`}
              >
                {activeCategoryLabel}
              </h2>
              <div className="flex items-center gap-3">
                {categoryUi === "cards" &&
                  (activeCategory !== "" || debouncedSearch) && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory("");
                        setSearch("");
                      }}
                      className={`${isCompact ? "text-[9px]" : "text-[10px]"} text-emerald-700 font-black uppercase tracking-widest hover:underline`}
                    >
                      Back to categories
                    </button>
                  )}
                <p
                  className={`${isCompact ? "text-[9px]" : "text-[10px]"} text-slate-400 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800`}
                >
                  {filtered.length} Results
                </p>
              </div>
            </div>
          )}

        {!selectedBaseProduct &&
          (shouldHideGrid ? null : isInitialLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`${radiusCard} animate-pulse bg-slate-100 dark:bg-slate-800 overflow-hidden`}
                >
                  <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div
              className={`h-[420px] sm:h-[500px] lg:h-[540px] xl:h-[560px] flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 dark:border-slate-800 ${radiusPanel}`}
            >
              <AlertCircle size={40} className="text-red-400 mb-4" />
              <p className="text-red-900 dark:text-red-400 font-bold">
                Could not load services
              </p>
              <button
                onClick={() => window.location.reload()}
                className={`mt-4 px-6 py-2 bg-red-600 text-white font-bold ${radiusButton} text-xs uppercase tracking-widest`}
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div
              className={`h-[420px] sm:h-[500px] lg:h-[540px] xl:h-[560px] flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 dark:border-slate-800 ${radiusPanel}`}
            >
              <Search size={32} className="text-slate-300 mb-4" />
              <p className="text-slate-800 dark:text-slate-200 font-bold">
                No services found
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-emerald-600 font-bold text-xs uppercase tracking-widest hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                {/* Fade on the bottom edge (only useful when we're clipping or using an internal scroll box). */}
                {(!effectivePreviewRows || !isGridExpanded || embedded) && (
                  <div
                    className={`absolute inset-0 ${radiusPanel} pointer-events-none z-10 shadow-[inset_0_-48px_60px_-20px_rgba(255,255,255,1),inset_0_-48px_60px_-20px_rgba(248,250,252,1)] dark:shadow-[inset_0_-48px_60px_-20px_rgba(15,23,42,1)]`}
                  />
                )}

                <div
                  ref={gridViewportRef}
                  className={`pr-1 scrollbar-hide ${
                    effectivePreviewRows
                      ? isGridExpanded
                        ? embedded
                          ? "h-[420px] sm:h-[500px] lg:h-[540px] xl:h-[560px] overflow-y-auto"
                          : "overflow-visible"
                        : "overflow-hidden"
                      : "h-[420px] sm:h-[500px] lg:h-[540px] xl:h-[560px] overflow-y-auto"
                  }`}
                  style={
                    effectivePreviewRows && !isGridExpanded
                      ? { height: collapsedGridHeight ?? 520 }
                      : undefined
                  }
                >
                  <div className="grid grid-cols-2 mt-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-4">
                    {filtered.map((biller, idx) => {
                      const color = getColor(biller.categoryKey);
                      return (
                        <div
                          key={biller.id}
                          ref={idx === 0 ? firstCardMeasureRef : undefined}
                          className={`group ${radiusCard} bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_rgba(2,6,23,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-[0_18px_45px_rgba(2,6,23,0.12)] dark:hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden`}
                          onClick={() => openProduct(biller)}
                        >
                          <div className="relative aspect-[19/10] w-full overflow-hidden bg-white dark:bg-slate-800">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/10 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />

                            <div className="absolute left-1/2 top-[58%] sm:top-[70%] -translate-x-1/2 -translate-y-1/2">
                              <div
                                className={`w-16 h-16 sm:w-20 sm:h-20 ${radiusIcon} flex items-center justify-center bg-white/45 dark:bg-slate-700/25 shadow-sm ring-1 ring-white/50 dark:ring-white/10 relative overflow-hidden`}
                              >
                                <CategoryIcon
                                  categoryKey={biller.categoryKey}
                                  className={`w-8 h-8 ${color.icon}`}
                                />
                              </div>
                            </div>

                            <div className="absolute top-3 left-3">
                              {/* Categeory airtime*/}
                              {/* <span
                                className={`inline-flex items-center gap-1 px-2 py-1 ${radiusChip} font-bold uppercase tracking-widest backdrop-blur-md border ${isCompact ? "text-[8px]" : "text-[9px]"} bg-white/90 dark:bg-slate-900/80 border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-200`}
                              >
                                <span className={color.icon}>
                                  <CategoryIcon
                                    categoryKey={biller.categoryKey}
                                    className={
                                      isCompact ? "w-2 h-2" : "w-2.5 h-2.5"
                                    }
                                  />
                                </span>
                                {biller.categoryLabel}
                              </span> */}
                            </div>

                            {biller.currencyCode && (
                              <div className="absolute top-3 right-3">
                                <span
                                  className={`inline-flex items-center px-2 py-1 ${radiusChip} font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm ${isCompact ? "text-[8px]" : "text-[9px]"}`}
                                >
                                  {biller.currencyCode}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col flex-1 p-4 pt-3">
                            <h3
                              className={`${isCompact ? "text-[13px]" : "text-sm"} font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 mb-1 flex-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors`}
                            >
                              {biller.name}
                            </h3>
                          </div>

                          {/* <div className="px-4 pb-4 -mt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openProduct(biller);
                              }}
                              className={`w-full flex items-center justify-center gap-1.5 ${radiusButton} font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300 uppercase tracking-widest ${isCompact ? "py-2 text-[9px]" : "py-2.5 text-[10px]"}`}
                            >
                              Pay Now
                              <ChevronRight size={12} />
                            </button>
                          </div> */}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {effectivePreviewRows && canExpandGrid && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isGridExpanded;
                      setIsGridExpanded(next);
                      if (!next) {
                        // When collapsing, bring the user back to the top of the grid.
                        requestAnimationFrame(() => {
                          gridViewportRef.current?.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                          gridViewportRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        });
                      }
                    }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 ${radiusButton} bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest hover:border-slate-300 hover:shadow-sm transition-all`}
                  >
                    {isGridExpanded ? "View less" : "View all"}
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform ${isGridExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              )}
            </div>
          ))}

        {!selectedBaseProduct && isBusy && !isInitialLoading && (
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
            Updating...
          </p>
        )}
      </div>
    </div>
  );
}
