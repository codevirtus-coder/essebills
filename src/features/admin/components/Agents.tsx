import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { getPaginatedUsers, getUserById, changeUserActivationStatus, updateUser } from "../services/adminUsers.service";
import type { AdminUserDto } from "../dto/admin-api.dto";
import CRUDLayout, { type CRUDColumn } from "../../shared/components/CRUDLayout";
import { UserCircle, Store, MapPin, Wallet, TrendingUp, ShieldCheck, Search, PlusCircle, Download, X, Check, Ban, Eye, Edit2 } from "lucide-react";
import { cn } from "../../../lib/utils";

// Using type assertion to handle CRUDLayout generic type mismatch
type AgentRow = {
  id: number;
  uid?: string;
  name: string;
  initials: string;
  shopName: string;
  location: string;
  floatBalance: number;
  totalEarnings: number;
  status: "Active" | "Suspended" | "Pending";
  email: string;
  phoneNumber: string;
  enabled: boolean;
  active: boolean;
};

function normalizeAgent(user: AdminUserDto): AgentRow {
  const id = Number(user.id) || 0;
  const firstName = String(user.firstName ?? "");
  const lastName = String(user.lastName ?? "");
  const name = [firstName, lastName].filter(Boolean).join(" ") || String(user.username ?? user.email ?? "—");
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";
  
  // Determine status based on active and enabled fields
  let status: AgentRow["status"] = "Active";
  if (user.active === false) {
    status = "Suspended";
  } else if (user.enabled === false) {
    status = "Pending";
  }
  
  return {
    id,
    name,
    initials,
    shopName: String(user.shopName ?? user.username ?? "—"),
    location: String(user.shopLocation ?? "Harare, ZW"),
    floatBalance: 0,
    totalEarnings: 0,
    status,
    email: String(user.email ?? ""),
    phoneNumber: String(user.phoneNumber ?? ""),
    enabled: user.enabled ?? true,
    active: user.active ?? true,
  };
}

