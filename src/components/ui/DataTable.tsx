'use client'

import { useState, useMemo, type ReactNode } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  searchable?: boolean
  searchPlaceholder?: string
  pagination?: boolean
  pageSize?: number
  emptyMessage?: string
  onRowClick?: (row: T) => void
}

type SortDirection = 'asc' | 'desc' | null

interface SortState {
  key: string | null
  direction: SortDirection
}

function getNestedValue(obj: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchable = false,
  searchPlaceholder = 'Rechercher...',
  pagination = false,
  pageSize = 10,
  emptyMessage = 'Aucune donnée à afficher.',
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortState>({ key: null, direction: null })
  const [currentPage, setCurrentPage] = useState(0)

  const filteredData = useMemo(() => {
    if (!search.trim()) return data
    const lowerSearch = search.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        const value = getNestedValue(row, col.key)
        if (value == null) return false
        return String(value).toLowerCase().includes(lowerSearch)
      })
    )
  }, [data, search, columns])

  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) return filteredData
    const sorted = [...filteredData]
    sorted.sort((a, b) => {
      const aVal = getNestedValue(a, sort.key!)
      const bVal = getNestedValue(b, sort.key!)
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      const comparison = aStr.localeCompare(bStr, 'fr')
      return sort.direction === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [filteredData, sort])

  const totalPages = pagination ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1
  const paginatedData = pagination
    ? sortedData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : sortedData

  function handleSort(key: string) {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return { key: null, direction: null }
    })
  }

  function handleSearch(value: string) {
    setSearch(value)
    setCurrentPage(0)
  }

  return (
    <div className="rounded-2xl border border-border-light overflow-hidden bg-bg-elevated">
      {/* Barre de recherche */}
      {searchable && (
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-border-light rounded-xl
                         bg-bg-card text-text-primary placeholder:text-text-muted
                         focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
                         transition-colors"
            />
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-card">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer select-none hover:text-text-primary transition-colors' : ''
                  } ${col.className ?? ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="inline-flex">
                        {sort.key === col.key ? (
                          sort.direction === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 text-text-muted" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-text-secondary"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-border hover:bg-bg-card/50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 text-sm text-text-primary ${col.className ?? ''}`}
                    >
                      {col.render
                        ? col.render(row)
                        : (getNestedValue(row, col.key) as ReactNode) ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-text-secondary">
            {sortedData.length === 0
              ? 'Aucun résultat'
              : `${currentPage * pageSize + 1}–${Math.min(
                  (currentPage + 1) * pageSize,
                  sortedData.length
                )} sur ${sortedData.length}`}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border-light
                         text-text-secondary hover:bg-bg-card hover:text-text-primary
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm font-medium text-text-primary min-w-[4rem] text-center">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border-light
                         text-text-secondary hover:bg-bg-card hover:text-text-primary
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
