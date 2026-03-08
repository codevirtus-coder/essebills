import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, 
  Send, 
  Calendar, 
  History as HistoryIcon, 
  Plus, 
  Trash2, 
  Edit2, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight,
  Info,
  AlertCircle,
  Search,
  ArrowRight,
  PlusCircle,
  Loader2,
  RefreshCw,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout';
import { 
  getBulkPaymentGroups, 
  createBulkPaymentGroup, 
  updateBulkPaymentGroup, 
  deleteBulkPaymentGroup,
  initiateBulkPayment,
  initiateBulkPaymentFromGroup,
  getBulkPaymentRequests,
  getBulkPaymentRequestById,
  getBulkPaymentSchedules,
  createBulkPaymentSchedule,
  updateBulkPaymentSchedule,
  deleteBulkPaymentSchedule,
  getProducts
} from '../../../services';
import type { 
  BulkPaymentGroup, 
  BulkPaymentGroupItem, 
  BulkPaymentRequest, 
  BulkPaymentSchedule,
  BulkPaymentFrequency,
  Product,
  BulkItemDto
} from '../../../types';
import toast from 'react-hot-toast';
import CRUDModal from '../../shared/components/CRUDModal';

type SubTab = 'groups' | 'initiate' | 'schedules' | 'history';

