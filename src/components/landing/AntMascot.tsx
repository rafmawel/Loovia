// Mascotte fourmi Loovia — 4 poses SVG
// Style : Creative South — trait épais, géométrique, expressif

interface AntProps {
  className?: string
}

/** Hero pose — fière, debout, tenant un trousseau de clés */
export function AntHero({ className = '' }: AntProps) {
  return (
    <svg viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Antennes — relevées, fières */}
      <path d="M130 95 C120 50, 100 30, 85 15" stroke="#0D0F1A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="85" cy="15" r="6" fill="#E8622A"/>
      <path d="M170 95 C180 50, 200 30, 215 15" stroke="#0D0F1A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="215" cy="15" r="6" fill="#E8622A"/>

      {/* Tête — ronde */}
      <circle cx="150" cy="130" r="45" fill="#0D0F1A" stroke="#0D0F1A" strokeWidth="3"/>
      {/* Yeux — grands, ronds, expressifs */}
      <ellipse cx="135" cy="125" rx="12" ry="14" fill="white"/>
      <ellipse cx="165" cy="125" rx="12" ry="14" fill="white"/>
      <circle cx="138" cy="123" r="6" fill="#0D0F1A"/>
      <circle cx="168" cy="123" r="6" fill="#0D0F1A"/>
      <circle cx="140" cy="121" r="2.5" fill="white"/>
      <circle cx="170" cy="121" r="2.5" fill="white"/>
      {/* Sourire */}
      <path d="M137 145 C142 155, 158 155, 163 145" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>

      {/* Corps — costume sombre */}
      <ellipse cx="150" cy="220" rx="50" ry="55" fill="#1A1E30" stroke="#0D0F1A" strokeWidth="3"/>
      {/* Col de chemise */}
      <path d="M130 178 L150 195 L170 178" stroke="white" strokeWidth="2.5" fill="none"/>
      {/* Cravate orange */}
      <polygon points="150,192 143,215 150,225 157,215" fill="#E8622A"/>
      {/* Boutons */}
      <circle cx="150" cy="240" r="3" fill="#252840"/>
      <circle cx="150" cy="255" r="3" fill="#252840"/>

      {/* Abdomen */}
      <ellipse cx="150" cy="310" rx="42" ry="45" fill="#0D0F1A"/>
      <ellipse cx="150" cy="310" rx="30" ry="32" fill="#1A1E30" opacity="0.3"/>

      {/* Bras gauche — posé sur la hanche */}
      <path d="M100 210 C75 215, 65 240, 80 255" stroke="#0D0F1A" strokeWidth="8" strokeLinecap="round" fill="none"/>
      {/* Main gauche */}
      <circle cx="80" cy="257" r="8" fill="#0D0F1A"/>

      {/* Bras droit — tient les clés en l'air */}
      <path d="M200 205 C225 195, 240 175, 235 155" stroke="#0D0F1A" strokeWidth="8" strokeLinecap="round" fill="none"/>
      {/* Main droite */}
      <circle cx="235" cy="153" r="8" fill="#0D0F1A"/>
      {/* Trousseau de clés */}
      <circle cx="245" cy="135" r="12" stroke="#E8622A" strokeWidth="3" fill="none"/>
      <rect x="248" y="120" width="4" height="18" rx="1" fill="#F5C842" transform="rotate(15, 250, 129)"/>
      <rect x="240" y="118" width="4" height="14" rx="1" fill="#E8622A" transform="rotate(-10, 242, 125)"/>
      <circle cx="245" cy="135" r="3" fill="#E8622A"/>

      {/* Pattes — fines avec jointures */}
      <path d="M120 340 C110 360, 100 375, 95 395" stroke="#0D0F1A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M180 340 C190 360, 195 375, 200 395" stroke="#0D0F1A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      {/* Pieds */}
      <ellipse cx="90" cy="395" rx="14" ry="6" fill="#0D0F1A"/>
      <ellipse cx="205" cy="395" rx="14" ry="6" fill="#0D0F1A"/>
    </svg>
  )
}

