import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { Icon } from "../../../components/ui/Icon";
import { ROUTE_PATHS } from "../../../router/paths";
import { getAllProducts, getProductCategories } from "../../../services/products.service";
import type { Product, ProductCategory } from "../../../types/products";

type Category = {
  key: string;
  label: string;
  icon: string;
};

type Biller = {
  id: string;
  name: string;
  icon: string;
  categoryKey: string;
  categoryLabel: string;
};
function inferCategory(name: string, code: string): { key: string; label: string } {
  const value = `${name} ${code}`.toLowerCase();
  if (/(airtime|recharge|evd|topup)/.test(value)) return { key: "airtime", label: "Airtime" };
  if (/(bundle|data)/.test(value)) return { key: "internet", label: "Internet" };
  if (/(school|tuition|fees|university|college|education)/.test(value))
    return { key: "education", label: "Education" };
  if (/(insurance|life|medical|health)/.test(value)) return { key: "insurance", label: "Insurance" };
  if (/(fuel|petrol|diesel|gas)/.test(value)) return { key: "fuel", label: "Fuel" };
  if (/(donat)/.test(value)) return { key: "donations", label: "Donations" };
  if (/(lottery|loto|jackpot)/.test(value)) return { key: "lottery", label: "Lottery" };
  return { key: "utilities", label: "Utilities" };
}

function iconByCategory(category: string): string {
  switch (category) {
    case "Airtime":
      return "network_cell";
    case "Internet":
      return "network_cell";
    case "Education":
      return "school";
    case "Insurance":
      return "verified_user";
    case "Fuel":
      return "inventory_2";
    case "Donations":
      return "payments";
    case "Lottery":
      return "confirmation_number";
    default:
      return "payments";
  }
}

function iconByProduct(name: string, category: string): string {
  const normalized = name.toLowerCase();
  if (/(wallet|float|balance)/.test(normalized))
    return "account_balance_wallet";
  if (/(zesa|zesco|token|electric)/.test(normalized)) return "bolt";
  if (/(zinwa|water)/.test(normalized)) return "water_drop";
  if (/(bundle|data)/.test(normalized)) return "wifi";
  if (/(telone|adsl|router)/.test(normalized)) return "router";
  if (/(econet|evd|airtime|recharge)/.test(normalized)) return "cell_tower";
  if (/(netone|topup)/.test(normalized)) return "signal_cellular_alt";
  if (/(uz|university|school|tuition)/.test(normalized)) return "school";
  if (/(msu|stories|fees)/.test(normalized)) return "auto_stories";
  if (/(harare|city of harare)/.test(normalized)) return "domain";
  if (/(bulawayo|city of bulawayo)/.test(normalized)) return "location_city";
  if (/(liquid|home|internet)/.test(normalized)) return "language";
  if (/(cimas|medical)/.test(normalized)) return "medical_services";
  if (/(nyaradzo|insurance)/.test(normalized)) return "umbrella";
  if (/(puma|fuel|diesel|petrol)/.test(normalized)) return "local_gas_station";
  if (/(zuva|petroleum|oil)/.test(normalized)) return "oil_barrel";
  if (/(red cross|donat)/.test(normalized)) return "volunteer_activism";
  if (/(lotto|lottery|jackpot)/.test(normalized)) return "casino";
  return iconByCategory(category);
}

async function fetchProductsAndCategories(): Promise<{ products: Product[]; categories: ProductCategory[] }> {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getProductCategories(),
  ]);
  return {
    products: Array.isArray(products) ? products : [],
    categories: Array.isArray(categories) ? categories : [],
  };
}