export default function BulkPaymentsPage() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('groups');
  const [loading, setLoading] = useState(false);

  // Groups State
  const [groups, setGroups] = useState<BulkPaymentGroup[]>([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<BulkPaymentGroup | null>(null);
  const [groupItems, setGroupItems] = useState<BulkPaymentGroupItem[]>([]);

  // Initiate State
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<BulkPaymentGroup | null>(null);
  const [bulkName, setBulkName] = useState('');

  // Schedules State
  const [schedules, setSchedules] = useState<BulkPaymentSchedule[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // History State
  const [requests, setRequests] = useState<BulkPaymentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BulkPaymentRequest | null>(null);
  const [isRequestDetailModalOpen, setIsRequestDetailModalOpen] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Products for selections
  const [products, setProducts] = useState<Product[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'groups') {
        const data = await getBulkPaymentGroups();
        setGroups(data);
      } else if (activeSubTab === 'initiate') {
        const data = await getBulkPaymentGroups();
        setGroups(data);
        const prodData = await getProducts({ size: 100 });
        setProducts(prodData.content);
      } else if (activeSubTab === 'schedules') {
        const data = await getBulkPaymentSchedules();
        setSchedules(data);
        const groupData = await getBulkPaymentGroups();
        setGroups(groupData);
      } else if (activeSubTab === 'history') {
        const data = await getBulkPaymentRequests();
        setRequests(data);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [activeSubTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling for history status
  useEffect(() => {
    if (activeSubTab === 'history') {
      pollingRef.current = setInterval(async () => {
        const data = await getBulkPaymentRequests();
        setRequests(data);
      }, 5000);
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [activeSubTab]);

  // --------------------------------------------------------------------------
  // Groups Logic
  // --------------------------------------------------------------------------
  const handleOpenGroupModal = (group: BulkPaymentGroup | null = null) => {
    setEditingGroup(group);
    setGroupItems(group?.items ? [...group.items] : []);
    setIsGroupModalOpen(true);
  };

  const handleAddGroupItem = () => {
    setGroupItems([...groupItems, { productCode: '', recipientIdentifier: '', amount: 0, currencyCode: 'USD' }]);
  };

  const handleRemoveGroupItem = (index: number) => {
    setGroupItems(groupItems.filter((_, i) => i !== index));
  };

  const handleUpdateGroupItem = (index: number, field: keyof BulkPaymentGroupItem, value: any) => {
    const updated = [...groupItems];
    updated[index] = { ...updated[index], [field]: value };
    setGroupItems(updated);
  };

  const handleSaveGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (groupItems.length === 0) {
      toast.error("Please add at least one recipient");
      return;
    }

    try {
      setLoading(true);
      if (editingGroup) {
        await updateBulkPaymentGroup(editingGroup.id, { name, description, items: groupItems });
        toast.success('Group updated successfully');
      } else {
        await createBulkPaymentGroup({ name, description, items: groupItems });
        toast.success('Group created successfully');
      }
      setIsGroupModalOpen(false);
      setEditingGroup(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save group');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (group: BulkPaymentGroup) => {
    if (!window.confirm(`Are you sure you want to delete group "${group.name}"?`)) return;
    try {
      await deleteBulkPaymentGroup(group.id);
      toast.success('Group deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete group');
    }
  };

  // --------------------------------------------------------------------------
  // Bulk Execution Logic
  // --------------------------------------------------------------------------
  const handleInitiateFromGroup = async () => {
    if (!selectedGroup || !bulkName) {
      toast.error('Please select a group and provide a name');
      return;
    }
    setLoading(true);
    try {
      await initiateBulkPaymentFromGroup(selectedGroup.id, bulkName);
      toast.success('Bulk payment initiated successfully');
      setIsInitiateModalOpen(false);
      setActiveSubTab('history');
    } catch (error) {
      toast.error('Failed to initiate bulk payment');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Columns Definitions
  // --------------------------------------------------------------------------
  const groupColumns: CRUDColumn<BulkPaymentGroup>[] = [
    { key: 'name', header: 'Group Name', render: (g) => <span className="font-bold text-slate-900 dark:text-white">{g.name}</span> },
    { key: 'description', header: 'Description' },
    { key: 'items', header: 'Recipients', render: (g) => <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono font-bold text-slate-600 dark:text-slate-400">{g.items?.length || 0}</span> },
    { key: 'total', header: 'Est. Volume', render: (g) => <span className="text-xs font-bold text-emerald-600">${g.items?.reduce((a, b) => a + (b.amount || 0), 0).toFixed(2)}</span> },
    { key: 'createdDate', header: 'Created', render: (g) => <span className="text-xs text-slate-500">{new Date(g.createdDate).toLocaleDateString()}</span> },
  ];

  const scheduleColumns: CRUDColumn<BulkPaymentSchedule>[] = [
    { key: 'name', header: 'Schedule Name', render: (s) => <span className="font-bold text-slate-900 dark:text-white">{s.name}</span> },
    { key: 'group', header: 'Group', render: (s) => <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{s.group.name}</span> },
    { key: 'frequency', header: 'Frequency', render: (s) => <span className="px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider">{s.frequency}</span> },
    { key: 'nextRunDate', header: 'Next Run', render: (s) => <span className="text-xs font-semibold text-slate-600">{new Date(s.nextRunDate).toLocaleString()}</span> },
    { key: 'active', header: 'Status', render: (s) => (
      <button 
        onClick={() => {
          updateBulkPaymentSchedule(s.id, { active: !s.active }).then(() => { toast.success(s.active ? 'Paused' : 'Resumed'); fetchData(); });
        }}
        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${s.active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
      >
        {s.active ? 'Active' : 'Paused'}
      </button>
    )},
  ];

  const requestColumns: CRUDColumn<BulkPaymentRequest>[] = [
    { key: 'name', header: 'Bulk Name', render: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.name}</span> },
    { key: 'status', header: 'Status', render: (r) => (
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
        r.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 
        r.status === 'FAILED' ? 'bg-red-50 text-red-600' : 
        'bg-amber-50 text-amber-600'
      }`}>
        {r.status}
      </span>
    )},
    { key: 'totalItems', header: 'Progress', render: (r) => (
      <div className="w-full max-w-[120px] space-y-1">
        <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
          <span>{r.successfulItems + r.failedItems}/{r.totalItems} done</span>
          <span>{Math.round(((r.successfulItems + r.failedItems) / r.totalItems) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${r.status === 'FAILED' ? 'bg-red-500' : 'bg-emerald-500'}`} 
            style={{ width: `${((r.successfulItems + r.failedItems) / r.totalItems) * 100}%` }}
          />
        </div>
      </div>
    )},
    { key: 'totalAmount', header: 'Total Value', render: (r) => <span className="font-bold text-slate-700 dark:text-slate-300">${r.totalAmount?.toFixed(2) || '0.00'}</span> },
    { key: 'createdDate', header: 'Date', render: (r) => <span className="text-xs text-slate-500">{new Date(r.createdDate).toLocaleString()}</span> },
  ];

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Bulk & Recurring Payments</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage multiple recipients, recurring utility bills, and scheduled payments at scale.</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-700/50">
          <button 
            onClick={() => setActiveSubTab('groups')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'groups' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Users size={16} /> Groups
          </button>
          <button 
            onClick={() => setActiveSubTab('initiate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'initiate' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Send size={16} /> Initiate
          </button>
          <button 
            onClick={() => setActiveSubTab('schedules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'schedules' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Calendar size={16} /> Schedules
          </button>
          <button 
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'history' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <HistoryIcon size={16} /> History
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      {activeSubTab === 'groups' && (
        <CRUDLayout
          title="Recipient Groups"
          columns={groupColumns}
          data={groups}
          loading={loading}
          pageable={{ page: 1, size: 20, totalElements: groups.length, totalPages: 1 }}
          onPageChange={() => {}}
          onSizeChange={() => {}}
          onRefresh={fetchData}
          onAdd={() => handleOpenGroupModal(null)}
          addButtonText="Create New Group"
          actions={{
            onEdit: (g) => handleOpenGroupModal(g),
            onDelete: handleDeleteGroup,
            onView: (g) => handleOpenGroupModal(g)
          }}
        />
      )}

      {activeSubTab === 'initiate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 border-slate-200 dark:border-slate-800 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Send size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Bulk Request</h3>
                  <p className="text-sm text-slate-500">Choose a saved group to trigger a batch payment.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Request Reference Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. March 2026 Staff Airtime" 
                    value={bulkName}
                    onChange={(e) => setBulkName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Select Saved Group</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {groups.map(group => (
                      <button
                        key={group.id}
                        onClick={() => setSelectedGroup(group)}
                        className={`p-4 rounded-xl border transition-all text-left flex items-center justify-between group ${
                          selectedGroup?.id === group.id 
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{group.name}</p>
                          <p className="text-[10px] text-slate-500">{group.items.length} Recipients</p>
                        </div>
                        {selectedGroup?.id === group.id && <CheckCircle size={18} className="text-emerald-500" />}
                      </button>
                    ))}
                    <button 
                      onClick={() => { setActiveSubTab('groups'); setIsGroupModalOpen(true); }}
                      className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-emerald-600"
                    >
                      <Plus size={16} />
                      <span className="text-sm font-bold">New Group</span>
                    </button>
                  </div>
                </div>
              </div>

              {selectedGroup && (
                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Batch Summary</h4>
                    <span className="text-xs font-bold text-emerald-600">{selectedGroup.items.length} Items</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Total Volume</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${selectedGroup.items.reduce((acc, item) => acc + item.amount, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={handleInitiateFromGroup}
                    disabled={loading || !bulkName}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : (
                      <>
                        <Play size={16} fill="currentColor" />
                        Execute Bulk Payment
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle size={18} />
                <h4 className="font-bold text-sm">Wallet Dependency</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bulk payments strictly use your Internal Wallet. Ensure your balance is topped up before the execution starts. Partial failures (e.g. invalid accounts) will be reported in History.
              </p>
            </div>

            <div className="glass-card p-6 border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Recent Activity</h4>
              <div className="space-y-3">
                {requests.slice(0, 3).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.name}</p>
                      <p className="text-[10px] text-slate-500">{r.status}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedRequest(r);
                        setIsRequestDetailModalOpen(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'schedules' && (
        <CRUDLayout
          title="Payment Schedules"
          columns={scheduleColumns}
          data={schedules}
          loading={loading}
          pageable={{ page: 1, size: 20, totalElements: schedules.length, totalPages: 1 }}
          onPageChange={() => {}}
          onSizeChange={() => {}}
          onRefresh={fetchData}
          onAdd={() => setIsScheduleModalOpen(true)}
          addButtonText="Setup New Schedule"
          actions={{
            onDelete: (s) => {
              if (window.confirm('Delete this schedule?')) {
                deleteBulkPaymentSchedule(s.id).then(() => { toast.success('Deleted'); fetchData(); });
              }
            },
            onEdit: (s) => {
              updateBulkPaymentSchedule(s.id, { active: !s.active }).then(() => { toast.success(s.active ? 'Paused' : 'Resumed'); fetchData(); });
            }
          }}
        />
      )}

      {activeTab === 'history' || activeSubTab === 'history' && (
        <CRUDLayout
          title="Bulk Request History"
          columns={requestColumns}
          data={requests}
          loading={loading}
          pageable={{ page: 1, size: 20, totalElements: requests.length, totalPages: 1 }}
          onPageChange={() => {}}
          onSizeChange={() => {}}
          onRefresh={fetchData}
          actions={{
            onView: async (r) => {
              const full = await getBulkPaymentRequestById(r.id);
              setSelectedRequest(full);
              setIsRequestDetailModalOpen(true);
            }
          }}
        />
      )}

      {/* Group Editor Modal */}
      <CRUDModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title={editingGroup ? "Edit Recipient Group" : "Create Recipient Group"}
      >
        <form onSubmit={handleSaveGroup} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Group Name</label>
              <input 
                name="name"
                defaultValue={editingGroup?.name}
                required
                placeholder="e.g. Office Staff"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Description</label>
              <input 
                name="description"
                defaultValue={editingGroup?.description}
                placeholder="Optional description"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Recipients ({groupItems.length})</h4>
              <button 
                type="button" 
                onClick={handleAddGroupItem}
                className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50 transition-all"
              >
                <Plus size={14} /> Add Recipient
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {groupItems.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-end group">
                  <div className="flex-1 min-w-[120px] space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product Code</label>
                    <input 
                      value={item.productCode}
                      onChange={(e) => handleUpdateGroupItem(idx, 'productCode', e.target.value)}
                      placeholder="ECONET_AIRTIME"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div className="flex-1 min-w-[120px] space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account / Phone</label>
                    <input 
                      value={item.recipientIdentifier}
                      onChange={(e) => handleUpdateGroupItem(idx, 'recipientIdentifier', e.target.value)}
                      placeholder="0771000000"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                    <input 
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleUpdateGroupItem(idx, 'amount', parseFloat(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-black text-emerald-600"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveGroupItem(idx)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {groupItems.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                  <p className="text-sm text-slate-400 italic">No recipients added yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsGroupModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-10 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              Save Group
            </button>
          </div>
        </form>
      </CRUDModal>

      <CRUDModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Setup Recurring Payment"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            setLoading(true);
            await createBulkPaymentSchedule({
              name: f.get('name') as string,
              groupId: Number(f.get('groupId')),
              frequency: f.get('frequency') as BulkPaymentFrequency,
              startDate: f.get('startDate') as string
            });
            toast.success('Schedule created');
            setIsScheduleModalOpen(false);
            fetchData();
          } catch (e) { toast.error('Failed to create schedule'); }
          finally { setLoading(false); }
        }} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Schedule Name</label>
              <input name="name" required placeholder="e.g. Monthly Airtime" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Recipient Group</label>
              <select name="groupId" required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium">
                <option value="">Select Group...</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.items.length} recipients)</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Frequency</label>
                <select name="frequency" required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium">
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BI_WEEKLY">Bi-Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Start Date</label>
                <input type="datetime-local" name="startDate" required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-medium" />
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500">Cancel</button>
            <button type="submit" disabled={loading} className="px-10 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 flex items-center gap-2">
              {loading && <Loader2 className="animate-spin" size={16} />}
              Create Schedule
            </button>
          </div>
        </form>
      </CRUDModal>

      <CRUDModal
        isOpen={isRequestDetailModalOpen}
        onClose={() => setIsRequestDetailModalOpen(false)}
        title={`Bulk Request: ${selectedRequest?.name}`}
      >
        <div className="space-y-6">
           <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-800/50">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Successful</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{selectedRequest?.successfulItems}</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-[1.5rem] border border-red-100 dark:border-red-800/50">
                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Failed</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{selectedRequest?.failedItems}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] border border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Items</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{selectedRequest?.totalItems}</p>
              </div>
           </div>

           <div className="max-h-[400px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-3xl shadow-inner scrollbar-thin">
             <table className="w-full text-left">
               <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 border-b border-slate-100 dark:border-slate-800">
                 <tr>
                   <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Recipient</th>
                   <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Value</th>
                   <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                 {selectedRequest?.items?.map(item => (
                   <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
                     <td className="px-6 py-4">
                       <p className="text-sm font-bold text-slate-900 dark:text-white">{item.recipientIdentifier}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.productCode}</p>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white">${item.amount.toFixed(2)}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{item.currencyCode}</p>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            item.status === 'SUCCESS' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                            item.status === 'FAILED' ? 'text-red-600 bg-red-50 border-red-100' : 
                            'text-amber-600 bg-amber-50 border-amber-100'
                          }`}>
                            {item.status}
                          </span>
                          {item.errorMessage && <p className="text-[9px] text-red-400 font-medium max-w-[120px] text-center">{item.errorMessage}</p>}
                        </div>
                     </td>
                   </tr>
                 ))}
                 {!selectedRequest?.items && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-400 italic">No details available</td>
                    </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </CRUDModal>
    </div>
  );
}