/** Problème pose — submergée sous des papiers, antennes tombantes */
export function AntOverwhelmed({ className = '' }: AntProps) {
  return (
    <svg viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Antennes — tombantes */}
      <path d="M130 95 C125 70, 110 65, 90 75" stroke="#0D0F1A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="88" cy="77" r="5" fill="#9BA3C2"/>
      <path d="M170 95 C175 70, 190 65, 210 75" stroke="#0D0F1A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="212" cy="77" r="5" fill="#9BA3C2"/>

      {/* Tête */}
      <circle cx="150" cy="130" r="45" fill="#0D0F1A" stroke="#0D0F1A" strokeWidth="3"/>
      {/* Yeux — stressés */}
      <ellipse cx="135" cy="125" rx="12" ry="14" fill="white"/>
      <ellipse cx="165" cy="125" rx="12" ry="14" fill="white"/>
      <circle cx="135" cy="128" r="5" fill="#0D0F1A"/>
      <circle cx="165" cy="128" r="5" fill="#0D0F1A"/>
      {/* Sourcils inquiets */}
      <path d="M123 110 L140 116" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M177 110 L160 116" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Bouche — grimace */}
      <path d="M135 150 C140 145, 160 145, 165 150" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

      {/* Corps */}
      <ellipse cx="150" cy="220" rx="50" ry="55" fill="#1A1E30" stroke="#0D0F1A" strokeWidth="3"/>
      <polygon points="150,192 143,215 150,225 157,215" fill="#E8622A" opacity="0.6"/>
      <ellipse cx="150" cy="310" rx="42" ry="45" fill="#0D0F1A"/>

      {/* Bras — levés en panique */}
      <path d="M100 210 C70 195, 55 180, 50 160" stroke="#0D0F1A" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M200 210 C230 195, 245 180, 250 160" stroke="#0D0F1A" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <circle cx="48" cy="158" r="8" fill="#0D0F1A"/>
      <circle cx="252" cy="158" r="8" fill="#0D0F1A"/>

      {/* Papiers qui volent */}
      <rect x="30" y="100" width="40" height="50" rx="3" fill="white" stroke="#252840" strokeWidth="1.5" transform="rotate(-15, 50, 125)"/>
      <rect x="35" y="112" width="20" height="2" rx="1" fill="#9BA3C2" transform="rotate(-15, 50, 125)"/>
      <rect x="35" y="118" width="25" height="2" rx="1" fill="#9BA3C2" transform="rotate(-15, 50, 125)"/>

      <rect x="230" y="90" width="40" height="50" rx="3" fill="white" stroke="#252840" strokeWidth="1.5" transform="rotate(12, 250, 115)"/>
      <rect x="235" y="102" width="20" height="2" rx="1" fill="#9BA3C2" transform="rotate(12, 250, 115)"/>

      <rect x="60" y="140" width="35" height="45" rx="3" fill="#F5F0E8" stroke="#252840" strokeWidth="1.5" transform="rotate(-8, 77, 162)"/>
      <rect x="235" y="140" width="35" height="45" rx="3" fill="#F5F0E8" stroke="#252840" strokeWidth="1.5" transform="rotate(10, 252, 162)"/>

      {/* Pattes */}
      <path d="M120 340 C110 360, 100 375, 95 395" stroke="#0D0F1A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M180 340 C190 360, 195 375, 200 395" stroke="#0D0F1A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <ellipse cx="90" cy="395" rx="14" ry="6" fill="#0D0F1A"/>
      <ellipse cx="205" cy="395" rx="14" ry="6" fill="#0D0F1A"/>
    </svg>
  )
}

