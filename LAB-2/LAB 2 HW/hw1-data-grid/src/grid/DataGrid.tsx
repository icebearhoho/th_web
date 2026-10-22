import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react'
import { filterRows, getPageCount, paginateRows, sortRows } from './gridLogic'
import { moveCell } from './gridNavigation'
import type { CellPosition } from './gridNavigation'
import { useDebouncedCallback } from './useDebouncedCallback'
import type { DataGridProps, SortState } from './types'
import './DataGrid.css'

const DEFAULT_PAGE_SIZE = 10
const FILTER_DEBOUNCE_MS = 250

export function DataGrid<T>({
  data,
  columns,
  ariaLabel,
  getRowId,
  onRowSelect,
  pageSize = DEFAULT_PAGE_SIZE,
}: DataGridProps<T>) {
  const uid = useId()
  const captionId = `${uid}-caption`
  const filterId = `${uid}-filter`
  const statusId = `${uid}-status`

  const [sort, setSort] = useState<SortState<T> | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [appliedFilter, setAppliedFilter] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [active, setActive] = useState<CellPosition>({ row: 0, col: 0 })
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())

  const tableRef = useRef<HTMLTableElement>(null)
  const focusAfterRender = useRef(false)

  const filtered = filterRows(data, columns, appliedFilter)
  const sorted = sortRows(filtered, sort)
  const pageCount = getPageCount(sorted.length, pageSize)
  const safePageIndex = Math.min(pageIndex, pageCount - 1)
  const pageRows = paginateRows(sorted, { pageIndex: safePageIndex, pageSize })

  const activeRow = Math.min(active.row, Math.max(pageRows.length - 1, 0))
  const activeCol = Math.min(active.col, columns.length - 1)

  // Move DOM focus to the active cell after a keyboard move (roving tabindex).
  useLayoutEffect(() => {
    if (!focusAfterRender.current) return
    focusAfterRender.current = false
    tableRef.current
      ?.querySelector<HTMLElement>(`td[data-row="${activeRow}"][data-col="${activeCol}"]`)
      ?.focus()
  })

  const applyFilter = useDebouncedCallback((value: string) => {
    setAppliedFilter(value)
    setPageIndex(0)
    setActive({ row: 0, col: 0 })
  }, FILTER_DEBOUNCE_MS)

  function handleFilterChange(event: ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value)
    applyFilter(event.target.value)
  }

  function toggleSort(key: SortState<T>['key']) {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' }
      if (current.direction === 'asc') return { key, direction: 'desc' }
      return null
    })
    setPageIndex(0)
    setActive({ row: 0, col: 0 })
  }

  function goToPage(next: number) {
    if (next < 0 || next >= pageCount) return
    setPageIndex(next)
    setActive({ row: 0, col: 0 })
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // One delegated handler on the grid; the focused cell tells us which row/column was hit.
  function handleGridKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    const cell = (event.target as HTMLElement).closest<HTMLElement>('td[data-row]')
    if (!cell) return
    const row = Number(cell.dataset.row)
    const col = Number(cell.dataset.col)
    const rowData = pageRows[row]

    if (event.key === 'Enter') {
      event.preventDefault()
      onRowSelect?.(rowData)
      return
    }
    if (event.key === ' ') {
      event.preventDefault() // stop the page from scrolling
      toggleSelected(getRowId(rowData))
      return
    }
    const next = moveCell({ row, col }, event.key, { rowCount: pageRows.length, colCount: columns.length }, event.ctrlKey)
    if (next) {
      event.preventDefault()
      focusAfterRender.current = true
      setActive(next)
    }
  }

  function handleGridClick(event: MouseEvent<HTMLTableElement>) {
    const cell = (event.target as HTMLElement).closest<HTMLElement>('td[data-row]')
    if (!cell) return
    const row = Number(cell.dataset.row)
    setActive({ row, col: Number(cell.dataset.col) })
    onRowSelect?.(pageRows[row])
  }

  const first = sorted.length === 0 ? 0 : safePageIndex * pageSize + 1
  const last = Math.min((safePageIndex + 1) * pageSize, sorted.length)
  const sortColumn = columns.find((column) => column.accessorKey === sort?.key)
  const statusText =
    sorted.length === 0
      ? 'No rows match the filter.'
      : `Showing ${first} to ${last} of ${sorted.length} rows. Page ${safePageIndex + 1} of ${pageCount}.` +
        (sortColumn && sort
          ? ` Sorted by ${sortColumn.header}, ${sort.direction === 'asc' ? 'ascending' : 'descending'}.`
          : '') +
        (selectedIds.size > 0 ? ` ${selectedIds.size} selected.` : '')

  return (
    <section className="data-grid">
      <div className="data-grid__toolbar">
        <label htmlFor={filterId} className="data-grid__label">
          Filter rows
        </label>
        <input
          id={filterId}
          type="search"
          className="data-grid__input"
          value={inputValue}
          onChange={handleFilterChange}
          aria-describedby={statusId}
          autoComplete="off"
        />
      </div>

      <div className="data-grid__scroll">
        <table
          ref={tableRef}
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role -- native table needs role="grid" for arrow-key navigation and aria-selected rows
          role="grid"
          aria-labelledby={captionId}
          aria-rowcount={sorted.length + 1}
          className="data-grid__table"
          onKeyDown={handleGridKeyDown}
          onClick={handleGridClick}
        >
          <caption id={captionId} className="data-grid__caption">
            {ariaLabel}
          </caption>
          <thead>
            <tr>
              {columns.map((column) => {
                const direction = sort?.key === column.accessorKey ? sort.direction : null
                const ariaSort = direction === null ? undefined : direction === 'asc' ? 'ascending' : 'descending'
                return (
                  <th key={column.accessorKey} scope="col" aria-sort={ariaSort}>
                    {column.sortable ? (
                      <button type="button" className="data-grid__sort" onClick={() => toggleSort(column.accessorKey)}>
                        {column.header}
                        <span aria-hidden="true" className="data-grid__sort-icon">
                          {direction === null ? '↕' : direction === 'asc' ? '▲' : '▼'}
                        </span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-grid__empty">
                  No rows match the filter.
                </td>
              </tr>
            ) : (
              pageRows.map((row, rowIndex) => {
                const id = getRowId(row)
                const selected = selectedIds.has(id)
                return (
                  <tr key={id} aria-selected={selected} aria-rowindex={safePageIndex * pageSize + rowIndex + 2} className={selected ? 'is-selected' : undefined}>
                    {columns.map((column, colIndex) => (
                      <td
                        key={column.accessorKey}
                        data-row={rowIndex}
                        data-col={colIndex}
                        tabIndex={rowIndex === activeRow && colIndex === activeCol ? 0 : -1}
                      >
                        {String(row[column.accessorKey] ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="data-grid__footer">
        <output id={statusId} aria-live="polite" className="data-grid__status">
          {statusText}
        </output>
        <nav aria-label="Pagination" className="data-grid__pager">
          <button type="button" className="data-grid__button" aria-disabled={safePageIndex === 0} onClick={() => goToPage(safePageIndex - 1)}>
            Previous
          </button>
          <span className="data-grid__page">
            Page {safePageIndex + 1} of {pageCount}
          </span>
          <button type="button" className="data-grid__button" aria-disabled={safePageIndex >= pageCount - 1} onClick={() => goToPage(safePageIndex + 1)}>
            Next
          </button>
        </nav>
      </div>
    </section>
  )
}