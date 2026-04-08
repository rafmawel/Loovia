// Mascotte fourmi Loovia — style rétro/cartoon
// Trait épais noir, couleurs chaudes pastel, visible sur fond sombre
// Utilisée de façon DISCRÈTE : petite, dans les coins, fil conducteur

interface AntProps {
  className?: string
}

/** Fourmi qui marche avec un trousseau de clés — style rétro cartoon */
export function AntWithKeys({ className = '' }: AntProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Antennes */}
      <path d="M38 30 C35 18, 28 12, 22 8" stroke="#0D0F1A" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="21" cy="7" r="3.5" fill="#F4A77C"/>
      <path d="M52 28 C55 18, 62 12, 68 10" stroke="#0D0F1A" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="69" cy="9" r="3.5" fill="#F4A77C"/>
      {/* Tête */}
      <circle cx="45" cy="38" r="16" fill="#F4A77C" stroke="#0D0F1A" strokeWidth="3"/>
      {/* Yeux */}
      <circle cx="40" cy="36" r="4.5" fill="white"/>
      <circle cx="51" cy="36" r="4.5" fill="white"/>
      <circle cx="41" cy="35" r="2.2" fill="#0D0F1A"/>
      <circle cx="52" cy="35" r="2.2" fill="#0D0F1A"/>
      <circle cx="41.5" cy="34" r="0.8" fill="white"/>
      <circle cx="52.5" cy="34" r="0.8" fill="white"/>
      {/* Sourire */}
      <path d="M40 44 C43 48, 48 48, 51 44" stroke="#0D0F1A" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Corps */}
      <ellipse cx="45" cy="62" rx="14" ry="15" fill="#F2B5A0" stroke="#0D0F1A" strokeWidth="3"/>
      {/* Abdomen */}
      <ellipse cx="45" cy="82" rx="11" ry="12" fill="#F4A77C" stroke="#0D0F1A" strokeWidth="3"/>
      {/* Bras — tient les clés */}
      <path d="M59 58 C68 52, 74 48, 78 44" stroke="#0D0F1A" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="79" cy="43" r="3" fill="#F4A77C" stroke="#0D0F1A" strokeWidth="2"/>
      {/* Clés */}
      <circle cx="86" cy="36" r="5" stroke="#E8622A" strokeWidth="2.5" fill="none"/>
      <rect x="88" y="30" width="2.5" height="8" rx="1" fill="#E8622A" transform="rotate(15, 89, 34)"/>
      {/* Autre bras */}
      <path d="M31 60 C22 58, 18 62, 16 68" stroke="#0D0F1A" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="15" cy="69" r="3" fill="#F4A77C" stroke="#0D0F1A" strokeWidth="2"/>
      {/* Pattes */}
      <path d="M38 90 C35 95, 32 98, 30 100" stroke="#0D0F1A" strokeWidth="3" strokeLinecap="round"/>
      <path d="M52 90 C55 95, 58 98, 60 100" stroke="#0D0F1A" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

/** Fourmi assise qui sirote un café — pour les sections détente */
export function AntRelaxed({ className = '' }: AntProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Antennes */}
      <path d="M30 22 C28 14, 22 10, 16 8" stroke="#0D0F1A" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="15" cy="7" r="3" fill="#F4A77C"/>
      <path d="M44 22 C46 14, 52 10, 58 8" stroke="#0D0F1A" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="59" cy="7" r="3" fill="#F4A77C"/>
      {/* Tête */}
      <circle cx="37" cy="30" r="13" fill="#F4A77C" stroke="#0D0F1A" strokeWidth="2.5"/>
      {/* Yeux fermés — content */}
      <path d="M31 28 C33 25, 36 25, 38 28" stroke="#0D0F1A" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M40 28 C42 25, 45 25, 47 28" stroke="#0D0F1A" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Sourire */}
      <path d="M33 36 C35 39, 39 39, 41 36" stroke="#0D0F1A" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Corps assis */}
      <ellipse cx="37" cy="50" rx="12" ry="12" fill="#F2B5A0" stroke="#0D0F1A" strokeWidth="2.5"/>
      {/* Abdomen */}
      <ellipse cx="37" cy="66" rx="10" ry="9" fill="#F4A77C" stroke="#0D0F1A" strokeWidth="2.5"/>
      {/* Bras + tasse */}
      <path d="M49 48 C56 44, 60 40, 62 36" stroke="#0D0F1A" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="59" y="30" width="10" height="12" rx="2" fill="#E8622A" stroke="#0D0F1A" strokeWidth="2"/>
      <path d="M69 34 C73 34, 73 40, 69 40" stroke="#0D0F1A" strokeWidth="2" fill="none"/>
      {/* Vapeur */}
      <path d="M63 26 C62 22, 64 20, 63 16" stroke="#C0B0DC" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      {/* Pattes */}
      <path d="M30 72 C28 76, 24 78, 20 78" stroke="#0D0F1A" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M44 72 C46 76, 50 78, 54 78" stroke="#0D0F1A" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

/** Petite fourmi qui salue — pour le footer */
export function AntWave({ className = '' }: AntProps) {
  return (
    <svg viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 14 C18 8, 14 5, 10 3" stroke="#0D0F1A" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9" cy="2.5" r="2.5" fill="#F4A77C"/>
      <path d="M30 14 C32 8, 36 5, 40 3" stroke="#0D0F1A" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="41" cy="2.5" r="2.5" fill="#F4A77C"/>
      <circle cx="25" cy="22" r="10" fill="#F4A77C" stroke="#0D0F1A" strokeWidth="2.5"/>
      <circle cx="22" cy="20" r="3" fill="white"/>
      <circle cx="29" cy="20" r="3" fill="white"/>
      <circle cx="22.5" cy="19.5" r="1.5" fill="#0D0F1A"/>
      <circle cx="29.5" cy="19.5" r="1.5" fill="#0D0F1A"/>
      <path d="M22 27 C24 29, 27 29, 29 27" stroke="#0D0F1A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="25" cy="38" rx="9" ry="10" fill="#F2B5A0" stroke="#0D0F1A" strokeWidth="2.5"/>
      <ellipse cx="25" cy="52" rx="7" ry="7" fill="#F4A77C" stroke="#0D0F1A" strokeWidth="2.5"/>
      {/* Bras droit qui salue */}
      <path d="M34 36 C40 30, 42 24, 40 18" stroke="#0D0F1A" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="40" cy="17" r="2.5" fill="#F4A77C" stroke="#0D0F1A" strokeWidth="1.5"/>
    </svg>
  )
}

/** Mini fourmi icon — pour les accents décoratifs */
export function AntMini({ className = '' }: AntProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M9 6 C8 3, 6 2, 4 1" stroke="#0D0F1A" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="3.5" cy="0.8" r="1.5" fill="#F4A77C"/>
      <path d="M15 6 C16 3, 18 2, 20 1" stroke="#0D0F1A" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="20.5" cy="0.8" r="1.5" fill="#F4A77C"/>
      <circle cx="12" cy="8" r="4" fill="#F4A77C" stroke="#0D0F1A" strokeWidth="1.5"/>
      <circle cx="10.5" cy="7.5" r="1" fill="#0D0F1A"/>
      <circle cx="13.5" cy="7.5" r="1" fill="#0D0F1A"/>
      <ellipse cx="12" cy="15" rx="4" ry="4" fill="#F2B5A0" stroke="#0D0F1A" strokeWidth="1.5"/>
      <ellipse cx="12" cy="21" rx="3" ry="3" fill="#F4A77C" stroke="#0D0F1A" strokeWidth="1.5"/>
    </svg>
  )
}
