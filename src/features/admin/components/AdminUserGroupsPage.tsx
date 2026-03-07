import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { confirmToast } from '../../../lib/confirmToast'
import type { AdminGroupDto } from '../dto/admin-api.dto'
import { createGroup, deleteGroup, getPaginatedGroups, updateGroup } from '../services'
import CRUDLayout, { type CRUDColumn } from '../../shared/components/CRUDLayout'
import CRUDModal from '../../shared/components/CRUDModal'
import { AdminInput, AdminTextarea } from './shared/AdminControls'
import { Users, FileText, Calendar, User, Edit2, Trash2 } from 'lucide-react'

const AdminUserGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<AdminGroupDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<AdminGroupDto | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editForm, setEditForm] = useState({ name: '', description: '' })

  const loadGroups = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await getPaginatedGroups()
      setGroups(Array.isArray(response?.content) ? response.content : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load groups')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadGroups()
  }, [loadGroups])

  const filteredGroups = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return groups.filter(group => 
      (group.name ?? '').toLowerCase().includes(term) ||
      (group.description ?? '').toLowerCase().includes(term)
    )
  }, [groups, searchTerm])

  const openEditModal = (group: AdminGroupDto) => {
    setSelectedGroup(group)
    setEditForm({
      name: String(group.name ?? ''),
      description: String(group.description ?? ''),
    })
    setIsEditOpen(true)
  }

  const handleCreate = async () => {
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

  const handleUpdate = async () => {
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

  const handleDelete = (id: string | number) => {
    confirmToast(`Delete this group?`, () => {
      deleteGroup(id)
        .then(() => {
          toast.success('Group deleted')
          return loadGroups()
        })
        .catch((error: unknown) => {
          toast.error(error instanceof Error ? error.message : 'Failed to delete group')
        })
    })
  }

  const columns: CRUDColumn<AdminGroupDto>[] = [
    {
      key: 'name',
      header: 'Group Name',
      render: (g) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <Users size={18} className="text-slate-600 dark:text-slate-400" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{String(g.name ?? '—')}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (g) => (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <FileText size={14} />
          <span className="text-sm">{String(g.description ?? '—')}</span>
        </div>
      ),
    },
    {
      key: 'createdBy',
      header: 'Created By',
      render: (g) => (
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <User size={12} />
          {String(g.createdBy ?? '—')}
        </div>
      ),
    },
    {
      key: 'createdDate',
      header: 'Created On',
      render: (g) => (
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Calendar size={12} />
          {String(g.createdDate ?? '—')}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Groups</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage user groups and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <Users size={16} className="text-slate-600 dark:text-slate-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">{groups.length} Groups</span>
          </div>
        </div>
      </div>

      <CRUDLayout
        title=""
        columns={columns}
        data={filteredGroups}
        loading={isLoading}
        pageable={{ page: 1, size: filteredGroups.length, totalElements: filteredGroups.length, totalPages: 1 }}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        onSearch={setSearchTerm}
        onRefresh={loadGroups}
        onAdd={() => {
          setName('')
          setDescription('')
          setIsCreateOpen(true)
        }}
        addButtonText="Create Group"
        actions={{
          onEdit: openEditModal,
          onDelete: (item) => handleDelete(item.id!)
        }}
      />

      <CRUDModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create User Group"
        onSubmit={handleCreate}
        isSubmitting={isCreating}
        submitLabel="Create Group"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Group Name</label>
            <AdminInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              placeholder="e.g. Administrators"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Description</label>
            <AdminTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Describe the group's purpose..."
            />
          </div>
        </div>
      </CRUDModal>

      <CRUDModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit User Group"
        onSubmit={handleUpdate}
        isSubmitting={isUpdating}
        submitLabel="Update Group"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Group Name</label>
            <AdminInput
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Description</label>
            <AdminTextarea
              value={editForm.description}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, description: event.target.value }))
              }
              rows={3}
              className="w-full"
            />
          </div>
        </div>
      </CRUDModal>
    </div>
  )
}

export default AdminUserGroupsPage
