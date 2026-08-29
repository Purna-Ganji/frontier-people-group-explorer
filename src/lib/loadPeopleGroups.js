import Papa from 'papaparse'
import peopleGroupsCsv from '../data/A_Data.csv?raw'

export function loadPeopleGroups() {
  const { data, errors } = Papa.parse(peopleGroupsCsv, {
    header: true,
    skipEmptyLines: true,
  })

  if (errors.length > 0) {
    console.error('CSV parsing errors:', errors)
  }

  return data
}