import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import type {
  AdminCountryDto,
  AdminCurrencyDto,
  AdminProductCategoryDto,
  AdminProductDto,
} from "../dto/admin-api.dto";
import {
  createProduct,
  deleteProduct,
  getAllCountries,
  getAllCurrencies,
  getAllProductCategories,
  getAllProducts,
  updateProduct,
} from "../services";
import { DataTable, type TableColumn } from "../../../components/ui";
import { AdminTableLayout } from "./shared/AdminTableLayout";
import {
  AdminCreateButton,
  AdminIconDeleteButton,
  AdminIconEditButton,
  AdminInput,
  AdminPrimaryButton,
  AdminRefreshButton,
  AdminSearchInput,
  AdminSelect,
  AdminTextarea,
} from "./shared/AdminControls";
import { ADMIN_CARD } from "./shared/adminUi";

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
  const [isFormOpen, setIsFormOpen] = useState(false);

  const columns: TableColumn<AdminProductDto>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (product) => (
        <p className="text-sm font-bold text-dark-text dark:text-gray-200">
          {String(product.name ?? "Unnamed Product")}
        </p>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      render: (product) => (
        <span className="text-xs font-black text-neutral-text uppercase tracking-wide">
          {String(product.code ?? "-")}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (product) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${
            normalizeStatus(product.status) === "ACTIVE"
              ? "bg-accent-green/10 text-accent-green border-accent-green/20"
              : "bg-neutral-light text-neutral-text border-neutral-light"
          }`}
        >
          {toDisplayStatus(product.status)}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (product) => (
        <span className="text-xs font-semibold text-neutral-text">
          {String((product.category as { displayName?: string; name?: string } | undefined)?.displayName
            ?? (product.category as { name?: string } | undefined)?.name
            ?? "-")}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (product) => (
        <div className="flex justify-end gap-1">
          <AdminIconEditButton onClick={() => handleEditProduct(product)} title="Edit Product" />
          <AdminIconDeleteButton onClick={() => void handleDeleteProduct(product.id)} title="Delete Product" />
        </div>
      ),
    },
  ];
  const [products, setProducts] = useState<AdminProductDto[]>([]);
  const [countries, setCountries] = useState<AdminCountryDto[]>([]);
  const [currencies, setCurrencies] = useState<AdminCurrencyDto[]>([]);
  const [productCategories, setProductCategories] = useState<AdminProductCategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [defaultCurrencyCode, setDefaultCurrencyCode] = useState("");
  const [categoryId, setCategoryId] = useState("");
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
      const [countriesRes, currenciesRes, categoriesRes] = await Promise.all([
        getAllCountries(),
        getAllCurrencies(),
        getAllProductCategories(),
      ]);
      setCountries(Array.isArray(countriesRes) ? countriesRes : []);
      setCurrencies(Array.isArray(currenciesRes) ? currenciesRes : []);
      setProductCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
    } catch {
      setCountries([]);
      setCurrencies([]);
      setProductCategories([]);
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
    setCategoryId("");
    setMinimumDisablingBalance("");
    setMinimumPurchaseAmount("");
    setDescription("");
    setReturnUrl("");
    setProductLogoFileName("");
    setStatus("ACTIVE");
    setEditingProductId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsFormOpen(true);
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
      !categoryId ||
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
        category: { id: Number(categoryId) },
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
      setIsFormOpen(false);
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
    const categoryValue =
      typeof product.category === "object" && product.category !== null
        ? String((product.category as { id?: string | number }).id ?? "")
        : "";

    setEditingProductId(product.id ?? null);
    setName(String(product.name ?? ""));
    setCode(String(product.code ?? ""));
    setCountryCode(String(countryValue));
    setDefaultCurrencyCode(String(currencyValue));
    setCategoryId(String(categoryValue));
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

    setIsFormOpen(true);
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
    <AdminTableLayout
      title="Products"
      subtitle="Manage product catalog and availability for billers."
      toolbar={
        <>
          <AdminCreateButton onClick={openCreateModal}>+ Create Product</AdminCreateButton>
          <AdminRefreshButton onClick={() => void loadProducts()}>Refresh</AdminRefreshButton>
        </>
      }
      stats={
        <div className="px-4 py-2 rounded-2xl bg-primary/10 text-primary text-xs font-black uppercase tracking-widest w-fit">
          Total: {products.length}
        </div>
      }
    >
      <div className="space-y-4">
        <div className={`p-4 ${ADMIN_CARD}`}>
          <div className="max-w-xl">
            <AdminSearchInput
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products by name or code..."
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredProducts}
          rowKey={(product) => String(product.id ?? `${product.code ?? "product"}`)}
          loading={isLoading}
          emptyMessage="No products found"
          emptyIcon="inventory_2"
        />
      </div>

      {isFormOpen ? (
        <div className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button
            type="button"
            onClick={() => setIsFormOpen(false)}
            className="absolute inset-0 bg-slate-900/45"
            aria-label="Close product form modal"
          />
          <div className="relative w-full sm:max-w-4xl bg-white rounded-t-2xl sm:rounded-2xl border border-neutral-light shadow-2xl h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-neutral-light px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-dark-text">
                  {editingProductId ? "Update Product" : "Add Product"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-neutral-light text-neutral-text hover:bg-neutral-light/40"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form
              ref={formCardRef}
              onSubmit={(event) => void handleCreateProduct(event)}
              className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Name</span>
                <AdminInput value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. ZESA Prepaid" className="mt-1" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Code</span>
                <AdminInput value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. ZESA_PREPAID" className="mt-1 uppercase" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Status</span>
                <AdminSelect value={status} onChange={(event) => setStatus(event.target.value as ProductStatus)} className="mt-1">
                  <option value="ACTIVE">Active</option>
                  <option value="COMING_SOON">Coming Soon</option>
                  <option value="DISABLED">Disabled</option>
                </AdminSelect>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Default Currency</span>
                <AdminSelect value={defaultCurrencyCode} onChange={(event) => setDefaultCurrencyCode(event.target.value)} className="mt-1">
                  <option value="">Select currency</option>
                  {currencies.map((currency) => (
                    <option key={String(currency.id ?? currency.code)} value={String(currency.code ?? "")}>
                      {String(currency.name ?? currency.code ?? "Unknown")}
                    </option>
                  ))}
                </AdminSelect>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Product Category</span>
                <AdminSelect value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-1">
                  <option value="">Select category</option>
                  {productCategories.map((category) => (
                    <option key={String(category.id ?? category.name)} value={String(category.id ?? "")}>
                      {String(category.displayName ?? category.name ?? "Unknown")}
                    </option>
                  ))}
                </AdminSelect>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Country</span>
                <AdminSelect value={countryCode} onChange={(event) => setCountryCode(event.target.value)} className="mt-1">
                  <option value="">Select country</option>
                  {countries.map((country) => (
                    <option key={String(country.id ?? country.code)} value={String(country.code ?? "")}>
                      {String(country.name ?? country.code ?? "Unknown")}
                    </option>
                  ))}
                </AdminSelect>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Minimum Disabling Balance</span>
                <AdminInput type="number" value={minimumDisablingBalance} onChange={(event) => setMinimumDisablingBalance(event.target.value)} placeholder="0" className="mt-1" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Minimum Purchase Amount</span>
                <AdminInput type="number" value={minimumPurchaseAmount} onChange={(event) => setMinimumPurchaseAmount(event.target.value)} placeholder="0" className="mt-1" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Product Logo File Name</span>
                <AdminInput value={productLogoFileName} onChange={(event) => setProductLogoFileName(event.target.value)} placeholder="logo.png" className="mt-1" />
              </label>

              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Return URL</span>
                <AdminInput value={returnUrl} onChange={(event) => setReturnUrl(event.target.value)} placeholder="https://yourapp.com/callback" className="mt-1" />
              </label>

              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Description</span>
                <AdminTextarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Describe this product" className="mt-1" />
              </label>

              <div className="lg:col-span-2 sticky bottom-0 bg-white border-t border-neutral-light -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 flex items-center justify-end gap-2 mt-2">
                <AdminRefreshButton onClick={() => setIsFormOpen(false)}>Cancel</AdminRefreshButton>
                <AdminPrimaryButton type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingProductId ? "Update Product" : "Add Product"}
                </AdminPrimaryButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminTableLayout>
  );
};

export default Products;