const Agents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentRow | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AdminUserDto>>({});
  const [actionLoading, setActionLoading] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAgents = () => {
    setLoading(true);
    getPaginatedUsers({ 
      page, 
      size,
      search: searchTerm || undefined 
    })
      .then((response) => {
        const users = response?.content ?? [];
        const agentUsers = users.filter(
          (u) => (u.group as { name?: string } | null | undefined)?.name === "AGENT"
        );
        setAgents(agentUsers.map(normalizeAgent));
        setTotalElements(response?.totalElements ?? 0);
        setTotalPages(response?.totalPages ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage - 1); // API uses 0-based, UI uses 1-based
  };
  
  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0); // Reset to first page when size changes
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(0); // Reset to first page when searching
  };

  useEffect(() => {
    fetchAgents();
  }, [page, size, searchTerm]);

  // Handler functions for agent actions
  const handleApproveAgent = async (agent: AgentRow) => {
    if (!agent.id) return;
    setActionLoading(true);
    try {
      // Use the existing changeUserActivationStatus which passes status as query param
      await changeUserActivationStatus(true, agent.id);
      toast.success(`Agent ${agent.name} has been approved successfully`);
      fetchAgents();
      setIsViewModalOpen(false);
    } catch (error) {
      console.error("Failed to approve agent:", error);
      toast.error("Failed to approve agent. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendAgent = async (agent: AgentRow) => {
    if (!agent.id) return;
    setActionLoading(true);
    try {
      await changeUserActivationStatus(false, agent.id);
      toast.success(`Agent ${agent.name} has been suspended`);
      fetchAgents();
      setIsViewModalOpen(false);
    } catch (error) {
      console.error("Failed to suspend agent:", error);
      toast.error("Failed to suspend agent. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateAgent = async (agent: AgentRow) => {
    if (!agent.id) return;
    setActionLoading(true);
    try {
      await changeUserActivationStatus(true, agent.id);
      toast.success(`Agent ${agent.name} has been reactivated`);
      fetchAgents();
      setIsViewModalOpen(false);
    } catch (error) {
      console.error("Failed to reactivate agent:", error);
      toast.error("Failed to reactivate agent. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAgent = async () => {
    if (!selectedAgent?.id) return;
    setActionLoading(true);
    try {
      // Use updateUser (PUT) with the full form data
      await updateUser({ id: selectedAgent.id, ...editForm } as AdminUserDto);
      toast.success("Agent details updated successfully");
      fetchAgents();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update agent:", error);
      toast.error("Failed to update agent. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAgents = useMemo(
    () => agents.filter(agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(agent.id).includes(searchTerm)
    ),
    [agents, searchTerm]
  );

  const columns: CRUDColumn<AgentRow>[] = [
    {
      key: "partner",
      header: "Agent Partner",
      render: (agent) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold text-xs">
            {agent.initials}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{agent.name}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{agent.shopName} • ID: {agent.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (agent) => (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <MapPin size={12} />
          <span className="text-xs font-semibold">{agent.location}</span>
        </div>
      ),
    },
    {
      key: "float",
      header: "Float",
      className: "text-right",
      render: (agent) => (
        <span className={cn(
          "font-bold text-sm",
          agent.floatBalance < 50 ? "text-red-500" : "text-slate-900 dark:text-slate-100"
        )}>
          ${agent.floatBalance.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "text-center",
      render: (agent) => (
        <span className={cn(
          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          agent.status === "Active" 
            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50" 
            : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400"
        )}>
          {agent.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Partners", value: agents.filter(a => a.status === 'Active').length, icon: Store, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Total Network Float", value: "$0.00", icon: Wallet, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "System Health", value: "Optimal", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
          { label: "Revenue Trend", value: "+12.5%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
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
        title="Agent Partner Administration"
        columns={columns}
        data={filteredAgents}
        loading={loading}
        pageable={{ page: page + 1, size, totalElements, totalPages }}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
        onSearch={handleSearch}
        onRefresh={fetchAgents}
        onAdd={() => {}}
        addButtonText="Onboard Agent"
        actions={{
          onEdit: async (agent) => {
            setSelectedAgent(agent as AgentRow);
            setActionLoading(true);
            try {
              // Fetch full agent profile data
              const fullAgent = await getUserById((agent as AgentRow).id);
              setEditForm({
                firstName: fullAgent.firstName || "",
                lastName: fullAgent.lastName || "",
                email: fullAgent.email || "",
                phoneNumber: fullAgent.phoneNumber || "",
                shopName: fullAgent.shopName || "",
                shopLocation: fullAgent.shopLocation || "",
                gender: fullAgent.gender || "",
                nationality: fullAgent.nationality || "",
              });
              setIsEditModalOpen(true);
            } catch (error) {
              console.error("Failed to fetch agent details:", error);
              toast.error("Failed to load agent details");
            } finally {
              setActionLoading(false);
            }
          },
          onView: (agent) => {
            setSelectedAgent(agent as AgentRow);
            setIsViewModalOpen(true);
          },
        }}
      />

      {/* View Agent Details Modal */}
      {isViewModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold text-lg">
                  {selectedAgent.initials}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedAgent.name}</h2>
                  <p className="text-sm text-slate-500">Agent Details</p>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent ID</label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAgent.id}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                  <p className="mt-1">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border",
                      selectedAgent.status === "Active" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400" 
                        : selectedAgent.status === "Pending"
                        ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
                        : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400"
                    )}>
                      {selectedAgent.status}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shop Name</label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAgent.shopName}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1">
                    <MapPin size={14} />
                    {selectedAgent.location}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAgent.email || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</label>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedAgent.phoneNumber || '—'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Float Balance</label>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">${selectedAgent.floatBalance.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Earnings</label>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">${selectedAgent.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex gap-3">
                {selectedAgent.status === "Pending" && (
                  <button
                    onClick={() => handleApproveAgent(selectedAgent)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Check size={18} />
                    Approve Agent
                  </button>
                )}
                {selectedAgent.status === "Active" && (
                  <button
                    onClick={() => handleSuspendAgent(selectedAgent)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <Ban size={18} />
                    Suspend Agent
                  </button>
                )}
                {selectedAgent.status === "Suspended" && (
                  <button
                    onClick={() => handleReactivateAgent(selectedAgent)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Check size={18} />
                    Reactivate Agent
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditForm({
                      shopName: selectedAgent.shopName,
                      shopLocation: selectedAgent.location,
                      firstName: selectedAgent.name.split(" ")[0],
                      lastName: selectedAgent.name.split(" ").slice(1).join(" "),
                    });
                    setIsViewModalOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit2 size={18} />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {isEditModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Agent</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={editForm.firstName || ""}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={editForm.lastName || ""}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber || ""}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
                  <select
                    value={editForm.gender || ""}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={editForm.nationality || ""}
                    onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="e.g. Zimbabwean"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Shop Name</label>
                <input
                  type="text"
                  value={editForm.shopName || ""}
                  onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={editForm.shopLocation || ""}
                  onChange={(e) => setEditForm({ ...editForm, shopLocation: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g. Harare, ZW"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateAgent()}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
