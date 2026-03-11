import React, { useEffect, useState, useCallback } from "react";
import {
  getDonationCampaignsV1,
  getDonationsByCampaignV1,
  getDonationSummaryV1,
  type DonationCampaignV1,
  type DonationV1,
} from "../../../services/donationsV1.service";
import StatCard from "../../../components/ui/StatCard";
import CRUDLayout from "../../shared/components/CRUDLayout";
import { cn } from "../../../lib/utils";
import { Trash2 } from "lucide-react";

const Donations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"donations" | "campaigns" | "categories">("donations");

  // Donations state
  const [donations, setDonations] = useState<DonationV1[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [donationsPageable, setDonationsPageable] = useState({ page: 1, size: 10, totalElements: 0, totalPages: 0 });
  const [campaignsV1, setCampaignsV1] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");

  // Campaigns state
  const [campaigns, setCampaigns] = useState<DonationCampaignV1[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const campaignsPageable = { page: 1, size: 10, totalElements: 0, totalPages: 0 };

  // Stats state
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  const loadStats = useCallback(() => {
    getDonationSummaryV1()
      .then(setStats)
      .catch(() => {});
  }, []);

  const fetchDonations = useCallback((page = 1, size = 10) => {
    setLoadingDonations(true);
    const load = async () => {
      // Swagger: donations are fetched by campaign
      if (!selectedCampaignId) {
        const camps = await getDonationCampaignsV1();
        const options = Array.isArray(camps) ? camps.map((c) => ({ id: Number(c.id), name: String(c.name ?? "") })) : [];
        setCampaignsV1(options);
        if (options[0]?.id) {
          setSelectedCampaignId(String(options[0].id));
          const data = await getDonationsByCampaignV1(options[0].id, page - 1, size);
          setDonations(data.content ?? []);
          setDonationsPageable({
            page: (data.number ?? 0) + 1,
            size: data.size ?? size,
            totalElements: data.totalElements ?? 0,
            totalPages: data.totalPages ?? 0,
          });
          return;
        }
        setDonations([]);
        setDonationsPageable({ page: 1, size, totalElements: 0, totalPages: 0 });
        return;
      }
      const data = await getDonationsByCampaignV1(Number(selectedCampaignId), page - 1, size);
      setDonations(data.content ?? []);
      setDonationsPageable({
        page: (data.number ?? 0) + 1,
        size: data.size ?? size,
        totalElements: data.totalElements ?? 0,
        totalPages: data.totalPages ?? 0,
      });
    };

    Promise.resolve(load())
      .catch(() => setDonations([]))
      .finally(() => setLoadingDonations(false));
  }, [selectedCampaignId]);

  const fetchCampaigns = useCallback((page = 1, size = 10) => {
    setLoadingCampaigns(true);
    getDonationCampaignsV1()
      .then((data) => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoadingCampaigns(false));
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadStats(); }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === "donations") {
      fetchDonations();
    } else if (activeTab === "campaigns") {
      fetchCampaigns();
    } else if (activeTab === "categories") {
      // No categories endpoint in provided Swagger.
    }
  }, [activeTab]);

  // Donations columns - use any type for simplicity
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
      key: "campaign",
      header: "Campaign",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (d: any) => (
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {d.campaign?.name ?? "â€”"}
        </span>
      ),
    },
    {
      key: "donor",
      header: "Donor",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (d: any) => (
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {d.donorName || "Anonymous"}
          </p>
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
        const isSuccess = status === "SUCCESS";
        const isPending = status === "PENDING" || status === "PROCESSING";
        const isFailed = status === "FAILED";
        
        return (
          <span className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            isSuccess 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400" 
              : isPending
              ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
              : isFailed
              ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400"
              : "bg-slate-50 text-slate-600 border-slate-100"
          )}>
            {status}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (d: any) => (
        <div className="flex gap-2">
          <button
            disabled
            className="p-1.5 text-slate-300 cursor-not-allowed"
            title="Refund (not in Swagger)"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // Campaigns columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const campaignColumns: any[] = [
    {
      key: "name",
      header: "Campaign",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => (
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.name}</p>
          <p className="text-xs text-slate-500 truncate max-w-[200px]">{c.description}</p>
        </div>
      ),
    },
    {
      key: "product",
      header: "Product",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {c.product?.name ?? "â€”"}
        </span>
      ),
    },
    {
      key: "targetAmount",
      header: "Target",
      className: "text-right",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => <span className="text-sm font-bold text-slate-900 dark:text-slate-100">${(Number(c.targetAmount) || 0).toFixed(2)}</span>,
    },
    {
      key: "status",
      header: "Status",
      className: "text-center",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => (
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            c.active === false
              ? "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
              : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
          )}
        >
          {c.active === false ? "Inactive" : "Active"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => (
        <div className="flex gap-2">
          <button disabled className="p-1.5 text-slate-300 cursor-not-allowed" title="Delete (not in Swagger)">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // Transform data - add uid field
  const donationsData = donations.map(d => ({ ...d, uid: String(d.id) }));
  const campaignsData = campaigns.map(c => ({ ...c, uid: String(c.id) }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Raised"
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
          value={String((stats as any)?.activeCampaigns ?? 0)}
          change="Running"
          icon="campaign"
          iconBg="bg-purple-50 dark:bg-purple-900/20"
          iconColor="text-purple-600 dark:text-purple-400"
          chartPath="M0 25 L 20 15 L 40 22 L 60 8 L 80 12 L 100 2"
          strokeColor="#a855f7"
        />
        <StatCard
          label="Total Donors"
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
        <button
          onClick={() => setActiveTab("donations")}
          className={cn(
            "pb-3 px-1 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors",
            activeTab === "donations"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          )}
        >
          Donations
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={cn(
            "pb-3 px-1 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors",
            activeTab === "campaigns"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          )}
        >
          Campaigns
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={cn(
            "pb-3 px-1 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors",
            activeTab === "categories"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
          )}
        >
          Categories
        </button>
      </div>

      {/* Content */}
      {activeTab === "donations" && (
        <CRUDLayout
          title="All Donations"
          columns={donationColumns}
          // @ts-expect-error - type mismatch with CRUDLayout
          data={donationsData}
          loading={loadingDonations}
          pageable={donationsPageable}
          onPageChange={(p) => fetchDonations(p, donationsPageable.size)}
          onSizeChange={(s) => fetchDonations(1, s)}
          searchable={true}
          filterComponent={
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Campaign</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => {
                    setSelectedCampaignId(e.target.value);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
                >
                  <option value="">Select campaign...</option>
                  {campaignsV1.map((c) => (
                    <option key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => fetchDonations(donationsPageable.page, donationsPageable.size)}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          }
        />
      )}

      {activeTab === "campaigns" && (
        <CRUDLayout
          title="Campaigns"
          columns={campaignColumns}
          // @ts-expect-error - type mismatch with CRUDLayout
          data={campaignsData}
          loading={loadingCampaigns}
          pageable={campaignsPageable}
          onPageChange={() => {}}
          onSizeChange={() => {}}
          searchable={true}
        />
      )}

      {activeTab === "categories" && (
        <div className="glass-card p-6 border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Donation Categories</h3>
          <p className="text-sm text-slate-500">
            Not available: the provided Swagger does not expose donation category endpoints.
          </p>
        </div>
      )}
    </div>
  );
};

export default Donations;
