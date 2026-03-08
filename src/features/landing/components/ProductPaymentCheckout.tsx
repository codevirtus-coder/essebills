import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import PaymentCheckout, { type PaymentOption } from "./PaymentCheckout";
import { getProducts, getCurrencies, getProductById } from "../../../services/products.service";
import { processProductPayment } from "../../../services/payments.service";
import { type ProductPaymentContext } from "../../../types/transactions";
import type { Currency } from "../../../types/products";
import { toast } from "react-hot-toast";

interface ProductPaymentCheckoutProps {
  productId?: number;
  billerName?: string;
  accountNumber?: string;
  amount?: string;
  productCategoryId?: number;
  onBack: () => void;
  onSuccess?: (response: any) => void;
  embedded?: boolean;
}

export function ProductPaymentCheckout({
  productId,
  billerName = "ZESA Prepaid",
  accountNumber = "",
  amount = "0",
  productCategoryId,
  onBack,
  onSuccess,
  embedded = false,
}: ProductPaymentCheckoutProps) {
  
  const hasValidProductId = typeof productId === 'number' && productId > 0;

  // 1. Fetch product details
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['checkout-product', hasValidProductId ? productId : billerName],
    queryFn: async () => {
      if (hasValidProductId) {
        return getProductById(productId);
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
    return (currenciesData as any).content ?? [];
  }, [currenciesData]);

  const productCurrencyCode = useMemo(() => {
    const fromDefaultCurrency = product?.defaultCurrency?.code;
    if (fromDefaultCurrency) return fromDefaultCurrency;
    return (product as any)?.defaultCurrencyCode;
  }, [product]);

  const currency = useMemo<Currency | undefined>(() => {
    if (product?.defaultCurrency) return product.defaultCurrency;
    if (productCurrencyCode) {
      const found = currencies.find((c) => c.code === productCurrencyCode);
      if (found) return found;
      return { code: productCurrencyCode } as Currency;
    }
    return currencies.find((c) => c.code === 'USD') || currencies[0];
  }, [currencies, product, productCurrencyCode]);

  // 3. Payment Mutation
  const mutation = useMutation({
    mutationFn: processProductPayment,
    onSuccess: (response) => {
      if (response.paymentTransaction?.redirectUrl) {
        toast.success("Redirecting to payment gateway...");
        window.location.href = response.paymentTransaction.redirectUrl;
      } else if (response.productPaymentCompletionStatus === 'SUCCESS') {
        toast.success("Payment successful!");
        if (onSuccess) onSuccess(response);
      } else {
        toast.error("Payment could not be completed. Please try again.");
      }
    },
    onError: (error: any) => {
      console.error("Payment error:", error);
      toast.error(error?.message || "An error occurred during payment processing.");
    }
  });

  const handleConfirm = (method: PaymentOption, email: string, phone: string, enteredAccountNumber: string, enteredAmount: number) => {
    if (!product) {
      toast.error("Product information not found.");
      return;
    }
    if (!currency) {
      toast.error("Currency information not found.");
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
        productCategoryId: product.category?.id ?? productCategoryId,
      }),
    };

    mutation.mutate(context);
  };

  return (
    <PaymentCheckout
      billerName={product?.name || billerName}
      accountNumber={accountNumber}
      amount={amount}
      categoryLabel={product?.category?.displayName || product?.category?.name}
      currencyCode={currency?.code ?? "USD"}
      minimumAmount={product?.minimumPurchaseAmount}
      onBack={onBack}
      onConfirm={handleConfirm}
      isLoading={mutation.isPending || isLoadingProduct || isLoadingCurrencies}
      embedded={embedded}
    />
  );
}
