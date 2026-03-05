import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { Icon } from './Icon';

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T, index: number) => React.ReactNode;
  /** Enable sorting on this column */
  sortable?: boolean;
  /** Return the primitive value used for sorting (defaults to no sort if omitted) */
  sortValue?: (row: T) => string | number;
  /** Return a string used for global text filtering */
  filterValue?: (row: T) => string;
}

export interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  className?: string;
  /** Optional content rendered above the table, inside the container (with a bottom border) */
  header?: React.ReactNode;
  /** Number of skeleton rows to show when `loading` is true */
  skeletonRows?: number;
  /** Table layout: `auto` or `fixed` to keep column sizing consistent */
  tableLayout?: 'auto' | 'fixed';
  /** Optional accessible label for the table */
  ariaLabel?: string;
  /** Enable client-side pagination */
  pagination?: {
    pageSize?: number;
    pageSizeOptions?: number[];
  };
  /** Show a global text filter / search bar above the table */
  filterable?: boolean;
  /** Placeholder for the filter input */
  filterPlaceholder?: string;
}

type SortState = { key: string; dir: 'asc' | 'desc' };

const DEFAULT_SKELETON_ROWS = 5;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function alignClass(align?: string): string {
  if (align === 'right') return 'text-right';
  if (align === 'center') return 'text-center';
  return '';
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon = 'inbox',
  className = '',
  header,
  skeletonRows = DEFAULT_SKELETON_ROWS,
  tableLayout = 'auto',
  ariaLabel,
  pagination,
  filterable = false,
  filterPlaceholder = 'Search...',
}: DataTableProps<T>) {
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE;
  const pageSizeOptions = pagination?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;
  const [activePageSize, setActivePageSize] = useState(pageSize);

  const handleSort = (col: TableColumn<T>) => {
    if (!col.sortable && !col.sortValue) return;
    setSortState((prev) => {
      if (prev?.key !== col.key) return { key: col.key, dir: 'asc' };
      if (prev.dir === 'asc') return { key: col.key, dir: 'desc' };
      return null; // third click clears
    });
    setCurrentPage(0);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
    setCurrentPage(0);
  };

  const processedData = useMemo(() => {
    let result = data;

    // Global text filter
    if (filterable && filterText.trim()) {
      const lower = filterText.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = col.filterValue ? col.filterValue(row) : '';
          return String(val).toLowerCase().includes(lower);
        })
      );
    }

    // Sort
    if (sortState) {
      const col = columns.find((c) => c.key === sortState.key);
      if (col?.sortValue) {
        result = [...result].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          const cmp = av < bv ? -1 : av > bv ? 1 : 0;
          return sortState.dir === 'asc' ? cmp : -cmp;
        });
      }
    }

    return result;
  }, [data, filterText, sortState, filterable, columns]);

  const totalPages = pagination ? Math.ceil(processedData.length / activePageSize) : 1;
  const paginatedData = pagination
    ? processedData.slice(currentPage * activePageSize, (currentPage + 1) * activePageSize)
    : processedData;

  const SortIcon = ({ col }: { col: TableColumn<T> }) => {
    if (!col.sortable && !col.sortValue) return null;
    if (sortState?.key !== col.key) return <ArrowUpDown size={12} className="opacity-40 shrink-0" />;
    return sortState.dir === 'asc'
      ? <ArrowUp size={12} className="text-primary shrink-0" />
      : <ArrowDown size={12} className="text-primary shrink-0" />;
  };

  return (
    <div className={`data-table bg-white border border-neutral-light overflow-hidden rounded-xl shadow-sm ${className}`}>
      {header && (
        <div className="border-b border-neutral-light dark:border-white/5">
          {header}
        </div>
      )}

      {filterable && (
        <div className="px-4 py-3 border-b border-neutral-light dark:border-white/5 bg-neutral-light/10">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text/50 pointer-events-none" />
            <input
              type="text"
              value={filterText}
              onChange={handleFilterChange}
              placeholder={filterPlaceholder}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-neutral-light bg-white text-sm font-semibold text-dark-text placeholder:text-neutral-text/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table
          className="w-full text-left"
          aria-label={ariaLabel}
          role="table"
          style={{ tableLayout }}
        >
          <thead>
            <tr className="bg-primary/5 border-b border-neutral-light">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  role="columnheader"
                  onClick={() => handleSort(col)}
                  className={`px-5 py-3.5 text-[11px] font-bold text-neutral-text uppercase tracking-wider select-none ${alignClass(col.align)} ${
                    col.sortable || col.sortValue ? 'cursor-pointer hover:text-dark-text transition-colors' : ''
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-light">
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse" role="row">
                  {columns.map((col) => (
                    <td key={col.key} role="cell" className="px-5 py-3.5">
                      <div className="h-4 bg-neutral-light/50 dark:bg-white/10 rounded-lg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center gap-3 py-16 text-neutral-text">
                    <Icon name={emptyIcon} size={40} className="opacity-30" />
                    <p className="text-xs font-bold uppercase tracking-widest">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={rowKey(row)}
                  role="row"
                  className="hover:bg-primary/5 transition-colors group focus-within:outline-none"
                >
                  {columns.map((col) => (
                    <td key={col.key} role="cell" className={`px-5 py-4 text-[15px] text-dark-text font-semibold ${alignClass(col.align)}`}>
                      {col.render(row, currentPage * activePageSize + index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && !loading && processedData.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-light bg-neutral-light/10">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-neutral-text font-medium">
              {processedData.length === 0
                ? '0 results'
                : `${currentPage * activePageSize + 1}–${Math.min((currentPage + 1) * activePageSize, processedData.length)} of ${processedData.length}`}
            </span>
            {pageSizeOptions.length > 1 && (
              <select
                value={activePageSize}
                onChange={(e) => {
                  setActivePageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="h-7 text-[11px] font-medium rounded border border-neutral-light bg-white px-2 text-neutral-text focus:outline-none"
              >
                {pageSizeOptions.map((s) => (
                  <option key={s} value={s}>{s} / page</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="w-7 h-7 rounded flex items-center justify-center text-neutral-text hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i)
              .filter((i) => Math.abs(i - currentPage) <= 2)
              .map((i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-7 h-7 rounded text-[11px] font-bold transition-colors ${
                    i === currentPage
                      ? 'bg-primary text-white'
                      : 'text-neutral-text hover:bg-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="w-7 h-7 rounded flex items-center justify-center text-neutral-text hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
