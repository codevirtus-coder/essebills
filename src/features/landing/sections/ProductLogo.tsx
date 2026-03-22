import { useState } from "react";
import { getProductLogoUrl } from "../../../services/products.service";
import { categoryIcon } from "./homePageUtils";

export function ProductLogo({
  productId,
  name,
  categoryLabel,
  className = "",
}: {
  productId: number;
  name: string;
  categoryLabel: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className={`flex items-center justify-center text-slate-400 ${className}`}>
        {categoryIcon(categoryLabel)}
      </div>
    );
  }
  return (
    <img
      src={getProductLogoUrl(productId)}
      alt={name}
      loading="lazy"
      decoding="async"
      className={`object-contain ${className}`}
      onError={() => setErrored(true)}
    />
  );
}
