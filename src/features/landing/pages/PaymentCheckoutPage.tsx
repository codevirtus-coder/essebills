import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import PaymentCheckout, { PaymentOption } from "../components/PaymentCheckout";
import { ROUTE_PATHS } from "../../../router/paths";
import { getProducts, getCurrencies, getProductById } from "../../../services/products.service";
import { processProductPayment } from "../../../services/payments.service";
import { ProductPaymentContext } from "../../../types/transactions";
import type { Currency } from "../../../types/products";
import { toast } from "react-hot-toast";

export function PaymentCheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const billerName = useMemo(() => searchParams.get("biller") ?? "ZESA Prepaid", [searchParams]);
  const accountNumber = useMemo(() => searchParams.get("account") ?? "", [searchParams]);
  const amount = useMemo(() => searchParams.get("amount") ?? "0", [searchParams]);
  const productIdParam = useMemo(() => searchParams.get("productId"), [searchParams]);
  const productCategoryIdParam = useMemo(() => searchParams.get("productCategoryId"), [searchParams]);
  const parsedProductId = useMemo(() => Number(productIdParam), [productIdParam]);
  const hasValidProductId = Number.isFinite(parsedProductId) && parsedProductId > 0;

  const amountValue = useMemo(() => {
    const parsed = Number(amount);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount]);

  // 1. Fetch product details by ID when available, otherwise fallback to search.
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['checkout-product', hasValidProductId ? parsedProductId : billerName],
    queryFn: async () => {
      if (hasValidProductId) {
        return getProductById(parsedProductId);
      }
      const productPage = await getProducts({ search: billerName, size: 1 });
      return productPage.content?.[0];
    },
    enabled: hasValidProductId || !!billerName,
  });

  // 2. Fetch Currencies
  const { data: currenciesData, isLoading: isLoadingCurrencies } = useQuery({
    queryKey: ['currencies', 'all'],
    queryFn: () => getCurrencies(),
  });

  const currencies = useMemo<Currency[]>(() => {
    if (!currenciesData) return [];
    if (Array.isArray(currenciesData)) return currenciesData;
    return currenciesData.content ?? [];
  }, [currenciesData]);

  const productCurrencyCode = useMemo(() => {
    const fromDefaultCurrency = product?.defaultCurrency?.code;
    if (fromDefaultCurrency) return fromDefaultCurrency;

    // Some backend payloads expose default currency as a direct code field.
    const fromDirectCode = (product as { defaultCurrencyCode?: string } | undefined)?.defaultCurrencyCode;
    return fromDirectCode;
  }, [product]);

  const currency = useMemo<Currency | undefined>(() => {
    if (product?.defaultCurrency) {
      return product.defaultCurrency;
    }

    if (productCurrencyCode) {
      const byProductCurrencyCode = currencies.find((c) => c.code === productCurrencyCode);
      if (byProductCurrencyCode) return byProductCurrencyCode;

      // Fallback object still aligns with API schema where only code may be needed.
      return { code: productCurrencyCode };
    }

    return currencies.find((c) => c.code === 'USD') || currencies[0];
  }, [currencies, product, productCurrencyCode]);

  // 3. Payment Mutation
  const mutation = useMutation({
    mutationFn: processProductPayment,
    onSuccess: (response) => {
      if (response.paymentTransaction?.redirectUrl) {
        toast.success("Redirecting to payment gateway...");
        globalThis.location.href = response.paymentTransaction.redirectUrl;
      } else if (response.productPaymentCompletionStatus === 'SUCCESS') {
        toast.success("Payment successful!");
        navigate(ROUTE_PATHS.home);
      } else {
        toast.error("Payment could not be completed. Please try again.");
      }
    },
    onError: (error: unknown) => {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred during payment processing.");
    }
  });

  const handleConfirm = (method: PaymentOption, email: string, phone: string, enteredAccountNumber: string, enteredAmount: number) => {
    if (!product) {
      toast.error("Product information not found.");
      return;
    }
    if (!currency) {
      toast.error("Currency information not found. Please refresh and try again.");
      return;
    }
    if (!enteredAmount || enteredAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    const context: ProductPaymentContext = {
      email: email || undefined,
      phoneNumber: phone,
      amount: enteredAmount,
      paymentMethodCode: method === 'pesepay' ? 'PXP' : 'WALLET',
      currencyCode: currency,
      productCode: product,
      productRequiredFields: {
        accountNumber: enteredAccountNumber,
        meterNumber: enteredAccountNumber,
      },
      paymentMethodRequiredFields: {},
      productMetadata: JSON.stringify({
        productId: product.id,
        productCategoryId: product.category?.id ?? (productCategoryIdParam ? Number(productCategoryIdParam) : undefined),
      }),
    };

    mutation.mutate(context);
  };

  const categoryLabel = product?.category?.displayName ?? product?.category?.name ?? undefined;
  const minimumAmount = product?.minimumPurchaseAmount ?? undefined;

  return (
    <PaymentCheckout
      billerName={billerName}
      accountNumber={accountNumber}
      amount={amount}
      categoryLabel={categoryLabel}
      currencyCode={currency?.code ?? "USD"}
      minimumAmount={minimumAmount}
      onBack={() => navigate(`${ROUTE_PATHS.home}#pay-now`)}
      onConfirm={handleConfirm}
      isLoading={mutation.isPending || isLoadingProduct || isLoadingCurrencies}
    />
  );
}

export default PaymentCheckoutPage;
