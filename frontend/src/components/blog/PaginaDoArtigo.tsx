import type { ArtigoDoBlog, BandaDaMateria, ResumoDoArtigo } from './tipos';
import { prepararCorpo, serieDoTitulo, dataPorExtenso, resumoDe, capaQueVoa } from './corpo';
import { OucaEnquantoLe } from './OucaEnquantoLe';
import { LeituraViva } from './LeituraViva';
import { CartaoDoArtigo } from './CartaoDoArtigo';
import { IndiceVivo } from '../casa/IndiceVivo';
import { CompartilharArtigo } from './CompartilharArtigo';
import { FaixaDaCasa } from './CabecalhoDoBlog';
import { Surgir } from './Surgir';

/* =========================================================================
   O ARTIGO DO BLOG, rota `/blog/[slug]`

   A TELA MAIS IMPORTANTE DO BLOG. Quem lê blog chega pelo Google, direto
   numa matéria, quase sempre no telefone. Por isso o artigo foi desenhado
   antes da capa, e o telefone conta tanto quanto o computador aqui (no
   resto do site, quem está no telefone usa o app; no blog, não).

   O MATERIAL é a foto da banda e a letra da casa: o título condensado em
   corpo de cartaz, o texto na medida de leitura (68 caracteres), nada de
   textura atrás do texto. A foto é objeto (ver A FOTO NA MÃO no CSS).

   A ORDEM:
     1. A ABERTURA, como a do Álbum (30/10, "muito abaixo do site"): à
        esquerda a categoria e a série, o título, o resumo, quem escreveu, a
        data e o tempo de leitura; à direita a capa em quadrado, como objeto
        na mão, com o crédito. No telefone a capa vem primeiro, de ponta a
        ponta. A capa é a mesma foto do cartão que se clicou, e voa dele
        para cá (`capaQueVoa`);
     2. (a foto já veio na abertura);
     3. o texto. À esquerda, o índice vivo (matéria com três partes ou
        mais); à direita, OUÇA ENQUANTO LÊ, preso ao lado;
     4. o fim: as tags, compartilhar (os quatro do ar), quem escreveu;
     5. A PRÓXIMA, grande, como virar a página, e os relacionados.

   O QUE ELE PEDE DO SITE: o artigo pela API do blog (`/posts/slug/<slug>`),
   a próxima e os relacionados (a mesma categoria, como no ar), e as bandas
   citadas (ver `tipos.ts`). Nenhum campo novo.
   ========================================================================= */
