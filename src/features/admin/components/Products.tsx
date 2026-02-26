import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { AdminCountryDto, AdminCurrencyDto, AdminProductDto } from "../dto/admin-api.dto";
import {
  createProduct,
  deleteProduct,
  getAllCountries,
  getAllCurrencies,
  getAllProducts,
  updateProduct,
} from "../services";

type ProductStatus = "ACTIVE" | "COMING_SOON" | "DISABLED";

function normalizeStatus(value?: string): ProductStatus {
  const normalized = String(value ?? "").toUpperCase();
  if (normalized === "COMING_SOON") return "COMING_SOON";
  if (normalized === "DISABLED") return "DISABLED";
  return "ACTIVE";
}

function toDisplayStatus(value?: string) {
  const status = normalizeStatus(value);
  if (status === "COMING_SOON") return "Coming Soon";
  if (status === "DISABLED") return "Disabled";
  return "Active";
}

const Products: React.FC = () => {
  const formCardRef = React.useRef<HTMLFormElement | null>(null);
  const [products, setProducts] = useState<AdminProductDto[]>([]);
  const [countries, setCountries] = useState<AdminCountryDto[]>([]);
  const [currencies, setCurrencies] = useState<AdminCurrencyDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [defaultCurrencyCode, setDefaultCurrencyCode] = useState("");
  const [minimumDisablingBalance, setMinimumDisablingBalance] = useState("");
  const [minimumPurchaseAmount, setMinimumPurchaseAmount] = useState("");
  const [description, setDescription] = useState("");
  const [returnUrl, setReturnUrl] = useState("");
  const [productLogoFileName, setProductLogoFileName] = useState("");
  const [status, setStatus] = useState<ProductStatus>("ACTIVE");
  const [editingProductId, setEditingProductId] = useState<string | number | null>(null);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await getAllProducts();
      setProducts(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const [countriesRes, currenciesRes] = await Promise.all([
        getAllCountries(),
        getAllCurrencies(),
      ]);
      setCountries(Array.isArray(countriesRes) ? countriesRes : []);
      setCurrencies(Array.isArray(currenciesRes) ? currenciesRes : []);
    } catch {
      setCountries([]);
      setCurrencies([]);
    }
  };

  useEffect(() => {
    void loadProducts();
    void loadLookups();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) => {
      const productName = String(product.name ?? "").toLowerCase();
      const productCode = String(product.code ?? "").toLowerCase();
      return productName.includes(term) || productCode.includes(term);
    });
  }, [products, searchTerm]);

  const resetForm = () => {
    setName("");
    setCode("");
    setCountryCode("");
    setDefaultCurrencyCode("");
    setMinimumDisablingBalance("");
    setMinimumPurchaseAmount("");
    setDescription("");
    setReturnUrl("");
    setProductLogoFileName("");
    setStatus("ACTIVE");
    setEditingProductId(null);
  };

  const handleCreateProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();

    if (
      !trimmedName ||
      !trimmedCode ||
      !countryCode ||
      !defaultCurrencyCode ||
      !description.trim() ||
      !returnUrl.trim() ||
      !productLogoFileName.trim() ||
      !minimumDisablingBalance ||
      !minimumPurchaseAmount
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name: trimmedName,
        code: trimmedCode,
        countryCode,
        defaultCurrencyCode,
        minimumDisablingBalance: Number(minimumDisablingBalance),
        minimumPurchaseAmount: Number(minimumPurchaseAmount),
        description: description.trim(),
        returnUrl: returnUrl.trim(),
        productLogoFileName: productLogoFileName.trim(),
        status,
      };

      if (editingProductId) {
        await updateProduct({
          id: editingProductId,
          ...payload,
        });
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product added");
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProduct = (product: AdminProductDto) => {
    const countryValue =
      product.countryCode ??
      (typeof product.country === "object" && product.country !== null
        ? String((product.country as { code?: string }).code ?? "")
        : "");
    const currencyValue =
      product.defaultCurrencyCode ??
      (typeof product.defaultCurrency === "object" && product.defaultCurrency !== null
        ? String((product.defaultCurrency as { code?: string }).code ?? "")
        : "");

    setEditingProductId(product.id ?? null);
    setName(String(product.name ?? ""));
    setCode(String(product.code ?? ""));
    setCountryCode(String(countryValue));
    setDefaultCurrencyCode(String(currencyValue));
    setMinimumDisablingBalance(
      product.minimumDisablingBalance !== undefined && product.minimumDisablingBalance !== null
        ? String(product.minimumDisablingBalance)
        : "",
    );
    setMinimumPurchaseAmount(
      product.minimumPurchaseAmount !== undefined && product.minimumPurchaseAmount !== null
        ? String(product.minimumPurchaseAmount)
        : "",
    );
    setDescription(String(product.description ?? ""));
    setReturnUrl(String(product.returnUrl ?? ""));
    setProductLogoFileName(String(product.productLogoFileName ?? ""));
    setStatus(normalizeStatus(product.status));

    window.requestAnimationFrame(() => {
      formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleDeleteProduct = async (productId?: string | number) => {
    if (!productId) return;
    try {
      await deleteProduct(productId);
      toast.success("Product deleted");
      await loadProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">
            Products
          </h2>
          <p className="text-sm text-neutral-text">
            Manage product catalog and availability for billers.
          </p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
          Total: {products.length}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <form
          ref={formCardRef}
          onSubmit={(event) => void handleCreateProduct(event)}
          className="xl:col-span-1 bg-white p-6 rounded-[2rem] border border-neutral-light shadow-sm space-y-4"
        >
          <h3 className="text-lg font-extrabold text-dark-text dark:text-white">
            {editingProductId ? "Update Product" : "Add Product"}
          </h3>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
              Name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. ZESA Prepaid"
              className="w-full bg-[#f8fafc] border border-neutral-light rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
              Code
            </span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. ZESA_PREPAID"
              className="w-full bg-[#f8fafc] border border-neutral-light rounded-xl px-4 py-3 text-sm font-semibold uppercase focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
              Status
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ProductStatus)}
              className="w-full bg-[#f8fafc] border border-neutral-light rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            >
              <option value="ACTIVE">Active</option>
              <option value="COMING_SOON">Coming Soon</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
              Default Currency
            </span>
            <select
              value={defaultCurrencyCode}
              onChange={(event) => setDefaultCurrencyCode(event.target.value)}
              className="w-full bg-[#f8fafc] border border-neutral-light rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            >
              <option value="">Select currency</option>
              {currencies.map((currency) => (
                <option key={String(currency.id ?? currency.code)} value={String(currency.code ?? "")}>
                  {String(currency.name ?? currency.code ?? "Unknown")}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
              Country
            </span>
            <select
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              className="w-full bg-[#f8fafc] border border-neutral-light rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={String(country.id ?? country.code)} value={String(country.code ?? "")}>
                  {String(country.name ?? country.code ?? "Unknown")}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
              Minimum Disabling Balance
            </span>
            <input
              type="number"
              value={minimumDisablingBalance}
              onChange={(event) => setMinimumDisablingBalance(event.target.value)}
              placeholder="0"
              className="w-full bg-[#f8fafc] border border-neutral-light rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
              Minimum Purchase Amount
            </span>
            <input
              type="number"
              value={minimumPurchaseAmount}
              onChange={(event) => setMinimumPurchaseAmount(event.target.value)}
              placeholder="0"
              className="w-full bg-[#f8fafc] border border-neutral-light rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
              Product Logo File Name
            </span>
            <input
              value={productLogoFileName}
              onChange={(event) => setProductLogoFileName(event.target.value)}
              placeholder="logo.png"
              className="w-full bg-[#f8fafc] border border-neutral-light rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
              Return URL
            </span>
            <input
              value={returnUrl}
              onChange={(event) => setReturnUrl(event.target.value)}
              placeholder="https://yourapp.com/callback"
              className="w-full bg-[#f8fafc] border border-neutral-light rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-text">
              Description
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Describe this product"
              className="w-full bg-[#f8fafc] border border-neutral-light rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : editingProductId ? "Update Product" : "Add Product"}
          </button>
          {editingProductId ? (
            <button
              type="button"
              onClick={resetForm}
              className="w-full bg-neutral-light text-neutral-text px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-neutral-light/80 transition-all"
            >
              Cancel Edit
            </button>
          ) : null}
        </form>

        <div className="xl:col-span-2 bg-white rounded-[2rem] border border-neutral-light shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-light">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-text text-lg">
                search
              </span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products by name or code..."
                className="w-full bg-[#f8fafc] border border-neutral-light rounded-xl pl-11 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-neutral-light/20">
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                    Product
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                    Code
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-sm font-semibold text-neutral-text text-center">
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-sm font-semibold text-neutral-text text-center">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <tr key={String(product.id ?? `${product.code ?? "product"}-${index}`)} className="hover:bg-neutral-light/10 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-dark-text dark:text-gray-200">
                          {String(product.name ?? "Unnamed Product")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-neutral-text uppercase tracking-wide">
                          {String(product.code ?? "-")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${
                            normalizeStatus(product.status) === "ACTIVE"
                              ? "bg-accent-green/10 text-accent-green border-accent-green/20"
                              : "bg-neutral-light text-neutral-text border-neutral-light"
                          }`}
                        >
                          {toDisplayStatus(product.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="w-10 h-10 inline-flex items-center justify-center rounded-xl hover:bg-primary/10 hover:text-primary text-neutral-text transition-all mr-1"
                          title="Edit Product"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => void handleDeleteProduct(product.id)}
                          className="w-10 h-10 inline-flex items-center justify-center rounded-xl hover:bg-red-50 hover:text-red-600 text-neutral-text transition-all"
                          title="Delete Product"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
