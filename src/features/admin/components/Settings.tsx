import React, { useState } from "react";
import { motion } from "framer-motion";
import { DEFAULT_SYSTEM_CONFIG, INITIAL_CATEGORIES } from "../data/constants";
import { SystemConfig, ServiceCategory, FAQItem } from "../data/types";
import { 
  Settings as SettingsIcon, 
  Percent, 
  Layers, 
  HelpCircle, 
  ShieldCheck, 
  Save, 
  CheckCircle, 
  Power, 
  Edit2, 
  Trash2, 
  Plus, 
  Info,
  Clock,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  Lock,
  Smartphone,
  Globe,
  Bell
} from "lucide-react";
import { cn } from "../../../lib/utils";
import CRUDLayout from "../../shared/components/CRUDLayout";

interface SettingsProps {
  faqs?: FAQItem[];
  setFaqs?: (faqs: FAQItem[]) => void;
  initialTab?: string;
}

type TabId = "commissions" | "categories" | "faqs" | "security";

const Settings: React.FC<SettingsProps> = ({
  faqs = [],
  setFaqs,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>((initialTab as TabId) || "commissions");
  const [categories, setCategories] = useState<ServiceCategory[]>(INITIAL_CATEGORIES);
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: "commissions", label: "Revenue Split", icon: Percent },
    { id: "categories", label: "Biller Settings", icon: Layers },
    { id: "faqs", label: "FAQ Manager", icon: HelpCircle },
    { id: "security", label: "Security & Access", icon: ShieldCheck },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("System policies synchronized successfully.");
    }, 1000);
  };

  const updateSplit = (id: string, field: "agentRate" | "platformRate", val: string) => {
    const num = parseFloat(val) || 0;
    setCategories(categories.map((c) => (c.id === id ? { ...c, [field]: num } : c)));
  };

  const toggleCategoryActive = (id: string) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Area */}
      <div className="glass-card p-8 border-slate-200 dark:border-slate-800 flex items-start gap-6">
         <div className="w-16 h-16 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
            <SettingsIcon className="text-emerald-600 dark:text-emerald-400" size={32} />
         </div>
         <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Configuration</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Master control for revenue split, global categories, and platform policies.</p>
            <div className="mt-4 flex items-center gap-3">
               <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full uppercase tracking-widest border border-emerald-200 dark:border-emerald-800/50">Production Node</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={12} /> Last Sync: 2 mins ago
               </span>
            </div>
         </div>
      </div>

      {/* Horizontal Navigation */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={cn(
              "flex items-center gap-2.5 px-8 py-5 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
              activeTab === tab.id
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeSettingsTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "commissions" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {categories.map((cat) => (
                 <div key={cat.id} className="glass-card p-8 border-slate-200 dark:border-slate-800 hover:border-emerald-500/20 transition-all group">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                             <Layers size={24} />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900 dark:text-white">{cat.label}</h4>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Platform ID: {cat.id}</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => toggleCategoryActive(cat.id)}
                         className={cn(
                           "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border",
                           cat.isActive 
                             ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                             : "bg-slate-100 text-slate-400 border-slate-200"
                         )}
                       >
                         {cat.isActive ? 'Active' : 'Disabled'}
                       </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Agent Share (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={cat.agentRate}
                            onChange={(e) => updateSplit(cat.id, "agentRate", e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Retention (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={cat.platformRate}
                            onChange={(e) => updateSplit(cat.id, "platformRate", e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
             <div className="glass-card p-10 border-slate-200 dark:border-slate-800 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mx-auto text-emerald-600">
                   <Layers size={40} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Biller Policy Manager</h3>
                   <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">Configure global rules for biller onboarding, field validation patterns, and settlement frequencies.</p>
                </div>
                <button className="px-10 py-4 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 transition-all">
                   Manage Dynamic Fields
                </button>
             </div>
          </div>
        )}

        {activeTab === "faqs" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FAQ List refactored to high-end cards */}
                <div className="glass-card p-8 border-slate-200 dark:border-slate-800 flex items-start gap-4">
                   <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0 text-blue-600">
                      <HelpCircle size={20} />
                   </div>
                   <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">General Information</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Common questions about the platform, settlement times, and supported currencies.</p>
                      <button className="text-emerald-600 font-bold uppercase text-[9px] tracking-widest hover:underline pt-2">Edit Questions</button>
                   </div>
                </div>
                <div className="glass-card p-8 border-slate-200 dark:border-slate-800 flex items-start gap-4">
                   <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center shrink-0 text-purple-600">
                      <AlertTriangle size={20} />
                   </div>
                   <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">Troubleshooting</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Resolving failed transactions, account locks, and API integration issues.</p>
                      <button className="text-emerald-600 font-bold uppercase text-[9px] tracking-widest hover:underline pt-2">Edit Questions</button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 border-slate-200 dark:border-slate-800 space-y-6">
                   <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center">
                      <Lock size={24} />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Two-Factor Auth</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Mandatory for all admin level accounts.</p>
                   </div>
                   <div className="pt-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded-full uppercase tracking-widest border border-emerald-100">Enforced</span>
                   </div>
                </div>
                <div className="glass-card p-8 border-slate-200 dark:border-slate-800 space-y-6">
                   <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Globe size={24} />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">IP Whitelisting</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Restrict API access to specific IP ranges.</p>
                   </div>
                   <div className="pt-2">
                      <button className="text-emerald-600 font-bold uppercase text-[9px] tracking-widest hover:underline">Configure Ranges</button>
                   </div>
                </div>
                <div className="glass-card p-8 border-slate-200 dark:border-slate-800 space-y-6">
                   <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center">
                      <Bell size={24} />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Audit Logs</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Track every sensitive operation performed.</p>
                   </div>
                   <div className="pt-2">
                      <button className="text-emerald-600 font-bold uppercase text-[9px] tracking-widest hover:underline">View Stream</button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Global Action Bar */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-end items-center gap-6">
         <p className="text-xs text-slate-400 font-medium">Careful: Changes affect the entire platform ecosystem.</p>
         <button
           onClick={handleSave}
           disabled={isSaving}
           className="bg-emerald-600 text-white px-12 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-70"
         >
           {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
           {isSaving ? "Deploying Rules..." : "Synchronize Global Settings"}
         </button>
      </div>
    </div>
  );
};

export default Settings;
