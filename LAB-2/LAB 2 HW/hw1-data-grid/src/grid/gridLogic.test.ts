import { describe, expect, it } from 'vitest'
import { filterRows, getPageCount, paginateRows, sortRows } from './gridLogic'
import type { ColumnDef } from './types'

interface Person {
  id: string
  name: string
  age: number | null
  city: string
}

const people: readonly Person[] = [
  { id: 'a', name: 'Nguyễn An', age: 30, city: 'Hà Nội' },
  { id: 'b', name: 'Đặng Bình', age: 25, city: 'Đà Nẵng' },
  { id: 'c', name: 'Trần Chi', age: null, city: 'Huế' },
  { id: 'd', name: 'Lê Dũng', age: 25, city: 'Hà Nội' },
]

const columns: readonly ColumnDef<Person>[] = [
  { header: 'Name', accessorKey: 'name', sortable: true },
  { header: 'Age', accessorKey: 'age', sortable: true },
  { header: 'City', accessorKey: 'city' },
]

const ids = (rows: readonly Person[]) => rows.map((r) => r.id)

describe('filterRows', () => {
  it('returns every row for an empty or whitespace query', () => {
    expect(ids(filterRows(people, columns, ''))).toEqual(['a', 'b', 'c', 'd'])
    expect(ids(filterRows(people, columns, '   '))).toEqual(['a', 'b', 'c', 'd'])
  })

  it('matches case-insensitively in any column', () => {
    expect(ids(filterRows(people, columns, 'hà nội'))).toEqual(['a', 'd'])
  })

  it('ignores Vietnamese diacritics, including đ', () => {
    expect(ids(filterRows(people, columns, 'ha noi'))).toEqual(['a', 'd'])
    expect(ids(filterRows(people, columns, 'dang'))).toEqual(['b'])
  })

  it('matches numeric cells as text and never matches the literal "null"', () => {
    expect(ids(filterRows(people, columns, '25'))).toEqual(['b', 'd'])
    expect(ids(filterRows(people, columns, 'null'))).toEqual([])
  })

  it('does not mutate the input', () => {
    const copy = [...people]
    filterRows(people, columns, 'a')
    expect(people).toEqual(copy)
  })
})

describe('sortRows', () => {
  it('returns the same order when sort is null', () => {
    expect(ids(sortRows(people, null))).toEqual(['a', 'b', 'c', 'd'])
  })

  it('sorts text ascending and descending (locale aware)', () => {
    expect(ids(sortRows(people, { key: 'name', direction: 'asc' }))).toEqual(['b', 'd', 'a', 'c'])
    expect(ids(sortRows(people, { key: 'name', direction: 'desc' }))).toEqual(['c', 'a', 'd', 'b'])
  })

  it('sorts numbers numerically and keeps null last in both directions', () => {
    expect(ids(sortRows(people, { key: 'age', direction: 'asc' }))).toEqual(['b', 'd', 'a', 'c'])
    expect(ids(sortRows(people, { key: 'age', direction: 'desc' }))).toEqual(['a', 'b', 'd', 'c'])
  })

  it('is stable: equal values keep their original order', () => {
    expect(ids(sortRows(people, { key: 'age', direction: 'asc' })).slice(0, 2)).toEqual(['b', 'd'])
  })

  it('does not mutate the input', () => {
    const before = ids(people)
    sortRows(people, { key: 'name', direction: 'desc' })
    expect(ids(people)).toEqual(before)
  })
})

describe('paginateRows / getPageCount', () => {
  const rows = Array.from({ length: 25 }, (_, i) => i)

  it('slices the requested page', () => {
    expect(paginateRows(rows, { pageIndex: 0, pageSize: 10 })).toEqual(rows.slice(0, 10))
    expect(paginateRows(rows, { pageIndex: 2, pageSize: 10 })).toEqual(rows.slice(20, 25))
  })

  it('clamps an out-of-range page index', () => {
    expect(paginateRows(rows, { pageIndex: 99, pageSize: 10 })).toEqual(rows.slice(20, 25))
    expect(paginateRows(rows, { pageIndex: -3, pageSize: 10 })).toEqual(rows.slice(0, 10))
  })

  it('counts pages and always reports at least one', () => {
    expect(getPageCount(25, 10)).toBe(3)
    expect(getPageCount(20, 10)).toBe(2)
    expect(getPageCount(0, 10)).toBe(1)
  })
})
