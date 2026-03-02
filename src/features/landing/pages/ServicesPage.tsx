import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { Icon } from "../../../components/ui/Icon";
import { apiFetch } from "../../../api/apiClient";
import { ROUTE_PATHS } from "../../../router/paths";

type Category = {
  id: string;
  icon: string;
};

type Biller = {
  id: string;
  name: string;
  icon: string;
  category: string;
  colorClass: string;
};

type ApiProduct = {
  id: number;
  name: string;
  code: string;
  status: string;
  deleted?: boolean;
  minimumPurchaseAmount?: string;
};

const categories: Category[] = [
  { id: "All", icon: "table_chart" },
  { id: "Utilities", icon: "receipt_long" },
  { id: "Airtime", icon: "network_cell" },
  { id: "Internet", icon: "network_cell" },
  { id: "Education", icon: "school" },
  { id: "Insurance", icon: "verified_user" },
  { id: "Fuel", icon: "inventory_2" },
  { id: "Donations", icon: "payments" },
  { id: "Lottery", icon: "confirmation_number" },
];

function inferCategory(name: string, code: string): string {
  const value = `${name} ${code}`.toLowerCase();
  if (/(airtime|recharge|evd|topup)/.test(value)) return "Airtime";
  if (/(bundle|data)/.test(value)) return "Internet";
  if (/(school|tuition|fees|university|college|education)/.test(value))
    return "Education";
  if (/(insurance|life|medical|health)/.test(value)) return "Insurance";
  if (/(fuel|petrol|diesel|gas)/.test(value)) return "Fuel";
  if (/(donat)/.test(value)) return "Donations";
  if (/(lottery|loto|jackpot)/.test(value)) return "Lottery";
  return "Utilities";
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

function colorClassByCategory(category: string): string {
  switch (category) {
    case "Airtime":
      return "bg-red-50 text-red-600";
    case "Internet":
      return "bg-indigo-50 text-indigo-600";
    case "Education":
      return "bg-blue-50 text-blue-800";
    case "Insurance":
      return "bg-pink-50 text-pink-600";
    case "Fuel":
      return "bg-amber-50 text-amber-700";
    case "Donations":
      return "bg-red-50 text-red-800";
    case "Lottery":
      return "bg-yellow-50 text-yellow-700";
    default:
      return "bg-orange-50 text-orange-600";
  }
}

async function fetchProducts(): Promise<ApiProduct[]> {
  try {
    return await apiFetch<ApiProduct[]>("/v1/products/all");
  } catch {
    return [];
  }
}

export function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isRequestingBiller, setIsRequestingBiller] = useState(false);
  const [billerRequested, setBillerRequested] = useState(false);

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", "all", "services-page"],
    queryFn: fetchProducts,
  });

  const billers = useMemo<Biller[]>(
    () =>
      (products ?? [])
        .filter((product) => product.status === "ACTIVE" && !product.deleted)
        .map((product) => {
          const category = inferCategory(product.name, product.code);
          return {
            id: `api-${product.id}`,
            name: product.name,
            category,
            icon: iconByCategory(category),
            colorClass: colorClassByCategory(category),
          };
        }),
    [products],
  );

  const filteredBillers = useMemo(
    () =>
      billers.filter((biller) => {
        const matchesCategory =
          activeCategory === "All" || biller.category === activeCategory;
        const matchesSearch = biller.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [activeCategory, searchQuery],
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
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`category-pill mt-8 whitespace-nowrap ${activeCategory === cat.id ? "active" : ""}`}
                >
                  <Icon name={cat.icon} size={16} />
                  {cat.id}
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
                    <div
                      className={`services-market-icon ${biller.colorClass}`}
                    >
                      <Icon name={biller.icon} size={28} />
                    </div>
                    <h3 className="services-market-title">{biller.name}</h3>
                    <p className="services-market-category">
                      {biller.category}
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
              className="services-market-cta inline-flex h-12 min-w-[198px] items-center justify-center rounded-full bg-white/10 px-6 text-center uppercase whitespace-nowrap transition hover:bg-white/20"
            >
              Biller Onboarding
            </NavLink>
          </div>
        </section>
      </section>
    </main>
  );
}
