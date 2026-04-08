// Éléments décoratifs style Creative South

interface DecoProps {
  className?: string
}

/** Étoile à 4 branches */
export function Star4({ className = '', color = '#E8622A' }: DecoProps & { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5Z" fill={color}/>
    </svg>
  )
}

/** Mini immeuble haussmannien */
export function MiniBuilding({ className = '' }: DecoProps) {
  return (
    <svg viewBox="0 0 80 100" fill="none" className={className}>
      <rect x="5" y="20" width="70" height="75" rx="3" fill="#1A1E30" stroke="#252840" strokeWidth="2"/>
      <path d="M5 20 L40 5 L75 20" fill="#1A1E30" stroke="#252840" strokeWidth="2"/>
      <rect x="15" y="32" width="12" height="10" rx="1.5" fill="#252840"/>
      <rect x="34" y="32" width="12" height="10" rx="1.5" fill="#252840"/>
      <rect x="53" y="32" width="12" height="10" rx="1.5" fill="#252840"/>
      <rect x="15" y="50" width="12" height="10" rx="1.5" fill="#252840"/>
      <rect x="34" y="50" width="12" height="10" rx="1.5" fill="#E8622A" opacity="0.3"/>
      <rect x="53" y="50" width="12" height="10" rx="1.5" fill="#252840"/>
      <rect x="30" y="72" width="20" height="23" rx="2" fill="#E8622A" opacity="0.5"/>
    </svg>
  )
}

/** Clé stylisée */
export function KeyIcon({ className = '' }: DecoProps) {
  return (
    <svg viewBox="0 0 60 60" fill="none" className={className}>
      <circle cx="20" cy="20" r="14" stroke="#E8622A" strokeWidth="3.5" fill="none"/>
      <circle cx="20" cy="20" r="6" fill="#E8622A" opacity="0.2"/>
      <line x1="30" y1="30" x2="52" y2="52" stroke="#E8622A" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="45" y1="45" x2="52" y2="38" stroke="#E8622A" strokeWidth="3" strokeLinecap="round"/>
      <line x1="40" y1="50" x2="47" y2="43" stroke="#E8622A" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

/** Pièce de monnaie Euro */
export function CoinEuro({ className = '' }: DecoProps) {
  return (
    <svg viewBox="0 0 60 60" fill="none" className={className}>
      <circle cx="30" cy="30" r="24" fill="#F5C842" stroke="#E8622A" strokeWidth="3"/>
      <circle cx="30" cy="30" r="18" stroke="#E8622A" strokeWidth="1.5" opacity="0.4" fill="none"/>
      <text x="30" y="38" textAnchor="middle" fill="#0D0F1A" fontSize="22" fontWeight="bold" fontFamily="serif">&euro;</text>
    </svg>
  )
}

/** Document / Quittance PDF */
export function DocPDF({ className = '' }: DecoProps) {
  return (
    <svg viewBox="0 0 50 65" fill="none" className={className}>
      <rect x="2" y="2" width="40" height="56" rx="3" fill="white" stroke="#252840" strokeWidth="2"/>
      <path d="M30 2 L30 16 L44 16" fill="#F5F0E8" stroke="#252840" strokeWidth="2"/>
      <rect x="8" y="22" width="22" height="3" rx="1" fill="#E8622A"/>
      <rect x="8" y="30" width="28" height="2" rx="1" fill="#9BA3C2" opacity="0.5"/>
      <rect x="8" y="36" width="25" height="2" rx="1" fill="#9BA3C2" opacity="0.5"/>
      <rect x="8" y="42" width="20" height="2" rx="1" fill="#9BA3C2" opacity="0.5"/>
      <rect x="8" y="50" width="14" height="5" rx="2" fill="#E8622A" opacity="0.2"/>
      <text x="15" y="54" fill="#E8622A" fontSize="4" fontWeight="bold">PDF</text>
    </svg>
  )
}

/** Losange plein */
export function Diamond({ className = '', color = '#E8622A' }: DecoProps & { color?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className}>
      <rect x="6" y="0" width="6" height="6" rx="1" transform="rotate(45 6 6)" fill={color}/>
    </svg>
  )
}
