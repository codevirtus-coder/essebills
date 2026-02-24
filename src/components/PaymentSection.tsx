import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "./Icon";
import { billerCategories, billers } from "../data/siteData";
import { ROUTE_PATHS } from "../router/paths";

type CategoryPillProps = {
  icon: string;
  label: string;
  active?: boolean;
};

type BillerCardProps = {
  id: string;
  icon: string;
  name: string;
  category: string;
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

type ApiProduct = {
  id: number;
  name: string;
  code: string;
  status: string;
  deleted?: boolean;
  description?: string;
  productLogoFileName?: string;
  minimumPurchaseAmount?: string;
};

const DEFAULT_FIELDS: BillerCardProps["fields"] = [
  { key: "accountNumber", label: "Account / Card Number", placeholder: "Enter biller account", type: "text" },
  { key: "mobileNumber", label: "Mobile Number", placeholder: "77*******", type: "tel" },
  { key: "amount", label: "Amount", placeholder: "0.00", type: "number", prefix: "$" },
];

function inferCategory(name: string, code: string): string {
  const value = `${name} ${code}`.toLowerCase();
  if (/(airtime|recharge|evd|topup)/.test(value)) return "Airtime";
  if (/(bundle|data)/.test(value)) return "Internet";
  if (/(school|tuition|fees|university|college|education)/.test(value)) return "Education";
  if (/(insurance|life|medical|health)/.test(value)) return "Insurance";
  if (/(fuel|petrol|diesel|gas)/.test(value)) return "Fuel";
  if (/(donat)/.test(value)) return "Donations";
  if (/(lottery|loto|jackpot)/.test(value)) return "Lottery";
  return "Utilities";
}

function iconByCategory(category: string): string {
  switch (category) {
    case "Airtime":
      return "settings_input_antenna";
    case "Internet":
      return "wifi";
    case "Education":
      return "school";
    case "Insurance":
      return "health_and_safety";
    case "Fuel":
      return "local_gas_station";
    case "Donations":
      return "volunteer_activism";
    case "Lottery":
      return "casino";
    default:
      return "electric_bolt";
  }
}

function fieldsByProduct(name: string, category: string): BillerCardProps["fields"] {
  const normalized = name.toLowerCase();

  if (/(zesa|zesco|token|electric)/.test(normalized)) {
    return [
      { key: "accountNumber", label: "Meter Number", placeholder: "Enter meter number", type: "text" },
      { key: "mobileNumber", label: "Mobile Number", placeholder: "77*******", type: "tel" },
      { key: "amount", label: "Amount", placeholder: "0.00", type: "number", prefix: "$" },
    ];
  }

  if (/(airtime|bundle|data)/.test(normalized) || category === "Airtime") {
    return [
      { key: "mobileNumber", label: "Mobile Number", placeholder: "77*******", type: "tel" },
      { key: "amount", label: "Amount", placeholder: "0.00", type: "number", prefix: "$" },
    ];
  }

  if (/(dstv|gotv|tv)/.test(normalized)) {
    return [
      { key: "accountNumber", label: "Smart Card Number", placeholder: "Enter smart card number", type: "text" },
      { key: "mobileNumber", label: "Mobile Number", placeholder: "77*******", type: "tel" },
      { key: "amount", label: "Amount", placeholder: "0.00", type: "number", prefix: "$" },
    ];
  }

  if (category === "Education") {
    return [
      { key: "accountNumber", label: "Student Number", placeholder: "Enter student number", type: "text" },
      { key: "mobileNumber", label: "Mobile Number", placeholder: "77*******", type: "tel" },
      { key: "amount", label: "Amount", placeholder: "0.00", type: "number", prefix: "$" },
    ];
  }

  if (category === "Insurance") {
    return [
      { key: "accountNumber", label: "Policy Number", placeholder: "Enter policy number", type: "text" },
      { key: "mobileNumber", label: "Mobile Number", placeholder: "77*******", type: "tel" },
      { key: "amount", label: "Amount", placeholder: "0.00", type: "number", prefix: "$" },
    ];
  }

  return DEFAULT_FIELDS;
}

const PRODUCTS_ENDPOINT = "https://api.test.rongeka.com/v1/products/all";

async function fetchProducts(): Promise<ApiProduct[]> {
  const response = await fetch(PRODUCTS_ENDPOINT);
  if (!response.ok) {
    throw new Error(`Failed to fetch products (${response.status})`);
  }

  const payload: unknown = await response.json();
  if (Array.isArray(payload)) return payload as ApiProduct[];
  return [];
}

function CategoryPill({ icon, label, active = false, onClick }: CategoryPillProps & { onClick: () => void }) {
  return (
    <button type="button" className={`category-pill ${active ? "active" : ""}`} onClick={onClick}>
      <Icon name={icon} className="icon-sm" />
      {label}
    </button>
  );
}

function BillerCard({
  id,
  icon,
  name,
  isSelected = false,
  isDashed = false,
  onSelect,
}: BillerCardProps & { isSelected?: boolean; onSelect: (id: string) => void }) {
  return (
    <div
      className={`biller-card ${isSelected ? "selected" : ""} ${isDashed ? "dashed" : ""}`.trim()}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(id);
        }
      }}
    >
      <div className="biller-icon-wrap">
        <Icon name={icon} className="icon-lg" />
      </div>
      <p>{name}</p>
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

