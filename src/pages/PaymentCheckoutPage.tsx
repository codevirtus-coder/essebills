import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PaymentCheckout from "../components/PaymentCheckout";
import { ROUTE_PATHS } from "../router/paths";

export function PaymentCheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const billerName = useMemo(() => searchParams.get("biller") ?? "ZESA Prepaid", [searchParams]);
  const accountNumber = useMemo(() => searchParams.get("account") ?? "", [searchParams]);
  const amount = useMemo(() => searchParams.get("amount") ?? "0", [searchParams]);

  return (
    <PaymentCheckout
      billerName={billerName}
      accountNumber={accountNumber}
      amount={amount}
      onBack={() => navigate(`${ROUTE_PATHS.home}#pay-now`)}
      onConfirm={() => {
        window.alert(`Payment request queued for ${billerName}`);
      }}
    />
  );
}

export default PaymentCheckoutPage;
