import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout'
import CRUDModal from '../../shared/components/CRUDModal'
import type { AdminUserDto } from '../dto/admin-api.dto'
import { changeUserActivationStatus, createUser, getPaginatedUsers, updateUser } from '../services'
import {
  AdminInput,
} from './shared/AdminControls'
import { CheckCircle, XCircle, User, Mail, Phone, Calendar, Edit2, ShieldCheck, Ban, Check } from 'lucide-react'
import { cn } from '../../../lib/utils'

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusLoadingId, setStatusLoadingId] = useState<string | number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedUser, setSelectedUser] = useState<AdminUserDto | null>(null)
  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  })
  const [editForm, setEditForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  })

  const loadUsers = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const page = await getPaginatedUsers({ page: 0, size: 100 })
      setUsers(Array.isArray(page.content) ? page.content : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load users')
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
      (user.email ?? '').toLowerCase().includes(term) ||
      (user.firstName ?? '').toLowerCase().includes(term) ||
      (user.lastName ?? '').toLowerCase().includes(term)
    )
  }, [users, searchTerm])

  const openEditModal = (user: AdminUserDto) => {
    setSelectedUser(user)
    setEditForm({
      username: String(user.username ?? ''),
      firstName: String(user.firstName ?? ''),
      lastName: String(user.lastName ?? ''),
      email: String(user.email ?? ''),
      phoneNumber: String(user.phoneNumber ?? ''),
    })
    setIsEditOpen(true)
  }

  const handleCreate = async () => {
    if (!form.username.trim() || !form.email.trim() || !form.firstName.trim() || !form.lastName.trim()) {
      toast.error('Username, First Name, Last Name and Email are required')
      return
    }

    try {
      setIsCreating(true)
      await createUser({
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
      })
      toast.success('User created')
      setForm({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
      })
      setIsCreateOpen(false)
      await loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user')
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedUser?.id) {
      toast.error('User ID is missing')
      return
    }

    if (
      !editForm.username.trim() ||
      !editForm.email.trim() ||
      !editForm.firstName.trim() ||
      !editForm.lastName.trim()
    ) {
      toast.error('Username, First Name, Last Name and Email are required')
      return
    }

    try {
      setIsUpdating(true)
      await updateUser({
        ...selectedUser,
        id: selectedUser.id,
        username: editForm.username.trim(),
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
      })
      toast.success('User updated')
      setIsEditOpen(false)
      setSelectedUser(null)
      await loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleStatus = async (user: AdminUserDto) => {
    if (!user.id) {
      toast.error('User ID is missing')
      return
    }
    const nextActive = user.active === false
    try {
      setStatusLoadingId(user.id)
      await changeUserActivationStatus(nextActive, user.id)
      toast.success(nextActive ? 'User activated' : 'User deactivated')
      await loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user status')
    } finally {
      setStatusLoadingId(null)
    }
  }

  const columns: CRUDColumn<AdminUserDto>[] = [
    {
      key: 'username',
      header: 'User',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <User size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{String(user.username ?? '-')}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{`${String(user.firstName ?? '')} ${String(user.lastName ?? '')}`.trim() || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (user) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Mail size={12} />
            {String(user.email ?? '-')}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Phone size={12} />
            {String(user.phoneNumber ?? '-')}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-center',
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
      ),
    },
    {
      key: 'createdDate',
      header: 'Created On',
      render: (user) => (
        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
          <Calendar size={12} />
          {String(user.createdDate ?? '-')}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage system users, roles, and access controls.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-2">
            <User size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">{users.length} Users</span>
          </div>
        </div>
      </div>

      <CRUDLayout
        title=""
        columns={columns}
        data={filteredUsers}
        loading={isLoading}
        pageable={{ page: 1, size: filteredUsers.length, totalElements: filteredUsers.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onSearch={setSearchTerm}
        onRefresh={loadUsers}
        onAdd={() => {
          setForm({ username: '', firstName: '', lastName: '', email: '', phoneNumber: '' })
          setIsCreateOpen(true)
        }}
        addButtonText="Add User"
        actions={{
          onEdit: openEditModal,
          renderCustom: (user) => (
            <button
              onClick={() => void handleToggleStatus(user)}
              disabled={statusLoadingId === user.id}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                user.active !== false 
                  ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" 
                  : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              )}
              title={user.active !== false ? "Disable User" : "Activate User"}
            >
              {statusLoadingId === user.id ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : user.active !== false ? (
                <Ban size={16} />
              ) : (
                <Check size={16} />
              )}
            </button>
          )
        }}
      />

      <CRUDModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New User"
        onSubmit={handleCreate}
        isSubmitting={isCreating}
        submitLabel="Create User"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Username</label>
            <AdminInput
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full"
              placeholder="jdoe"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">First Name</label>
            <AdminInput
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full"
              placeholder="John"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Last Name</label>
            <AdminInput
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full"
              placeholder="Doe"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <AdminInput
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full"
              placeholder="john@example.com"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
            <AdminInput
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              className="w-full"
              placeholder="+263..."
            />
          </div>
        </div>
      </CRUDModal>

      <CRUDModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit User Profile"
        onSubmit={handleUpdate}
        isSubmitting={isUpdating}
        submitLabel="Update User"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Username</label>
            <AdminInput
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">First Name</label>
            <AdminInput
              value={editForm.firstName}
              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Last Name</label>
            <AdminInput
              value={editForm.lastName}
              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <AdminInput
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
            <AdminInput
              value={editForm.phoneNumber}
              onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
      </CRUDModal>
    </div>
  )
}

export default AdminUsersPage
