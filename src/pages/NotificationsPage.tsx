import React, { useEffect, useState, useCallback } from 'react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  clearReadNotifications,
  type Notification 
} from '../services/notification.service';
import CRUDLayout, { type CRUDColumn, type PageableState } from '../features/shared/components/CRUDLayout';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  MessageSquare, 
  Trash2, 
  CheckCheck, 
  Clock,
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageable, setPageable] = useState<PageableState>({
    page: 1,
    size: 20,
    totalElements: 0,
    totalPages: 1,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setPageable(prev => ({
        ...prev,
        totalElements: data.length,
        totalPages: Math.ceil(data.length / prev.size)
      }));
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      await loadData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      toast.success('All marked as read');
      await loadData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      toast.success('Notification removed');
      await loadData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const columns: CRUDColumn<Notification>[] = [
    {
      key: 'type',
      header: '',
      className: 'w-12',
      render: (n) => {
        const Icon = n.type === 'success' ? CheckCircle2 : n.type === 'alert' ? AlertCircle : n.type === 'message' ? MessageSquare : Info;
        const color = n.type === 'success' ? 'text-emerald-500' : n.type === 'alert' ? 'text-red-500' : n.type === 'message' ? 'text-blue-500' : 'text-slate-400';
        const bg = n.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20' : n.type === 'alert' ? 'bg-red-50 dark:bg-red-900/20' : n.type === 'message' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-50 dark:bg-slate-900';
        
        return (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg, color)}>
            <Icon size={20} />
          </div>
        );
      }
    },
    {
      key: 'content',
      header: 'Notification',
      render: (n) => (
        <div className={cn("space-y-1", !n.isRead && "font-bold")}>
          <div className="flex items-center gap-2">
            <p className={cn("text-sm text-slate-900 dark:text-white", !n.isRead ? "font-black" : "font-semibold")}>
              {n.title}
            </p>
            {n.category && (
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-tighter border border-slate-200 dark:border-slate-700">
                {n.category}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-2xl font-medium">
            {n.message}
          </p>
        </div>
      )
    },
    {
      key: 'timestamp',
      header: 'Time',
      render: (n) => {
        const date = new Date(n.timestamp);
        return (
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <Clock size={12} />
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            <span className="mx-1">•</span>
            {date.toLocaleDateString()}
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-center',
      render: (n) => (
        <span className={cn(
          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          n.isRead 
            ? "bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-900 dark:text-slate-600 dark:border-slate-800" 
            : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50"
        )}>
          {n.isRead ? 'Read' : 'New'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-8 border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
            <Bell size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Inbox</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your system alerts and transaction notifications.</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={handleMarkAllRead}
             className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all flex items-center gap-2"
           >
             <CheckCheck size={14} />
             Mark all as Read
           </button>
        </div>
      </div>

      <CRUDLayout
        title=""
        columns={columns}
        data={notifications}
        loading={loading}
        pageable={pageable}
        onPageChange={(p) => setPageable(prev => ({ ...prev, page: p }))}
        onSizeChange={(s) => setPageable(prev => ({ ...prev, size: s, page: 1 }))}
        onRefresh={loadData}
        searchable={false}
        actions={{
          onDelete: (n) => handleDelete(n.id),
          renderCustom: (n) => (
            <div className="flex items-center gap-2">
               {!n.isRead && (
                 <button onClick={() => handleMarkRead(n.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Mark as read">
                    <CheckCircle2 size={16} />
                 </button>
               )}
               {n.actionUrl && (
                 <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View details">
                    <ExternalLink size={16} />
                 </button>
               )}
            </div>
          )
        }}
      />
    </div>
  );
}
