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
} from "../../../services/products.service";
import type { Product, ProductCategory } from "../../../types/products";

type CategoryPillProps = {
  icon: string;
  label: string;
  active?: boolean;
};

type BillerCardProps = {
  id: string;
  icon: string;
  name: string;
  categoryKey: string;
  categoryLabel: string;
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

type CategoryTab = {
  key: string;
  label: string;
  icon: string;
};

type FieldProps = {
  label: string;
  children: ReactNode;
};

const DEFAULT_FIELDS: BillerCardProps["fields"] = [
  {
    key: "accountNumber",
    label: "Account / Card Number",
    placeholder: "Enter biller account",
    type: "text",
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

function inferCategory(
  name: string,
  code: string,
): { key: string; label: string } {
  const value = `${name} ${code}`.toLowerCase();
  if (/(airtime|recharge|evd|topup)/.test(value))
    return { key: "airtime", label: "Airtime" };
  if (/(bundle|data)/.test(value))
    return { key: "internet", label: "Internet" };
  if (/(school|tuition|fees|university|college|education)/.test(value))
    return { key: "education", label: "Education" };
  if (/(insurance|life|medical|health)/.test(value))
    return { key: "insurance", label: "Insurance" };
  if (/(fuel|petrol|diesel|gas)/.test(value))
    return { key: "fuel", label: "Fuel" };
  if (/(donat)/.test(value)) return { key: "donations", label: "Donations" };
  if (/(lottery|loto|jackpot)/.test(value))
    return { key: "lottery", label: "Lottery" };
  return { key: "utilities", label: "Utilities" };
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

function fieldsByProduct(
  name: string,
  category: string,
): BillerCardProps["fields"] {
  const normalized = name.toLowerCase();

  if (/(zesa|zesco|token|electric)/.test(normalized)) {
    return [
      {
        key: "accountNumber",
        label: "Meter Number",
        placeholder: "Enter meter number",
        type: "text",
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
  }

  if (/(airtime|bundle|data)/.test(normalized) || category === "Airtime") {
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
  }

  if (/(dstv|gotv|tv)/.test(normalized)) {
    return [
      {
        key: "accountNumber",
        label: "Smart Card Number",
        placeholder: "Enter smart card number",
        type: "text",
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
  }

  if (category === "Education") {
    return [
      {
        key: "accountNumber",
        label: "Student Number",
        placeholder: "Enter student number",
        type: "text",
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
  }

  if (category === "Insurance") {
    return [
      {
        key: "accountNumber",
        label: "Policy Number",
        placeholder: "Enter policy number",
        type: "text",
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
  }

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

function CategoryPill({
  icon,
  label,
  active = false,
  onClick,
}: CategoryPillProps & { onClick: () => void }) {
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
  const headingWords = ["Select", "Biller", "to", "Pay"];
  const scrollDirection = useScrollDirection();
  const inViewVariant = scrollDirection === "down" ? "visible" : "visibleInstant";

  const [activeCategory, setActiveCategory] = useState<string>("");
  const [selectedBillerId, setSelectedBillerId] = useState<string>("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", "categories", activeCategory],
    queryFn: () => fetchProductsAndCategories(activeCategory),
  });

  const categoryTabs: CategoryTab[] = useMemo(() => {
    const fromBackend = (data?.categories ?? [])
      .filter((category) => category.active !== false)
      .map((category) => {
        const key = String(category.id ?? category.name ?? "").trim();
        const label = String(
          category.displayName ?? category.name ?? "Category",
        );
        const icon =
          String(category.emoji ?? "").trim() || iconByCategory(label);
        return { key, label, icon };
      })
      .filter((category) => category.key.length > 0);

    if (fromBackend.length > 0) return fromBackend;
    return [
      {
        key: "utilities",
        label: "Utilities",
        icon: iconByCategory("Utilities"),
      },
    ];
  }, [data?.categories]);

  const displayBillers: BillerCardProps[] = useMemo(
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
            backendCategory?.displayName ??
              backendCategory?.name ??
              inferred.label,
          );
          const categoryIcon =
            String(backendCategory?.emoji ?? "").trim() ||
            iconByCategory(categoryLabel);

          return {
            id: `api-${String(product.id ?? product.code ?? Math.random())}`,
            icon: categoryIcon,
            name: productName,
            categoryKey,
            categoryLabel,
            fields: fieldsByProduct(productName, categoryLabel),
            minimumPurchaseAmount: Number(product.minimumPurchaseAmount ?? 0),
          };
        }),
    [data?.products],
  );

  useEffect(() => {
    if (!categoryTabs.length) return;
    if (
      !activeCategory ||
      !categoryTabs.some((category) => category.key === activeCategory)
    ) {
      setActiveCategory(categoryTabs[0].key);
    }
  }, [categoryTabs, activeCategory]);

  const filteredBillers = useMemo(() => {
    if (!activeCategory) return [];
    return displayBillers.filter(
      (biller) => biller.categoryKey === activeCategory && !biller.isDashed,
    );
  }, [activeCategory, displayBillers]);

  const selectedBiller = useMemo(
    () =>
      filteredBillers.find((biller) => biller.id === selectedBillerId) ??
      filteredBillers[0] ??
      null,
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
      if (
        field.key === "amount" &&
        selectedBiller.minimumPurchaseAmount &&
        selectedBiller.minimumPurchaseAmount > 0
      ) {
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
      <motion.h2
        className="payment-animated-title"
        initial="hidden"
        whileInView={inViewVariant}
        viewport={{ once: false, amount: 0.55 }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              delayChildren: 0.08,
              staggerChildren: 0.22,
            },
          },
          visibleInstant: {
            transition: { delayChildren: 0, staggerChildren: 0 },
          },
        }}
      >
        {headingWords.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            className="payment-animated-word"
            variants={{
              hidden: {
                opacity: 0.18,
                y: 20,
                scale: 0.92,
                color: "#9ca3af",
              },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                color: "#0f172a",
              },
              visibleInstant: {
                opacity: 1,
                y: 0,
                scale: 1,
                color: "#0f172a",
                transition: { duration: 0 },
              },
            }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 18,
              mass: 0.75,
            }}
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
            hidden: { opacity: 0, y: 110, scale: 0.98 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 1.05,
                ease: [0.16, 1, 0.3, 1] as const,
              },
            },
            visibleInstant: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0 },
            },
          }}
        >
          <div>
            <div className="categories-row">
              {categoryTabs.map((category) => (
                <CategoryPill
                  key={category.key}
                  icon={category.icon}
                  label={category.label}
                  active={category.key === activeCategory}
                  onClick={() => setActiveCategory(category.key)}
                />
              ))}
            </div>
          </div>

          <div className="billers-grid">
            {isLoading && (
              <p className="type-body text-muted">Loading products...</p>
            )}
            {isError && (
              <p className="type-body text-muted">Could not load products.</p>
            )}
            {!isLoading && filteredBillers.length === 0 ? (
              <div
                className="billers-empty-state"
                role="status"
                aria-live="polite"
              >
                <span className="material-symbols-outlined">inventory_2</span>
                <p>
                  No active products under{" "}
                  {categoryTabs.find(
                    (category) => category.key === activeCategory,
                  )?.label ?? "this category"}
                  .
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
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          [field.key]: event.target.value,
                        }))
                      }
                    />
                  </div>
                ) : (
                  <input
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    value={formValues[field.key] ?? ""}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        [field.key]: event.target.value,
                      }))
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
        </motion.div>
      </div>
    </section>
  );
}
