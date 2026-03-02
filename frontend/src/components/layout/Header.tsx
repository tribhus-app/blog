'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-32">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="Tribhus Blog - Ir para pagina inicial">
            <Image
              src="/images/logo_horizontal.png"
              alt="Tribhus Blog"
              width={400}
              height={120}
              quality={80}
              sizes="(max-width: 768px) 192px, 256px"
              className="h-20 md:h-24 w-auto transition-transform group-hover:scale-105"
              priority
            />
            <span className="text-2xl font-light text-text-muted translate-y-2" aria-hidden="true">Blog</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-text-secondary hover:text-white transition-colors">
              Inicio
            </Link>
            <Link href="/categoria/bandas" className="text-sm text-text-secondary hover:text-white transition-colors">
              Bandas
            </Link>
            <Link href="/categoria/noticias" className="text-sm text-text-secondary hover:text-white transition-colors">
              Noticias
            </Link>
            <Link href="/categoria/curiosidades" className="text-sm text-text-secondary hover:text-white transition-colors">
              Curiosidades
            </Link>
            <Link href="/categoria/internacional" className="text-sm text-text-secondary hover:text-white transition-colors">
              Internacional
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5"
              aria-label="Buscar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Tribhus link */}
            <a
              href="https://tribhus.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-primary-light hover:text-white border border-primary/30 hover:border-primary/60 rounded-full transition-all"
            >
              Tribhus
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5"
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Search bar expandido */}
        {isSearchOpen && (
          <div className="pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar artigos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-dark-card border border-border/50 rounded-xl px-4 py-3 pl-11 text-white placeholder-text-muted focus:border-primary/50 focus:outline-none transition-colors"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-white transition-colors"
                  aria-label="Fechar busca"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-dark/95 backdrop-blur-lg">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link
              href="/"
              className="block py-3 text-white font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/categoria/bandas"
              className="block py-3 text-text-secondary hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Bandas
            </Link>
            <Link
              href="/categoria/noticias"
              className="block py-3 text-text-secondary hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Noticias
            </Link>
            <Link
              href="/categoria/curiosidades"
              className="block py-3 text-text-secondary hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Curiosidades
            </Link>
            <Link
              href="/categoria/internacional"
              className="block py-3 text-text-secondary hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Internacional
            </Link>
            <div className="pt-4 mt-4 border-t border-border/30">
              <a
                href="https://tribhus.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-3 text-primary-light"
              >
                Acessar Tribhus
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
