import { useState, useCallback } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  Filter
} from 'lucide-react';

export interface CRUDColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface CRUDActions<T> {
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  canEdit?: (item: T) => boolean;
  canDelete?: (item: T) => boolean;
  /** Render extra action buttons/menus alongside (or instead of) the standard edit/delete buttons. */
  renderCustom?: (item: T) => React.ReactNode;
}

export interface PageableState {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

interface CRUDLayoutProps<T> {
  title: string;
  columns: CRUDColumn<T>[];
  data: T[];
  loading: boolean;
  pageable: PageableState;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  onSearch?: (search: string) => void;
  onRefresh?: () => void;
  actions?: CRUDActions<T>;
  onAdd?: () => void;
  addButtonText?: string;
  children?: React.ReactNode;
  searchable?: boolean;
  filterComponent?: React.ReactNode;
  sortState?: SortState | null;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}

export default function CRUDLayout<T extends { uid?: string; id?: number }>({
  title,
  columns,
  data,
  loading,
  pageable,
  onPageChange,
  onSizeChange,
  onSearch,
  onRefresh,
  actions,
  onAdd,
  addButtonText = 'Add New',
  children,
  searchable = true,
  filterComponent,
  sortState,
  onSort,
}: CRUDLayoutProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (column: string) => {
    if (!onSort) return;
    if (sortState?.column === column) {
      onSort(column, sortState.direction === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(column, 'asc');
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortState?.column !== column) return <ChevronsUpDown className="w-3 h-3 ml-1 inline-block text-slate-400" />;
    if (sortState.direction === 'asc') return <ChevronUp className="w-3 h-3 ml-1 inline-block text-emerald-600" />;
    return <ChevronDown className="w-3 h-3 ml-1 inline-block text-emerald-600" />;
  };

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  }, [searchQuery, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const pageNumbers = [];
  const hasActions = Boolean(actions?.onEdit || actions?.onDelete || actions?.onView || actions?.renderCustom);
  const maxVisiblePages = 5;
  let startPage = Math.max(1, pageable.page - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(pageable.totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Refresh"
            >
              <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>{addButtonText}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && onSearch && (
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </form>
          )}
          
          {filterComponent && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500/50 dark:text-emerald-400' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          )}
        </div>
        
        {showFilters && filterComponent && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            {filterComponent}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider ${
                      column.className || ''
                    }`}
                  >
                    {column.sortable && onSort ? (
                      <button
                        onClick={() => handleSort(String(column.key))}
                        className="flex items-center gap-0.5 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                      >
                        {column.header}
                        <SortIcon column={String(column.key)} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
                {hasActions && (
                  <th className="sticky right-0 z-[70] border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Loading...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-6 py-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400">No data found</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.uid || item.id || index} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={`px-6 py-4 text-sm text-slate-700 dark:text-slate-300 ${
                          column.className || ''
                        }`}
                      >
                        {column.render 
                          ? column.render(item) 
                          : String(item[column.key as keyof T] ?? '')}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="sticky right-0 z-[70] border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 text-right group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50">
                        <div className="flex items-center justify-end gap-2">
                          {actions?.onView && (
                            <button
                              onClick={() => actions.onView?.(item)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="View"
                              aria-label="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {actions?.onEdit && (!actions.canEdit || actions.canEdit(item)) && (
                            <button
                              onClick={() => actions.onEdit?.(item)}
                              className="p-1 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {actions?.onDelete && (!actions.canDelete || actions.canDelete(item)) && (
                            <button
                              onClick={() => actions.onDelete?.(item)}
                              className="p-1 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {actions?.renderCustom?.(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageable.totalPages > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>Show</span>
              <select
                value={pageable.size}
                onChange={(e) => onSizeChange(Number(e.target.value))}
                className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>of {pageable.totalElements} entries</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(pageable.page - 1)}
                disabled={pageable.page <= 1}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {startPage > 1 && (
                <>
                  <button
                    onClick={() => onPageChange(1)}
                    className="px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    1
                  </button>
                  {startPage > 2 && <span className="dark:text-slate-500">...</span>}
                </>
              )}
              
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    pageable.page === page
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {endPage < pageable.totalPages && (
                <>
                  {endPage < pageable.totalPages - 1 && <span className="dark:text-slate-500">...</span>}
                  <button
                    onClick={() => onPageChange(pageable.totalPages)}
                    className="px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300"
                  >
                    {pageable.totalPages}
                  </button>
                </>
              )}
              
              <button
                onClick={() => onPageChange(pageable.page + 1)}
                disabled={pageable.page >= pageable.totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Content */}
      {children}
    </div>
  );
}
