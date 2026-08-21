import { generoDoPost } from '@/lib/generoDoSite'

/**
 * Caminho do post-guia do blog para o catálogo de bandas do gênero no site.
 * Ver `lib/generoDoSite.ts` para o motivo e para a lista de destinos.
 */
export default function LinkParaGenero({ slug }: { slug: string }) {
  const genero = generoDoPost(slug)
  if (!genero) return null

  return (
    <aside className="mb-10 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
      <p className="text-white font-semibold text-lg mb-1">
        Quer ouvir {genero.nome} agora?
      </p>
      <p className="text-text-secondary mb-4">
        A Tribhus reúne bandas de {genero.nome} com perfil, músicas e próximos shows.
      </p>
      <a
        href={`https://tribhus.com.br/genero/${genero.slug}`}
        className="inline-flex items-center gap-2 text-primary-light font-medium hover:gap-3 transition-all"
      >
        Ver as bandas de {genero.nome}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    </aside>
  )
}
