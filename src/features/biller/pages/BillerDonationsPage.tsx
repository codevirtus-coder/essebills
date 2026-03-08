import React, { useEffect, useState, useCallback } from "react";
import {
  getAllCampaigns,
  getAllDonationCategories,
  getDonationStats as getStats,
  createCampaign,
  updateCampaign,
  type DonationCampaign,
  type DonationCategory,
  type DonationStats,
} from "../../../services/donations.service";
import StatCard from "../../../components/ui/StatCard";
import CRUDLayout from "../../shared/components/CRUDLayout";
import { cn } from "../../../lib/utils";
import { Plus, Edit, Trash2, Heart, Users, Target, TrendingUp } from "lucide-react";

interface CampaignFormData {
  name: string;
  description: string;
  categoryId: string | number;
  targetAmount: number;
  currencyCode: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  isFeatured: boolean;
}

const BillerDonationsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [categories, setCategories] = useState<DonationCategory[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<DonationCampaign | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    categoryId: "",
    targetAmount: 0,
    currencyCode: "USD",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    imageUrl: "",
    isFeatured: false,
  });

  const pageable = { page: 1, size: 10, totalElements: 0, totalPages: 0 };

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      getAllCampaigns({}),
      getAllDonationCategories(),
      getStats(),
    ])
      .then(([campaignsData, categoriesData, statsData]) => {
        setCampaigns(campaignsData.content ?? []);
        setCategories(categoriesData);
        setStats(statsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, formData);
      } else {
        await createCampaign({
          ...formData,
          isActive: true,
        });
      }
      setShowModal(false);
      setEditingCampaign(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Failed to save campaign", error);
    }
  };

  const handleEdit = (campaign: DonationCampaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      categoryId: campaign.categoryId,
      targetAmount: campaign.targetAmount,
      currencyCode: campaign.currencyCode,
      startDate: campaign.startDate.split("T")[0],
      endDate: campaign.endDate ? campaign.endDate.split("T")[0] : "",
      imageUrl: campaign.imageUrl || "",
      isFeatured: campaign.isFeatured,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        const { deleteCampaign } = await import("../../../services/donations.service");
        await deleteCampaign(id);
        fetchData();
      } catch (error) {
        console.error("Failed to delete campaign", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      targetAmount: 0,
      currencyCode: "USD",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      imageUrl: "",
      isFeatured: false,
    });
  };

  // Columns for CRUDLayout
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: any[] = [
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
        <span className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          c.isActive 
            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400" 
            : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
        )}>
          {c.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (c: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(c)}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(c.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

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

      {/* Campaigns Table */}
      <CRUDLayout
        title="My Campaigns"
        columns={columns}
        // @ts-expect-error - type mismatch with CRUDLayout
        data={campaignsData}
        loading={loading}
        pageable={pageable}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onAdd={() => {
          setEditingCampaign(null);
          resetForm();
          setShowModal(true);
        }}
        addButtonText="Create Campaign"
        searchable={true}
        onRefresh={fetchData}
      />

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingCampaign ? "Edit Campaign" : "Create Campaign"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter campaign name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Describe your campaign"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={String(formData.categoryId)}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={String(cat.id)} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Amount *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currencyCode}
                    onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="ZWL">ZWL</option>
                    <option value="ZAR">ZAR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isFeatured" className="text-sm text-slate-700 dark:text-slate-300">
                  Feature this campaign
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCampaign(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
                >
                  {editingCampaign ? "Update Campaign" : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillerDonationsPage;
