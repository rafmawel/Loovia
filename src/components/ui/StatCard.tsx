// Carte de statistique pour les KPIs du tableau de bord
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

/** Tendance d'évolution d'un KPI */
interface StatTrend {
  /** Valeur de la tendance en pourcentage */
  value: number
  /** Indique si la tendance est positive (hausse favorable) */
  positive: boolean
}

/** Props du composant StatCard */
interface StatCardProps {
  /** Icône représentant le KPI */
  icon: LucideIcon
  /** Libellé du KPI (ex. : « Revenus mensuels ») */
  label: string
  /** Valeur affichée (ex. : « 12 450 € » ou 42) */
  value: string | number
  /** Tendance optionnelle avec flèche et couleur */
  trend?: StatTrend
  /** Classes CSS additionnelles */
  className?: string
}

export function StatCard({ icon: Icon, label, value, trend, className = '' }: StatCardProps) {
  return (
    <div
      className={`bg-bg-elevated rounded-2xl border border-border-light glow-accent p-6 ${className}`}
    >
      <div className="flex items-start justify-between">
        {/* Icône dans un cercle terracotta */}
        <div className="rounded-full bg-accent/10 p-3 text-accent">
          <Icon className="h-5 w-5" />
        </div>

        {/* Indicateur de tendance */}
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend.positive ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {trend.positive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>

      {/* Valeur principale */}
      <div className="mt-4">
        <p className="text-2xl font-bold tabular-nums text-text-primary">
          {value}
        </p>
        <p className="text-sm text-text-secondary mt-1">
          {label}
        </p>
      </div>
    </div>
  )
}
