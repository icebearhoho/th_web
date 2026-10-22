export interface Employee {
  id: string
  name: string
  department: string
  location: string
  salary: number
  startDate: string
}

const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Đặng', 'Vũ', 'Bùi']
const givenNames = ['An', 'Bình', 'Chi', 'Dũng', 'Giang', 'Hà', 'Khoa', 'Linh', 'Minh', 'Ngọc']
const departments = ['Engineering', 'Design', 'Finance', 'Marketing', 'Support']
const locations = ['Hà Nội', 'Đà Nẵng', 'TP. Hồ Chí Minh', 'Huế']

// Deterministic on purpose: no Math.random(), so tests and Lighthouse runs see the same data.
export const employees: readonly Employee[] = Array.from({ length: 57 }, (_, i) => {
  const n = i + 1
  return {
    id: `emp-${String(n).padStart(3, '0')}`,
    name: `${lastNames[i % lastNames.length]} ${givenNames[(i * 3) % givenNames.length]}`,
    department: departments[(i * 2) % departments.length],
    location: locations[(i * 5) % locations.length],
    salary: 12_000_000 + ((i * 7_919) % 41) * 500_000,
    startDate: `20${String(15 + (i % 10)).padStart(2, '0')}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
  }
})