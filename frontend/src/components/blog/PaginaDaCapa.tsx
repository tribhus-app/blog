import type { CSSProperties } from 'react';
import type { CapaDoBlog } from './tipos';
import { serieDoTitulo, resumoDe, capaQueVoa } from './corpo';
import { CartaoDoArtigo } from './CartaoDoArtigo';
import { FaixaDaCasa } from './CabecalhoDoBlog';
import { Surgir } from './Surgir';

/* =========================================================================
   A CAPA DO BLOG, rota `/blog`

   UMA CAPA DE REVISTA. A matéria mais nova abre a página como uma capa: o
   título grande em letra de cartaz à esquerda e a foto à direita, inteira.
   A maior parte das fotos do blog é capa de disco ou foto quadrada de banda
   (1200 x 1200), por isso a foto da capa e os cartões são quadrados: o disco
   aparece inteiro, sem corte, e sem véu escuro por cima para o texto caber.

   AS MESMAS PARTES DO AR, NA MESMA ORDEM E COM AS MESMAS PALAVRAS (o Google
   já conhece esta página):
     1. o destaque, com o título do artigo como único H1 e "Ler artigo";
     2. "Explorar:", as oito categorias;
     3. "Últimas publicações" e "Ver todas": um largo e quatro em grade. Ao
        lado: o texto do blog e "Conhecer o Tribhus", "Mais lidas", "Mais
        artigos" (no ar, embaixo das últimas) e "Newsletter";
     4. "Explore por categoria", "Encontre conteúdo do seu interesse": as
        oito, cada uma com a foto da matéria mais nova dela.
   Dez artigos, como no ar (1 + 1 + 4 + 4).

   O QUE MUDOU DE PROPÓSITO:
     - SEM DATA nas listas (a regra da casa para todo feed: "19 de junho" ao
       lado de "26 de outubro" faz o blog parecer parado). A data continua no
       artigo e no dado que o Google lê;
     - SEM AS OITO CORES DE CATEGORIA: cada uma é dita pelo nome, em letra de
       painel. Três delas não passavam no contraste;
     - "Mais lidas" ganhou a posição (1 a 4), em número grande: é a única
       lista da página que é ranking, e o número é o que ela informa.
   ========================================================================= */
