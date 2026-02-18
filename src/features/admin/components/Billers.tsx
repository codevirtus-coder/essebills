
import React, { useState } from 'react';

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
  status: 'Active' | 'Pending' | 'Suspended';
  settlement: 'Real-time' | 'Daily' | 'Weekly';
  revenueShare: string;
  fields: BillerField[];
  allowBulk: boolean;
}

const Billers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedBiller, setSelectedBiller] = useState<Biller | null>(null);
  
  const [billers, setBillers] = useState<Biller[]>([
    { 
      id: '1', 
      name: 'ZESA Prepaid', 
      category: 'Utilities', 
      icon: 'bolt', 
      onboardedDate: 'Jan 12, 2023', 
      status: 'Active', 
      settlement: 'Daily', 
      revenueShare: '2.5%',
      fields: [
        { id: 'account', label: 'Meter Number', placeholder: 'Enter meter number', type: 'text' },
        { id: 'amount', label: 'Amount', placeholder: '0.00', type: 'text', prefix: '$' }
      ],
      allowBulk: true
    },
    { 
      id: '2', 
      name: 'City of Harare', 
      category: 'Utilities', 
      icon: 'location_city', 
      onboardedDate: 'Feb 05, 2023', 
      status: 'Active', 
      settlement: 'Weekly', 
      revenueShare: '1.8%',
      fields: [
        { id: 'account', label: 'Account Number', placeholder: 'Enter account number', type: 'text' },
        { id: 'amount', label: 'Amount', placeholder: '0.00', type: 'text', prefix: '$' }
      ],
      allowBulk: false
    },
    { 
      id: '3', 
      name: 'Econet Airtime', 
      category: 'Airtime', 
      icon: 'cell_tower', 
      onboardedDate: 'Mar 15, 2023', 
      status: 'Active', 
      settlement: 'Real-time', 
      revenueShare: '3.0%',
      fields: [
        { id: 'mobile', label: 'Mobile Number', placeholder: '077*******', type: 'tel' },
        { id: 'amount', label: 'Amount', placeholder: '0.00', type: 'text', prefix: '$' }
      ],
      allowBulk: true
    },
    { 
      id: '4', 
      name: 'TelOne ADSL', 
      category: 'Internet', 
      icon: 'wifi', 
      onboardedDate: 'Apr 20, 2023', 
      status: 'Active', 
      settlement: 'Daily', 
      revenueShare: '2.2%',
      fields: [
        { id: 'account', label: 'Telephone Number', placeholder: 'e.g. 0242123456', type: 'tel' },
        { id: 'amount', label: 'Amount', placeholder: '0.00', type: 'text', prefix: '$' }
      ],
      allowBulk: true
    },
  ]);

  const handleEditClick = (biller: Biller) => {
    setSelectedBiller({ ...biller });
    setIsAddingNew(false);
    setIsDrawerOpen(true);
  };

  const handleCreateClick = () => {
    const newBiller: Biller = {
      id: `BL-${Date.now()}`,
      name: '',
      category: 'Utilities',
      icon: 'corporate_fare',
      onboardedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Pending',
      settlement: 'Daily',
      revenueShare: '2.0%',
      fields: [
        { id: 'account', label: 'Account Number', placeholder: 'Enter account...', type: 'text' },
        { id: 'amount', label: 'Amount', placeholder: '0.00', type: 'text', prefix: '$' }
      ],
      allowBulk: false
    };
    setSelectedBiller(newBiller);
    setIsAddingNew(true);
    setIsDrawerOpen(true);
  };

  const handleSaveBiller = () => {
    if (selectedBiller) {
      if (isAddingNew) {
        setBillers([selectedBiller, ...billers]);
      } else {
        setBillers(billers.map(b => b.id === selectedBiller.id ? selectedBiller : b));
      }
      setIsDrawerOpen(false);
      setSelectedBiller(null);
    }
  };

  const addProvisionField = () => {
    if (selectedBiller) {
      const newField: BillerField = {
        id: `field_${Date.now()}`,
        label: 'New Field',
        placeholder: 'Enter value',
        type: 'text'
      };
      setSelectedBiller({
        ...selectedBiller,
        fields: [...selectedBiller.fields, newField]
      });
    }
  };

  const removeProvisionField = (fieldId: string) => {
    if (selectedBiller) {
      setSelectedBiller({
        ...selectedBiller,
        fields: selectedBiller.fields.filter(f => f.id !== fieldId)
      });
    }
  };

  const updateProvisionField = (fieldId: string, updates: Partial<BillerField>) => {
    if (selectedBiller) {
      setSelectedBiller({
        ...selectedBiller,
        fields: selectedBiller.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
      });
    }
  };

  const filteredBillers = billers.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text">Biller Administration</h2>
          <p className="text-sm text-neutral-text">Configure settlement rules and customer provisions for all providers.</p>
        </div>
        <button 
          onClick={handleCreateClick}
          className="bg-primary text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-xl shadow-primary/20"
        >
          <span className="material-symbols-outlined text-lg">add_business</span>
          Onboard New Provider
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Network Reach', value: billers.length.toString(), icon: 'hub', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active', value: billers.filter(b => b.status === 'Active').length.toString(), icon: 'check_circle', color: 'text-accent-green', bg: 'bg-accent-green/10' },
          { label: 'Review Required', value: billers.filter(b => b.status === 'Pending').length.toString(), icon: 'fact_check', color: 'text-orange-500', bg: 'bg-orange-100' },
          { label: 'Platform Cut', value: '2.4%', icon: 'percent', color: 'text-blue-500', bg: 'bg-blue-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-neutral-light flex items-center gap-5 shadow-sm">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-dark-text">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-neutral-light flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-neutral-text text-xl">search</span>
          <input 
            type="text" 
            placeholder="Master search billers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f8fafc] border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <button className="p-4 bg-[#f8fafc] text-neutral-text rounded-2xl hover:bg-neutral-light transition-all">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-neutral-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-neutral-light/20">
                <th className="px-10 py-6 text-[10px] font-black text-neutral-text uppercase tracking-widest">Biller Entity</th>
                <th className="px-10 py-6 text-[10px] font-black text-neutral-text uppercase tracking-widest">Bulk Ops</th>
                <th className="px-10 py-6 text-[10px] font-black text-neutral-text uppercase tracking-widest">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-neutral-text uppercase tracking-widest">Settlement</th>
                <th className="px-10 py-6 text-[10px] font-black text-neutral-text uppercase tracking-widest">Commission</th>
                <th className="px-10 py-6 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {filteredBillers.map((biller) => (
                <tr key={biller.id} className="group hover:bg-neutral-light/10 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">{biller.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-dark-text">{biller.name || 'Unnamed Entity'}</p>
                        <p className="text-[10px] text-neutral-text font-bold">Joined {biller.onboardedDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${biller.allowBulk ? 'bg-accent-green/20 text-accent-green border border-accent-green/20' : 'bg-neutral-light text-neutral-text/50 border border-neutral-light'}`}>
                      {biller.allowBulk ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${
                      biller.status === 'Active' ? 'bg-accent-green/10 text-accent-green border-accent-green/20' :
                      biller.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {biller.status}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-xs font-black text-neutral-text">{biller.settlement}</span>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-sm font-black text-dark-text">{biller.revenueShare}</p>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(biller)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-primary/10 hover:text-primary text-neutral-text transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">settings</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isDrawerOpen && selectedBiller && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-dark-text/40 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-neutral-light flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">{selectedBiller.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-dark-text">{isAddingNew ? 'Onboard Provider' : 'Configure Biller'}</h3>
                  <p className="text-xs font-bold text-neutral-text uppercase tracking-widest">{isAddingNew ? 'Entity Registration' : selectedBiller.name}</p>
                </div>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-neutral-light rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              <section className="space-y-6">
                <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-[0.2em] border-b border-neutral-light pb-2">Identification & Category</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-text uppercase">Biller Name</label>
                      <input 
                        type="text" 
                        value={selectedBiller.name}
                        onChange={(e) => setSelectedBiller({...selectedBiller, name: e.target.value})}
                        placeholder="e.g. Nyaradzo Life"
                        className="w-full bg-[#f8fafc] border-none rounded-xl py-3 px-4 text-sm font-bold"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-text uppercase">Category</label>
                      <select 
                        value={selectedBiller.category}
                        onChange={(e) => setSelectedBiller({...selectedBiller, category: e.target.value})}
                        className="w-full bg-[#f8fafc] border-none rounded-xl py-3 px-4 text-sm font-bold"
                      >
                         <option value="Utilities">Utilities</option>
                         <option value="Airtime">Airtime</option>
                         <option value="Internet">Internet</option>
                         <option value="Education">Education</option>
                         <option value="Insurance">Insurance</option>
                      </select>
                   </div>
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-[0.2em] border-b border-neutral-light pb-2">Operational Parameters</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-text uppercase">Settlement Frequency</label>
                    <select 
                      value={selectedBiller.settlement}
                      onChange={(e) => setSelectedBiller({...selectedBiller, settlement: e.target.value as any})}
                      className="w-full bg-[#f8fafc] border-none rounded-xl py-3 px-4 text-sm font-bold"
                    >
                      <option value="Real-time">Real-time</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-text uppercase">Biller Status</label>
                    <select 
                      value={selectedBiller.status}
                      onChange={(e) => setSelectedBiller({...selectedBiller, status: e.target.value as any})}
                      className="w-full bg-[#f8fafc] border-none rounded-xl py-3 px-4 text-sm font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                
                {/* BULK PAYMENT CONFIGURATION */}
                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex items-center justify-between">
                   <div>
                      <p className="text-sm font-bold text-dark-text">Allow Bulk Payments</p>
                      <p className="text-[10px] text-neutral-text font-medium">Enable CSV/Excel batch processing for this biller.</p>
                   </div>
                   <button 
                     onClick={() => setSelectedBiller({...selectedBiller, allowBulk: !selectedBiller.allowBulk})}
                     className={`w-12 h-6 rounded-full relative transition-all duration-300 ${selectedBiller.allowBulk ? 'bg-primary' : 'bg-neutral-light'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${selectedBiller.allowBulk ? 'right-1' : 'left-1'}`}></div>
                   </button>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-light pb-2">
                   <h4 className="text-[10px] font-black text-neutral-text uppercase tracking-[0.2em]">Customer Provisions (Dynamic Fields)</h4>
                   <button 
                     onClick={addProvisionField}
                     className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline"
                   >
                     <span className="material-symbols-outlined text-sm">add_circle</span>
                     Add Field
                   </button>
                </div>
                
                <div className="space-y-4">
                  {selectedBiller.fields.map((field) => (
                    <div key={field.id} className="p-6 bg-[#f8fafc] rounded-3xl border border-neutral-light relative group animate-in slide-in-from-top-2">
                      <button 
                        onClick={() => removeProvisionField(field.id)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-neutral-text uppercase">Field Label</label>
                          <input 
                            type="text" 
                            value={field.label}
                            onChange={(e) => updateProvisionField(field.id, { label: e.target.value })}
                            className="w-full bg-white border-neutral-light border rounded-xl py-2 px-3 text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-neutral-text uppercase">Placeholder</label>
                          <input 
                            type="text" 
                            value={field.placeholder}
                            onChange={(e) => updateProvisionField(field.id, { placeholder: e.target.value })}
                            className="w-full bg-white border-neutral-light border rounded-xl py-2 px-3 text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-neutral-text uppercase">Input Type</label>
                          <select 
                            value={field.type}
                            onChange={(e) => updateProvisionField(field.id, { type: e.target.value })}
                            className="w-full bg-white border-neutral-light border rounded-xl py-2 px-3 text-xs font-bold"
                          >
                            <option value="text">Plain Text</option>
                            <option value="number">Numeric</option>
                            <option value="tel">Phone / Mobile</option>
                            <option value="email">Email</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-neutral-text uppercase">Prefix (Optional)</label>
                          <input 
                            type="text" 
                            value={field.prefix || ''}
                            onChange={(e) => updateProvisionField(field.id, { prefix: e.target.value })}
                            placeholder="e.g. $"
                            className="w-full bg-white border-neutral-light border rounded-xl py-2 px-3 text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-8 border-t border-neutral-light bg-[#f8fafc] flex gap-4">
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-4 rounded-2xl border border-neutral-light font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all"
              >
                Discard Changes
              </button>
              <button 
                onClick={handleSaveBiller}
                disabled={!selectedBiller.name}
                className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {isAddingNew ? 'Complete Onboarding' : 'Synchronize Policy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billers;
