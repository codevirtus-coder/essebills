import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { confirmToast } from '../../../lib/confirmToast'
import { DataTable, TableColumn } from '../../../components/ui/DataTable'
import type { AdminUserDto } from '../dto/admin-api.dto'
import { changeUserActivationStatus, createUser, getPaginatedUsers, resetUserOtp, updateUser } from '../services'
import { AdminTableLayout } from './shared/AdminTableLayout'
import {
  AdminCreateButton,
  AdminIconActivateButton,
  AdminIconDisableButton,
  AdminIconEditButton,
  AdminIconOtpButton,
  AdminInput,
  AdminPrimaryButton,
  AdminRefreshButton,
} from './shared/AdminControls'

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

  const handleResetOtp = (user: AdminUserDto) => {
    if (!user.id) {
      toast.error('User ID is missing')
      return
    }
    confirmToast(`Reset OTP for ${String(user.username ?? user.email)}? A new OTP secret will be generated.`, () => {
      setOtpResetLoadingId(user.id!)
      resetUserOtp(user.id!)
        .then(() => {
          toast.success('OTP reset successfully')
        })
        .catch((error: unknown) => {
          toast.error(error instanceof Error ? error.message : 'Failed to reset OTP')
        })
        .finally(() => {
          setOtpResetLoadingId(null)
        })
    })
  }

  return (
    <>
      <AdminTableLayout
        title="User Management"
        subtitle="Users List"
        toolbar={
          <>
            <AdminCreateButton onClick={() => setIsCreateOpen(true)}>+ Create</AdminCreateButton>
            <AdminRefreshButton onClick={() => void loadUsers()}>Refresh</AdminRefreshButton>
          </>
        }
      >
        <DataTable
          columns={useMemo<TableColumn<AdminUserDto>[]>(() => [
            {
              key: 'username',
              header: 'Username',
              render: (user) => String(user.username ?? '-'),
            },
            {
              key: 'fullName',
              header: 'Full Name',
              render: (user) => `${String(user.firstName ?? '')} ${String(user.lastName ?? '')}`.trim() || '-',
            },
            {
              key: 'email',
              header: 'Email',
              render: (user) => String(user.email ?? '-'),
            },
            {
              key: 'phoneNumber',
              header: 'Phone',
              render: (user) => String(user.phoneNumber ?? '-'),
            },
            {
              key: 'status',
              header: 'Status',
              render: (user) => (user.active === false ? 'Inactive' : 'Active'),
            },
            {
              key: 'createdDate',
              header: 'Created on',
              render: (user) => String(user.createdDate ?? '-'),
            },
            {
              key: 'actions',
              header: 'Actions',
              align: 'center',
              render: (user) => (
                <div className="flex items-center justify-center gap-1">
                  <AdminIconEditButton onClick={() => openEditModal(user)} />
                  {user.active === false ? (
                    <AdminIconActivateButton
                      onClick={() => void handleToggleStatus(user)}
                      disabled={statusLoadingId === user.id}
                      title={statusLoadingId === user.id ? 'Processing...' : 'Activate'}
                    />
                  ) : (
                    <AdminIconDisableButton
                      onClick={() => void handleToggleStatus(user)}
                      disabled={statusLoadingId === user.id}
                      title={statusLoadingId === user.id ? 'Processing...' : 'Disable'}
                    />
                  )}
                  <AdminIconOtpButton
                    onClick={() => void handleResetOtp(user)}
                    disabled={otpResetLoadingId === user.id}
                    title="Reset OTP secret for this user"
                  />
                </div>
              ),
            },
          ], [statusLoadingId, otpResetLoadingId])}
          data={rows}
          rowKey={(user) => String(user.id ?? `${user.username ?? 'user'}-${Math.random()}`)}
          loading={isLoading}
          emptyMessage="No users found"
          emptyIcon="filter_alt_off"
        />
      </AdminTableLayout>

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
            <form className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(event) => void handleCreate(event)}>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text">Username</span>
                <AdminInput
                  value={form.username}
                  onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                  className="mt-1"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">First Name</span>
                <AdminInput
                  value={form.firstName}
                  onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  className="mt-1"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">Last Name</span>
                <AdminInput
                  value={form.lastName}
                  onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  className="mt-1"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text">Email</span>
                <AdminInput
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-1"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text">Phone Number</span>
                <AdminInput
                  value={form.phoneNumber}
                  onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                  className="mt-1"
                />
              </label>
              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                <AdminRefreshButton onClick={() => setIsCreateOpen(false)}>Cancel</AdminRefreshButton>
                <AdminPrimaryButton type="submit" disabled={isCreating}>
                  {isCreating ? 'Submitting...' : 'Submit'}
                </AdminPrimaryButton>
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
            <form className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(event) => void handleUpdate(event)}>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text">Username</span>
                <AdminInput
                  value={editForm.username}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, username: event.target.value }))}
                  className="mt-1"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">First Name</span>
                <AdminInput
                  value={editForm.firstName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  className="mt-1"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">Last Name</span>
                <AdminInput
                  value={editForm.lastName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  className="mt-1"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text">Email</span>
                <AdminInput
                  type="email"
                  value={editForm.email}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-1"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs font-semibold text-neutral-text">Phone Number</span>
                <AdminInput
                  value={editForm.phoneNumber}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                  className="mt-1"
                />
              </label>
              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                <AdminRefreshButton onClick={() => setIsEditOpen(false)}>Cancel</AdminRefreshButton>
                <AdminPrimaryButton type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save'}
                </AdminPrimaryButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default AdminUsersPage
