import React, { useMemo, useState } from 'react'
import { PortalDropdown } from '../../../components/ui/PortalDropdown'
import toast from 'react-hot-toast'
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout'
import CRUDModal from '../../shared/components/CRUDModal'
import type { AdminGroupDto, AdminUserDto } from '../dto/admin-api.dto'
import {
  changeUserActivationStatus,
  createUser,
  getPaginatedGroups,
  getPaginatedUsers,
  updateUser,
  adminSendPasswordReset,
  adminSetPassword,
  adminResendInvite,
  adminSetOtp,
} from '../services'
import { AdminInput, AdminSelect } from './shared/AdminControls'
import {
  CheckCircle, XCircle, User, Mail, Phone, Calendar,
  Edit2, Ban, Check, MoreVertical, KeyRound, Mail as MailIcon,
  RefreshCw, ShieldCheck, ShieldOff, Lock,
} from 'lucide-react'
import { cn } from '../../../lib/utils'

// ─── Actions dropdown ────────────────────────────────────────────────────────

interface UserActionsMenuProps {
  user: AdminUserDto
  onEdit: (user: AdminUserDto) => void
  onToggleStatus: (user: AdminUserDto) => void
  onSendReset: (user: AdminUserDto) => void
  onSetPassword: (user: AdminUserDto) => void
  onResendInvite: (user: AdminUserDto) => void
  onToggleOtp: (user: AdminUserDto) => void
  loadingId: string | number | null
}

const UserActionsMenu: React.FC<UserActionsMenuProps> = ({
  user, onEdit, onToggleStatus, onSendReset, onSetPassword, onResendInvite, onToggleOtp, loadingId,
}) => {
  const busy = loadingId === user.id

  return (
    <PortalDropdown
      trigger={({ ref, onClick, open: isOpen }) => (
        <button
          ref={ref}
          onClick={onClick}
          disabled={busy}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="More actions"
          aria-expanded={isOpen}
        >
          {busy
            ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : <MoreVertical size={16} />}
        </button>
      )}
    >
      {(close) => (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl min-w-[200px] py-1 text-sm">
          <button onClick={() => { close(); onEdit(user) }}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Edit2 size={14} /> Edit Profile
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button onClick={() => { close(); onSendReset(user) }}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
            <RefreshCw size={14} /> Send Password Reset Link
          </button>
          <button onClick={() => { close(); onSetPassword(user) }}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
            <KeyRound size={14} /> Set Password Directly
          </button>
          <button onClick={() => { close(); onResendInvite(user) }}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
            <MailIcon size={14} /> Resend Invite Email
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button onClick={() => { close(); onToggleOtp(user) }}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
            {user.otpEnabled
              ? <><ShieldOff size={14} /> Disable 2FA</>
              : <><ShieldCheck size={14} /> Enable 2FA</>}
          </button>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <button onClick={() => { close(); onToggleStatus(user) }}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2",
              user.active !== false
                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            )}>
            {user.active !== false ? <><Ban size={14} /> Deactivate User</> : <><Check size={14} /> Activate User</>}
          </button>
        </div>
      )}
    </PortalDropdown>
  )
}

// ─── Set Password Modal ───────────────────────────────────────────────────────

interface SetPasswordModalProps {
  user: AdminUserDto | null
  onClose: () => void
  onSubmit: (newPassword: string) => Promise<void>
}

