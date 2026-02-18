import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "./Icon";
import { billerCategories, billers } from "../data/siteData";

type CategoryPillProps = {
  icon: string;
  label: string;
  active?: boolean;
};

type BillerCardProps = {
  icon: string;
  name: string;
  featured?: boolean;
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

function CategoryPill({ icon, label, active = false }: CategoryPillProps) {
  return (
    <button type="button" className={`category-pill ${active ? "active" : ""}`}>
      <Icon name={icon} className="icon-sm" />
      {label}
    </button>
  );
}

function BillerCard({
  icon,
  name,
  featured = false,
  isDashed = false,
}: BillerCardProps) {
  return (
    <div
      className={`biller-card ${featured ? "featured" : ""} ${isDashed ? "dashed" : ""}`.trim()}
      role="button"
      tabIndex={0}
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
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", "all"],
    queryFn: fetchProducts,
  });

  const displayBillers: BillerCardProps[] =
    data && data.length > 0
      ? data
          .filter((product) => product.status === "ACTIVE" && !product.deleted)
          .map((product, index) => ({
            icon: index === 0 ? "electric_bolt" : "receipt_long",
            name: product.name,
            featured: index === 0,
          }))
      : billers;

  return (
    <section className="payment" id="pay-now">
      <div className="container">
        <div className="payment-card">
          <div>
            <h2 className="type-section-title">Select Biller to Pay</h2>
            <div className="categories-row">
              {billerCategories.map((category) => (
                <CategoryPill key={category.label} {...category} />
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
            {displayBillers.map((biller, index) => (
              <BillerCard key={`${biller.name}-${index}`} {...biller} />
            ))}
          </div>

          <form className="payment-form">
            <Field label="Account / Card Number">
              <input type="text" placeholder="Enter biller account" />
            </Field>

            <Field label="Mobile Number">
              <input type="tel" placeholder="77*******" />
            </Field>

            <Field label="Amount">
              <div className="amount-field">
                <span>$</span>
                <input type="number" placeholder="0.00" />
              </div>
            </Field>

            <button
              type="submit"
              className="button button-primary button-primary-cta submit-button"
            >
              CONTINUE
              <Icon name="arrow_forward" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
