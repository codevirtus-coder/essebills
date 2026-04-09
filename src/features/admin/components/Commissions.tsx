import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout';
import CRUDModal from '../../shared/components/CRUDModal';
import {
  getAgentCommissionRates,
  getAgentCommissionRateById,
  createAgentCommissionRate,
  updateAgentCommissionRate
} from '../../../services/agentCommission.service';
import {
  getAllServiceCharges,
  getServiceChargeById,
  createServiceCharge,
  updateServiceCharge,
  deleteServiceCharge,
  type ServiceCharge,
} from '../../../services/serviceCharge.service';
import { getPaginatedUsers } from '../services/adminUsers.service';
import { getPaginatedCurrencies } from '../services/adminLookups.service';
import { getAllProductCategories } from '../services/adminProducts.service';
import { INITIAL_CATEGORIES } from '../data/constants';
import { 
  Percent, 
  UserCircle, 
  Settings, 
  TrendingUp, 
  Layers, 
  Info, 
  Plus, 
  Edit2, 
  Search,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { cn } from '../../../lib/utils';

type TabId = 'agent-rates' | 'service-charges' | 'revenue-split';

export default function Commissions() {
  const [activeTab, setActiveCategory] = useState<TabId>('agent-rates');
  const [loading, setLoading] = useState(false);
  
  // Agent Rates State
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [commissionRates, setCommissionRates] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRate, setEditingRate] = useState<any>(null);
  const [productCategories, setProductCategories] = useState<Array<Record<string, unknown>>>([]);
  const [currencies, setCurrencies] = useState<Array<Record<string, unknown>>>([]);

  // Revenue Split State (Categories)
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);

  // Service Charge State
  const [serviceCharges, setServiceCharges] = useState<ServiceCharge[]>([]);
  const [isScModalOpen, setIsScModalOpen] = useState(false);
  const [isSavingSc, setIsSavingSc] = useState(false);
  const [editingSc, setEditingSc] = useState<Partial<ServiceCharge> | null>(null);

  const tabs = [
    { id: 'agent-rates', label: 'Agent Commission Rates', icon: UserCircle },
    { id: 'service-charges', label: 'Service Charge Rates', icon: DollarSign },
    { id: 'revenue-split', label: 'Service Revenue Split', icon: Percent },
  ];

  // Load Agents for selection
  useEffect(() => {
    getPaginatedUsers({ size: 100 }).then(res => {
      const filtered = (res?.content ?? []).filter((u: any) => u.group?.name === 'AGENT');
      setAgents(filtered);
      if (filtered.length > 0) setSelectedAgentId(String(filtered[0].id));
    });
  }, []);

  useEffect(() => {
    Promise.all([getAllProductCategories(), getPaginatedCurrencies({ size: 200 })])
      .then(([categoryData, currencyData]) => {
        setProductCategories(Array.isArray(categoryData) ? categoryData : []);
        setCurrencies(Array.isArray(currencyData?.content) ? currencyData.content : []);
      })
      .catch(() => {
        setProductCategories([]);
        setCurrencies([]);
      });
  }, []);

  // Load rates when agent changes
  const loadRates = React.useCallback(async () => {
    if (!selectedAgentId) return;
    try {
      setLoading(true);
      const data = await getAgentCommissionRates(selectedAgentId);
      setCommissionRates(data);
    } catch (error) {
      toast.error("Failed to load commission rates");
    } finally {
      setLoading(false);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    void loadRates();
  }, [loadRates]);

  const loadServiceCharges = React.useCallback(async () => {
    try {
      const data = await getAllServiceCharges();
      setServiceCharges(data);
    } catch {
      toast.error("Failed to load service charge rates");
    }
  }, []);

  useEffect(() => {
    void loadServiceCharges();
  }, [loadServiceCharges]);

  const handleSaveSc = async () => {
    const ratePercent = Number(editingSc?.ratePercent);
    if (!Number.isFinite(ratePercent) || ratePercent < 0) {
      toast.error("Rate percent must be a non-negative number");
      return;
    }
    if (!String(editingSc?.userGroup ?? "").trim()) {
      toast.error("User group is required");
      return;
    }
    try {
      setIsSavingSc(true);
      const payload = {
        userGroup: String(editingSc!.userGroup).trim().toUpperCase(),
        ratePercent,
        description: String(editingSc?.description ?? "").trim() || undefined,
        active: editingSc?.active !== false,
      };
      if (editingSc?.id) {
        await updateServiceCharge(editingSc.id, payload);
      } else {
        await createServiceCharge(payload);
      }
      toast.success("Service charge rate saved");
      setIsScModalOpen(false);
      await loadServiceCharges();
    } catch {
      toast.error("Failed to save service charge rate");
    } finally {
      setIsSavingSc(false);
    }
  };

  const handleDeleteSc = async (id: number) => {
    try {
      await deleteServiceCharge(id);
      toast.success("Deleted");
      await loadServiceCharges();
    } catch {
      toast.error("Failed to delete service charge rate");
    }
  };

  const agentRateColumns: CRUDColumn<any>[] = [
    {
      key: 'product',
      header: 'Product / Service',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Settings size={14} />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{r.productName || r.product?.name || 'All Products'}</span>
        </div>
      )
    },
    {
      key: 'rate',
      header: 'Commission Rate',
      className: 'text-right',
      render: (r) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{r.ratePercent ?? r.rate ?? r.commissionRate}%</span>
    },
    {
      key: 'type',
      header: 'Type',
      render: (r) => (
        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
          {r.type || 'PERCENTAGE'}
        </span>
      )
    }
  ];

  const splitColumns: CRUDColumn<any>[] = [
    {
      key: 'category',
      header: 'Service Category',
      render: (cat) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Layers size={18} />
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{cat.label}</span>
        </div>
      )
    },
    {
      key: 'agentRate',
      header: 'Agent (%)',
      className: 'text-right',
      render: (cat) => <span className="font-bold text-slate-700 dark:text-slate-300">{cat.agentRate}%</span>
    },
    {
      key: 'platformRate',
      header: 'Platform (%)',
      className: 'text-right',
      render: (cat) => <span className="font-bold text-blue-600 dark:text-blue-400">{cat.platformRate}%</span>
    },
    {
      key: 'total',
      header: 'Total Fee',
      className: 'text-right',
      render: (cat) => <span className="font-bold text-slate-900 dark:text-white">{(cat.agentRate + cat.platformRate).toFixed(1)}%</span>
    }
  ];

  const serviceChargeColumns: CRUDColumn<ServiceCharge>[] = [
    {
      key: 'userGroup',
      header: 'User Group',
      render: (r) => (
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
          {r.userGroup}
        </span>
      ),
    },
    {
      key: 'ratePercent',
      header: 'Rate (%)',
      className: 'text-right',
      render: (r) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{r.ratePercent}%</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (r) => <span className="text-sm text-slate-500">{r.description ?? '—'}</span>,
    },
    {
      key: 'active',
      header: 'Active',
      render: (r) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${r.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
          {r.active ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  const handleSaveRate = async () => {
    if (!selectedAgentId) return;
    const ratePercent = Number(editingRate?.ratePercent);
    if (!Number.isFinite(ratePercent)) {
      toast.error("Rate percent is required");
      return;
    }
    if (!String(editingRate?.productCode ?? "").trim()) {
      toast.error("Product code is required");
      return;
    }
    if (!String(editingRate?.currencyCode ?? "").trim()) {
      toast.error("Currency code is required");
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        productCategory: String(editingRate?.productCategory ?? "").trim(),
        productCode: String(editingRate?.productCode ?? "").trim(),
        currencyCode: String(editingRate?.currencyCode ?? "").trim().toUpperCase(),
        ratePercent,
      };
      if (editingRate.id) {
        await updateAgentCommissionRate(selectedAgentId, editingRate.id, payload);
      } else {
        await createAgentCommissionRate(selectedAgentId, payload);
      }
      toast.success("Commission rate saved");
      setIsModalOpen(false);
      await loadRates();
    } catch (error) {
      toast.error("Failed to save rate");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Agents", value: agents.length, icon: UserCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Avg. Agent Rate", value: "3.2%", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Platform Yield", value: "1.8%", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
          { label: "Revenue Node", value: "Optimal", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 border-slate-200 dark:border-slate-800 flex items-center gap-4 text-slate-900 dark:text-white">
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

      {/* Horizontal Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as TabId)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative",
              activeTab === tab.id
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'agent-rates' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
               <div className="flex items-center gap-3 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                     <Search size={18} />
                  </div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Agent:</label>
               </div>
               <select
                 value={selectedAgentId}
                 onChange={(e) => setSelectedAgentId(e.target.value)}
                 className="flex-1 min-w-[200px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
               >
                 {agents.map(a => (
                   <option key={a.id} value={a.id}>{a.firstName} {a.lastName} ({a.username})</option>
                 ))}
               </select>
            </div>

            <CRUDLayout
              title="Individual Agent Exceptions"
              columns={agentRateColumns}
              data={commissionRates}
              loading={loading}
              pageable={{ page: 1, size: 50, totalElements: commissionRates.length, totalPages: 1 }}
              onPageChange={() => {}}
              onSizeChange={() => {}}
              onRefresh={loadRates}
              onAdd={() => {
                setEditingRate({
                  productCategory: '',
                  productCode: '',
                  currencyCode: '',
                  ratePercent: '',
                });
                setIsModalOpen(true);
              }}
              addButtonText="Add Exception"
              actions={{
                onEdit: async (r) => {
                  try {
                    if (!selectedAgentId || !r?.id) throw new Error('missing')
                    const full = await getAgentCommissionRateById(selectedAgentId, r.id)
                    setEditingRate(full)
                  } catch {
                    setEditingRate(r)
                  } finally {
                    setIsModalOpen(true)
                  }
                },
              }}
            />
          </div>
        )}

        {activeTab === 'service-charges' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl flex items-start gap-3">
              <Info className="text-blue-600 shrink-0" size={18} />
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                Service charges are applied to every non-wallet payment. Configure per user group (e.g. CUSTOMER at 1%, AGENT at 0%). A fallback "ALL" group rate can be set as a catch-all.
              </p>
            </div>
            <CRUDLayout
              title="Service Charge Rates"
              columns={serviceChargeColumns}
              data={serviceCharges}
              loading={loading}
              pageable={{ page: 1, size: 50, totalElements: serviceCharges.length, totalPages: 1 }}
              onPageChange={() => {}}
              onSizeChange={() => {}}
              onRefresh={loadServiceCharges}
              onAdd={() => {
                setEditingSc({ userGroup: '', ratePercent: 1, description: '', active: true });
                setIsScModalOpen(true);
              }}
              addButtonText="Add Rate"
              actions={{
                onEdit: async (r) => {
                  try {
                    if (!r?.id) throw new Error('missing')
                    const full = await getServiceChargeById(r.id)
                    setEditingSc(full)
                  } catch {
                    setEditingSc(r)
                  } finally {
                    setIsScModalOpen(true)
                  }
                },
                onDelete: (r) => r.id && handleDeleteSc(r.id),
              }}
            />
          </div>
        )}

        {activeTab === 'revenue-split' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <CRUDLayout
              title="Global Service Policies"
              columns={splitColumns}
              data={categories}
              loading={false}
              pageable={{ page: 1, size: categories.length, totalElements: categories.length, totalPages: 1 }}
              onPageChange={() => {}}
              onSizeChange={() => {}}
              actions={{
                onEdit: () => toast("Revenue Split editing restricted to master policy."),
              }}
            />
          </div>
        )}
      </div>

      {/* Commission Modal */}
      <CRUDModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRate?.id ? "Update Rate" : "New Rate Exception"}
        onSubmit={handleSaveRate}
        isSubmitting={isSaving}
        submitLabel="Commit Policy"
      >
        {editingRate && (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex items-start gap-3">
               <Info className="text-emerald-600 shrink-0" size={18} />
               <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  Custom rates for an individual agent will override global category defaults for the selected product.
               </p>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Product Category</label>
              <select
                value={editingRate.productCategory ?? ''}
                onChange={(e) => setEditingRate({ ...editingRate, productCategory: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select category</option>
                {productCategories.map((category) => {
                  const code = String(category.code ?? category.name ?? category.id ?? '');
                  const label = String(category.displayName ?? category.name ?? code);
                  return <option key={code} value={code}>{label}</option>;
                })}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Product Code</label>
              <input
                type="text"
                value={editingRate.productCode ?? ''}
                onChange={(e) => setEditingRate({ ...editingRate, productCode: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. ZESA_PREPAID"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Currency Code</label>
              <select
                value={editingRate.currencyCode ?? ''}
                onChange={(e) => setEditingRate({ ...editingRate, currencyCode: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select currency</option>
                {currencies.map((currency) => {
                  const code = String(currency.code ?? currency.id ?? '');
                  return <option key={code} value={code}>{code}</option>;
                })}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Rate Percent</label>
              <input
                type="number"
                step="0.1"
                value={editingRate.ratePercent ?? ''}
                onChange={(e) => setEditingRate({ ...editingRate, ratePercent: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. 2.5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Rate Type</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                defaultValue="PERCENTAGE"
                disabled
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
          </div>
        )}
      </CRUDModal>

      {/* Service Charge Modal */}
      <CRUDModal
        isOpen={isScModalOpen}
        onClose={() => setIsScModalOpen(false)}
        title={editingSc?.id ? "Update Service Charge Rate" : "New Service Charge Rate"}
        onSubmit={handleSaveSc}
        isSubmitting={isSavingSc}
        submitLabel="Save Rate"
      >
        {editingSc && (
          <div className="space-y-5">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
              <Info className="text-blue-600 shrink-0" size={18} />
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                Set the group to "ALL" to apply this rate as a fallback for any group that does not have a specific rate configured.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">User Group</label>
              <input
                type="text"
                value={editingSc.userGroup ?? ''}
                onChange={(e) => setEditingSc({ ...editingSc, userGroup: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. CUSTOMER, AGENT, ALL"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Rate Percent</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={editingSc.ratePercent ?? ''}
                onChange={(e) => setEditingSc({ ...editingSc, ratePercent: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. 1.0"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Description (Optional)</label>
              <input
                type="text"
                value={editingSc.description ?? ''}
                onChange={(e) => setEditingSc({ ...editingSc, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. Standard customer service fee"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="sc-active"
                checked={editingSc.active !== false}
                onChange={(e) => setEditingSc({ ...editingSc, active: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <label htmlFor="sc-active" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Active</label>
            </div>
          </div>
        )}
      </CRUDModal>
    </div>
  );
}
