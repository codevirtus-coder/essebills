import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import type {
  AdminCountryDto,
  AdminCurrencyDto,
  AdminProductCategoryDto,
  AdminProductDto,
} from "../dto/admin-api.dto";
import {
  createProduct,
  deleteProduct,
  getPaginatedCountries,
  getPaginatedCurrencies,
  getAllProductCategories,
  getPaginatedProducts,
  updateProduct,
} from "../services";
import { getProductLogoUrl, uploadProductLogo } from "../../../services/products.service";
import CRUDLayout, { type CRUDColumn } from "../../shared/components/CRUDLayout";
import CRUDModal from "../../shared/components/CRUDModal";
import {
  Package,
  Tag,
  Globe,
  DollarSign,
  Settings,
  Info,
  CheckCircle2,
  XCircle,
  Plus,
  Layers,
  ArrowRight,
  ShoppingCart,
  Upload,
  Image,
} from "lucide-react";
import { cn } from "../../../lib/utils";

type ProductStatus = "ACTIVE" | "COMING_SOON" | "DISABLED";

function normalizeStatus(value?: string): ProductStatus {
  const normalized = String(value ?? "").toUpperCase();
  if (normalized === "COMING_SOON") return "COMING_SOON";
  if (normalized === "DISABLED") return "DISABLED";
  return "ACTIVE";
}

