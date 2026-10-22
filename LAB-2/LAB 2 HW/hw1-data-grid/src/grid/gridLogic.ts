import type { ColumnDef, PaginationState, SortState } from './types'

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/** Lower-case and strip diacritics so "ha noi" matches "Hà Nội" and "dang" matches "Đặng". */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLocaleLowerCase()
}

function isMissing(value: unknown): boolean {
  return value === null || value === undefined || value === ''
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return collator.compare(String(a), String(b))
}

export function filterRows<T>(
  rows: readonly T[],
  columns: readonly ColumnDef<T>[],
  query: string,
): T[] {
  const needle = normalize(query.trim())
  if (needle === '') return [...rows]
  return rows.filter((row) =>
    columns.some((column) => {
      const value: unknown = row[column.accessorKey]
      return !isMissing(value) && normalize(String(value)).includes(needle)
    }),
  )
}

export function sortRows<T>(rows: readonly T[], sort: SortState<T> | null): T[] {
  const copy = [...rows]
  if (sort === null) return copy
  const factor = sort.direction === 'asc' ? 1 : -1
  // Array.prototype.sort is stable (ES2019), so equal values keep their original order.
  return copy.sort((rowA, rowB) => {
    const a: unknown = rowA[sort.key]
    const b: unknown = rowB[sort.key]
    const aMissing = isMissing(a)
    const bMissing = isMissing(b)
    if (aMissing || bMissing) {
      // Missing values go last whichever direction is active.
      return aMissing === bMissing ? 0 : aMissing ? 1 : -1
    }
    return factor * compareValues(a, b)
  })
}

export function getPageCount(totalRows: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalRows / pageSize))
}

export function paginateRows<T>(rows: readonly T[], pagination: PaginationState): T[] {
  const { pageSize } = pagination
  const lastPage = getPageCount(rows.length, pageSize) - 1
  const pageIndex = Math.min(Math.max(pagination.pageIndex, 0), lastPage)
  return rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
}
