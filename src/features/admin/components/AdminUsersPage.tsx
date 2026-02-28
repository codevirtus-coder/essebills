import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { DataTable, TableColumn } from '../../../components/ui/DataTable'
import type { AdminUserDto } from '../dto/admin-api.dto'
import { changeUserActivationStatus, createUser, getPaginatedUsers, resetUserOtp, updateUser } from '../services'

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusLoadingId, setStatusLoadingId] = useState<string | number | null>(null)
  const [otpResetLoadingId, setOtpResetLoadingId] = useState<string | number | null>(null)
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

  const rows = useMemo(() => users, [users])

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

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

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

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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

  const handleResetOtp = async (user: AdminUserDto) => {
    if (!user.id) {
      toast.error('User ID is missing')
      return
    }
    if (!window.confirm(`Reset OTP for ${String(user.username ?? user.email)}? A new OTP secret will be generated.`)) {
      return
    }
    try {
      setOtpResetLoadingId(user.id)
      await resetUserOtp(user.id)
      toast.success('OTP reset successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset OTP')
    } finally {
      setOtpResetLoadingId(null)
    }
  }

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <section className="bg-white rounded-xl border border-neutral-light p-6 min-h-[112px]">
        <h2 className="text-4 leading-none font-medium text-dark-text dark:text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-[28px]">group</span>
          User Management
        </h2>
        <p className="text-sm text-neutral-text mt-8">Users List</p>
      </section>

      <section className="bg-white rounded-xl border border-neutral-light p-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded border border-[#7E57C2] text-[#7E57C2] text-lg font-medium uppercase tracking-wide hover:bg-[#7E57C2]/5 transition-colors"
          >
            + Create
          </button>
          <button
            type="button"
            onClick={() => void loadUsers()}
            className="px-4 py-2 rounded border border-[#7E57C2] text-[#7E57C2] text-lg font-medium uppercase tracking-wide hover:bg-[#7E57C2]/5 transition-colors"
          >
            Refresh
          </button>
        </div>

        <DataTable
          columns={useMemo<TableColumn<AdminUserDto>[]>(() => [
            {
              key: 'username',
              header: 'Username',
              render: (user) => String(user.username ?? '-')
            },
            {
              key: 'fullName',
              header: 'Full Name',
              render: (user) => `${String(user.firstName ?? '')} ${String(user.lastName ?? '')}`.trim() || '-'
            },
            {
              key: 'email',
              header: 'Email',
              render: (user) => String(user.email ?? '-')
            },
            {
              key: 'phoneNumber',
              header: 'Phone',
              render: (user) => String(user.phoneNumber ?? '-')
            },
            {
              key: 'status',
              header: 'Status',
              render: (user) => user.active === false ? 'Inactive' : 'Active'
            },
            {
              key: 'createdDate',
              header: 'Created on',
              render: (user) => String(user.createdDate ?? '-')
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'center',
              render: (user) => (
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(user)}
                    className="h-8 px-3 rounded-lg border border-[#7E57C2]/40 text-[#7E57C2] text-xs font-semibold hover:bg-[#7E57C2]/5"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleToggleStatus(user)}
                    disabled={statusLoadingId === user.id}
                    className={`h-8 px-3 rounded-lg border text-xs font-semibold disabled:opacity-60 ${
                      user.active === false
                        ? 'border-green-200 text-green-700 hover:bg-green-50'
                        : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    {statusLoadingId === user.id ? '...' : user.active === false ? 'Activate' : 'Disable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleResetOtp(user)}
                    disabled={otpResetLoadingId === user.id}
                    className="h-8 px-3 rounded-lg border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-50 disabled:opacity-60"
                    title="Reset OTP secret for this user"
                  >
                    {otpResetLoadingId === user.id ? '...' : 'OTP'}
                  </button>
                </div>
              )
            }
          ], [statusLoadingId, otpResetLoadingId])}
          data={rows}
          rowKey={(user) => String(user.id ?? `${user.username ?? 'user'}-${Math.random()}`)}
          loading={isLoading}
          emptyMessage="No users found"
          emptyIcon="filter_alt_off"
        />
      </section>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsCreateOpen(false)}
            className="absolute inset-0 bg-slate-900/45"
            aria-label="Close create modal"
          />
          <div className="relative w-full max-w-xl bg-white rounded-2xl border border-neutral-light shadow-2xl p-6">
            <h3 className="text-lg font-bold text-dark-text">Create User</h3>
            <p className="text-xs text-neutral-text mt-1">
              Endpoint: <code>/v1/users</code>
            </p>
            <form className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(event) => void handleCreate(event)}>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text">Username</span>
                <input
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">First Name</span>
                <input
                  value={form.firstName}
                  onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">Last Name</span>
                <input
                  value={form.lastName}
                  onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text">Phone Number</span>
                <input
                  value={form.phoneNumber}
                  onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-light text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
                >
                  {isCreating ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isEditOpen && selectedUser ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsEditOpen(false)}
            className="absolute inset-0 bg-slate-900/45"
            aria-label="Close edit modal"
          />
          <div className="relative w-full max-w-xl bg-white rounded-2xl border border-neutral-light shadow-2xl p-6">
            <h3 className="text-lg font-bold text-dark-text">Edit User</h3>
            <p className="text-xs text-neutral-text mt-1">
              Endpoint: <code>/v1/users/{String(selectedUser.id)}</code>
            </p>
            <form className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(event) => void handleUpdate(event)}>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text">Username</span>
                <input
                  value={editForm.username}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, username: event.target.value }))}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">First Name</span>
                <input
                  value={editForm.firstName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">Last Name</span>
                <input
                  value={editForm.lastName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text">Email</span>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text">Phone Number</span>
                <input
                  value={editForm.phoneNumber}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-light text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminUsersPage
