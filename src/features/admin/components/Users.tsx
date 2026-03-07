import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout'
import CRUDModal from '../../shared/components/CRUDModal'
import type { AdminUserDto } from '../dto/admin-api.dto'
import { changeUserActivationStatus, createUser, getPaginatedUsers, updateUser } from '../services'
import { User, Mail, Phone, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '../../../lib/utils'

const Users: React.FC = () => {
  const [users, setUsers] = useState<AdminUserDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const loadUsers = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const page = await getPaginatedUsers({ page: 0, size: 100 })
      setUsers(Array.isArray(page.content) ? page.content : [])
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return users.filter(user => 
      (user.username ?? '').toLowerCase().includes(term) ||
      (user.email ?? '').toLowerCase().includes(term)
    )
  }, [users, searchTerm])

  const columns: CRUDColumn<AdminUserDto>[] = [
    {
      key: 'username',
      header: 'User',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <User size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{String(user.username ?? '-')}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{`${String(user.firstName ?? '')} ${String(user.lastName ?? '')}`.trim() || '-'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (user) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Mail size={12} /> {String(user.email ?? '-')}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Phone size={12} /> {String(user.phoneNumber ?? '-')}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
          user.active !== false
            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
            : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400"
        )}>
          {user.active !== false ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {user.active !== false ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <CRUDLayout
        title="User Management"
        columns={columns}
        data={filteredUsers}
        loading={isLoading}
        pageable={{ page: 1, size: 100, totalElements: filteredUsers.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onSearch={setSearchTerm}
        onRefresh={loadUsers}
        onAdd={() => setIsCreateOpen(true)}
      />
    </div>
  )
}

export default Users