const SetPasswordModal: React.FC<SetPasswordModalProps> = ({ user, onClose, onSubmit }) => {
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)

  const mismatch = confirm.length > 0 && pw !== confirm
  const valid = pw.length >= 8 && !mismatch

  const handleSubmit = async () => {
    if (!valid) return
    setBusy(true)
    try {
      await onSubmit(pw)
      setPw(''); setConfirm('')
      onClose()
    } finally {
      setBusy(false)
    }
  }

  if (!user) return null

  return (
    <CRUDModal
      isOpen={!!user}
      onClose={onClose}
      title={`Set Password — ${user.username ?? ''}`}
      onSubmit={handleSubmit}
      isSubmitting={busy}
      submitLabel="Set Password"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500">Set a new password directly for this user. Min 8 characters.</p>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">New Password</label>
          <AdminInput type="password" value={pw} onChange={e => setPw(e.target.value)} className="w-full" placeholder="Min 8 characters" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Confirm Password</label>
          <AdminInput type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full" placeholder="Repeat password" />
          {mismatch && <p className="text-xs text-red-500 ml-1">Passwords do not match</p>}
        </div>
      </div>
    </CRUDModal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [groups, setGroups] = useState<AdminGroupDto[]>([])
  const [setPasswordUser, setSetPasswordUser] = useState<AdminUserDto | null>(null)

  const [selectedUser, setSelectedUser] = useState<AdminUserDto | null>(null)
  const [form, setForm] = useState({ username: '', firstName: '', lastName: '', email: '', phoneNumber: '', groupId: '' })
  const [editForm, setEditForm] = useState({ username: '', firstName: '', lastName: '', email: '', phoneNumber: '' })

  const loadUsers = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const page = await getPaginatedUsers({ page: 0, size: 200, sort: 'id', order: 'DESC' })
      setUsers(Array.isArray(page.content) ? page.content : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => { void loadUsers() }, [loadUsers])

  React.useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await getPaginatedGroups({ page: 0, size: 200 })
        setGroups(Array.isArray(response?.content) ? response.content : [])
      } catch { setGroups([]) }
    }
    void loadGroups()
  }, [])

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
      toast.error('Username, First Name, Last Name and Email are required'); return
    }
    if (!form.groupId) { toast.error('Group is required'); return }
    try {
      setIsCreating(true)
      const payload: AdminUserDto = {
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        groupId: Number(form.groupId),
        ...(form.phoneNumber.trim() ? { phoneNumber: form.phoneNumber.trim() } : {}),
      }
      await createUser(payload)
      toast.success('User created — welcome email sent')
      setForm({ username: '', firstName: '', lastName: '', email: '', phoneNumber: '', groupId: '' })
      setIsCreateOpen(false)
      await loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user')
    } finally { setIsCreating(false) }
  }

  const handleUpdate = async () => {
    if (!selectedUser?.id) { toast.error('User ID is missing'); return }
    if (!editForm.username.trim() || !editForm.email.trim() || !editForm.firstName.trim() || !editForm.lastName.trim()) {
      toast.error('Username, First Name, Last Name and Email are required'); return
    }
    try {
      setIsUpdating(true)
      await updateUser({ ...selectedUser, id: selectedUser.id, ...editForm })
      toast.success('User updated')
      setIsEditOpen(false)
      setSelectedUser(null)
      await loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update user')
    } finally { setIsUpdating(false) }
  }

  const withActionLoading = async (userId: string | number, fn: () => Promise<void>) => {
    setActionLoadingId(userId)
    try { await fn() } finally { setActionLoadingId(null) }
  }

  const handleToggleStatus = (user: AdminUserDto) => {
    if (!user.id) return
    void withActionLoading(user.id, async () => {
      await changeUserActivationStatus(user.active === false, user.id!)
      toast.success(user.active === false ? 'User activated' : 'User deactivated')
      await loadUsers()
    })
  }

  const handleSendReset = (user: AdminUserDto) => {
    if (!user.id) return
    void withActionLoading(user.id, async () => {
      await adminSendPasswordReset(user.id!)
      toast.success(`Password reset link sent to ${user.email ?? 'user'}`)
    })
  }

  const handleResendInvite = (user: AdminUserDto) => {
    if (!user.id) return
    void withActionLoading(user.id, async () => {
      await adminResendInvite(user.id!)
      toast.success(`Invite email resent to ${user.email ?? 'user'}`)
    })
  }

  const handleToggleOtp = (user: AdminUserDto) => {
    if (!user.id) return
    void withActionLoading(user.id, async () => {
      await adminSetOtp(user.id!, !user.otpEnabled)
      toast.success(`2FA ${user.otpEnabled ? 'disabled' : 'enabled'} for ${user.username ?? 'user'}`)
      await loadUsers()
    })
  }

  const handleSetPassword = async (newPassword: string) => {
    if (!setPasswordUser?.id) return
    await adminSetPassword(setPasswordUser.id, newPassword)
    toast.success(`Password updated for ${setPasswordUser.username ?? 'user'}`)
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
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '-'}</p>
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
            <Mail size={12} />{String(user.email ?? '-')}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Phone size={12} />{String(user.phoneNumber ?? '-')}
          </div>
        </div>
      ),
    },
    {
      key: 'group',
      header: 'Group',
      render: (user) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {String((user as any).group?.name ?? (user as any).groupName ?? '-')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-center',
      render: (user) => (
        <div className="flex flex-col items-center gap-1">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            user.active !== false
              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
              : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400"
          )}>
            {user.active !== false ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {user.active !== false ? 'Active' : 'Inactive'}
          </span>
          {user.otpEnabled && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              <Lock size={9} /> 2FA On
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'createdDate',
      header: 'Created On',
      render: (user) => (
        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
          <Calendar size={12} />{String(user.createdDate ?? '-')}
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
          setForm({ username: '', firstName: '', lastName: '', email: '', phoneNumber: '', groupId: '' })
          setIsCreateOpen(true)
        }}
        addButtonText="Add User"
        actions={{
          renderCustom: (user) => (
            <UserActionsMenu
              user={user}
              onEdit={openEditModal}
              onToggleStatus={handleToggleStatus}
              onSendReset={handleSendReset}
              onSetPassword={(u) => setSetPasswordUser(u)}
              onResendInvite={handleResendInvite}
              onToggleOtp={handleToggleOtp}
              loadingId={actionLoadingId}
            />
          ),
        }}
      />

      {/* Create Modal */}
      <CRUDModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New User"
        onSubmit={handleCreate} isSubmitting={isCreating} submitLabel="Create User">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Username</label>
            <AdminInput value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full" placeholder="jdoe" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">First Name</label>
            <AdminInput value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full" placeholder="John" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Last Name</label>
            <AdminInput value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full" placeholder="Doe" />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <AdminInput type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full" placeholder="john@example.com" />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
            <AdminInput value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} className="w-full" placeholder="+263..." />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Group</label>
            <AdminSelect value={form.groupId} onChange={e => setForm({ ...form, groupId: e.target.value })} className="w-full">
              <option value="">Select group</option>
              {groups.map(group => (
                <option key={String(group.id)} value={String(group.id)}>{String(group.name ?? group.id)}</option>
              ))}
            </AdminSelect>
          </div>
        </div>
      </CRUDModal>

      {/* Edit Modal */}
      <CRUDModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit User Profile"
        onSubmit={handleUpdate} isSubmitting={isUpdating} submitLabel="Update User">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Username</label>
            <AdminInput value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="w-full" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">First Name</label>
            <AdminInput value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} className="w-full" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Last Name</label>
            <AdminInput value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} className="w-full" />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <AdminInput type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full" />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
            <AdminInput value={editForm.phoneNumber} onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} className="w-full" />
          </div>
        </div>
      </CRUDModal>

      {/* Set Password Modal */}
      <SetPasswordModal
        user={setPasswordUser}
        onClose={() => setSetPasswordUser(null)}
        onSubmit={handleSetPassword}
      />
    </div>
  )
}

export default AdminUsersPage
