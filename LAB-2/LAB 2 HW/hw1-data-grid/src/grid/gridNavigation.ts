export interface CellPosition {
  readonly row: number
  readonly col: number
}

export interface GridDimensions {
  readonly rowCount: number
  readonly colCount: number
}

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max)

/**
 * Pure keyboard-navigation rule for a grid. Returns the next cell, or null when the key is not a
 * navigation key (so the caller knows not to call preventDefault).
 */
export function moveCell(
  from: CellPosition,
  key: string,
  { rowCount, colCount }: GridDimensions,
  ctrlKey = false,
): CellPosition | null {
  if (rowCount <= 0 || colCount <= 0) return null
  const lastRow = rowCount - 1
  const lastCol = colCount - 1
  switch (key) {
    case 'ArrowUp':
      return { row: clamp(from.row - 1, lastRow), col: from.col }
    case 'ArrowDown':
      return { row: clamp(from.row + 1, lastRow), col: from.col }
    case 'ArrowLeft':
      return { row: from.row, col: clamp(from.col - 1, lastCol) }
    case 'ArrowRight':
      return { row: from.row, col: clamp(from.col + 1, lastCol) }
    case 'Home':
      return ctrlKey ? { row: 0, col: 0 } : { row: from.row, col: 0 }
    case 'End':
      return ctrlKey ? { row: lastRow, col: lastCol } : { row: from.row, col: lastCol }
    default:
      return null
  }
}