/** Solution pose — assise, détendue, tasse en main */
export function AntRelaxed({ className = '' }: AntProps) {
  return (
    <svg viewBox="0 0 300 380" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Fauteuil */}
      <path d="M50 250 C50 220, 60 200, 80 195 L220 195 C240 200, 250 220, 250 250 L250 330 C250 345, 240 355, 225 355 L75 355 C60 355, 50 345, 50 330Z" fill="#1A1E30" stroke="#252840" strokeWidth="2"/>
      <path d="M40 240 C35 240, 30 250, 30 265 L30 310 C30 320, 35 325, 45 325 L55 325 L55 240Z" fill="#1A1E30" stroke="#252840" strokeWidth="2"/>
      <path d="M260 240 C265 240, 270 250, 270 265 L270 310 C270 320, 265 325, 255 325 L245 325 L245 240Z" fill="#1A1E30" stroke="#252840" strokeWidth="2"/>

      {/* Antennes — détendues */}
      <path d="M130 70 C125 40, 115 25, 100 20" stroke="#0D0F1A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="98" cy="19" r="6" fill="#E8622A"/>
      <path d="M170 70 C175 40, 185 25, 200 20" stroke="#0D0F1A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="202" cy="19" r="6" fill="#E8622A"/>

      {/* Tête */}
      <circle cx="150" cy="105" r="42" fill="#0D0F1A"/>
      {/* Yeux — demi-fermés, content */}
      <path d="M125 100 C130 92, 140 92, 145 100" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M155 100 C160 92, 170 92, 175 100" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Sourire satisfait */}
      <path d="M135 118 C142 128, 158 128, 165 118" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>

      {/* Corps — assis dans le fauteuil */}
      <ellipse cx="150" cy="200" rx="48" ry="50" fill="#1A1E30" stroke="#0D0F1A" strokeWidth="3"/>
      <path d="M130 155 L150 170 L170 155" stroke="white" strokeWidth="2.5" fill="none"/>
      <polygon points="150,168 144,188 150,198 156,188" fill="#E8622A"/>

      {/* Abdomen */}
      <ellipse cx="150" cy="280" rx="40" ry="42" fill="#0D0F1A"/>

      {/* Bras gauche — posé sur l'accoudoir */}
      <path d="M102 200 C75 210, 55 220, 45 240" stroke="#0D0F1A" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <circle cx="43" cy="242" r="8" fill="#0D0F1A"/>

      {/* Bras droit — tient une tasse */}
      <path d="M198 195 C220 190, 232 185, 238 178" stroke="#0D0F1A" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <circle cx="240" cy="176" r="8" fill="#0D0F1A"/>
      {/* Tasse */}
      <rect x="228" y="148" width="24" height="28" rx="4" fill="#E8622A"/>
      <path d="M252 158 C262 158, 262 170, 252 170" stroke="#E8622A" strokeWidth="3" fill="none"/>
      {/* Vapeur */}
      <path d="M236 142 C234 135, 238 130, 236 123" stroke="#9BA3C2" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <path d="M244 144 C242 137, 246 132, 244 125" stroke="#9BA3C2" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>

      {/* Pattes — croisées et posées */}
      <path d="M120 310 C110 330, 115 345, 130 355" stroke="#0D0F1A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M180 310 C195 320, 210 325, 225 325" stroke="#0D0F1A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <ellipse cx="130" cy="358" rx="14" ry="5" fill="#0D0F1A"/>
      <ellipse cx="228" cy="327" rx="14" ry="5" fill="#0D0F1A"/>
    </svg>
  )
}

