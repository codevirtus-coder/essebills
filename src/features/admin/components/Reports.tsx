
import React, { useState } from 'react';

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'Ready' | 'Processing' | 'Failed';
  size: string;
}

const Reports: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<Report[]>([
    { id: '1', name: 'May Monthly Revenue Summary', type: 'Financial', date: 'Jun 01, 2024', status: 'Ready', size: '2.4 MB' },
    { id: '2', name: 'ZESA Settlement Report Q2', type: 'Settlement', date: 'May 28, 2024', status: 'Ready', size: '1.1 MB' },
    { id: '3', name: 'User Growth Analytics 2024', type: 'Operational', date: 'May 15, 2024', status: 'Ready', size: '4.8 MB' },
    { id: '4', name: 'Tax Compliance Document', type: 'Tax', date: 'Apr 30, 2024', status: 'Ready', size: '850 KB' },
  ]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newReport: Report = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Custom Analysis ${new Date().toLocaleDateString()}`,
        type: 'Analytical',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: 'Ready',
        size: '1.2 MB'
      };
      setReports([newReport, ...reports]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-text">Reporting Center</h2>
          <p className="text-sm text-neutral-text">Generate, schedule, and manage your system reports.</p>
        </div>
        <button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <span className="material-symbols-outlined animate-spin">sync</span>
              Generating...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">add_chart</span>
              Generate New Report
            </>
          )}
        </button>
      </div>

      {/* Report Templates Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Revenue Report', icon: 'payments', color: 'bg-primary/10 text-primary', desc: 'Detailed breakdown of all income sources and biller cuts.' },
          { title: 'Biller Settlement', icon: 'account_balance', color: 'bg-accent-green/10 text-accent-green', desc: 'Verification of successful payouts and pending settlements.' },
          { title: 'Audit Logs', icon: 'security', color: 'bg-orange-100 text-orange-600', desc: 'Complete history of administrative actions and security events.' }
        ].map((template) => (
          <div key={template.title} className="bg-white p-6 rounded-3xl border border-neutral-light hover:shadow-xl hover:shadow-primary/5 transition-all group cursor-pointer">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${template.color}`}>
              <span className="material-symbols-outlined">{template.icon}</span>
            </div>
            <h3 className="text-lg font-bold text-dark-text mb-2">{template.title}</h3>
            <p className="text-xs text-neutral-text leading-relaxed mb-6">{template.desc}</p>
            <button className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
              Use Template <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        ))}
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-light overflow-hidden">
        <div className="p-8 border-b border-neutral-light flex items-center justify-between">
          <h4 className="text-lg font-bold text-dark-text">Generated Reports Archive</h4>
          <div className="flex gap-2">
             <button className="p-2 hover:bg-neutral-light rounded-lg transition-colors text-neutral-text">
                <span className="material-symbols-outlined">filter_list</span>
             </button>
             <button className="p-2 hover:bg-neutral-light rounded-lg transition-colors text-neutral-text">
                <span className="material-symbols-outlined">refresh</span>
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-light/20">
                <th className="px-8 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest">Report Name</th>
                <th className="px-8 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest">Type</th>
                <th className="px-8 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest">Created Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest">Size</th>
                <th className="px-8 py-4 text-[10px] font-black text-neutral-text uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-neutral-light/10 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">description</span>
                      <p className="text-sm font-bold text-dark-text">{report.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2 py-1 bg-neutral-light/50 text-[10px] font-bold text-neutral-text rounded uppercase">{report.type}</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-neutral-text">{report.date}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                      <span className="text-xs font-bold text-accent-green">{report.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-neutral-text">{report.size}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all text-neutral-text" title="Download PDF">
                        <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                      </button>
                      <button className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all text-neutral-text" title="Download Excel">
                        <span className="material-symbols-outlined text-lg">table_view</span>
                      </button>
                      <button className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all text-neutral-text" title="Delete">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
