import { describe, expect, it } from 'vitest'
import { moveCell } from './gridNavigation'
const dims = { rowCount: 3, colCount: 4 }

describe('moveCell', () => {
  it('moves with the arrow keys', () => {
    expect(moveCell({ row: 1, col: 1 }, 'ArrowDown', dims)).toEqual({ row: 2, col: 1 })
    expect(moveCell({ row: 1, col: 1 }, 'ArrowUp', dims)).toEqual({ row: 0, col: 1 })
    expect(moveCell({ row: 1, col: 1 }, 'ArrowRight', dims)).toEqual({ row: 1, col: 2 })
    expect(moveCell({ row: 1, col: 1 }, 'ArrowLeft', dims)).toEqual({ row: 1, col: 0 })
  })

  it('stops at the edges instead of wrapping', () => {
    expect(moveCell({ row: 0, col: 0 }, 'ArrowUp', dims)).toEqual({ row: 0, col: 0 })
    expect(moveCell({ row: 0, col: 0 }, 'ArrowLeft', dims)).toEqual({ row: 0, col: 0 })
    expect(moveCell({ row: 2, col: 3 }, 'ArrowDown', dims)).toEqual({ row: 2, col: 3 })
    expect(moveCell({ row: 2, col: 3 }, 'ArrowRight', dims)).toEqual({ row: 2, col: 3 })
  })

  it('supports Home/End and Ctrl+Home/End', () => {
    expect(moveCell({ row: 1, col: 2 }, 'Home', dims)).toEqual({ row: 1, col: 0 })
    expect(moveCell({ row: 1, col: 2 }, 'End', dims)).toEqual({ row: 1, col: 3 })
    expect(moveCell({ row: 1, col: 2 }, 'Home', dims, true)).toEqual({ row: 0, col: 0 })
    expect(moveCell({ row: 1, col: 2 }, 'End', dims, true)).toEqual({ row: 2, col: 3 })
  })

  it('returns null for keys it does not handle', () => {
    expect(moveCell({ row: 0, col: 0 }, 'a', dims)).toBe(null)
    expect(moveCell({ row: 0, col: 0 }, 'Tab', dims)).toBe(null)
  })

  it('returns null for an empty grid', () => {
    expect(moveCell({ row: 0, col: 0 }, 'ArrowDown', { rowCount: 0, colCount: 4 })).toBe(null)
  })
})