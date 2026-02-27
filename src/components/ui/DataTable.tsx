'use client'

// Tableau de données responsive avec recherche, tri et pagination
import { useState, useMemo, type ReactNode } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

/** Définition d'une colonne du tableau */
interface Column<T> {
  /** Clé d'accès à la propriété dans l'objet */
  key: string
  /** Libellé affiché dans l'en-tête */
  header: string
  /** Fonction de rendu personnalisée pour la cellule */
  render?: (row: T) => ReactNode
  /** Indique si la colonne est triable */
  sortable?: boolean
  /** Classes CSS additionnelles pour la colonne */
  className?: string
}

/** Props du composant DataTable */
interface DataTableProps<T> {
  /** Définition des colonnes */
  columns: Column<T>[]
  /** Données à afficher */
  data: T[]
  /** Activer la barre de recherche */
  searchable?: boolean
  /** Placeholder de la barre de recherche */
  searchPlaceholder?: string
  /** Activer la pagination */
  pagination?: boolean
  /** Nombre de lignes par page (défaut : 10) */
  pageSize?: number
  /** Message affiché quand le tableau est vide */
  emptyMessage?: string
  /** Callback au clic sur une ligne */
  onRowClick?: (row: T) => void
}

/** Direction de tri */
type SortDirection = 'asc' | 'desc' | null

/** État du tri actuel */
interface SortState {
  key: string | null
  direction: SortDirection
}

/**
 * Accède à une valeur imbriquée dans un objet via une clé à points
 * (ex. : "tenant.first_name")
 */
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
  // État de la recherche
  const [search, setSearch] = useState('')

  // État du tri
  const [sort, setSort] = useState<SortState>({ key: null, direction: null })

  // Page courante (indexée à partir de 0)
  const [currentPage, setCurrentPage] = useState(0)

  // Filtrage par recherche textuelle
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

  // Tri des données filtrées
  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) return filteredData

    const sorted = [...filteredData]
    sorted.sort((a, b) => {
      const aVal = getNestedValue(a, sort.key!)
      const bVal = getNestedValue(b, sort.key!)

      // Gestion des valeurs nulles
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      // Comparaison numérique si possible
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal
      }

      // Comparaison textuelle par défaut
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      const comparison = aStr.localeCompare(bStr, 'fr')
      return sort.direction === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [filteredData, sort])

  // Pagination
  const totalPages = pagination ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1
  const paginatedData = pagination
    ? sortedData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : sortedData

  // Gestion du clic sur un en-tête de colonne pour le tri
  function handleSort(key: string) {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return { key: null, direction: null }
    })
  }

  // Remise à zéro de la page lors d'une recherche
  function handleSearch(value: string) {
    setSearch(value)
    setCurrentPage(0)
  }

  return (
    <div className="rounded-2xl border border-stone-200/50 overflow-hidden bg-white">
      {/* Barre de recherche */}
      {searchable && (
        <div className="p-4 border-b border-stone-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl
                         bg-white text-slate-900 placeholder:text-stone-400
                         focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta
                         transition-colors"
            />
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* En-tête */}
          <thead>
            <tr className="bg-stone-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer select-none hover:text-slate-900 transition-colors' : ''
                  } ${col.className ?? ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {/* Icône de tri */}
                    {col.sortable && (
                      <span className="inline-flex">
                        {sort.key === col.key ? (
                          sort.direction === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 text-stone-300" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Corps du tableau */}
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-stone-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-stone-100 hover:bg-stone-50/50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 text-sm text-slate-900 ${col.className ?? ''}`}
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100">
          {/* Indicateur de résultats */}
          <p className="text-sm text-stone-500">
            {sortedData.length === 0
              ? 'Aucun résultat'
              : `${currentPage * pageSize + 1}–${Math.min(
                  (currentPage + 1) * pageSize,
                  sortedData.length
                )} sur ${sortedData.length}`}
          </p>

          {/* Boutons de navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-stone-200
                         text-stone-500 hover:bg-stone-50 hover:text-slate-900
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm font-medium text-slate-900 min-w-[4rem] text-center">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-stone-200
                         text-stone-500 hover:bg-stone-50 hover:text-slate-900
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