export function PaginaDaCapa({ capa }: { capa: CapaDoBlog }) {
  const [destaque, largo, ...resto] = capa.recentes;
  const grade = resto.slice(0, 4);
  const mais = resto.slice(4, 8);
  const { serie, resto: titulo } = serieDoTitulo(destaque.title);
  /* SEM RESUMO, A DESCRIÇÃO DO GOOGLE: a série Descobertas não preenche o
     `excerpt`, mas todo artigo tem `metaDescription`. Nada de campo novo. */
  const resumo = resumoDe(destaque);
  /* TÍTULO CURTO, LETRA MAIOR: "Conheça a banda Lilhouse" cabe em três
     linhas largas; um título de 60 letras no mesmo corpo viraria seis. */
  const curto = titulo.length <= 30;

  return (
    <main id="conteudo" className="bl blc">
      <Surgir />
      <FaixaDaCasa />

      {/* 1. O DESTAQUE: um link só, como no ar */}
      <a className="blc-destaque" href={`/blog/${destaque.slug}`}>
        {/* A CAPA DE REVISTA: a série em cima, na altura do topo da foto, e o
            título com o resto assentados embaixo, na altura do pé da foto.
            A coluna inteira trabalha, sem o título boiando no meio do preto. */}
        <div className="blc-destaque-txt">
          <p className="blc-sobre">{serie ?? destaque.category.name}</p>
          <div className="blc-destaque-base">
          <h1 className={`blc-h1${curto ? ' curto' : ''}`}>
            {serie && <span className="so-leitor">{serie} - </span>}
            {titulo}
          </h1>
          {resumo && <p className="blc-destaque-resumo">{resumo}</p>}
          <p className="blc-destaque-pe">
            {destaque.author && (
              /* A FOTO DE QUEM ESCREVEU, quando existe. O campo já existe na
                 API do blog (`author.avatar`), só está vazio em todos: basta
                 subir a foto no painel do blog. Sem foto, só o nome (nada de
                 bolinha com a inicial). */
              <span className="blc-quem">
                {destaque.author.avatar && <img className="bl-avatar" src={destaque.author.avatar} alt="" width={72} height={72} />}
                <span>Por <b>{destaque.author.name}</b></span>
              </span>
            )}
            <span className="blc-ler">
              Ler artigo
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </p>
          </div>
        </div>
        <div className="blc-destaque-foto" style={{ viewTransitionName: capaQueVoa(destaque.slug) }}>
          {destaque.coverImage && (
            <img src={destaque.coverImage} alt="" fetchPriority="high" decoding="async" width={1200} height={1200} />
          )}
        </div>
      </a>

      {/* 2. EXPLORAR */}
      <nav className="blc-explorar" aria-label="Explorar categorias">
        <span className="bl-rotulo">Explorar:</span>
        <ul>
          {capa.categorias.map((c) => (
            <li key={c.slug}><a href={`/blog/categoria/${c.slug}`}>{c.name}</a></li>
          ))}
        </ul>
      </nav>

      {/* 3. AS ÚLTIMAS, e a coluna do lado */}
      <div className="blc-corpo">
        <section className="blc-ultimas" aria-labelledby="blc-ult-tit">
          <header className="blc-cab-secao">
            <h2 className="blc-h2" id="blc-ult-tit">Últimas publicações</h2>
            <a className="blc-ver" href="/blog/arquivo">Ver todas</a>
          </header>

          {largo && <div data-surge><CartaoDoArtigo artigo={largo} grande titulo="h2" /></div>}

          <ul className="blc-grade">
            {grade.map((a, i) => (
              <li key={a.slug} data-surge style={{ '--i': i % 2 } as CSSProperties}><CartaoDoArtigo artigo={a} quadrado titulo="h2" /></li>
            ))}
          </ul>

        </section>

        <aside className="blc-lado">
          <div className="blc-sobre-blog">
            <p>O <b>Tribhus Blog</b> traz noticias, reviews e entrevistas do cenário rock underground e independente brasileiro.</p>
            <a className="blc-ver" href="https://tribhus.com" target="_blank" rel="noopener">Conhecer o Tribhus</a>
          </div>

          <section className="blc-lidas" aria-labelledby="blc-lidas-tit">
            <h3 className="bl-rotulo" id="blc-lidas-tit">Mais lidas</h3>
            <ol>
              {capa.maisLidas.map((a, i) => {
                const s = serieDoTitulo(a.title);
                return (
                  <li key={a.slug}>
                    <a href={`/blog/${a.slug}`}>
                      <span className="blc-lidas-n" aria-hidden="true">{i + 1}</span>
                      <span className="blc-lidas-txt">
                        <span className="blc-mais-sobre">{s.serie ?? a.category.name}</span>
                        <span className="blc-lidas-tit">{s.resto}</span>
                      </span>
                      {a.coverImage && <span className="blc-lidas-foto"><img src={a.coverImage} alt="" loading="lazy" decoding="async" width={112} height={112} /></span>}
                    </a>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* MAIS ARTIGOS mora aqui, e não embaixo das últimas: embaixo, a
              coluna do lado acabava antes e deixava um vão do tamanho da
              lista ao lado dela (30/10). Aqui as duas colunas terminam
              juntas. */}
          {mais.length > 0 && (
            <section className="blc-mais" aria-labelledby="blc-mais-tit">
              <h3 className="bl-rotulo" id="blc-mais-tit">Mais artigos</h3>
              <ol>
                {mais.map((a) => {
                  const s = serieDoTitulo(a.title);
                  return (
                    <li key={a.slug}>
                      <a href={`/blog/${a.slug}`}>
                        <span className="blc-mais-foto">
                          {a.coverImage && <img src={a.coverImage} alt="" loading="lazy" decoding="async" width={176} height={176} />}
                        </span>
                        <span className="blc-mais-txt">
                          <span className="blc-mais-sobre">{s.serie ?? a.category.name}</span>
                          <span className="blc-mais-tit">{s.resto}</span>
                        </span>
                        <svg className="blc-mais-seta" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {/* "CATEGORIAS" (as oito pílulas) SAIU DAQUI: era a terceira vez
              que as mesmas oito apareciam na página, entre "Explorar:" logo
              acima e "Explore por categoria" logo abaixo. A palavra
              continua no rodapé, com os links. */}

          {/* NEWSLETTER: no ar, o formulário não manda para lugar nenhum (não
              tem `action` nem envio). Fica com as palavras do ar; quando o
              site tiver para onde mandar, é só ligar o `action`. */}
          <section className="blc-news" aria-labelledby="blc-news-tit">
            <h3 className="blc-news-tit" id="blc-news-tit">Newsletter</h3>
            <p>Receba as melhores noticias do rock direto no seu email.</p>
            <form className="blc-news-form">
              <input type="email" name="email" placeholder="seu@email.com" aria-label="Seu email" autoComplete="email" required />
              <button type="submit" className="blc-news-bt">Inscrever-se</button>
            </form>
          </section>
        </aside>
      </div>

      {/* 4. EXPLORE POR CATEGORIA */}
      <section className="blc-explore" aria-labelledby="blc-exp-tit">
        <header className="blc-explore-cab">
          <h2 className="blc-h2" id="blc-exp-tit">Explore por categoria</h2>
          <p>Encontre conteúdo do seu interesse</p>
        </header>
        <ul>
          {capa.categorias.map((c, i) => (
            <li key={c.slug} data-surge style={{ '--i': i % 4 } as CSSProperties}>
              <a href={`/blog/categoria/${c.slug}`}>
                <span className="blc-cat-foto">
                  {c.capa && <img src={c.capa} alt="" loading="lazy" decoding="async" width={600} height={600} />}
                </span>
                <div className="blc-cat-txt">
                  <h3>{c.name}</h3>
                  {c.description && <p>{c.description}</p>}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
