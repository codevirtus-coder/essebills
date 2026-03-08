import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProductPaymentCheckout } from "../components/ProductPaymentCheckout";
import { ROUTE_PATHS } from "../../../router/paths";

export function PaymentCheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const billerName = useMemo(() => searchParams.get("biller") || undefined, [searchParams]);
  const accountNumber = useMemo(() => searchParams.get("account") || undefined, [searchParams]);
  const amount = useMemo(() => searchParams.get("amount") || undefined, [searchParams]);
  const productId = useMemo(() => {
    const p = searchParams.get("productId");
    return p ? Number(p) : undefined;
  }, [searchParams]);
  const productCategoryId = useMemo(() => {
    const c = searchParams.get("productCategoryId");
    return c ? Number(c) : undefined;
  }, [searchParams]);

  return (
    <ProductPaymentCheckout
      productId={productId}
      billerName={billerName}
      accountNumber={accountNumber}
      amount={amount}
      productCategoryId={productCategoryId}
      onBack={() => navigate(`${ROUTE_PATHS.home}#pay-now`)}
      onSuccess={() => navigate(ROUTE_PATHS.home)}
    />
  );
}

export default PaymentCheckoutPage;
