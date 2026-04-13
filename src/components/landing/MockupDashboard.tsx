export function MockupDashboard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-bg-elevated rounded-2xl border border-border-light overflow-hidden ${className}`}
      style={{ transform: 'perspective(1200px) rotateY(-3deg) rotateX(1.5deg)' }}>
      {/* Chrome */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <span className="text-[11px] text-text-muted font-mono ml-3">loovia.app/dashboard</span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-[180px] border-r border-border p-4 hidden sm:block">
          <div className="flex items-center gap-2 mb-7 px-2">
            <span className="text-[13px] font-bold font-display">L<span className="text-accent">oo</span>via</span>
          </div>
          {['Tableau de bord', 'Mes Biens', 'Locataires', 'Baux', 'Finances', 'Analytique'].map((item, i) => (
            <div key={item} className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[11px] mb-0.5 ${
              i === 0 ? 'bg-accent/10 text-accent font-medium' : 'text-text-secondary'
            }`}>
              <div className={`h-[6px] w-[6px] rounded-full ${i === 0 ? 'bg-accent' : 'bg-border-light'}`} />
              {item}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-6 bg-bg-primary/50">
          <p className="text-[12px] font-medium text-white/90 mb-4">Tableau de bord</p>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Biens', value: '4' },
              { label: 'Locataires', value: '6' },
              { label: 'Revenus/mois', value: '3 850 €', accent: true },
              { label: 'Occupation', value: '92%', accent: true },
            ].map(kpi => (
              <div key={kpi.label} className="bg-bg-elevated rounded-xl p-3 border border-border">
                <p className="text-[10px] text-text-muted">{kpi.label}</p>
                <p className={`text-[14px] font-bold mt-1 tabular-nums ${kpi.accent ? 'text-accent' : 'text-white'}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-bg-elevated rounded-xl border border-border p-4 mb-4">
            <p className="text-[10px] text-text-muted mb-3">Revenus mensuels</p>
            <div className="flex items-end gap-[5px] h-[56px]">
              {[38, 52, 45, 62, 55, 70, 65, 75, 72, 80, 74, 82].map((h, i) => (
                <div key={i} className="flex-1 rounded-[3px] bg-accent/50 hover:bg-accent transition-colors" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-bg-elevated rounded-xl border border-border p-4">
            <p className="text-[10px] text-text-muted mb-3">Activité récente</p>
            {[
              { t: 'Loyer reçu — Appt T3 Lyon', a: '+850 €', c: 'text-success' },
              { t: 'Quittance — Studio Paris 9e', a: '+620 €', c: 'text-success' },
              { t: 'Impayé — Maison Bordeaux', a: '1 200 €', c: 'text-danger' },
            ].map(r => (
              <div key={r.t} className="flex items-center justify-between py-[6px] border-b border-border last:border-0">
                <span className="text-[11px] text-text-secondary">{r.t}</span>
                <span className={`text-[11px] font-semibold tabular-nums ${r.c}`}>{r.a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
