
import React, { useState } from 'react';
import { DataTable, type TableColumn } from '../../../components/ui';

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

  const columns: TableColumn<Report>[] = [
    {
      key: 'name',
      header: 'Report Name',
      render: (report) => (
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">description</span>
          <p className="text-sm font-bold text-dark-text dark:text-gray-200">{report.name}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (report) => (
        <span className="px-2 py-1 bg-neutral-light/50 dark:bg-white/5 text-[10px] font-bold text-neutral-text rounded uppercase">{report.type}</span>
      ),
    },
    {
      key: 'date',
      header: 'Created Date',
      render: (report) => <span className="text-sm text-neutral-text">{report.date}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (report) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            report.status === 'Ready' ? 'bg-accent-green' : 
            report.status === 'Processing' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className={`text-xs font-bold ${
            report.status === 'Ready' ? 'text-accent-green' : 
            report.status === 'Processing' ? 'text-yellow-600' : 'text-red-600'
          }`}>{report.status}</span>
        </div>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      render: (report) => <span className="text-sm text-neutral-text">{report.size}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: () => (
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
      ),
    },
  ];

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
          <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">Reporting Center</h2>
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
          <div key={template.title} className="bg-white  p-6 rounded-3xl border border-neutral-light dark:border-white/5 hover:shadow-xl hover:shadow-primary/5 transition-all group cursor-pointer">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${template.color}`}>
              <span className="material-symbols-outlined">{template.icon}</span>
            </div>
            <h3 className="text-lg font-bold text-dark-text dark:text-white mb-2">{template.title}</h3>
            <p className="text-xs text-neutral-text leading-relaxed mb-6">{template.desc}</p>
            <button className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
              Use Template <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        ))}
      </div>

      {/* Recent Reports Table */}
      <DataTable
        columns={columns}
        data={reports}
        rowKey={(report) => report.id}
        emptyMessage="No reports found"
        emptyIcon="description"
        header={
          <div className="px-8 py-5 flex items-center justify-between">
            <h4 className="text-lg font-bold text-dark-text dark:text-white">Generated Reports Archive</h4>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-neutral-light dark:hover:bg-white/5 rounded-lg transition-colors text-neutral-text">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
              <button className="p-2 hover:bg-neutral-light dark:hover:bg-white/5 rounded-lg transition-colors text-neutral-text">
                <span className="material-symbols-outlined">refresh</span>
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default Reports;

