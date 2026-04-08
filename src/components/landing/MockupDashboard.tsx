// Composant mockup du dashboard — données fictives réalistes
export function MockupDashboard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-ui-card rounded-2xl border border-ui-border shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden ${className}`}
      style={{ transform: 'perspective(1200px) rotateY(-6deg) rotateX(2deg)' }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-ui-border">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-green-400/80" />
        </div>
        <span className="text-[11px] text-text-muted font-mono ml-2">loovia.app/dashboard</span>
      </div>

      <div className="flex">
        {/* Sidebar mock */}
        <div className="w-44 border-r border-ui-border p-3 hidden sm:block">
          <div className="flex items-center gap-2 mb-6 px-2">
            <div className="h-5 w-5 rounded bg-accent/20" />
            <span className="text-xs font-bold text-accent">Loovia</span>
          </div>
          {['Tableau de bord', 'Mes Biens', 'Locataires', 'Baux', 'Finances', 'Analytique'].map((item, i) => (
            <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] mb-0.5 ${i === 0 ? 'bg-accent/10 text-accent font-medium' : 'text-text-secondary'}`}>
              <div className={`h-3 w-3 rounded ${i === 0 ? 'bg-accent/30' : 'bg-ui-border'}`} />
              {item}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-5">
          <div className="text-xs font-medium text-text-primary mb-4">Tableau de bord</div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
            {[
              { label: 'Biens', value: '4', color: 'text-text-primary' },
              { label: 'Locataires', value: '6', color: 'text-text-primary' },
              { label: 'Revenus/mois', value: '3 850 €', color: 'text-success' },
              { label: 'Occupation', value: '92%', color: 'text-accent' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-bg-dark rounded-lg p-2.5 border border-ui-border">
                <p className="text-[10px] text-text-muted">{kpi.label}</p>
                <p className={`text-sm font-bold ${kpi.color} mt-0.5 tabular-nums`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="bg-bg-dark rounded-lg border border-ui-border p-3 mb-3">
            <div className="text-[10px] text-text-muted mb-2">Revenus mensuels</div>
            <div className="flex items-end gap-1.5 h-16">
              {[40, 55, 48, 65, 58, 72, 68, 78, 74, 82, 76, 85].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-accent/60 transition-all hover:bg-accent"
                  style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[8px] text-text-muted">Jan</span>
              <span className="text-[8px] text-text-muted">Déc</span>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-bg-dark rounded-lg border border-ui-border p-3">
            <div className="text-[10px] text-text-muted mb-2">Dernière activité</div>
            {[
              { text: 'Loyer reçu — Appt T3 Lyon', amount: '+850 €', color: 'text-success' },
              { text: 'Quittance envoyée — Studio Paris', amount: '+620 €', color: 'text-success' },
              { text: 'Impayé détecté — Maison Bordeaux', amount: '1 200 €', color: 'text-red-400' },
            ].map((item) => (
              <div key={item.text} className="flex items-center justify-between py-1.5 border-b border-ui-border last:border-0">
                <span className="text-[10px] text-text-secondary">{item.text}</span>
                <span className={`text-[10px] font-bold tabular-nums ${item.color}`}>{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
