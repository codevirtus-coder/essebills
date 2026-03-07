import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  createProduct,
  deleteProduct,
  getPaginatedProducts,
  updateProduct,
} from "../services";
import CRUDLayout, { type CRUDColumn } from "../../shared/components/CRUDLayout";
import CRUDModal from "../../shared/components/CRUDModal";
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  Trash2, 
  Edit2, 
  Plus, 
  Info,
  Bolt,
  Antenna,
  Wifi,
  Globe,
  PlusCircle,
  XCircle,
  Percent,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "../../../lib/utils";

interface BillerField {
  id: string;
  label: string;
  placeholder: string;
  type: string;
  prefix?: string;
}

interface Biller {
  id: string;
  name: string;
  category: string;
  icon: string;
  onboardedDate: string;
  status: "Active" | "Pending" | "Suspended";
  settlement: "Real-time" | "Daily" | "Weekly";
  revenueShare: string;
  fields: BillerField[];
  allowBulk: boolean;
}

interface BillersProps {
  onOnboard?: () => void;
}

const Billers: React.FC<BillersProps> = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isPersisting, setIsPersisting] = useState(false);
  const [selectedBiller, setSelectedBiller] = useState<Biller | null>(null);
  const [isLoadingBillers, setIsLoadingBillers] = useState(false);
  const [billerSource, setBillerSource] = useState<"api" | "mock">("mock");

  const [billers, setBillers] = useState<Biller[]>([
    {
      id: "1",
      name: "ZESA Prepaid",
      category: "Utilities",
      icon: "bolt",
      onboardedDate: "Jan 12, 2023",
      status: "Active",
      settlement: "Daily",
      revenueShare: "2.5%",
      fields: [
        { id: "account", label: "Meter Number", placeholder: "Enter meter number", type: "text" },
        { id: "amount", label: "Amount", placeholder: "0.00", type: "text", prefix: "$" },
      ],
      allowBulk: true,
    },
    {
      id: "3",
      name: "Econet Airtime",
      category: "Airtime",
      icon: "antenna",
      onboardedDate: "Mar 15, 2023",
      status: "Active",
      settlement: "Real-time",
      revenueShare: "3.0%",
      fields: [
        { id: "mobile", label: "Mobile Number", placeholder: "077*******", type: "tel" },
        { id: "amount", label: "Amount", placeholder: "0.00", type: "text", prefix: "$" },
      ],
      allowBulk: true,
    },
  ]);

  const columns: CRUDColumn<Biller>[] = [
    {
      key: "name",
      header: "Biller Entity",
      render: (biller) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {biller.name || "Unnamed Entity"}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
              {biller.category}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (biller) => {
        const isActive = biller.status === "Active";
        const isPending = biller.status === "Pending";
        return (
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              isActive 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50" 
                : isPending 
                ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50"
                : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
            )}
          >
            {biller.status}
          </span>
        );
      },
    },
    {
      key: "settlement",
      header: "Settlement",
      render: (biller) => (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Clock size={12} />
          <span className="text-xs font-semibold">{biller.settlement}</span>
        </div>
      ),
    },
    {
      key: "revenueShare",
      header: "Comm.",
      render: (biller) => (
        <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
          <Percent size={12} className="text-emerald-500" />
          <span className="text-sm">{biller.revenueShare}</span>
        </div>
      ),
    },
  ];

  const loadProductsAsBillers = async () => {
    try {
      setIsLoadingBillers(true);
      const response = await getPaginatedProducts();
      const products = response?.content ?? [];
      const mapped: Biller[] = products.map((product: any, index: number) => ({
        id: String(product.id ?? `P-${index}`),
        name: String(product.name ?? `Product ${index + 1}`),
        category: "Utilities",
        icon: "corporate_fare",
        onboardedDate: "N/A",
        status: String(product.status ?? "").toUpperCase() === "ACTIVE" ? "Active" : "Pending",
        settlement: "Daily",
        revenueShare: "2.0%",
        fields: [
          { id: "account", label: "Account Number", placeholder: "Enter account...", type: "text" },
          { id: "amount", label: "Amount", placeholder: "0.00", type: "text", prefix: "$" },
        ],
        allowBulk: true,
      }));

      if (mapped.length > 0) {
        setBillers(mapped);
        setBillerSource("api");
      }
    } catch {
      setBillerSource("mock");
    } finally {
      setIsLoadingBillers(false);
    }
  };

  useEffect(() => {
    void loadProductsAsBillers();
  }, []);

  const handleEditClick = (biller: Biller) => {
    setSelectedBiller({ ...biller });
    setIsAddingNew(false);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    const newBiller: Biller = {
      id: `BL-${Date.now()}`,
      name: "",
      category: "Utilities",
      icon: "corporate_fare",
      onboardedDate: new Date().toLocaleDateString(),
      status: "Pending",
      settlement: "Daily",
      revenueShare: "2.0%",
      fields: [
        { id: "account", label: "Account Number", placeholder: "Enter account...", type: "text" },
        { id: "amount", label: "Amount", placeholder: "0.00", type: "text", prefix: "$" },
      ],
      allowBulk: false,
    };
    setSelectedBiller(newBiller);
    setIsAddingNew(true);
    setIsModalOpen(true);
  };

  const handleSaveBiller = async () => {
    if (!selectedBiller) return;
    try {
      setIsPersisting(true);
      const payload = {
        name: selectedBiller.name.trim(),
        code: selectedBiller.name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_"),
        status: selectedBiller.status === "Active" ? "ACTIVE" : "INACTIVE",
        description: `${selectedBiller.category} - ${selectedBiller.settlement}`,
      };

      if (isAddingNew) await createProduct(payload);
      else await updateProduct({ id: selectedBiller.id, ...payload });

      toast.success(`Product ${isAddingNew ? 'created' : 'updated'} successfully`);
      await loadProductsAsBillers();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setIsPersisting(false);
    }
  };

  const handleDeleteBiller = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this biller?")) return;
    try {
      await deleteProduct(id);
      toast.success("Biller deleted");
      await loadProductsAsBillers();
    } catch (error) {
      toast.error("Failed to delete biller");
    }
  };

  const filteredBillers = billers.filter(
    (b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           b.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Biller Network", value: billers.length, icon: Building2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Active Nodes", value: billers.filter(b => b.status === "Active").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Pending Review", value: billers.filter(b => b.status === "Pending").length, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "Source", value: billerSource.toUpperCase(), icon: Globe, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <CRUDLayout
        title="Biller Administration"
        columns={columns}
        data={filteredBillers}
        loading={isLoadingBillers}
        pageable={{ page: 1, size: filteredBillers.length, totalElements: filteredBillers.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onSearch={setSearchTerm}
        onRefresh={loadProductsAsBillers}
        onAdd={handleCreateClick}
        addButtonText="Onboard Biller"
        actions={{
          onEdit: handleEditClick,
          onDelete: (item) => handleDeleteBiller(item.id)
        }}
      />

      <CRUDModal
        isOpen={isModalOpen && !!selectedBiller}
        onClose={() => setIsModalOpen(false)}
        title={isAddingNew ? "Onboard Provider" : "Configure Biller"}
        onSubmit={handleSaveBiller}
        isSubmitting={isPersisting}
        submitLabel={isAddingNew ? "Complete Onboarding" : "Save Changes"}
        size="lg"
      >
        {selectedBiller && (
          <div className="space-y-8">
            <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Identification</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Biller Name</label>
                  <input
                    value={selectedBiller.name}
                    onChange={(e) => setSelectedBiller({ ...selectedBiller, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="e.g. ZESA Prepaid"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Category</label>
                  <select
                    value={selectedBiller.category}
                    onChange={(e) => setSelectedBiller({ ...selectedBiller, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none"
                  >
                    <option value="Utilities">Utilities</option>
                    <option value="Airtime">Airtime</option>
                    <option value="Internet">Internet</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Operational Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Settlement Frequency</label>
                  <select
                    value={selectedBiller.settlement}
                    onChange={(e) => setSelectedBiller({ ...selectedBiller, settlement: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none"
                  >
                    <option value="Real-time">Real-time</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Status</label>
                  <select
                    value={selectedBiller.status}
                    onChange={(e) => setSelectedBiller({ ...selectedBiller, status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Enable Bulk Payments</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Allows processing multiple transactions via CSV/Excel</p>
              </div>
              <button
                onClick={() => setSelectedBiller({ ...selectedBiller, allowBulk: !selectedBiller.allowBulk })}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-all",
                  selectedBiller.allowBulk ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", selectedBiller.allowBulk ? "right-1" : "left-1")} />
              </button>
            </div>
          </div>
        )}
      </CRUDModal>
    </div>
  );
};

export default Billers;