/** CTA pose — ouvre une porte, métaphore du démarrage */
export function AntDoor({ className = '' }: AntProps) {
  return (
    <svg viewBox="0 0 350 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Porte */}
      <rect x="170" y="40" width="130" height="340" rx="6" fill="#1A1E30" stroke="#252840" strokeWidth="3"/>
      <rect x="180" y="50" width="110" height="320" rx="3" fill="#131629"/>
      {/* Poignée */}
      <circle cx="275" cy="210" r="8" fill="#E8622A"/>
      <circle cx="275" cy="210" r="4" fill="#0D0F1A"/>
      {/* Lumière qui sort de la porte */}
      <path d="M180 50 L120 20 L120 380 L180 370Z" fill="#E8622A" opacity="0.06"/>
      <path d="M180 100 L140 80 L140 320 L180 310Z" fill="#E8622A" opacity="0.08"/>

      {/* Fourmi */}
      {/* Antennes */}
      <path d="M80 130 C75 100, 65 85, 50 75" stroke="#0D0F1A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="48" cy="73" r="6" fill="#E8622A"/>
      <path d="M115 130 C120 100, 130 85, 145 80" stroke="#0D0F1A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <circle cx="147" cy="78" r="6" fill="#E8622A"/>

      {/* Tête */}
      <circle cx="98" cy="165" r="40" fill="#0D0F1A"/>
      <ellipse cx="85" cy="160" rx="10" ry="12" fill="white"/>
      <ellipse cx="112" cy="160" rx="10" ry="12" fill="white"/>
      <circle cx="88" cy="158" r="5" fill="#0D0F1A"/>
      <circle cx="115" cy="158" r="5" fill="#0D0F1A"/>
      <circle cx="89" cy="156" r="2" fill="white"/>
      <circle cx="116" cy="156" r="2" fill="white"/>
      {/* Grand sourire */}
      <path d="M82 180 C90 192, 106 192, 114 180" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>

      {/* Corps */}
      <ellipse cx="98" cy="250" rx="45" ry="48" fill="#1A1E30" stroke="#0D0F1A" strokeWidth="3"/>
      <path d="M80 210 L98 225 L116 210" stroke="white" strokeWidth="2.5" fill="none"/>
      <polygon points="98,222 92,242 98,252 104,242" fill="#E8622A"/>
      <ellipse cx="98" cy="335" rx="38" ry="40" fill="#0D0F1A"/>

      {/* Bras gauche — posé */}
      <path d="M53 245 C30 250, 20 265, 25 280" stroke="#0D0F1A" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <circle cx="25" cy="282" r="7" fill="#0D0F1A"/>
      {/* Bras droit — pousse la porte */}
      <path d="M143 240 C160 235, 172 225, 178 215" stroke="#0D0F1A" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <circle cx="180" cy="213" r="7" fill="#0D0F1A"/>

      {/* Pattes */}
      <path d="M72 365 C65 380, 60 390, 55 398" stroke="#0D0F1A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M125 365 C130 380, 135 390, 140 398" stroke="#0D0F1A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <ellipse cx="50" cy="398" rx="12" ry="5" fill="#0D0F1A"/>
      <ellipse cx="145" cy="398" rx="12" ry="5" fill="#0D0F1A"/>

      {/* Étoiles décoratives autour de la porte */}
      <path d="M320 80 L323 88 L331 88 L325 93 L327 101 L320 96 L313 101 L315 93 L309 88 L317 88Z" fill="#F5C842" opacity="0.7"/>
      <path d="M160 55 L162 60 L167 60 L163 63 L164 68 L160 65 L156 68 L157 63 L153 60 L158 60Z" fill="#E8622A" opacity="0.5"/>
    </svg>
  )
}

/** Petite fourmi pour le footer — qui salue */
export function AntWave({ className = '' }: AntProps) {
  return (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M26 18 C24 8, 18 4, 12 2" stroke="#0D0F1A" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="11" cy="2" r="2.5" fill="#E8622A"/>
      <path d="M34 18 C36 8, 42 4, 48 2" stroke="#0D0F1A" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="49" cy="2" r="2.5" fill="#E8622A"/>
      <circle cx="30" cy="28" r="14" fill="#0D0F1A"/>
      <circle cx="25" cy="26" r="4" fill="white"/>
      <circle cx="35" cy="26" r="4" fill="white"/>
      <circle cx="26" cy="25" r="2" fill="#0D0F1A"/>
      <circle cx="36" cy="25" r="2" fill="#0D0F1A"/>
      <path d="M26 34 C28 37, 32 37, 34 34" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <ellipse cx="30" cy="50" rx="14" ry="14" fill="#1A1E30" stroke="#0D0F1A" strokeWidth="1.5"/>
      <ellipse cx="30" cy="70" rx="11" ry="10" fill="#0D0F1A"/>
      {/* Bras droit qui salue */}
      <path d="M44 48 C52 42, 55 35, 53 28" stroke="#0D0F1A" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="53" cy="27" r="3" fill="#0D0F1A"/>
    </svg>
  )
}
