import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { AdminGroupDto } from '../dto/admin-api.dto'
import { createGroup, deleteGroup, getAllGroups, updateGroup } from '../services'

const AdminUserGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<AdminGroupDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | number | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<AdminGroupDto | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editForm, setEditForm] = useState({ name: '', description: '' })

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

  const openEditModal = (group: AdminGroupDto) => {
    setSelectedGroup(group)
    setEditForm({
      name: String(group.name ?? ''),
      description: String(group.description ?? ''),
    })
    setIsEditOpen(true)
  }

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

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedGroup?.id) {
      toast.error('Group ID is missing')
      return
    }

    const trimmedName = editForm.name.trim()
    if (!trimmedName) {
      toast.error('Group name is required')
      return
    }

    try {
      setIsUpdating(true)
      await updateGroup({
        ...selectedGroup,
        id: selectedGroup.id,
        name: trimmedName,
        description: editForm.description.trim(),
      })
      toast.success('Group updated')
      setIsEditOpen(false)
      setSelectedGroup(null)
      await loadGroups()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update group')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (group: AdminGroupDto) => {
    if (!group.id) {
      toast.error('Group ID is missing')
      return
    }

    const shouldDelete = window.confirm(`Delete group "${String(group.name ?? group.id)}"?`)
    if (!shouldDelete) return

    try {
      setIsDeletingId(group.id)
      await deleteGroup(group.id)
      toast.success('Group deleted')
      await loadGroups()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete group')
    } finally {
      setIsDeletingId(null)
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
            <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_1fr_148px]">
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Name</div>
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Created By</div>
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Last Modified By</div>
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Created on</div>
              <div className="px-4 py-3 text-sm font-semibold border-r border-white/20">Last Modified on</div>
              <div className="px-4 py-3 text-sm font-semibold text-center">Actions</div>
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
                  className="grid grid-cols-[1.1fr_1fr_1fr_1fr_1fr_148px] border-t border-neutral-light hover:bg-neutral-light/40 transition-colors"
                >
                  <div className="px-4 py-3 text-sm text-dark-text">{String(group.name ?? '-')}</div>
                  <div className="px-4 py-3 text-sm text-dark-text">{String(group.createdBy ?? '-')}</div>
                  <div className="px-4 py-3 text-sm text-dark-text">{String(group.lastModifiedBy ?? '-')}</div>
                  <div className="px-4 py-3 text-sm text-dark-text">{String(group.createdDate ?? '-')}</div>
                  <div className="px-4 py-3 text-sm text-dark-text">{String(group.lastModifiedDate ?? '-')}</div>
                  <div className="px-2 py-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(group)}
                      className="h-8 px-3 rounded-lg border border-[#7E57C2]/40 text-[#7E57C2] text-xs font-semibold hover:bg-[#7E57C2]/5"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(group)}
                      disabled={isDeletingId === group.id}
                      className="h-8 px-3 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-60"
                    >
                      {isDeletingId === group.id ? '...' : 'Delete'}
                    </button>
                  </div>
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

      {isEditOpen && selectedGroup ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsEditOpen(false)}
            className="absolute inset-0 bg-slate-900/45"
            aria-label="Close edit modal"
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-neutral-light shadow-2xl p-6">
            <h3 className="text-lg font-bold text-dark-text">Edit Group</h3>
            <p className="text-xs text-neutral-text mt-1">
              Endpoint: <code>/v1/groups/{String(selectedGroup.id)}</code>
            </p>
            <form className="mt-5 space-y-4" onSubmit={(event) => void handleUpdate(event)}>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">Name</span>
                <input
                  value={editForm.name}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full h-11 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text">Description</span>
                <textarea
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-neutral-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
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

export default AdminUserGroupsPage
