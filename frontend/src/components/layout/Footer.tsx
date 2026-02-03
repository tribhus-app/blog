import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-1 mb-4" aria-label="Tribhus Blog - Ir para pagina inicial">
              <Image
                src="/images/logo_horizontal.png"
                alt="Tribhus Blog"
                width={240}
                height={72}
                sizes="160px"
                className="h-16 w-auto"
              />
              <span className="text-xl font-light text-text-muted translate-y-2" aria-hidden="true">Blog</span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed">
              O melhor conteudo sobre rock underground e independente do Brasil.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Categorias</h4>
              <nav className="flex flex-col gap-2">
                <Link href="/categoria/noticias" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Noticias
                </Link>
                <Link href="/categoria/lancamentos" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Lancamentos
                </Link>
                <Link href="/categoria/entrevistas" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Entrevistas
                </Link>
                <Link href="/categoria/eventos" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Eventos
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Tribhus</h4>
              <nav className="flex flex-col gap-2">
                <a href="https://tribhus.com.br" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Plataforma
                </a>
                <a href="https://tribhus.com.br/bandas" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Bandas
                </a>
                <Link href="/sobre" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Sobre
                </Link>
              </nav>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Social</h4>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/tribhus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com/tribhus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Twitter"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://youtube.com/tribhus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-all"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <p>{currentYear} Tribhus. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/privacidade" className="hover:text-white transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:text-white transition-colors">
              Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