const Products: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<AdminProductDto[]>([]);
  const [countries, setCountries] = useState<AdminCountryDto[]>([]);
  const [currencies, setCurrencies] = useState<AdminCurrencyDto[]>([]);
  const [productCategories, setProductCategories] = useState<AdminProductCategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form State
  const [editingProductId, setEditingProductId] = useState<string | number | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [countryId, setCountryId] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minimumDisablingBalance, setMinimumDisablingBalance] = useState("");
  const [minimumPurchaseAmount, setMinimumPurchaseAmount] = useState("");
  const [description, setDescription] = useState("");
  const [returnUrl, setReturnUrl] = useState("");
  const [productLogoFileName, setProductLogoFileName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ProductStatus>("ACTIVE");
  const [parentProductId, setParentProductId] = useState<string>("");
  const [parentSearch, setParentSearch] = useState("");

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await getPaginatedProducts();
      setProducts(Array.isArray(response?.content) ? response.content : []);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const [countriesRes, currenciesRes, categoriesRes] = await Promise.all([
        getPaginatedCountries(),
        getPaginatedCurrencies(),
        getAllProductCategories(),
      ]);
      setCountries(countriesRes?.content ?? []);
      setCurrencies(currenciesRes?.content ?? []);
      setProductCategories(categoriesRes ?? []);
    } catch {
      // SILENT
    }
  };

  useEffect(() => {
    void loadProducts();
    void loadLookups();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => 
      String(p.name ?? "").toLowerCase().includes(term) || 
      String(p.code ?? "").toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const columns: CRUDColumn<AdminProductDto>[] = [
    {
      key: 'name',
      header: 'Product Name',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Package size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{String(p.name ?? "Unnamed")}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{String(p.code ?? "-")}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) => (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Layers size={12} className="text-emerald-500" />
          <span className="text-xs font-semibold">
            {String((p.category as any)?.displayName ?? (p.category as any)?.name ?? "-")}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-center',
      render: (p) => {
        const s = normalizeStatus(p.status);
        return (
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            s === "ACTIVE" 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400" 
              : "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400"
          )}>
            {s.replace("_", " ")}
          </span>
        );
      },
    },
  ];

  const resetForm = () => {
    setEditingProductId(null);
    setName(""); setCode(""); setCountryCode(""); setDefaultCurrencyCode("");
    setCategoryId(""); setMinimumDisablingBalance(""); setMinimumPurchaseAmount("");
    setDescription(""); setReturnUrl(""); setProductLogoFileName(""); setStatus("ACTIVE");
    setCountryId(""); setCurrencyId("");
    setLogoFile(null); setLogoPreview(null);
    setParentProductId(""); setParentSearch("");
  };

  const handleSave = async () => {
    if (!name || !code || !countryId || !currencyId) {
      toast.error("Required fields are missing");
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        countryId: Number(countryId),
        currencyId: Number(currencyId),
        categoryId: categoryId ? Number(categoryId) : null,
        minimumDisablingBalance: Number(minimumDisablingBalance || 0),
        minimumPurchaseAmount: Number(minimumPurchaseAmount || 0),
        description: description.trim(),
        returnUrl: returnUrl.trim() || "-",
        productLogoFileName: productLogoFileName.trim(),
        status,
        parentProductId: parentProductId ? Number(parentProductId) : null,
      };

      let savedProduct;
      if (editingProductId) savedProduct = await updateProduct({ id: editingProductId, ...payload });
      else savedProduct = await createProduct(payload);

      if (logoFile && savedProduct?.id) {
        try {
          await uploadProductLogo(savedProduct.id, logoFile);
        } catch {
          toast.error("Product saved but logo upload failed");
        }
      }

      toast.success(`Product ${editingProductId ? 'updated' : 'added'} successfully`);
      setIsModalOpen(false);
      await loadProducts();
    } catch (error) {
      toast.error("Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (p: AdminProductDto) => {
    setEditingProductId(p.id ?? null);
    setName(String(p.name ?? ""));
    setCode(String(p.code ?? ""));
    // Resolve country ID: prefer explicit id, otherwise match by code from loaded list
    const resolvedCountryId = (p.country as any)?.id
      ?? countries.find(c => c.code === (p.countryCode ?? (p.country as any)?.code))?.id
      ?? "";
    const resolvedCurrencyId = (p.defaultCurrency as any)?.id
      ?? currencies.find(c => c.code === (p.defaultCurrencyCode ?? (p.defaultCurrency as any)?.code))?.id
      ?? "";
    setCountryId(String(resolvedCountryId));
    setCurrencyId(String(resolvedCurrencyId));
    setCategoryId(String((p.category as any)?.id ?? ""));
    setMinimumDisablingBalance(String(p.minimumDisablingBalance ?? ""));
    setMinimumPurchaseAmount(String(p.minimumPurchaseAmount ?? ""));
    setDescription(String(p.description ?? ""));
    setReturnUrl(String(p.returnUrl ?? ""));
    setProductLogoFileName(String(p.productLogoFileName ?? ""));
    setLogoFile(null);
    setLogoPreview(p.id ? getProductLogoUrl(p.id) : null);
    setStatus(normalizeStatus(p.status));
    const pid = (p as any).parentProductId;
    setParentProductId(pid ? String(pid) : "");
    setParentSearch("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product removed");
      await loadProducts();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-slate-900 dark:text-white">
        {[
          { label: "Total Catalog", value: products.length, icon: Package, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Active Items", value: products.filter(p => normalizeStatus(p.status) === 'ACTIVE').length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Average Fee", value: "2.5%", icon: Tag, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
          { label: "New Sales", value: "+18", icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-bold">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <CRUDLayout
        title="Product Catalog"
        columns={columns}
        data={filteredProducts}
        loading={isLoading}
        pageable={{ page: 1, size: 50, totalElements: filteredProducts.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onSearch={setSearchTerm}
        onRefresh={loadProducts}
        onAdd={() => { resetForm(); setIsModalOpen(true); }}
        addButtonText="Add Product"
        actions={{
          onEdit: handleEdit,
          onDelete: (item) => handleDelete(item.id!)
        }}
      />

      <CRUDModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProductId ? "Update Product" : "Add New Product"}
        onSubmit={handleSave}
        isSubmitting={isSaving}
        submitLabel={editingProductId ? "Update Product" : "Add Product"}
        size="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Basic Info</h4>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Product Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="e.g. ZESA Prepaid" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">System Code</label>
              <input value={code} onChange={e => setCode(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase" placeholder="ZESA_PREPAID" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Category (Optional - Defaults to Other)</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none">
                <option value="">Select Category</option>
                {productCategories.map(c => <option key={c.id} value={c.id}>{c.displayName || c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Regional & Status</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Country</label>
                <select value={countryId} onChange={e => setCountryId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none">
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Currency</label>
                <select value={currencyId} onChange={e => setCurrencyId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none">
                  <option value="">Select Currency</option>
                  {currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Current Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as ProductStatus)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none">
                <option value="ACTIVE">Active</option>
                <option value="COMING_SOON">Coming Soon</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Extended Parameters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Parent product — makes this product a variant/child of the selected parent */}
               <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                    Parent Product <span className="font-normal text-slate-400">(optional — set to make this a variant)</span>
                  </label>
                  <input
                    type="text"
                    value={parentSearch}
                    onChange={e => setParentSearch(e.target.value)}
                    placeholder="Search by name or code…"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mb-1"
                  />
                  <select
                    value={parentProductId}
                    onChange={e => setParentProductId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none"
                    size={4}
                  >
                    <option value="">— No parent (standalone product) —</option>
                    {products
                      .filter(p =>
                        // exclude the product being edited from its own parent list
                        String(p.id) !== String(editingProductId) &&
                        (parentSearch.trim() === '' ||
                          String(p.name ?? '').toLowerCase().includes(parentSearch.toLowerCase()) ||
                          String(p.code ?? '').toLowerCase().includes(parentSearch.toLowerCase()))
                      )
                      .map(p => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name} ({p.code})
                        </option>
                      ))
                    }
                  </select>
                  {parentProductId && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">
                      Variant of: {products.find(p => String(p.id) === parentProductId)?.name ?? `#${parentProductId}`}
                      {' '}·{' '}
                      <button type="button" className="underline" onClick={() => { setParentProductId(''); setParentSearch(''); }}>clear</button>
                    </p>
                  )}
               </div>
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Min Purchase Amount</label>
                  <input type="number" value={minimumPurchaseAmount} onChange={e => setMinimumPurchaseAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold" placeholder="0.00" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Product Logo</label>
                  <div
                    className="relative flex items-center gap-3 w-full bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 cursor-pointer hover:border-emerald-400 transition-colors"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="logo"
                        className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-100"
                        onError={() => setLogoPreview(null)}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Image size={18} className="text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
                        {logoFile ? logoFile.name : productLogoFileName || "Click to upload logo"}
                      </p>
                      <p className="text-[10px] text-slate-400">PNG, JPG, SVG, WebP</p>
                    </div>
                    <Upload size={14} className="text-slate-400 shrink-0" />
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setLogoFile(file);
                        if (file) setLogoPreview(URL.createObjectURL(file));
                      }}
                    />
                  </div>
               </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none" placeholder="Provide a brief description..." />
            </div>
          </div>
        </div>
      </CRUDModal>
    </div>
  );
};

export default Products;