export function PaginaDoArtigo({ artigo, endereco, bandas = [], proxima, relacionados = [], miniaturaDoVideo, antesDoTexto }: {
  artigo: ArtigoDoBlog;
  /** O endereço inteiro do artigo (https://tribhus.com/blog/<slug>), que vai no compartilhar. */
  endereco: string;
  /** Só do exemplo (ver `prepararCorpo`). */
  miniaturaDoVideo?: (id: string) => string;
  bandas?: BandaDaMateria[];
  proxima?: ResumoDoArtigo | null;
  relacionados?: ResumoDoArtigo[];
  /** HTML que entra no alto do texto (no blog: o convite do post-guia de gênero). */
  antesDoTexto?: string;
}) {
  const corpo = prepararCorpo(artigo.content, artigo.excerpt, miniaturaDoVideo, artigo.coverImage);
  /* SEM RESUMO, A DESCRIÇÃO DO GOOGLE, limpa (ver `resumoDe`); a que só
     repete o começo do texto não aparece. No ar, o <p> ficava vazio. */
  const resumo = resumoDe(artigo, artigo.content);
  const { serie, resto } = serieDoTitulo(artigo.title);
  const temIndice = corpo.secoes.length >= 3;
  const autor = artigo.author;
  const bio = autor.bio && autor.bio !== 'Equipe Tribhus' ? autor.bio : null;
  const outros = relacionados.filter((r) => r.slug !== proxima?.slug).slice(0, 3);

  return (
    <main id="conteudo" className="bl bl-artigo">
      <Surgir />
      <FaixaDaCasa />
      <LeituraViva titulo={artigo.title} fotos={corpo.fotos} bandas={bandas} />

      {/* A ABERTURA, COMO A DO ÁLBUM: o título ao lado da capa, e a capa
          como objeto na mão (a sombra embaixo, a quina pegando a luz), em
          quadrado porque a maior parte das capas do blog é capa de disco.
          Sem capa, o título fica sozinho na largura toda. */}
      <div className={`bl-abre${artigo.coverImage ? ' com-capa' : ''}`}>
        <header className="bl-topo">
          <nav className="bl-migalha" aria-label="Você está em">
            <ol>
              <li><a href="/blog">Início</a></li>
              <li><a href={`/blog/categoria/${artigo.category.slug}`}>{artigo.category.name}</a></li>
            </ol>
          </nav>

          {/* TÍTULO LONGO, LETRA MENOR: "#28: Vacilation Society, Stase,
              Órfãos do Milênio, Mera Corte e Dino Rock" no corpo de um título
              curto ocupava cinco linhas de cartaz antes de qualquer texto */}
          <h1 className={`bl-h1${resto.length > 48 ? ' longo' : ''}`}>
            {serie && <span className="bl-h1-serie">{serie}</span>}
            <span className="bl-h1-t">{resto}</span>
          </h1>

          {resumo && <p className="bl-resumo">{resumo}</p>}

          <p className="bl-assina">
            <span className="bl-assina-quem">
              {/* a foto só quando existe: sem ela, nada de bolinha com a inicial */}
              {autor.avatar && <img className="bl-avatar" src={autor.avatar} alt="" width={36} height={36} />}
              <span>Por <b>{autor.name}</b></span>
            </span>
            <time dateTime={artigo.publishedAt}>{dataPorExtenso(artigo.publishedAt)}</time>
            <span>{corpo.minutos} min de leitura</span>
          </p>
        </header>

        {artigo.coverImage && (
          <figure className="bl-capa">
            <span className="bl-capa-foto" style={{ viewTransitionName: capaQueVoa(artigo.slug) }}>
              {/* A foto que o Google mede (LCP): carrega primeiro, sem lazy. */}
              <img src={artigo.coverImage} alt="" fetchPriority="high" decoding="async" width={1200} height={1200} />
            </span>
            {artigo.imageCredit && (
              <figcaption>
                Foto: {artigo.imageCreditUrl
                  ? <a href={artigo.imageCreditUrl} target="_blank" rel="noopener">{artigo.imageCredit}</a>
                  : artigo.imageCredit}
              </figcaption>
            )}
          </figure>
        )}
      </div>

      <div className={`bl-grade${temIndice ? ' com-indice' : ''}${bandas.length ? ' com-bandas' : ''}`}>
        {temIndice && (
          <div className="bl-margem">
            <IndiceVivo itens={corpo.secoes.map((s) => ({ id: s.id, n: null, t: s.t }))} />
          </div>
        )}

        {bandas.length > 0 && (
          <aside className="bl-lado">
            <OucaEnquantoLe bandas={bandas} />
          </aside>
        )}

        <article className="bl-texto" dangerouslySetInnerHTML={{ __html: (antesDoTexto ?? '') + corpo.html }} />
      </div>

      <footer className="bl-fim">
        {/* A FONTE (`sourceUrl`/`sourceName`) NÃO APARECE, como no ar: nos
            seis artigos que a têm, ela já está escrita no fim do texto, e em
            quatro o `sourceName` guardado é o termo de busca da ferramenta
            ("Tavily: rock metal band news..."). */}

        {artigo.tags && artigo.tags.length > 0 && (
          <section className="bl-fim-bloco" aria-labelledby="bl-tags-tit">
            <h2 className="bl-rotulo" id="bl-tags-tit">Tags</h2>
            <ul className="bl-tags">
              {artigo.tags.map((t) => (
                <li key={t.slug}><a href={`/blog/tag/${t.slug}`}>{t.name}</a></li>
              ))}
            </ul>
          </section>
        )}

        <section className="bl-fim-bloco" aria-labelledby="bl-partilha-tit">
          <h2 className="bl-rotulo" id="bl-partilha-tit">Compartilhar</h2>
          <CompartilharArtigo url={endereco} titulo={artigo.title} />
        </section>

        {/* A CAIXA DO AUTOR: o nome e a bio de /authors (vazia, "Equipe
            Tribhus", como no ar). A foto só quando existir. */}
        <div className="bl-autor">
          {autor.avatar && <img className="bl-avatar" src={autor.avatar} alt="" width={56} height={56} />}
          <p>
            <span className="bl-rotulo">Autor</span>
            <b>{autor.name}</b>
            <span>{bio ?? 'Equipe Tribhus'}</span>
          </p>
        </div>
      </footer>

      {proxima && (
        <section className="bl-proxima" aria-labelledby="bl-proxima-tit">
          <p className="bl-rotulo" id="bl-proxima-tit">A próxima</p>
          <CartaoDoArtigo artigo={proxima} grande />
        </section>
      )}

      {outros.length > 0 && (
        <section className="bl-relacionados" aria-labelledby="bl-rel-tit">
          <h2 className="bl-rotulo" id="bl-rel-tit">Artigos Relacionados</h2>
          <ul className="bl-grade-cartoes">
            {outros.map((r) => <li key={r.slug}><CartaoDoArtigo artigo={r} /></li>)}
          </ul>
        </section>
      )}
    </main>
  );
}
