import React, { useState, useEffect, useMemo } from "react";
import { getPaginatedUsers } from "../services/adminUsers.service";
import type { AdminUserDto } from "../dto/admin-api.dto";
import CRUDLayout, { type CRUDColumn } from "../../shared/components/CRUDLayout";
import { UserCircle, Store, MapPin, Wallet, TrendingUp, ShieldCheck, Search, PlusCircle, Download } from "lucide-react";
import { cn } from "../../../lib/utils";

type AgentRow = {
  id: string;
  name: string;
  initials: string;
  shopName: string;
  location: string;
  floatBalance: number;
  totalEarnings: number;
  status: "Active" | "Suspended" | "Pending";
};

function normalizeAgent(user: AdminUserDto): AgentRow {
  const id = String(user.id ?? "");
  const firstName = String(user.firstName ?? "");
  const lastName = String(user.lastName ?? "");
  const name = [firstName, lastName].filter(Boolean).join(" ") || String(user.username ?? user.email ?? "—");
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";
  const status: AgentRow["status"] = user.active === false ? "Suspended" : "Active";
  
  return {
    id,
    name,
    initials,
    shopName: String(user.username ?? "—"),
    location: "Harare, ZW", // Default placeholder
    floatBalance: 0,
    totalEarnings: 0,
    status,
  };
}

const Agents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = () => {
    setLoading(true);
    getPaginatedUsers({ size: 200 })
      .then((response) => {
        const users = response?.content ?? [];
        const agentUsers = users.filter(
          (u) => (u.group as { name?: string } | null | undefined)?.name === "AGENT"
        );
        setAgents(agentUsers.map(normalizeAgent));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const filteredAgents = useMemo(
    () => agents.filter(agent =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.id.includes(searchTerm)
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
        pageable={{ page: 1, size: 50, totalElements: filteredAgents.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onSearch={setSearchTerm}
        onRefresh={fetchAgents}
        onAdd={() => {}}
        addButtonText="Onboard Agent"
        actions={{
          onEdit: () => {},
          onView: () => {},
        }}
      />
    </div>
  );
};

export default Agents;
