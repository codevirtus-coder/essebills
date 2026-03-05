import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { confirmToast } from '../../../lib/confirmToast'
import type { AdminGroupDto } from '../dto/admin-api.dto'
import { createGroup, deleteGroup, getAllGroups, updateGroup } from '../services'
import { DataTable, type TableColumn } from '../../../components/ui/DataTable'
import { AdminTableLayout } from './shared/AdminTableLayout'
import {
  AdminCreateButton,
  AdminIconDeleteButton,
  AdminIconEditButton,
  AdminInput,
  AdminPrimaryButton,
  AdminRefreshButton,
  AdminTextarea,
} from './shared/AdminControls'

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
          <AdminIconEditButton onClick={() => openEditModal(g)} />
          <AdminIconDeleteButton onClick={() => handleDelete(g)} disabled={isDeletingId === g.id} />
        </div>
      ),
    },
  ], [isDeletingId])

  return (
    <>
      <AdminTableLayout
        title="User Groups"
        subtitle="Manage user groups and permissions"
        toolbar={
          <>
            <AdminCreateButton onClick={() => setIsCreateOpen(true)}>+ Create Group</AdminCreateButton>
            <AdminRefreshButton onClick={() => void loadGroups()}>Refresh</AdminRefreshButton>
          </>
        }
      >
        <DataTable
          columns={columns}
          data={groups}
          rowKey={(g) => String(g.id ?? `${String(g.name ?? 'group')}-${Math.random()}`)}
          loading={isLoading}
          emptyMessage="No groups found"
          emptyIcon="group"
          filterable
          filterPlaceholder="Search groups..."
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
          <div className="relative w-full max-w-lg bg-white rounded-xl border border-neutral-light shadow-2xl p-6">
            <h3 className="text-lg font-bold text-dark-text">Create Group</h3>
            <form className="mt-5 space-y-4" onSubmit={(event) => void handleCreate(event)}>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Name</span>
                <AdminInput
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Description</span>
                <AdminTextarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <AdminRefreshButton onClick={() => setIsCreateOpen(false)}>Cancel</AdminRefreshButton>
                <AdminPrimaryButton type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create'}
                </AdminPrimaryButton>
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
                <AdminInput
                  value={editForm.name}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-neutral-text uppercase tracking-wider">Description</span>
                <AdminTextarea
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  rows={3}
                  className="mt-1"
                />
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
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

export default AdminUserGroupsPage
