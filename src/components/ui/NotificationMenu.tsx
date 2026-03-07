import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  BellOff, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  MessageSquare, 
  CheckCheck, 
  X, 
  Clock,
  PlusCircle,
  MoreVertical
} from 'lucide-react'
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  clearReadNotifications,
  type Notification 
} from '../../services/notification.service'
import { cn } from '../../lib/utils'
import { ROUTE_PATHS } from '../../router/paths'

export default function NotificationMenu({ onReplenishFloat }: { onReplenishFloat?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      void loadData()
    }
  }, [isOpen, loadData])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id)
    void loadData()
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead()
    void loadData()
  }

  const handleViewAll = () => {
    setIsOpen(false)
    // Find the base path for notifications based on group
    const basePath = window.location.pathname.split('/')[1] || 'portal'
    navigate(`/${basePath}/notifications`)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
          isOpen 
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" 
            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200"
        )}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+12px)] right-0 w-[400px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <div>
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Notifications</h4>
               <p className="text-[10px] font-bold text-emerald-600 uppercase mt-0.5">{unreadCount} New Alerts</p>
            </div>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors" title="Mark all as read">
                  <CheckCheck size={16} />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-[480px] overflow-y-auto scrollbar-hide">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {notifications.map((n) => {
                  const Icon = n.type === 'success' ? CheckCircle2 : n.type === 'alert' ? AlertCircle : Info;
                  const color = n.type === 'success' ? 'text-emerald-500' : n.type === 'alert' ? 'text-red-500' : 'text-blue-500';
                  
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                      className={cn(
                        "p-5 flex gap-4 items-start transition-colors cursor-pointer group relative",
                        n.isRead ? "opacity-60" : "bg-emerald-50/30 dark:bg-emerald-900/5 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                        n.type === 'success' ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50" : 
                        n.type === 'alert' ? "bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800/50" : 
                        "bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/50",
                        color
                      )}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-sm font-bold text-slate-900 dark:text-white truncate", !n.isRead && "pr-4")}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <div className="absolute right-5 top-6 w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40"></div>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                           <Clock size={10} className="text-slate-300" />
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                             {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                   <BellOff size={32} />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">All caught up!</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No new notifications at the moment.</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleViewAll}
            className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border-t border-slate-100 dark:border-slate-700"
          >
            Open Notifications Center
          </button>
        </div>
      )}
    </div>
  )
}
