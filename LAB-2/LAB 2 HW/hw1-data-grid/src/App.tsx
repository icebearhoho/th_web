import { useState } from 'react'
import { DataGrid } from './grid/DataGrid'
import type { ColumnDef } from './grid/types'
import { employees } from './data/sampleData'
import type { Employee } from './data/sampleData'

const columns: readonly ColumnDef<Employee>[] = [
  { header: 'Name', accessorKey: 'name', sortable: true },
  { header: 'Department', accessorKey: 'department', sortable: true },
  { header: 'Location', accessorKey: 'location', sortable: true },
  { header: 'Salary (VND)', accessorKey: 'salary', sortable: true },
  { header: 'Start date', accessorKey: 'startDate', sortable: true },
]

export default function App() {
  const [lastPicked, setLastPicked] = useState<Employee | null>(null)

  return (
    <main className="page">
      <h1>HW1: Accessible Data-Grid</h1>
      <DataGrid
        data={employees}
        columns={columns}
        ariaLabel="Employee directory"
        getRowId={(row) => row.id}
        onRowSelect={setLastPicked}
      />
      <p role="status" className="page__picked">
        {lastPicked ? `Last activated: ${lastPicked.name} (${lastPicked.id})` : 'Press Enter on a row to activate it. Press Space to select it.'}
      </p>
    </main>
  )
}