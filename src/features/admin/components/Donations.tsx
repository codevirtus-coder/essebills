import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { confirmToast } from "../../../lib/confirmToast";
import {
  getDonationsByCampaignV1,
  getDonationSummaryV1,
  type DonationV1,
} from "../../../services/donationsV1.service";
import {
  getDonationCampaigns,
  createDonationCampaign,
  updateDonationCampaign,
  deleteDonationCampaign,
  setDonationCampaignStatus,
  type DonationCampaignDto,
} from "../../../services/donationCampaigns.service";
import StatCard from "../../../components/ui/StatCard";
import CRUDLayout from "../../shared/components/CRUDLayout";
import CRUDModal from "../../shared/components/CRUDModal";
import { cn } from "../../../lib/utils";
import { Edit2, Trash2, ToggleLeft, ToggleRight, Plus } from "lucide-react";

const Donations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"donations" | "campaigns">("campaigns");

  // ── Stats ──────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  const loadStats = useCallback(() => {
    getDonationSummaryV1().then(setStats).catch(() => {});
  }, []);

  // ── Campaigns ──────────────────────────────────────────────────────────────
  const [campaigns, setCampaigns] = useState<DonationCampaignDto[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", targetAmount: "" });

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<DonationCampaignDto | null>(null);
  const [editForm, setEditForm] = useState({
    name: "", description: "", targetAmount: "", currencyCode: "",
    imageUrl: "", startDate: "", endDate: "", active: true, featured: false,
  });

  const fetchCampaigns = useCallback(() => {
    setLoadingCampaigns(true);
    getDonationCampaigns()
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => { toast.error("Failed to load campaigns"); setCampaigns([]); })
      .finally(() => setLoadingCampaigns(false));
  }, []);

  const handleCreate = async () => {
    if (!createForm.name.trim()) { toast.error("Name is required"); return; }
    try {
      setIsCreating(true);
      await createDonationCampaign({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        targetAmount: createForm.targetAmount ? Number(createForm.targetAmount) : undefined,
      });
      toast.success("Campaign created");
      setIsCreateOpen(false);
      setCreateForm({ name: "", description: "", targetAmount: "" });
      fetchCampaigns();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (c: DonationCampaignDto) => {
    setEditingCampaign(c);
    setEditForm({
      name: c.name,
      description: c.description ?? "",
      targetAmount: c.targetAmount != null ? String(c.targetAmount) : "",
      currencyCode: c.currencyCode ?? "",
      imageUrl: c.imageUrl ?? "",
      startDate: c.startDate ? c.startDate.slice(0, 16) : "",
      endDate: c.endDate ? c.endDate.slice(0, 16) : "",
      active: c.isActive ?? true,
      featured: c.isFeatured ?? false,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCampaign) return;
    if (!editForm.name.trim()) { toast.error("Name is required"); return; }
    try {
      setIsUpdating(true);
      await updateDonationCampaign(editingCampaign.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        targetAmount: editForm.targetAmount ? Number(editForm.targetAmount) : undefined,
        currencyCode: editForm.currencyCode.trim() || undefined,
        imageUrl: editForm.imageUrl.trim() || undefined,
        startDate: editForm.startDate || undefined,
        endDate: editForm.endDate || undefined,
        active: editForm.active,
        featured: editForm.featured,
      });
      toast.success("Campaign updated");
      setIsEditOpen(false);
      fetchCampaigns();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = (c: DonationCampaignDto) => {
    const next = !c.isActive;
    setDonationCampaignStatus(c.id, next)
      .then(() => { toast.success(next ? "Campaign activated" : "Campaign deactivated"); fetchCampaigns(); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to update status"));
  };

  const handleDelete = (c: DonationCampaignDto) => {
    confirmToast(`Delete campaign "${c.name}"?`, () => {
      deleteDonationCampaign(c.id)
        .then(() => { toast.success("Campaign deleted"); fetchCampaigns(); })
        .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to delete"));
    });
  };

  // ── Donations (individual) ─────────────────────────────────────────────────
  const [donations, setDonations] = useState<DonationV1[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [donationsPageable, setDonationsPageable] = useState({ page: 1, size: 10, totalElements: 0, totalPages: 0 });
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");

  const fetchDonations = useCallback((page = 1, size = 10) => {
    if (!selectedCampaignId) return;
    setLoadingDonations(true);
    getDonationsByCampaignV1(Number(selectedCampaignId), page - 1, size)
      .then((data) => {
        setDonations(data.content ?? []);
        setDonationsPageable({
          page: (data.number ?? 0) + 1,
          size: data.size ?? size,
          totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0,
        });
      })
      .catch(() => setDonations([]))
      .finally(() => setLoadingDonations(false));
  }, [selectedCampaignId]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (activeTab === "campaigns") fetchCampaigns(); }, [activeTab, fetchCampaigns]);
  useEffect(() => { if (activeTab === "donations" && selectedCampaignId) fetchDonations(); }, [activeTab, selectedCampaignId, fetchDonations]);

  // ── Columns ────────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const campaignColumns: any[] = [
    {
      key: "name",
      header: "Campaign",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => (
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {c.name}
            {c.isFeatured && (
              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
                Featured
              </span>
            )}
          </p>
          {c.description && <p className="text-xs text-slate-400 truncate max-w-[220px] mt-0.5">{c.description}</p>}
          {c.categoryName && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{c.categoryName}</p>}
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => {
        const raised = Number(c.raisedAmount ?? 0);
        const target = Number(c.targetAmount ?? 0);
        const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : null;
        const currency = c.currencyCode ?? "";
        return (
          <div className="min-w-[140px]">
            <p className="text-sm font-bold text-emerald-600">
              {currency} {raised.toLocaleString()}
            </p>
            {target > 0 && (
              <>
                <p className="text-[10px] text-slate-400">of {currency} {target.toLocaleString()} goal</p>
                <div className="mt-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-28">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{pct}%</p>
              </>
            )}
          </div>
        );
      },
    },
    {
      key: "donors",
      header: "Donors",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => (
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          {Number(c.donorCount ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "text-center",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => (
        <button
          onClick={() => handleToggleStatus(c)}
          title={c.isActive ? "Click to deactivate" : "Click to activate"}
          className="flex items-center gap-1.5 mx-auto transition-opacity hover:opacity-70"
        >
          {c.isActive ? (
            <>
              <ToggleRight className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inactive</span>
            </>
          )}
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => (
        <div className="flex gap-1.5 justify-end">
          <button
            onClick={() => openEdit(c)}
            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
            title="Edit"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => handleDelete(c)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const donationColumns: any[] = [
    {
      key: "date",
      header: "Date",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (d: any) => (
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {d.createdDate ? new Date(d.createdDate).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "donor",
      header: "Donor",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (d: any) => (
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{d.donorName || "Anonymous"}</p>
          {d.donorEmail && <p className="text-xs text-slate-500">{d.donorEmail}</p>}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      className: "text-right",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (d: any) => (
        <span className="font-bold text-emerald-600">
          {d.currencyCode} {(Number(d.amount) || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "text-center",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (d: any) => {
        const status = d.paymentStatus;
        return (
          <span className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            status === "SUCCESS"
              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
              : status === "PENDING" || status === "PROCESSING"
              ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
              : status === "FAILED"
              ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400"
              : "bg-slate-50 text-slate-600 border-slate-100"
          )}>
            {status ?? "—"}
          </span>
        );
      },
    },
  ];

  const campaignsData = campaigns.map((c) => ({ ...c, uid: String(c.id) }));
  const donationsData = donations.map((d) => ({ ...d, uid: String(d.id) }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Raised"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value={`$${Number((stats as any)?.totalAmount ?? (stats as any)?.amount ?? 0).toLocaleString()}`}
          change="All time"
          icon="payments"
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
          chartPath="M0 25 Q 20 10, 40 20 T 80 5 T 100 15"
          strokeColor="#10b981"
        />
        <StatCard
          label="Total Donations"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value={String((stats as any)?.totalDonations ?? (stats as any)?.count ?? 0)}
          change="Transactions"
          icon="sync_alt"
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
          chartPath="M0 20 Q 25 25, 50 10 T 100 5"
          strokeColor="#3b82f6"
        />
        <StatCard
          label="Active Campaigns"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value={String((stats as any)?.activeCampaigns ?? campaigns.filter((c) => c.isActive).length)}
          change="Running"
          icon="campaign"
          iconBg="bg-purple-50 dark:bg-purple-900/20"
          iconColor="text-purple-600 dark:text-purple-400"
          chartPath="M0 25 L 20 15 L 40 22 L 60 8 L 80 12 L 100 2"
          strokeColor="#a855f7"
        />
        <StatCard
          label="Total Donors"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value={String((stats as any)?.donorCount ?? 0)}
          change="Unique"
          icon="people"
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          iconColor="text-amber-600 dark:text-amber-400"
          chartPath="M0 15 Q 50 5, 100 25"
          strokeColor="#f59e0b"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        {(["campaigns", "donations"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-3 px-1 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors",
              activeTab === tab
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            )}
          >
            {tab === "campaigns" ? "Campaigns" : "Donations"}
          </button>
        ))}
      </div>

      {/* Campaigns tab */}
      {activeTab === "campaigns" && (
        <CRUDLayout
          title="Campaigns"
          columns={campaignColumns}
          // @ts-expect-error - type mismatch with CRUDLayout
          data={campaignsData}
          loading={loadingCampaigns}
          pageable={{ page: 1, size: 50, totalElements: campaigns.length, totalPages: 1 }}
          onPageChange={() => {}}
          onSizeChange={() => {}}
          onRefresh={fetchCampaigns}
          onAdd={() => { setCreateForm({ productId: "", name: "", description: "", targetAmount: "" }); setIsCreateOpen(true); }}
          addButtonText="New Campaign"
          searchable={false}
        />
      )}

      {/* Donations tab */}
      {activeTab === "donations" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Campaign</label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
              >
                <option value="">Select campaign…</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => fetchDonations(1, donationsPageable.size)}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-colors"
            >
              Load
            </button>
          </div>
          <CRUDLayout
            title=""
            columns={donationColumns}
            // @ts-expect-error - type mismatch with CRUDLayout
            data={donationsData}
            loading={loadingDonations}
            pageable={donationsPageable}
            onPageChange={(p) => fetchDonations(p, donationsPageable.size)}
            onSizeChange={(s) => fetchDonations(1, s)}
          />
        </div>
      )}

      {/* Create Campaign Modal */}
      <CRUDModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Donation Campaign"
        onSubmit={handleCreate}
        isSubmitting={isCreating}
        submitLabel="Create Campaign"
      >
        <div className="space-y-5">
          {[
            { key: "name", label: "Campaign Name *", type: "text" },
            { key: "description", label: "Description", type: "text" },
            { key: "targetAmount", label: "Target Amount", type: "number" },
          ].map(({ key, label, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
              <input
                type={type}
                value={String(createForm[key as keyof typeof createForm])}
                onChange={(e) => setCreateForm((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          ))}
        </div>
      </CRUDModal>

      {/* Edit Campaign Modal */}
      <CRUDModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit: ${editingCampaign?.name ?? ""}`}
        onSubmit={handleUpdate}
        isSubmitting={isUpdating}
        submitLabel="Save Changes"
      >
        <div className="space-y-5">
          {[
            { key: "name", label: "Campaign Name *", type: "text" },
            { key: "description", label: "Description", type: "text" },
            { key: "targetAmount", label: "Target Amount", type: "number" },
            { key: "currencyCode", label: "Currency Code", type: "text" },
            { key: "imageUrl", label: "Image URL", type: "text" },
            { key: "startDate", label: "Start Date", type: "datetime-local" },
            { key: "endDate", label: "End Date", type: "datetime-local" },
          ].map(({ key, label, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
              <input
                type={type}
                value={String(editForm[key as keyof typeof editForm])}
                onChange={(e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          ))}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.active}
                onChange={(e) => setEditForm((p) => ({ ...p, active: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.featured}
                onChange={(e) => setEditForm((p) => ({ ...p, featured: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-amber-500"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Featured</span>
            </label>
          </div>
        </div>
      </CRUDModal>
    </div>
  );
};

export default Donations;
