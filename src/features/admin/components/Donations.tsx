import React, { useEffect, useState, useCallback } from "react";
import {
  getAllDonations,
  getAllCampaigns,
  getAllDonationCategories,
  getDonationStats,
  refundDonation,
  updateCampaignStatus,
  deleteCampaign,
  type Donation,
  type DonationCampaign,
  type DonationCategory,
  type DonationStats,
} from "../../../services/donations.service";
import StatCard from "../../../components/ui/StatCard";
import CRUDLayout from "../../shared/components/CRUDLayout";
import { cn } from "../../../lib/utils";
import { Trash2 } from "lucide-react";

const Donations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"donations" | "campaigns" | "categories">("donations");

  // Donations state
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const donationsPageable = { page: 1, size: 10, totalElements: 0, totalPages: 0 };

  // Campaigns state
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const campaignsPageable = { page: 1, size: 10, totalElements: 0, totalPages: 0 };

  // Categories state
  const [categories, setCategories] = useState<DonationCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Stats state
  const [stats, setStats] = useState<DonationStats | null>(null);

  const loadStats = useCallback(() => {
    getDonationStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const fetchDonations = useCallback((page = 1, size = 10) => {
    setLoadingDonations(true);
    getAllDonations({ page: page - 1, size })
      .then((data) => {
        setDonations(data.content ?? []);
      })
      .catch(() => setDonations([]))
      .finally(() => setLoadingDonations(false));
  }, []);

  const fetchCampaigns = useCallback((page = 1, size = 10) => {
    setLoadingCampaigns(true);
    getAllCampaigns({ page: page - 1, size })
      .then((data) => {
        setCampaigns(data.content ?? []);
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoadingCampaigns(false));
  }, []);

  const fetchCategories = useCallback(() => {
    setLoadingCategories(true);
    getAllDonationCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  const handleRefund = async (id: string | number) => {
    if (window.confirm("Are you sure you want to refund this donation?")) {
      try {
        await refundDonation(id, "Refunded by admin");
        fetchDonations();
        loadStats();
      } catch (error) {
        console.error("Failed to refund donation", error);
      }
    }
  };

  const handleToggleCampaign = async (campaign: DonationCampaign) => {
    try {
      await updateCampaignStatus(campaign.id, !campaign.isActive);
      fetchCampaigns();
    } catch (error) {
      console.error("Failed to update campaign", error);
    }
  };

  const handleDeleteCampaign = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        await deleteCampaign(id);
        fetchCampaigns();
        loadStats();
      } catch (error) {
        console.error("Failed to delete campaign", error);
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadStats(); }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === "donations") {
      fetchDonations();
    } else if (activeTab === "campaigns") {
      fetchCampaigns();
    } else if (activeTab === "categories") {
      fetchCategories();
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
          {d.campaignName}
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
            {d.isAnonymous ? "Anonymous" : d.donorName}
          </p>
          {d.donorEmail && (
            <p className="text-xs text-slate-500">{d.donorEmail}</p>
          )}
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
          {d.paymentStatus === "SUCCESS" && (
            <button
              onClick={() => handleRefund(d.id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Refund"
            >
              <Trash2 size={16} />
            </button>
          )}
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
      key: "category",
      header: "Category",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {c.categoryName}
        </span>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => {
        const percentage = c.targetAmount > 0 ? (c.raisedAmount / c.targetAmount) * 100 : 0;
        return (
          <div className="w-full max-w-[150px]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">{percentage.toFixed(0)}%</span>
              <span className="text-slate-400">${c.raisedAmount.toLocaleString()} / ${c.targetAmount.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "donors",
      header: "Donors",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => (
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {c.donorCount}
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
          onClick={() => handleToggleCampaign(c)}
          className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            c.isActive 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400" 
              : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
          )}
        >
          {c.isActive ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleDeleteCampaign(c.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
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
          value={`$${(stats?.totalRaised || 0).toLocaleString()}`}
          change="All time"
          icon="payments"
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
          chartPath="M0 25 Q 20 10, 40 20 T 80 5 T 100 15"
          strokeColor="#10b981"
        />
        <StatCard
          label="Total Donations"
          value={String(stats?.totalDonations || 0)}
          change="Transactions"
          icon="sync_alt"
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
          chartPath="M0 20 Q 25 25, 50 10 T 100 5"
          strokeColor="#3b82f6"
        />
        <StatCard
          label="Active Campaigns"
          value={String(stats?.activeCampaigns || 0)}
          change="Running"
          icon="campaign"
          iconBg="bg-purple-50 dark:bg-purple-900/20"
          iconColor="text-purple-600 dark:text-purple-400"
          chartPath="M0 25 L 20 15 L 40 22 L 60 8 L 80 12 L 100 2"
          strokeColor="#a855f7"
        />
        <StatCard
          label="Total Donors"
          value={String(stats?.donorCount || 0)}
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
          onPageChange={() => {}}
          onSizeChange={() => {}}
          searchable={true}
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Donation Categories</h3>
          {loadingCategories ? (
            <p className="text-slate-500">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={String(cat.id)}
                  className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <h4 className="font-bold text-slate-900 dark:text-white">{cat.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">{cat.description}</p>
                  <span className={cn(
                    "mt-2 inline-block px-2 py-0.5 rounded text-xs font-bold uppercase",
                    cat.isActive 
                      ? "bg-emerald-50 text-emerald-600" 
                      : "bg-slate-100 text-slate-500"
                  )}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Donations;