export function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isRequestingBiller, setIsRequestingBiller] = useState(false);
  const [billerRequested, setBillerRequested] = useState(false);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", "all", "categories", "all", "services-page"],
    queryFn: fetchProductsAndCategories,
  });

  const categories = useMemo<Category[]>(() => {
    const backendCategories = (data?.categories ?? [])
      .filter((category) => category.active !== false)
      .map((category) => {
        const key = String(category.id ?? category.name ?? "").trim();
        const label = String(category.displayName ?? category.name ?? "Category");
        const icon = String(category.emoji ?? "").trim() || iconByCategory(label);
        return { key, label, icon };
      })
      .filter((category) => category.key.length > 0);

    return [{ key: "all", label: "All", icon: "table_chart" }, ...backendCategories];
  }, [data?.categories]);

  const billers = useMemo<Biller[]>(
    () =>
      (data?.products ?? [])
        .filter((product) => product.status === "ACTIVE" && !product.deleted)
        .map((product) => {
          const productName = String(product.name ?? "Unnamed Product");
          const productCode = String(product.code ?? "");
          const backendCategory = product.category;
          const inferred = inferCategory(productName, productCode);
          const categoryKey = String(
            backendCategory?.id ?? backendCategory?.name ?? inferred.key,
          );
          const categoryLabel = String(
            backendCategory?.displayName ?? backendCategory?.name ?? inferred.label,
          );
          return {
            id: `api-${String(product.id ?? product.code ?? Math.random())}`,
            name: productName,
            categoryKey,
            categoryLabel,
            icon: String(backendCategory?.emoji ?? "").trim() || iconByProduct(productName, categoryLabel),
          };
        }),
    [data?.products],
  );

  const filteredBillers = useMemo(
    () =>
      billers.filter((biller) => {
        const matchesCategory =
          activeCategory === "all" || biller.categoryKey === activeCategory;
        const matchesSearch = biller.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [billers, activeCategory, searchQuery],
  );

  const handleSelectBiller = (name: string) => {
    const query = new URLSearchParams({
      biller: name,
      account: "",
      amount: "0",
    });
    window.location.assign(`${ROUTE_PATHS.checkout}?${query.toString()}`);
  };

  const handleRequestBiller = () => {
    setIsRequestingBiller(true);
    window.setTimeout(() => {
      setIsRequestingBiller(false);
      setBillerRequested(true);
      window.setTimeout(() => setBillerRequested(false), 5000);
    }, 1500);
  };

  return (
    <main className="services-marketplace-page min-h-screen bg-[#EDEDF2] text-slate-900">
      <div className="relative left-1/2 right-1/2  -ml-[50vw] -mr-[50vw] w-screen ">
        <section className="px-6 bg-white pt-12 pb-16">
          <div className="container mx-auto max-w-4xl space-y-12">
            <NavLink
              to={ROUTE_PATHS.home}
              className="services-market-back inline-flex items-center gap-2 text-sm font-bold transition"
            >
              <Icon name="chevron_left" size={16} />
              Back to Home
            </NavLink>

            <div className="space-y-3 text-center">
              <h1 className="type-section-title">Services Marketplace</h1>
              <p className="services-market-subtitle type-body">
                Browse and pay for utilities, airtime, fees and more instantly.
              </p>
            </div>

            <div className="relative mx-auto max-w-2xl">
              <Icon
                name="search"
                size={22}
                className="services-market-search-icon absolute top-1/2 left-6 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="What bill would you like to pay today?"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="services-search-input w-full"
              />
            </div>
          </div>
        </section>

        <section>
          <div className="container  bg-white rounded-b-4xl  mx-auto px-6">
            <div className="services-hide-scrollbar flex justify-center items-center gap-3 overflow-x-auto pb-6">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`category-pill mt-8 whitespace-nowrap ${activeCategory === cat.key ? "active" : ""}`}
                >
                  <Icon name={cat.icon} size={16} />
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="mt-8 pb-4 grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-24 text-center">
                  <p className="type-body text-muted">Loading services...</p>
                </div>
              ) : isError ? (
                <div className="col-span-full flex items-center justify-center py-24 text-center">
                  <p className="type-body text-muted">
                    Could not load services from API.
                  </p>
                </div>
              ) : filteredBillers.length > 0 ? (
                filteredBillers.map((biller) => (
                  <article
                    key={biller.id}
                    className="services-market-card group"
                  >
                    <div className="services-market-icon bg-slate-100 text-slate-400">
                      <Icon name={biller.icon} size={20} />
                    </div>
                    <h3 className="services-market-title">{biller.name}</h3>
                    <p className="services-market-category">
                      {biller.categoryLabel}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSelectBiller(biller.name)}
                      className="services-market-button"
                    >
                      Pay This Biller
                    </button>
                  </article>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                  <Icon
                    name="search"
                    size={64}
                    className="mb-4 text-slate-300"
                  />
                  <p className="text-base font-bold text-neutral-text">
                    No services found
                  </p>
                  {/* <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("All");
                    }}
                    className="mt-3 text-[11px] font-bold tracking-wider text-primary uppercase hover:underline"
                  >
                    Clear all filters
                  </button> */}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="container mx-auto px-6 pb-20">
        <section className="relative mt-16 flex flex-col items-center justify-between gap-10 overflow-hidden rounded-[3rem] bg-[#1e293b] px-8 py-12 text-white md:flex-row md:px-16 md:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 max-w-xl space-y-4 text-center md:text-left">
            <h2 className="type-section-title">Don&apos;t see your biller?</h2>
            <p className="services-market-bottom-title type-body">
              We are constantly onboarding new services. If you are a biller
              looking to reach thousands of customers, join our ecosystem today.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleRequestBiller}
              disabled={isRequestingBiller || billerRequested}
              className={`services-market-cta inline-flex h-12 min-w-[156px] items-center justify-center rounded-full px-6 uppercase whitespace-nowrap transition ${
                billerRequested
                  ? "bg-secondary text-slate-900"
                  : "bg-primary text-white hover:brightness-110"
              }`}
            >
              {isRequestingBiller
                ? "Sending..."
                : billerRequested
                  ? "Request Logged"
                  : "Request Biller"}
            </button>
            <NavLink
              to={ROUTE_PATHS.register}
              className="services-market-cta inline-flex h-12 min-w-49.5 items-center justify-center rounded-full bg-white/10 px-6 text-center uppercase whitespace-nowrap transition hover:bg-white/20"
            >
              Biller Onboarding
            </NavLink>
          </div>
        </section>
      </section>
    </main>
  );
}
