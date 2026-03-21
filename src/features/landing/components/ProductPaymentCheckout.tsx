import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import PaymentCheckout, { type PaymentOption } from "./PaymentCheckout";
import ProductVariantPicker from "./ProductVariantPicker";
import { getProducts, getCurrencies, getProductById, getProductFields } from "../../../services/products.service";
import { processProductPayment } from "../../../services/payments.service";
import { getMyWalletBalances } from "../../../services/wallet.service";
import { isAuthenticated, getAuthSession } from "../../../features/auth/auth.storage";
import { type ProductPaymentContext } from "../../../types/transactions";
import type { Currency, Product } from "../../../types/products";
import { toast } from "react-hot-toast";
import { ROUTE_PATHS } from "../../../router/paths";

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
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const session = getAuthSession();
  const userRole = session?.group === 'CUSTOMER' ? 'customer' : session?.group === 'AGENT' ? 'agent' : null;

  // Variant picker state — set when user picks a specific bundle/plan from sibling products
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);

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

  // 2. Fetch sibling products in the same category (for bundle/plan variant selection)
  const categoryId = product?.category?.id ?? productCategoryId;
  const { data: siblingsPage } = useQuery({
    queryKey: ['category-products', categoryId],
    queryFn: () => getProducts({ categoryId, size: 100 }),
    enabled: !!categoryId && !!product,
  });
  const siblings = useMemo<Product[]>(() => siblingsPage?.content ?? [], [siblingsPage]);
  // Show variant picker only when no specific productId was given (user hasn't pre-selected)
  // and the category contains multiple products
  const showVariantPicker = siblings.length > 1 && !selectedVariant && !hasValidProductId;
  // The active product is either the user-selected variant or the base product
  const activeProduct = selectedVariant ?? product;

  // 3. Fetch product required fields (drives dynamic account field label/placeholder)
  const { data: productFields = [] } = useQuery({
    queryKey: ['product-fields', activeProduct?.id],
    queryFn: () => getProductFields(activeProduct!.id!),
    enabled: !!activeProduct?.id,
  });

  // 4. Fetch wallet balances (only when authenticated)
  const { data: walletBalances } = useQuery({
    queryKey: ['wallet-balances', userRole],
    queryFn: () => getMyWalletBalances(userRole as 'customer' | 'agent'),
    enabled: authenticated && userRole != null,
  });

  // 5. Fetch Currencies
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

  // 6. Payment Mutation
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
    if (!activeProduct) {
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
      productCode: activeProduct,
      productRequiredFields: {
        accountNumber: enteredAccountNumber,
      },
      paymentMethodRequiredFields: {},
      productMetadata: JSON.stringify({
        productId: activeProduct.id,
        productCategoryId: activeProduct.category?.id ?? productCategoryId,
      }),
    };

    mutation.mutate(context);
  };

  const walletBalance = useMemo(() => {
    if (!walletBalances || !currency) return undefined;
    const match = walletBalances.find((b) => b.currencyCode === currency.code);
    return match?.availableBalance ?? match?.balance;
  }, [walletBalances, currency]);

  // Auto-fill amount from variant price when it's a fixed-price bundle
  const variantAmount = useMemo(() => {
    if (selectedVariant?.minimumPurchaseAmount && selectedVariant.minimumPurchaseAmount > 0) {
      return String(selectedVariant.minimumPurchaseAmount);
    }
    return amount;
  }, [selectedVariant, amount]);

  if (showVariantPicker) {
    return (
      <div className={embedded ? '' : 'min-h-screen bg-[#f8fafc] pb-20 pt-8 px-4 sm:px-6 max-w-5xl mx-auto'}>
        <ProductVariantPicker
          categoryLabel={product?.category?.displayName || product?.category?.name || billerName}
          variants={siblings}
          onSelect={(variant) => setSelectedVariant(variant)}
          onBack={onBack}
          currencyCode={currency?.code ?? "USD"}
        />
      </div>
    );
  }

  return (
    <PaymentCheckout
      billerName={activeProduct?.name || billerName}
      accountNumber={accountNumber}
      amount={variantAmount}
      categoryLabel={activeProduct?.category?.displayName || activeProduct?.category?.name}
      currencyCode={currency?.code ?? "USD"}
      minimumAmount={activeProduct?.minimumPurchaseAmount}
      productFields={productFields}
      onBack={selectedVariant ? () => setSelectedVariant(null) : onBack}
      onConfirm={handleConfirm}
      isLoading={mutation.isPending || isLoadingProduct || isLoadingCurrencies}
      embedded={embedded}
      isAuthenticated={authenticated}
      walletBalance={walletBalance}
      onLoginRequired={() => navigate(ROUTE_PATHS.login)}
    />
  );
}
