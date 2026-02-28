import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { confirmToast } from '../../../lib/confirmToast'
import type { AdminGroupDto } from '../dto/admin-api.dto'
import { createGroup, deleteGroup, getAllGroups, updateGroup } from '../services'
import { DataTable, type TableColumn } from '../../../components/ui/DataTable'

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
      await createGroup({ name: trimmedName, description: description.trim() })
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

  const handleDelete = (group: AdminGroupDto) => {
    if (!group.id) {
      toast.error('Group ID is missing')
      return
    }
    confirmToast(`Delete group "${String(group.name ?? group.id)}"?`, () => {
      setIsDeletingId(group.id!)
      deleteGroup(group.id!)
        .then(() => {
          toast.success('Group deleted')
          return loadGroups()
        })
        .catch((error: unknown) => {
          toast.error(error instanceof Error ? error.message : 'Failed to delete group')
        })
        .finally(() => {
          setIsDeletingId(null)
        })
    })
  }

  const columns = useMemo<TableColumn<AdminGroupDto>[]>(() => [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortValue: (g) => String(g.name ?? ''),
      filterValue: (g) => String(g.name ?? ''),
      render: (g) => <span className="font-semibold text-dark-text text-sm">{String(g.name ?? '—')}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      filterValue: (g) => String(g.description ?? ''),
      render: (g) => <span className="text-sm text-neutral-text">{String(g.description ?? '—')}</span>,
    },
    {
      key: 'createdBy',
      header: 'Created By',
      render: (g) => <span className="text-sm text-neutral-text">{String(g.createdBy ?? '—')}</span>,
    },
    {
      key: 'createdDate',
      header: 'Created On',
      sortable: true,
      sortValue: (g) => String(g.createdDate ?? ''),
      render: (g) => <span className="text-sm text-neutral-text">{String(g.createdDate ?? '—')}</span>,
    },
    {
      key: 'lastModifiedBy',
      header: 'Last Modified By',
      render: (g) => <span className="text-sm text-neutral-text">{String(g.lastModifiedBy ?? '—')}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (g) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => openEditModal(g)}
            className="h-8 px-3 rounded-lg border border-primary/40 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(g)}
            disabled={isDeletingId === g.id}
            className="h-8 px-3 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-60 transition-colors"
          >
            {isDeletingId === g.id ? '...' : 'Delete'}
          </button>
        </div>
      ),
    },
  ], [isDeletingId])

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-dark-text">User Groups</h2>
        <p className="text-sm text-neutral-text mt-1">Manage user groups and permissions</p>
      </div>

      <DataTable
        columns={columns}
        data={groups}
        rowKey={(g) => String(g.id ?? `${String(g.name ?? 'group')}-${Math.random()}`)}
        loading={isLoading}
        emptyMessage="No groups found"
        emptyIcon="group"
        filterable
        filterPlaceholder="Search groups..."
        header={
          <div className="px-5 py-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="h-8 px-4 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              + Create Group
            </button>
            <button
              type="button"
              onClick={() => void loadGroups()}
              className="h-8 px-4 rounded-lg border border-neutral-light text-neutral-text text-xs font-semibold hover:bg-neutral-light/50 transition-colors"
            >
              Refresh
            </button>
          </div>
        }
      />

      {isCreateOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsCreateOpen(false)}
            className="absolute inset-0 bg-slate-900/45"
            aria-label="Close create modal"
          />
          <div className="relative w-full max-w-lg bg-white rounded-xl border border-neutral-light shadow-2xl p-6">
            <h3 className="text-lg font-bold text-dark-text">Create Group</h3>
            <form className="mt-5 space-y-4" onSubmit={(event) => void handleCreate(event)}>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full h-10 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Description</span>
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
                  {isCreating ? 'Creating...' : 'Create'}
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
          <div className="relative w-full max-w-lg bg-white rounded-xl border border-neutral-light shadow-2xl p-6">
            <h3 className="text-lg font-bold text-dark-text">Edit Group</h3>
            <form className="mt-5 space-y-4" onSubmit={(event) => void handleUpdate(event)}>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Name</span>
                <input
                  value={editForm.name}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full h-10 rounded-lg border border-neutral-light px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Description</span>
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
