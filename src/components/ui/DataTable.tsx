import React from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T, index: number) => React.ReactNode;
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
}

const DEFAULT_SKELETON_ROWS = 5;

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
}: DataTableProps<T>) {
  return (
    <div
      className={`bg-white rounded-[2rem] shadow-sm border border-neutral-light dark:border-white/5 overflow-hidden ${className}`}
    >
      {header && (
        <div className="border-b border-neutral-light dark:border-white/5">
          {header}
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
            <tr className="bg-neutral-light/20 dark:bg-white/5 border-b border-neutral-light dark:border-white/5">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  role="columnheader"
                  className={`px-8 py-5 text-[10px] font-black text-neutral-text uppercase tracking-widest ${alignClass(col.align)}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-light dark:divide-white/5">
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse" role="row">
                  {columns.map((col) => (
                    <td key={col.key} role="cell" className="px-8 py-5">
                      <div className="h-4 bg-neutral-light/50 dark:bg-white/10 rounded-lg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center gap-3 py-16 text-neutral-text">
                    <span className="material-symbols-outlined text-5xl opacity-30">
                      {emptyIcon}
                    </span>
                    <p className="text-xs font-bold uppercase tracking-widest">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={rowKey(row)}
                  role="row"
                  className="hover:bg-neutral-light/10 dark:hover:bg-white/5 transition-colors group"
                >
                  {columns.map((col) => (
                    <td key={col.key} role="cell" className={`px-8 py-5 ${alignClass(col.align)}`}>
                      {col.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
