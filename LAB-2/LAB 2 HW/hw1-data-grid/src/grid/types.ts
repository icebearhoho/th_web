export type SortDirection = 'asc' | 'desc'

export interface ColumnDef<T> {
  header: string
  accessorKey: keyof T & string
  sortable?: boolean
}

export interface DataGridProps<T> {
  data: readonly T[]
  columns: readonly ColumnDef<T>[]
  ariaLabel: string
  /** Stable unique id per row. Used as the React key and for selection. Never an array index. */
  getRowId: (row: T) => string
  onRowSelect?: (item: T) => void
  pageSize?: number
}

export interface SortState<T> {
  readonly key: keyof T & string
  readonly direction: SortDirection
}

export interface PaginationState {
  readonly pageIndex: number
  readonly pageSize: number
}

export interface GridState<T> {
  readonly sort: SortState<T> | null
  readonly filter: string
  readonly pagination: PaginationState
}
