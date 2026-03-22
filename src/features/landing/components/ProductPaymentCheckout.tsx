import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import PaymentCheckout, { type PaymentOption } from "./PaymentCheckout";
import PaymentStatusModal from "./PaymentStatusModal";
import ProductVariantPicker from "./ProductVariantPicker";
import { getProducts, getCurrencies, getProductById, getProductFields, checkProductAvailability, preCheckProduct, type ProductPreCheckResult } from "../../../services/products.service";
import { processProductPayment, getApplicableServiceCharge } from "../../../services/payments.service";
import { getMyWalletBalances } from "../../../services/wallet.service";
import { isAuthenticated, getAuthSession } from "../../../features/auth/auth.storage";
import { type ProductPaymentContext, type PaymentTransaction } from "../../../types/transactions";
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

  // Status modal state — shown while polling an async payment (EcoCash seamless, redirect return)
  const [pendingTx, setPendingTx] = useState<{
    transactionId: number;
    method: PaymentOption;
    amount: number;
    currencyCode: string;
  } | null>(null);

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

  // 3b. Availability check — runs when we know the active product
  const { data: availability } = useQuery({
    queryKey: ['product-availability', activeProduct?.id],
    queryFn: () => checkProductAvailability(activeProduct!.id!),
    enabled: !!activeProduct?.id,
    staleTime: 30_000, // re-check every 30 s
  });

  // Pre-check state — populated after the user fills in account fields
  const [preCheckResult, setPreCheckResult] = useState<ProductPreCheckResult | null>(null);
  const [isPreChecking, setIsPreChecking] = useState(false);

  // 4a. Fetch applicable service charge rate for this user's group
  const { data: serviceChargeData } = useQuery({
    queryKey: ['service-charge', session?.group],
    queryFn: () => getApplicableServiceCharge(session?.group),
  });
  // API returns ratePercent as a percentage (e.g. 1.0 = 1%) — convert to decimal multiplier
  const serviceChargeRate = serviceChargeData != null ? serviceChargeData.ratePercent / 100 : 0.01;

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
  const [lastMethod, setLastMethod] = useState<PaymentOption>("pesepay");
  const mutation = useMutation({
    mutationFn: processProductPayment,
    onSuccess: (response) => {
      const tx = response.paymentTransaction;

      if (tx?.redirectUrl) {
        // PesePay Gateway redirect — send user to Pesepay hosted page
        toast.success("Redirecting to payment gateway...");
        window.location.href = tx.redirectUrl;
        return;
      }

      if (response.productPaymentCompletionStatus === 'SUCCESS') {
        // Wallet or instant success
        toast.success("Payment successful!");
        if (onSuccess) onSuccess(response);
        return;
      }

      if (tx?.id && (tx.paymentStatus === 'PROCESSING' || tx.paymentStatus === 'PENDING')) {
        // EcoCash seamless — show polling modal
        setPendingTx({
          transactionId: tx.id,
          method: lastMethod,
          amount: tx.amount ?? 0,
          currencyCode: tx.currencyCode ?? currency?.code ?? "USD",
        });
        return;
      }

      // paymentStatus === SUCCESS but delivery failed (e.g. eSolutions non-00 after Pesepay charge)
      // This case should now be handled by the 402 handler below, but keep as fallback
      toast.error("Payment was processed but product delivery did not complete. Please contact support with reference: " + (tx?.productReferenceNumber ?? ""));
    },
    onError: (error: any) => {
      console.error("Payment error:", error);
      // 402 = charged but provider delivery failed
      if (error?.status === 402 || error?.statusCode === 402) {
        toast.error(
          (error?.message || "Payment was charged but delivery failed.") +
          " Please contact support with your reference number.",
          { duration: 8000 }
        );
        return;
      }
      toast.error(error?.message || "An error occurred during payment processing.");
    }
  });

  const handleConfirm = (method: PaymentOption, email: string, phone: string, enteredAccountNumber: string, enteredAmount: number) => {
    setLastMethod(method);
    if (!activeProduct) {
      toast.error("Product information not found.");
      return;
    }
    if (!currency) {
      toast.error("Currency information not found.");
      return;
    }

    let paymentMethodCode: string;
    if (method === 'wallet') {
      paymentMethodCode = 'WALLET';
    } else if (method === 'ecocash_seamless') {
      paymentMethodCode = 'PZW211';
    } else {
      // 'pesepay' → redirect flow (empty string triggers initiateTransaction)
      paymentMethodCode = '';
    }

    // EcoCash seamless requires the subscriber number under "customerPhoneNumber"
    const paymentMethodRequiredFields: Record<string, string> =
      method === 'ecocash_seamless' ? { customerPhoneNumber: phone } : {};

    const context: ProductPaymentContext = {
      email: email || undefined,
      phoneNumber: phone,
      amount: enteredAmount,
      paymentMethodCode,
      currencyCode: currency,
      productCode: activeProduct,
      productRequiredFields: {
        accountNumber: enteredAccountNumber,
      },
      paymentMethodRequiredFields,
      productMetadata: JSON.stringify({
        productId: activeProduct.id,
        productCategoryId: activeProduct.category?.id ?? productCategoryId,
      }),
      userId: session?.profile?.id,
      userGroup: session?.group,
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

  const handlePaymentSuccess = (_tx: PaymentTransaction) => {
    setPendingTx(null);
    toast.success("Payment successful! Your product has been delivered.");
    if (onSuccess) onSuccess(_tx);
  };

  const handlePaymentFailure = (_tx: PaymentTransaction) => {
    // keep modal open so user can click "Try Again"
    toast.error(_tx.pesepayTransactionStatusDescription || "Payment failed. Please try again.");
  };

  const handlePreCheck = async (requiredFields: Record<string, string>, enteredAmount?: number) => {
    if (!activeProduct?.id) return;
    setIsPreChecking(true);
    try {
      const result = await preCheckProduct(activeProduct.id, {
        requiredFields,
        amount: enteredAmount ?? 0,
        currencyCode: currency?.code,
      });
      setPreCheckResult(result);
    } catch {
      setPreCheckResult(null);
    } finally {
      setIsPreChecking(false);
    }
  };

  // Product unavailable — show blocked state
  if (availability && !availability.available) {
    return (
      <div className={embedded ? '' : 'min-h-screen bg-[#f8fafc] pb-20 pt-8 px-4 sm:px-6 max-w-xl mx-auto flex items-center justify-center'}>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">{activeProduct?.name || billerName}</h3>
          <p className="text-slate-500 text-sm">{availability.reason ?? "This product is temporarily unavailable. Please try again later."}</p>
          <button onClick={onBack} className="mt-2 px-6 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors text-sm">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {pendingTx && (
        <PaymentStatusModal
          transactionId={pendingTx.transactionId}
          paymentMethod={pendingTx.method as "pesepay" | "ecocash_seamless" | "wallet"}
          billerName={activeProduct?.name || billerName}
          amount={pendingTx.amount}
          currencyCode={pendingTx.currencyCode}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          onClose={() => setPendingTx(null)}
        />
      )}
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
        serviceChargeRate={serviceChargeRate}
        onLoginRequired={() => navigate(ROUTE_PATHS.login)}
        onPreCheck={handlePreCheck}
        preCheckResult={preCheckResult}
        isPreChecking={isPreChecking}
      />
    </>
  );
}