export function PaymentSection() {
  const [activeCategory, setActiveCategory] = useState<string>(billerCategories[0]?.label ?? "Utilities");
  const [selectedBillerId, setSelectedBillerId] = useState<string>("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", "all"],
    queryFn: fetchProducts,
  });

  const displayBillers: BillerCardProps[] =
    data && data.length > 0
      ? data
          .filter((product) => product.status === "ACTIVE" && !product.deleted)
          .map((product) => {
            const category = inferCategory(product.name, product.code);
            return {
            id: `api-${product.id}`,
            icon: iconByCategory(category),
            name: product.name,
            category,
            fields: fieldsByProduct(product.name, category),
            minimumPurchaseAmount: Number(product.minimumPurchaseAmount ?? 0),
            };
          })
      : (billers as Array<{ icon: string; name: string; isDashed?: boolean }>).map((item, index) => {
          const category = inferCategory(item.name, item.name);
          return {
            id: `fallback-${index}`,
            icon: item.icon,
            name: item.name,
            category,
            fields: fieldsByProduct(item.name, category),
            isDashed: item.isDashed,
          };
        });

  const filteredBillers = useMemo(
    () => displayBillers.filter((biller) => biller.category === activeCategory && !biller.isDashed),
    [activeCategory, displayBillers],
  );

  const selectedBiller = useMemo(
    () => filteredBillers.find((biller) => biller.id === selectedBillerId) ?? filteredBillers[0] ?? null,
    [filteredBillers, selectedBillerId],
  );

  useEffect(() => {
    if (filteredBillers.length === 0) {
      setSelectedBillerId("");
      return;
    }

    if (!filteredBillers.some((biller) => biller.id === selectedBillerId)) {
      setSelectedBillerId(filteredBillers[0].id);
    }
  }, [filteredBillers, selectedBillerId]);

  useEffect(() => {
    if (!selectedBiller) return;

    const nextValues: Record<string, string> = {};
    selectedBiller.fields.forEach((field) => {
      if (field.key === "amount" && selectedBiller.minimumPurchaseAmount && selectedBiller.minimumPurchaseAmount > 0) {
        nextValues[field.key] = String(selectedBiller.minimumPurchaseAmount);
        return;
      }
      nextValues[field.key] = formValues[field.key] ?? "";
    });
    setFormValues(nextValues);
  }, [selectedBiller]);

  const accountValue = useMemo(() => {
    if (formValues.accountNumber) return formValues.accountNumber;
    if (formValues.mobileNumber) return formValues.mobileNumber;
    const fallbackKey = Object.keys(formValues).find((key) => key !== "amount");
    return fallbackKey ? formValues[fallbackKey] : "";
  }, [formValues]);

  const amountValue = formValues.amount ?? "";

  const handleContinue = () => {
    if (!selectedBiller) return;
    const query = new URLSearchParams({
      biller: selectedBiller.name,
      account: accountValue,
      amount: amountValue || "0",
    });
    const targetUrl = `${ROUTE_PATHS.checkout}?${query.toString()}`;
    window.location.assign(targetUrl);
  };

  return (
    <section className="payment" id="pay-now">
      <div className="container">
        <div className="payment-card">
          <div>
            <h2 className="type-section-title">Select Biller to Pay</h2>
            <div className="categories-row">
              {billerCategories.map((category) => (
                <CategoryPill
                  key={category.label}
                  icon={category.icon}
                  label={category.label}
                  active={category.label === activeCategory}
                  onClick={() => setActiveCategory(category.label)}
                />
              ))}
            </div>
          </div>

          <div className="billers-grid">
            {isLoading && (
              <p className="type-body text-muted">Loading products...</p>
            )}
            {isError && (
              <p className="type-body text-muted">
                Could not load products. Showing default list.
              </p>
            )}
            {!isLoading && filteredBillers.length === 0 ? (
              <div className="billers-empty-state" role="status" aria-live="polite">
                <span className="material-symbols-outlined">inventory_2</span>
                <p>No active products under {activeCategory}.</p>
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

          <div className="payment-form">
            {(selectedBiller?.fields ?? DEFAULT_FIELDS).map((field) => (
              <Field key={field.key} label={field.label}>
                {field.prefix ? (
                  <div className="amount-field">
                    <span>{field.prefix}</span>
                    <input
                      type={field.type ?? "text"}
                      placeholder={field.placeholder}
                      value={formValues[field.key] ?? ""}
                      onChange={(event) =>
                        setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                      }
                    />
                  </div>
                ) : (
                  <input
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    value={formValues[field.key] ?? ""}
                    onChange={(event) =>
                      setFormValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                    }
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
        </div>
      </div>
    </section>
  );
}
