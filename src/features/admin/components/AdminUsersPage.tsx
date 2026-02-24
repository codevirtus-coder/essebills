import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { AdminUserDto } from '../dto/admin-api.dto'
import { createUser, getPaginatedUsers } from '../services'

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({
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

        <div className="border border-neutral-light rounded overflow-hidden bg-white">
          <div className="bg-[#7E57C2] text-white border-b border-neutral-light">
            <div className="grid grid-cols-6">
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Username</div>
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Full Name</div>
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Email</div>
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Phone</div>
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Status</div>
              <div className="px-4 py-3 text-sm font-semibold">Created on</div>
            </div>
          </div>
          <div className="min-h-[260px] bg-white">
            {isLoading ? (
              <div className="p-8 text-center text-neutral-text">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="p-8 text-center text-neutral-text">No users found</div>
            ) : (
              rows.map((user, index) => (
                <div
                  key={String(user.id ?? `${user.username ?? 'user'}-${index}`)}
                  className="grid grid-cols-6 border-t border-neutral-light hover:bg-neutral-light/40 transition-colors"
                >
                  <div className="px-4 py-3 text-sm text-dark-text">{String(user.username ?? '-')}</div>
                  <div className="px-4 py-3 text-sm text-dark-text">
                    {`${String(user.firstName ?? '')} ${String(user.lastName ?? '')}`.trim() || '-'}
                  </div>
                  <div className="px-4 py-3 text-sm text-dark-text truncate">{String(user.email ?? '-')}</div>
                  <div className="px-4 py-3 text-sm text-dark-text">{String(user.phoneNumber ?? '-')}</div>
                  <div className="px-4 py-3 text-sm text-dark-text">{user.active === false ? 'Inactive' : 'Active'}</div>
                  <div className="px-4 py-3 text-sm text-dark-text">{String(user.createdDate ?? '-')}</div>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-3 border-t border-neutral-light text-right text-sm text-neutral-text">
            1 - {rows.length} of {rows.length} Users
          </div>
        </div>
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
    </div>
  )
}

export default AdminUsersPage
