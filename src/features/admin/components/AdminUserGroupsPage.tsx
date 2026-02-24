import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { AdminGroupDto } from '../dto/admin-api.dto'
import { createGroup, getAllGroups } from '../services'

const AdminUserGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<AdminGroupDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const loadGroups = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await getAllGroups()
      setGroups(Array.isArray(response) ? response : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load groups')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadGroups()
  }, [loadGroups])

  const rows = useMemo(() => groups, [groups])

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error('Group name is required')
      return
    }

    try {
      setIsCreating(true)
      await createGroup({
        name: trimmedName,
        description: description.trim(),
      })
      toast.success('Group created')
      setName('')
      setDescription('')
      setIsCreateOpen(false)
      await loadGroups()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create group')
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
        <p className="text-sm text-neutral-text mt-8">Groups List</p>
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
            onClick={() => void loadGroups()}
            className="px-4 py-2 rounded border border-[#7E57C2] text-[#7E57C2] text-lg font-medium uppercase tracking-wide hover:bg-[#7E57C2]/5 transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="border border-neutral-light rounded overflow-hidden bg-white">
          <div className="bg-[#7E57C2] text-white border-b border-neutral-light">
            <div className="grid grid-cols-5">
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Name</div>
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Created By</div>
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Last Modified By</div>
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Created on</div>
              <div className="px-4 py-3 text-sm font-semibold">Last Modified on</div>
            </div>
          </div>
          <div className="min-h-[260px] bg-white">
            {isLoading ? (
              <div className="p-8 text-center text-neutral-text">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="p-8 text-center text-neutral-text">No groups found</div>
            ) : (
              rows.map((group, index) => (
                <div
                  key={String(group.id ?? `${group.name ?? 'group'}-${index}`)}
                  className="grid grid-cols-5 border-t border-neutral-light hover:bg-neutral-light/40 transition-colors"
                >
                  <div className="px-4 py-3 text-sm text-dark-text">{String(group.name ?? '-')}</div>
                  <div className="px-4 py-3 text-sm text-dark-text">{String(group.createdBy ?? '-')}</div>
                  <div className="px-4 py-3 text-sm text-dark-text">{String(group.lastModifiedBy ?? '-')}</div>
                  <div className="px-4 py-3 text-sm text-dark-text">{String(group.createdDate ?? '-')}</div>
                  <div className="px-4 py-3 text-sm text-dark-text">{String(group.lastModifiedDate ?? '-')}</div>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-3 border-t border-neutral-light text-right text-sm text-neutral-text">
            1 - {rows.length} of {rows.length} Groups
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
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-neutral-light shadow-2xl p-6">
            <h3 className="text-lg font-bold text-dark-text">Create Group</h3>
            <p className="text-xs text-neutral-text mt-1">
              Endpoint: <code>/v1/groups</code>
            </p>
            <form className="mt-5 space-y-4" onSubmit={(event) => void handleCreate(event)}>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-neutral-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
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

export default AdminUserGroupsPage
