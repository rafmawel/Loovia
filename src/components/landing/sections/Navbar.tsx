'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-bg-primary/95 backdrop-blur-xl border-b border-border' : 'bg-transparent'
    }`}>
      <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <Link href="/" className="font-display text-[22px] font-extrabold tracking-tight text-white">
          L<span className="gradient-text">oo</span>via
        </Link>
        <div className="flex items-center gap-8">
          <Link href="#fonctionnalites" className="hidden md:inline text-[14px] text-text-secondary hover:text-white transition-colors">Fonctionnalités</Link>
          <Link href="#tarifs" className="hidden md:inline text-[14px] text-text-secondary hover:text-white transition-colors">Tarifs</Link>
          <Link href="/login" className="text-[14px] text-text-secondary hover:text-white transition-colors">Connexion</Link>
          <Link href="/register" className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-accent text-white text-[14px] font-semibold hover:brightness-110 transition-all">
            Créer un compte <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  )
}
