'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[#0D0F1A]/92 backdrop-blur-xl border-b border-border shadow-lg'
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display text-[22px] font-extrabold tracking-tight">
          <span className="text-white">L</span>
          <span className="text-accent">oo</span>
          <span className="text-white">via</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-2 sm:gap-6">
          <Link href="#fonctionnalites" className="hidden md:inline text-[14px] font-medium text-text-secondary hover:text-white transition-colors">
            Fonctionnalités
          </Link>
          <Link href="#tarifs" className="hidden md:inline text-[14px] font-medium text-text-secondary hover:text-white transition-colors">
            Tarifs
          </Link>
          <Link href="/login" className="text-[14px] font-medium text-text-secondary hover:text-white transition-colors">
            Connexion
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center px-5 py-2 rounded-md bg-accent text-white text-[14px] font-display font-bold hover:bg-transparent border-2 border-accent hover:text-accent transition-all"
          >
            Accès bêta gratuit
          </Link>
        </div>
      </div>
    </nav>
  )
}
